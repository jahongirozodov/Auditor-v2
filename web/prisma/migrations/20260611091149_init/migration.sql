-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('super', 'head', 'chief', 'lead', 't1');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('planning', 'group_forming', 'project_draft', 'project_pending', 'head_approved', 'assigning', 'in_progress', 'review', 'returned', 'approved', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AuditProjectStatus" AS ENUM ('draft', 'submitted', 'approved', 'returned', 'executing', 'completed');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('new', 'review', 'returned', 'approved', 'fixing', 'fixed', 'retest', 'closed');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('high', 'medium', 'low');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "RoleCode" NOT NULL,
    "customRoleCode" TEXT,
    "title" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "phone" TEXT,
    "workPhone" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "totpSecret" TEXT,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stir" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "audits" INTEGER NOT NULL,
    "contact" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "risk" "RiskLevel" NOT NULL,
    "head" TEXT NOT NULL,
    "since" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgContact" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "OrgContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgDevice" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "crit" TEXT NOT NULL,

    CONSTRAINT "OrgDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL,
    "stage" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "leaderId" TEXT NOT NULL,
    "lastSync" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "projectStage" TEXT,
    "goal" TEXT,
    "methodology" TEXT,
    "scope" TEXT[],
    "tools" TEXT[],
    "findings" JSONB NOT NULL,
    "tasksAgg" JSONB NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditMember" (
    "auditId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuditMember_pkey" PRIMARY KEY ("auditId","userId")
);

-- CreateTable
CREATE TABLE "AuditProject" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "status" "AuditProjectStatus" NOT NULL,
    "currentApprovalStage" TEXT,
    "goal" TEXT,
    "methodology" TEXT,
    "scope" TEXT[],
    "tools" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditProjectApproval" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditProjectApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "due" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "findings" INTEGER NOT NULL,
    "files" INTEGER NOT NULL,
    "kpi" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "cvss" DOUBLE PRECISION NOT NULL,
    "status" "FindingStatus" NOT NULL,
    "reportedById" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cwe" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" INTEGER NOT NULL,
    "ai" BOOLEAN NOT NULL,
    "approvalStage" TEXT,
    "idempotencyKey" TEXT,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileStorage" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'db',
    "storageKey" TEXT,
    "bytes" BYTEA,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvidence" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindingEvidence" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'screenshot',
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FindingEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiUser" (
    "userId" TEXT NOT NULL,
    "audits" INTEGER NOT NULL,
    "tasks" INTEGER NOT NULL,
    "findings" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "sparkline" JSONB NOT NULL,

    CONSTRAINT "KpiUser_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "KpiRule" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KpiRule_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "KpiEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "auditId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "href" TEXT,
    "auditId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "actorId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditToken" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "issued" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    "status" "TokenStatus" NOT NULL,
    "lastUsed" TEXT NOT NULL,
    "tasks" INTEGER NOT NULL,

    CONSTRAINT "AuditToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSyncSession" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "findingCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentSyncSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTokenUsageLog" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTokenUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesktopAgentVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "sha256" TEXT,
    "signature" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesktopAgentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "approvalStage" TEXT,
    "generated" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "format" JSONB NOT NULL,
    "summary" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "success" BOOLEAN NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "ip" TEXT,
    "device" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalEvent" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStatusHistory" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskSubmissionFile" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskSubmissionFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigUpload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "gapCount" INTEGER NOT NULL DEFAULT 0,
    "severityAgg" JSONB NOT NULL,
    "auditId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfigUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyzedDevice" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "model" TEXT,
    "firmware" TEXT,
    "findingsAgg" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyzedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAnalysisResult" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT,
    "scope" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrafficUpload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "anomalyCount" INTEGER NOT NULL DEFAULT 0,
    "severityAgg" JSONB NOT NULL,
    "totalPackets" INTEGER NOT NULL DEFAULT 0,
    "uniqueIps" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'analyzed',
    "parsed" TEXT,
    "aiResult" TEXT,
    "aiOk" BOOLEAN NOT NULL DEFAULT false,
    "auditId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrafficUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ScannerUpload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "scanner" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "findingCount" INTEGER NOT NULL DEFAULT 0,
    "severityAgg" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'analyzed',
    "aiResult" TEXT,
    "aiOk" BOOLEAN NOT NULL DEFAULT false,
    "auditId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScannerUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopologyAiAnalysis" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopologyAiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopologyEnrichment" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopologyEnrichment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAiAnalysis" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditAiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "OrgContact_orgId_idx" ON "OrgContact"("orgId");

