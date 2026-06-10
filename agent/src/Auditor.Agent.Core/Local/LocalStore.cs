using System.Text.Json;
using Auditor.Agent.Core.Crypto;
using Auditor.Agent.Shared;
using Microsoft.Data.Sqlite;

namespace Auditor.Agent.Core.Local;

/// <summary>
/// Encrypted offline store (TZ §16.3). SQLite holds queue metadata for sync
/// management; each finding's sensitive content is serialized and AES-GCM encrypted
/// into a BLOB. The AES key is generated once and kept DPAPI-protected in `settings`,
/// so the data is meaningless without this Windows user on this machine.
/// </summary>
public sealed class LocalStore : IDisposable
{
    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };
    private readonly SqliteConnection _db;
    private readonly byte[] _key;

    public LocalStore(string dbPath)
    {
        // Pooling=False so the file handle is released promptly on Dispose (single-user
        // desktop agent — no pool benefit, and it keeps the DB file movable/deletable).
        _db = new SqliteConnection($"Data Source={dbPath};Pooling=False");
        _db.Open();
        InitSchema();
        _key = LoadOrCreateKey();
    }

    private void InitSchema()
    {
        Exec("""
            CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY, title TEXT, type TEXT, priority TEXT,
                status TEXT, due TEXT, findings INTEGER, files INTEGER);
            CREATE TABLE IF NOT EXISTS findings_queue (
                idempotency_key TEXT PRIMARY KEY, task_id TEXT, severity TEXT,
                cvss REAL, state TEXT NOT NULL, created_at TEXT NOT NULL, payload BLOB NOT NULL);
            CREATE TABLE IF NOT EXISTS sync_sessions (
                session_id TEXT PRIMARY KEY, started_at TEXT, status TEXT);
            CREATE TABLE IF NOT EXISTS local_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL,
                level TEXT NOT NULL, message TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS evidence_files (
                id TEXT PRIMARY KEY, finding_key TEXT, filename TEXT NOT NULL, mime TEXT,
                size_bytes INTEGER NOT NULL, sha256 TEXT, state TEXT NOT NULL,
                created_at TEXT NOT NULL, payload BLOB NOT NULL);
            CREATE TABLE IF NOT EXISTS task_status_queue (
                task_id TEXT PRIMARY KEY, to_status TEXT NOT NULL, state TEXT NOT NULL,
                created_at TEXT NOT NULL);
            """);
    }

    private byte[] LoadOrCreateKey()
    {
        var stored = GetSetting("db_key");
        var raw = stored is null ? null : TokenProtector.Unprotect(stored);
        if (raw is not null) return Convert.FromBase64String(raw);

        var key = DbCipher.NewKey();
        SetSetting("db_key", TokenProtector.Protect(Convert.ToBase64String(key)));
        return key;
    }

    // --- session token + audit context (DPAPI-protected) ---
    public void SaveSession(string jwt, AuditContext context)
    {
        SetSetting("session_token", TokenProtector.Protect(jwt));
        SetSetting("audit_context", TokenProtector.Protect(JsonSerializer.Serialize(context, Json)));
    }

    public string? GetSessionToken() => TokenProtector.Unprotect(GetSetting("session_token"));

    public AuditContext? GetAuditContext()
    {
        var raw = TokenProtector.Unprotect(GetSetting("audit_context"));
        return raw is null ? null : JsonSerializer.Deserialize<AuditContext>(raw, Json);
    }

    public void ClearSession()
    {
        Exec("DELETE FROM settings WHERE key IN ('session_token','audit_context')");
    }

    // --- tasks cache ---
    public void SaveTasks(IEnumerable<AgentTask> tasks)
    {
        Exec("DELETE FROM tasks");
        foreach (var t in tasks)
        {
            using var cmd = _db.CreateCommand();
            cmd.CommandText = """
                INSERT INTO tasks(id,title,type,priority,status,due,findings,files)
                VALUES($id,$title,$type,$priority,$status,$due,$findings,$files)
                """;
            cmd.Parameters.AddWithValue("$id", t.Id);
            cmd.Parameters.AddWithValue("$title", t.Title);
            cmd.Parameters.AddWithValue("$type", t.Type);
            cmd.Parameters.AddWithValue("$priority", t.Priority);
            cmd.Parameters.AddWithValue("$status", t.Status);
            cmd.Parameters.AddWithValue("$due", t.Due);
            cmd.Parameters.AddWithValue("$findings", t.Findings);
            cmd.Parameters.AddWithValue("$files", t.Files);
            cmd.ExecuteNonQuery();
        }
    }

    public List<AgentTask> GetTasks()
    {
        var list = new List<AgentTask>();
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT id,title,type,priority,status,due,findings,files FROM tasks ORDER BY id";
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new AgentTask(r.GetString(0), r.GetString(1), r.GetString(2), r.GetString(3),
                r.GetString(4), r.GetString(5), r.GetInt32(6), r.GetInt32(7)));
        return list;
    }

    // --- findings queue ---
    public void EnqueueFinding(QueuedFinding f)
    {
        var blob = DbCipher.EncryptString(JsonSerializer.Serialize(f.Input, Json), _key);
        using var cmd = _db.CreateCommand();
        cmd.CommandText = """
            INSERT OR REPLACE INTO findings_queue(idempotency_key,task_id,severity,cvss,state,created_at,payload)
            VALUES($k,$task,$sev,$cvss,$state,$created,$payload)
            """;
        cmd.Parameters.AddWithValue("$k", f.IdempotencyKey);
        cmd.Parameters.AddWithValue("$task", f.Input.TaskId);
        cmd.Parameters.AddWithValue("$sev", f.Input.Severity);
        cmd.Parameters.AddWithValue("$cvss", f.Input.Cvss);
        cmd.Parameters.AddWithValue("$state", f.State.ToString());
        cmd.Parameters.AddWithValue("$created", f.CreatedAt);
        cmd.Parameters.AddWithValue("$payload", blob);
        cmd.ExecuteNonQuery();
    }

    public List<QueuedFinding> GetFindings(SyncState? state = null)
    {
        var list = new List<QueuedFinding>();
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT state,created_at,payload FROM findings_queue"
            + (state is null ? "" : " WHERE state=$state") + " ORDER BY created_at";
        if (state is not null) cmd.Parameters.AddWithValue("$state", state.ToString());
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var payload = (byte[])r["payload"];
            var input = JsonSerializer.Deserialize<FindingSyncInput>(
                DbCipher.DecryptString(payload, _key), Json)!;
            list.Add(new QueuedFinding
            {
                Input = input,
                State = Enum.Parse<SyncState>(r.GetString(0)),
                CreatedAt = r.GetString(1),
            });
        }
        return list;
    }

    public void SetFindingState(string idempotencyKey, SyncState state)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "UPDATE findings_queue SET state=$state WHERE idempotency_key=$k";
        cmd.Parameters.AddWithValue("$state", state.ToString());
        cmd.Parameters.AddWithValue("$k", idempotencyKey);
        cmd.ExecuteNonQuery();
    }

    public (int pending, int synced, int failed) Counts()
    {
        int P = 0, S = 0, F = 0;
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT state, COUNT(*) FROM findings_queue GROUP BY state";
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var n = r.GetInt32(1);
            switch (Enum.Parse<SyncState>(r.GetString(0)))
            {
                case SyncState.Synced: S = n; break;
                case SyncState.Failed: F = n; break;
                default: P += n; break; // Pending + Syncing
            }
        }
        return (P, S, F);
    }

    // --- local log (TZ §16: lokal log) ---
    public void AppendLog(string level, string message)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "INSERT INTO local_log(ts,level,message) VALUES($ts,$lvl,$msg)";
        cmd.Parameters.AddWithValue("$ts", DateTime.Now.ToString("HH:mm:ss"));
        cmd.Parameters.AddWithValue("$lvl", level);
        cmd.Parameters.AddWithValue("$msg", message);
        cmd.ExecuteNonQuery();
    }

    public List<LogEntry> GetLogs(int limit = 200)
    {
        var list = new List<LogEntry>();
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT ts,level,message FROM local_log ORDER BY id DESC LIMIT $n";
        cmd.Parameters.AddWithValue("$n", limit);
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(new LogEntry(r.GetString(0), r.GetString(1), r.GetString(2)));
        return list;
    }

    /// <summary>Log lines with id &gt; afterId (ascending) — for the high-water-mark log upload.</summary>
    public List<(long Id, string Ts, string Level, string Message)> GetLogsAfter(long afterId, int limit = 200)
    {
        var list = new List<(long, string, string, string)>();
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT id,ts,level,message FROM local_log WHERE id>$a ORDER BY id ASC LIMIT $n";
        cmd.Parameters.AddWithValue("$a", afterId);
        cmd.Parameters.AddWithValue("$n", limit);
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add((r.GetInt64(0), r.GetString(1), r.GetString(2), r.GetString(3)));
        return list;
    }

    // --- evidence files (local AES-GCM at rest; uploaded in P2) ---
    public void AddEvidence(QueuedEvidence e, byte[] bytes)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = """
            INSERT OR REPLACE INTO evidence_files(id,finding_key,filename,mime,size_bytes,sha256,state,created_at,payload)
            VALUES($id,$fk,$name,$mime,$size,$sha,$state,$created,$payload)
            """;
        cmd.Parameters.AddWithValue("$id", e.Id);
        cmd.Parameters.AddWithValue("$fk", (object?)e.FindingKey ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$name", e.Filename);
        cmd.Parameters.AddWithValue("$mime", (object?)e.Mime ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$size", e.SizeBytes);
        cmd.Parameters.AddWithValue("$sha", (object?)e.Sha256 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$state", e.State.ToString());
        cmd.Parameters.AddWithValue("$created", e.CreatedAt);
        cmd.Parameters.AddWithValue("$payload", DbCipher.Encrypt(bytes, _key));
        cmd.ExecuteNonQuery();
    }

    public List<QueuedEvidence> GetEvidence(SyncState? state = null)
    {
        var list = new List<QueuedEvidence>();
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT id,finding_key,filename,mime,size_bytes,sha256,state,created_at FROM evidence_files"
            + (state is null ? "" : " WHERE state=$state") + " ORDER BY created_at DESC";
        if (state is not null) cmd.Parameters.AddWithValue("$state", state.ToString());
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new QueuedEvidence
            {
                Id = r.GetString(0),
                FindingKey = r.IsDBNull(1) ? null : r.GetString(1),
                Filename = r.GetString(2),
                Mime = r.IsDBNull(3) ? null : r.GetString(3),
                SizeBytes = r.GetInt64(4),
                Sha256 = r.IsDBNull(5) ? null : r.GetString(5),
                State = Enum.Parse<SyncState>(r.GetString(6)),
                CreatedAt = r.GetString(7),
            });
        return list;
    }

    public byte[] ReadEvidenceBytes(string id)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT payload FROM evidence_files WHERE id=$id";
        cmd.Parameters.AddWithValue("$id", id);
        var blob = (byte[])cmd.ExecuteScalar()!;
        return DbCipher.Decrypt(blob, _key);
    }

    public void SetEvidenceState(string id, SyncState state)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "UPDATE evidence_files SET state=$state WHERE id=$id";
        cmd.Parameters.AddWithValue("$state", state.ToString());
        cmd.Parameters.AddWithValue("$id", id);
        cmd.ExecuteNonQuery();
    }

    // --- task-status change queue (two-way; pushed in P2) ---
    public void EnqueueTaskStatus(string taskId, string toStatus)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = """
            INSERT OR REPLACE INTO task_status_queue(task_id,to_status,state,created_at)
            VALUES($id,$to,'Pending',$created)
            """;
        cmd.Parameters.AddWithValue("$id", taskId);
        cmd.Parameters.AddWithValue("$to", toStatus);
        cmd.Parameters.AddWithValue("$created", DateTime.UtcNow.ToString("u"));
        cmd.ExecuteNonQuery();
    }

    public List<TaskStatusChange> GetTaskStatusQueue(SyncState? state = null)
    {
        var list = new List<TaskStatusChange>();
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT task_id,to_status,state FROM task_status_queue"
            + (state is null ? "" : " WHERE state=$state");
        if (state is not null) cmd.Parameters.AddWithValue("$state", state.ToString());
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new TaskStatusChange(r.GetString(0), r.GetString(1), Enum.Parse<SyncState>(r.GetString(2))));
        return list;
    }

    public void SetTaskStatusState(string taskId, SyncState state)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "UPDATE task_status_queue SET state=$state WHERE task_id=$id";
        cmd.Parameters.AddWithValue("$state", state.ToString());
        cmd.Parameters.AddWithValue("$id", taskId);
        cmd.ExecuteNonQuery();
    }

    // --- offline credential vault + config (public KV wrappers) ---
    public void SaveCredential(string json) => SetSetting("auth_cred", json);
    public string? GetCredential() => GetSetting("auth_cred");
    public void SetConfig(string key, string value) => SetSetting("cfg_" + key, value);
    public string? GetConfig(string key) => GetSetting("cfg_" + key);

    // --- helpers ---
    private void Exec(string sql)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
    }

    private string? GetSetting(string key)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "SELECT value FROM settings WHERE key=$k";
        cmd.Parameters.AddWithValue("$k", key);
        return cmd.ExecuteScalar() as string;
    }

    private void SetSetting(string key, string value)
    {
        using var cmd = _db.CreateCommand();
        cmd.CommandText = "INSERT OR REPLACE INTO settings(key,value) VALUES($k,$v)";
        cmd.Parameters.AddWithValue("$k", key);
        cmd.Parameters.AddWithValue("$v", value);
        cmd.ExecuteNonQuery();
    }

    public void Dispose() => _db.Dispose();
}
