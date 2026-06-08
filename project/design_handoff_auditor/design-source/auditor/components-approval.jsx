/* Shared 3-stage approval flow (TZ §7 loyiha / §9 topilma).
   group_lead → head → dept → approved, with immutable timeline,
   current-stage chip and stage-aware action buttons. Reused by the
   audit "Audit loyihasi" tab and the finding drawer. */
(function () {
  const { useState } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  const Avatar = window.Avatar;

  // Which role may act on a given stage (prototype-level gate).
  const CAN_ACT = {
    group_lead: ["bosh", "yetakchi", "bolim", "departament"], // group_lead duty
    head:       ["bolim", "departament"],
    dept:       ["departament"],
  };

  function ApprovalFlow({ stages, timeline, current, role = "departament", kind = "project", onChange }) {
    const [stage, setStage] = useState(current);        // current_approval_stage | null (approved) | "returned"
    const [log, setLog] = useState(timeline.slice());
    const [returned, setReturned] = useState(false);

    const order = stages.map(s => s.key);
    const idx = stage && order.indexOf(stage) >= 0 ? order.indexOf(stage) : (stage === null ? order.length : 0);
    const noun = kind === "finding" ? "Topilma" : "Loyiha";

    function actor() {
      const u = D.USERS.find(x => x.role === role) || D.USERS[0];
      return u.id;
    }
    function stamp() {
      const d = new Date();
      const p = n => String(n).padStart(2, "0");
      return `2026-05-21 ${p(d.getHours())}:${p(d.getMinutes())}`;
    }

    const approved = stage === null;
    const canAct = !approved && !returned && stage && (CAN_ACT[stage] || []).includes(role);
    const curStage = stages.find(s => s.key === stage);

    function approve() {
      const nextIdx = idx + 1;
      const next = nextIdx >= order.length ? null : order[nextIdx];
      const label = next === null ? "Yakuniy tasdiqladi" : "Tasdiqladi";
      setLog(l => [...l, { who: actor(), action: label, stage, t: stamp(), state: "done" }]);
      setStage(next);
      setReturned(false);
      window.showToast(next === null ? `${noun} yakuniy tasdiqlandi` : `${noun} keyingi bosqichga o‘tdi`, "success");
      onChange && onChange(next);
    }
    async function reject() {
      const ok = await window.confirmAction({
        title: `${noun}ni qaytarish`,
        body: "Qaytarish sababini kiriting — bu o‘zgarmas tarixga yoziladi va muallifga bildiriladi.",
        confirmLabel: "Qaytarish", danger: true,
      });
      if (!ok) return;
      setLog(l => [...l, { who: actor(), action: "Qaytardi", stage, t: stamp(), state: "returned", comment: "Tuzatish talab qilinadi." }]);
      setReturned(true);
      window.showToast(`${noun} muallifga qaytarildi`, "warning");
      onChange && onChange("returned");
    }
    function resubmit() {
      setLog(l => [...l, { who: actor(), action: "Qayta yubordi", stage: order[0], t: stamp(), state: "done" }]);
      setStage(order[0]);
      setReturned(false);
      window.showToast(`${noun} qayta tasdiqlashga yuborildi`, "info");
      onChange && onChange(order[0]);
    }

    // ---- progress strip ----
    const strip = h("div", { className: "apf__strip", key: "strip" },
      stages.flatMap((s, i) => {
        const done = approved || i < idx;
        const isCur = !approved && !returned && i === idx;
        const seg = h("div", {
          key: s.key,
          className: "apf__node" + (done ? " apf__node--done" : isCur ? " apf__node--current" : ""),
        }, [
          h("div", { key: "d", className: "apf__dot" }, done ? h(I.Check, { size: 14, key: "i" }) : (i + 1)),
          h("div", { key: "b", className: "apf__nbody" }, [
            h("div", { key: 1, className: "apf__ntitle" }, s.title),
            h("div", { key: 2, className: "apf__nrole" }, s.role),
          ]),
        ]);
        if (i === 0) return [seg];
        return [h("div", { key: "c" + i, className: "apf__conn" + (i <= idx || approved ? " apf__conn--done" : "") }), seg];
      })
    );

    // ---- status chip ----
    const chip = approved
      ? h("span", { className: "tag tag--success", key: "c" }, [h(I.Check, { size: 11, key: "i" }), "Yakuniy tasdiqlangan"])
      : returned
        ? h("span", { className: "tag tag--danger", key: "c" }, [h(I.Refresh, { size: 11, key: "i" }), "Qaytarilgan — tuzatish kutilmoqda"])
        : h("span", { className: "tag tag--warning", key: "c" }, [h(I.Clock, { size: 11, key: "i" }), (curStage ? curStage.title : "") + " ko‘rmoqda"]);

    // ---- actions ----
    let actions = null;
    if (returned) {
      actions = h("button", { className: "btn btn--primary btn--sm", onClick: resubmit, key: "rs" }, [h(I.Send, { size: 14, key: "i" }), h("span", { key: "t" }, "Qayta yuborish")]);
    } else if (!approved && canAct) {
      actions = h("div", { style: { display: "flex", gap: 8 }, key: "act" }, [
        h("button", { key: "r", className: "btn btn--danger btn--sm", onClick: reject }, [h(I.X, { size: 14, key: "i" }), h("span", { key: "t" }, "Qaytarish")]),
        h("button", { key: "a", className: "btn btn--primary btn--sm", onClick: approve }, [h(I.Check, { size: 14, key: "i" }), h("span", { key: "t" }, idx + 1 >= order.length ? "Yakuniy tasdiqlash" : "Tasdiqlash")]),
      ]);
    } else if (!approved && !canAct) {
      actions = h("span", { className: "apf__wait", key: "w" }, [h(I.Lock, { size: 13, key: "i" }), h("span", { key: "t" }, "Bu bosqichni " + (curStage ? curStage.title.toLowerCase() : "tasdiqlovchi") + " hal qiladi")]);
    }

    return h("div", { className: "panel apf", key: "apf" }, [
      h("div", { className: "panel__h", key: "h" }, [
        h("div", { className: "panel__t", key: "t" }, [h(I.GitBranch, { size: 15, key: "i" }), h("span", { key: "s" }, "3-bosqichli tasdiqlash")]),
        chip,
      ]),
      h("div", { className: "panel__body", key: "b" }, [
        strip,
        h("div", { className: "apf__bar", key: "bar" }, [
          h("div", { key: "meta", className: "apf__meta" }, approved
            ? "Barcha bosqichlar yakunlandi."
            : returned ? "Muallif tuzatib qayta yuborishi kerak."
            : "Navbat: " + (curStage ? curStage.title : "")),
          h("div", { key: "a", style: { marginLeft: "auto" } }, actions),
        ]),
        // immutable timeline
        h("div", { className: "apf__tl", key: "tl" },
          log.map((e, i) => h("div", { key: i, className: "apf__tlitem apf__tlitem--" + (e.state || "done") }, [
            h("div", { key: "d", className: "apf__tldot" }, e.state === "returned" ? h(I.X, { size: 12, key: "i" }) : h(I.Check, { size: 12, key: "i" })),
            h("div", { key: "b", className: "apf__tlbody" }, [
              h("div", { key: 1, className: "apf__tlhead" }, [
                h(Avatar, { user: e.who, key: "a" }),
                h("span", { key: "n", className: "apf__tlname" }, D.userById(e.who).name),
                h("span", { key: "act", className: "apf__tlaction" }, e.action),
                h("span", { key: "t", className: "apf__tltime tabular" }, e.t),
              ]),
              e.comment ? h("div", { key: 2, className: "apf__tlcomment" }, "“" + e.comment + "”") : null,
            ]),
          ]))
        ),
      ]),
    ]);
  }

  window.ApprovalFlow = ApprovalFlow;
})();