-- CreateIndex
CREATE INDEX "OrgDevice_orgId_idx" ON "OrgDevice"("orgId");

-- CreateIndex
CREATE INDEX "Audit_orgId_idx" ON "Audit"("orgId");

-- CreateIndex
CREATE INDEX "Audit_leaderId_idx" ON "Audit"("leaderId");

-- CreateIndex
CREATE INDEX "AuditMember_userId_idx" ON "AuditMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditProject_auditId_key" ON "AuditProject"("auditId");

-- CreateIndex
CREATE INDEX "AuditProject_status_idx" ON "AuditProject"("status");

-- CreateIndex
CREATE INDEX "AuditProject_currentApprovalStage_idx" ON "AuditProject"("currentApprovalStage");

-- CreateIndex
CREATE INDEX "AuditProjectApproval_projectId_idx" ON "AuditProjectApproval"("projectId");

-- CreateIndex
CREATE INDEX "AuditProjectApproval_actorId_idx" ON "AuditProjectApproval"("actorId");

-- CreateIndex
CREATE INDEX "Task_auditId_idx" ON "Task"("auditId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE UNIQUE INDEX "Finding_idempotencyKey_key" ON "Finding"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Finding_auditId_idx" ON "Finding"("auditId");

-- CreateIndex
CREATE INDEX "Finding_taskId_idx" ON "Finding"("taskId");

-- CreateIndex
CREATE INDEX "Finding_reportedById_idx" ON "Finding"("reportedById");

-- CreateIndex
CREATE INDEX "FileStorage_uploadedById_idx" ON "FileStorage"("uploadedById");

-- CreateIndex
CREATE INDEX "FileStorage_sha256_idx" ON "FileStorage"("sha256");

-- CreateIndex
CREATE INDEX "AuditEvidence_auditId_idx" ON "AuditEvidence"("auditId");

-- CreateIndex
CREATE INDEX "AuditEvidence_fileId_idx" ON "AuditEvidence"("fileId");

-- CreateIndex
CREATE INDEX "FindingEvidence_findingId_idx" ON "FindingEvidence"("findingId");

-- CreateIndex
CREATE INDEX "FindingEvidence_fileId_idx" ON "FindingEvidence"("fileId");

-- CreateIndex
CREATE INDEX "FindingEvidence_uploadedById_idx" ON "FindingEvidence"("uploadedById");

-- CreateIndex
CREATE INDEX "KpiEvent_userId_idx" ON "KpiEvent"("userId");

-- CreateIndex
CREATE INDEX "KpiEvent_ruleCode_idx" ON "KpiEvent"("ruleCode");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditToken_auditId_idx" ON "AuditToken"("auditId");

-- CreateIndex
CREATE INDEX "AgentSyncSession_tokenId_idx" ON "AgentSyncSession"("tokenId");

-- CreateIndex
CREATE INDEX "AgentSyncSession_auditId_idx" ON "AgentSyncSession"("auditId");

-- CreateIndex
CREATE INDEX "AuditTokenUsageLog_tokenId_idx" ON "AuditTokenUsageLog"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopAgentVersion_version_key" ON "DesktopAgentVersion"("version");

-- CreateIndex
CREATE INDEX "Report_auditId_idx" ON "Report"("auditId");

-- CreateIndex
CREATE INDEX "LoginAttempt_email_idx" ON "LoginAttempt"("email");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_idx" ON "LoginAttempt"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "ApprovalEvent_entityType_entityId_idx" ON "ApprovalEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "TaskStatusHistory_taskId_idx" ON "TaskStatusHistory"("taskId");

-- CreateIndex
CREATE INDEX "TaskSubmissionFile_historyId_idx" ON "TaskSubmissionFile"("historyId");

-- CreateIndex
CREATE INDEX "ConfigUpload_auditId_idx" ON "ConfigUpload"("auditId");

-- CreateIndex
CREATE INDEX "ConfigUpload_taskId_idx" ON "ConfigUpload"("taskId");

-- CreateIndex
CREATE INDEX "ConfigUpload_uploadedById_idx" ON "ConfigUpload"("uploadedById");

-- CreateIndex
CREATE INDEX "AnalyzedDevice_uploadId_idx" ON "AnalyzedDevice"("uploadId");

-- CreateIndex
CREATE INDEX "AiAnalysisResult_uploadId_idx" ON "AiAnalysisResult"("uploadId");

-- CreateIndex
CREATE INDEX "AiAnalysisResult_scope_idx" ON "AiAnalysisResult"("scope");

-- CreateIndex
CREATE INDEX "TrafficUpload_auditId_idx" ON "TrafficUpload"("auditId");

-- CreateIndex
CREATE INDEX "TrafficUpload_taskId_idx" ON "TrafficUpload"("taskId");

-- CreateIndex
CREATE INDEX "TrafficUpload_uploadedById_idx" ON "TrafficUpload"("uploadedById");

-- CreateIndex
CREATE INDEX "ScannerUpload_auditId_idx" ON "ScannerUpload"("auditId");

-- CreateIndex
CREATE INDEX "ScannerUpload_taskId_idx" ON "ScannerUpload"("taskId");

-- CreateIndex
CREATE INDEX "ScannerUpload_uploadedById_idx" ON "ScannerUpload"("uploadedById");

-- CreateIndex
CREATE INDEX "TopologyAiAnalysis_auditId_idx" ON "TopologyAiAnalysis"("auditId");

-- CreateIndex
CREATE INDEX "TopologyEnrichment_auditId_createdAt_idx" ON "TopologyEnrichment"("auditId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditAiAnalysis_auditId_idx" ON "AuditAiAnalysis"("auditId");

-- CreateIndex
CREATE INDEX "AiConversation_userId_auditId_idx" ON "AiConversation"("userId", "auditId");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");

-- AddForeignKey
ALTER TABLE "OrgContact" ADD CONSTRAINT "OrgContact_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDevice" ADD CONSTRAINT "OrgDevice_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditMember" ADD CONSTRAINT "AuditMember_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditMember" ADD CONSTRAINT "AuditMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditProject" ADD CONSTRAINT "AuditProject_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditProjectApproval" ADD CONSTRAINT "AuditProjectApproval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AuditProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditProjectApproval" ADD CONSTRAINT "AuditProjectApproval_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStorage" ADD CONSTRAINT "FileStorage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidence" ADD CONSTRAINT "AuditEvidence_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidence" ADD CONSTRAINT "AuditEvidence_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingEvidence" ADD CONSTRAINT "FindingEvidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingEvidence" ADD CONSTRAINT "FindingEvidence_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingEvidence" ADD CONSTRAINT "FindingEvidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiUser" ADD CONSTRAINT "KpiUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiEvent" ADD CONSTRAINT "KpiEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditToken" ADD CONSTRAINT "AuditToken_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditToken" ADD CONSTRAINT "AuditToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmissionFile" ADD CONSTRAINT "TaskSubmissionFile_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "TaskStatusHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmissionFile" ADD CONSTRAINT "TaskSubmissionFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigUpload" ADD CONSTRAINT "ConfigUpload_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigUpload" ADD CONSTRAINT "ConfigUpload_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigUpload" ADD CONSTRAINT "ConfigUpload_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyzedDevice" ADD CONSTRAINT "AnalyzedDevice_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "ConfigUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysisResult" ADD CONSTRAINT "AiAnalysisResult_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "ConfigUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficUpload" ADD CONSTRAINT "TrafficUpload_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficUpload" ADD CONSTRAINT "TrafficUpload_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficUpload" ADD CONSTRAINT "TrafficUpload_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannerUpload" ADD CONSTRAINT "ScannerUpload_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannerUpload" ADD CONSTRAINT "ScannerUpload_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannerUpload" ADD CONSTRAINT "ScannerUpload_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
