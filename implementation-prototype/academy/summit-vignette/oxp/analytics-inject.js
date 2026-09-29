/**
 * Summit vignette #8 — inject Analytics (REPORTS nav) below Outcomes on OXP Mobile
 * Command Center. My Workspace opens an in-app overlay (no iframe navigation).
 */
(function () {
  const ROOT_ID = "summit-oxp-analytics-section";
  const STACK_ID = "summit-oxp-analytics-stack";
  const OUTCOMES_LABEL = "Outcomes Achieved by ELI+";
  const API = "/api/summit-vignette/workspace-reports";
  const WORKSPACE_SAVED_NAME = "Maple Creek — July 2026";

  const NAV = [
    { label: "Templates", hint: "Standard catalog", action: "stub" },
    { label: "Company Reports", hint: "Org-published", action: "stub" },
    { label: "My Workspace", hint: "Saved reports", action: "workspace" },
    { label: "Packets", hint: "Owner packages", action: "stub" },
  ];

  const FALLBACK_REPORTS = [
    {
      id: "summit-vignette-whitfield-income",
      name: WORKSPACE_SAVED_NAME,
      updatedAt: "2026-07-15T14:30:00.000Z",
      propertyLabel: "Maple Creek",
      periodLabel: "July 2026",
      compareScope: "Southeast Region",
      owner: "Whitfield Capital",
    },
    {
      id: "summit-vignette-region-noi",
      name: "Southeast Region NOI — T12",
      updatedAt: "2026-08-01T10:00:00.000Z",
      propertyLabel: "Southeast Region",
      periodLabel: "Trailing 12 months",
      compareScope: "Budget",
      owner: "Internal",
    },
  ];

  function findOutcomesSection() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent?.trim() !== OUTCOMES_LABEL) continue;
      let el = node.parentElement;
      while (el && el.childElementCount < 2) {
        el = el.parentElement;
      }
      return el;
    }
    return null;
  }

  function findPhoneMount() {
    const bodyWidth = document.body.getBoundingClientRect().width;
    let mount = null;
    let mountWidth = Infinity;

    document.querySelectorAll("div").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height < 500 || rect.width > bodyWidth * 0.85) return;
      const br = parseFloat(getComputedStyle(el).borderRadius) || 0;
      if (br < 40 || rect.width < 300 || rect.width > 520) return;
      if (rect.width < mountWidth) {
        mount = el;
        mountWidth = rect.width;
      }
    });

    return mount;
  }

  function getStack() {
    const mount = findPhoneMount() || document.body;
    const onPhone = mount !== document.body;

    if (onPhone && getComputedStyle(mount).position === "static") {
      mount.style.position = "relative";
    }

    let stack = mount.querySelector(`#${STACK_ID}`);
    if (stack) return stack;

    stack = document.createElement("div");
    stack.id = STACK_ID;
    stack.style.cssText = onPhone
      ? "position:absolute;inset:0;z-index:2147483646;display:none;flex-direction:column;background:#f5f5f7;font-family:Inter,system-ui,-apple-system,sans-serif;color:#191919;border-radius:inherit;overflow:hidden;"
      : "position:fixed;inset:0;z-index:2147483646;display:none;flex-direction:column;background:#f5f5f7;font-family:Inter,system-ui,-apple-system,sans-serif;color:#191919;";

    mount.appendChild(stack);
    return stack;
  }

  function closeStack() {
    const stack = document.getElementById(STACK_ID);
    if (stack) {
      stack.style.display = "none";
      stack.replaceChildren();
    }
  }

  function openStack(root) {
    const stack = getStack();
    stack.replaceChildren(root);
    stack.style.display = "flex";
  }

  function buildHeader(title, onBack) {
    const header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;gap:8px;padding:14px 16px;background:#fff;border-bottom:1px solid #ebebeb;flex-shrink:0;min-height:52px;box-sizing:border-box;";

    const back = document.createElement("button");
    back.type = "button";
    back.setAttribute("aria-label", "Back");
    back.textContent = "‹";
    back.style.cssText =
      "border:none;background:none;font-size:28px;line-height:1;color:#191919;cursor:pointer;padding:0 4px;margin-right:4px;";
    back.addEventListener("click", onBack);

    const heading = document.createElement("div");
    heading.textContent = title;
    heading.style.cssText = "font-size:17px;font-weight:600;line-height:22px;";

    header.appendChild(back);
    header.appendChild(heading);
    return header;
  }

  function buildScrollBody() {
    const body = document.createElement("div");
    body.style.cssText =
      "flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;box-sizing:border-box;";
    return body;
  }

  function buildShell(title, onBack) {
    const shell = document.createElement("div");
    shell.style.cssText = "display:flex;flex-direction:column;height:100%;width:100%;";
    shell.appendChild(buildHeader(title, onBack));
    return shell;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  function buildReportCard(report, onSelect) {
    const card = document.createElement("button");
    card.type = "button";
    card.style.cssText =
      "display:flex;align-items:flex-start;justify-content:space-between;gap:12px;width:100%;padding:14px 16px;border:1px solid #ebebeb;border-radius:12px;background:#fff;text-align:left;cursor:pointer;box-sizing:border-box;";

    const left = document.createElement("div");
    left.style.cssText = "min-width:0;flex:1;";

    const name = document.createElement("div");
    name.textContent = report.name;
    name.style.cssText =
      "font-size:15px;font-weight:600;line-height:20px;color:#191919;";

    const meta = document.createElement("div");
    meta.textContent = `${report.propertyLabel} · ${report.periodLabel}`;
    meta.style.cssText =
      "font-size:13px;color:#5c5c5c;margin-top:4px;line-height:18px;";

    const sub = document.createElement("div");
    sub.textContent = `vs ${report.compareScope}${report.owner ? ` · ${report.owner}` : ""}`;
    sub.style.cssText = "font-size:12px;color:#7a7a7a;margin-top:2px;line-height:16px;";

    left.appendChild(name);

    const titleIsPropertyPeriod =
      report.name.includes(report.propertyLabel) &&
      report.name.includes(report.periodLabel);
    if (!titleIsPropertyPeriod) {
      left.appendChild(meta);
    }
    left.appendChild(sub);

    const chevron = document.createElement("span");
    chevron.textContent = "›";
    chevron.style.cssText =
      "font-size:20px;color:#7a7a7a;line-height:1;flex-shrink:0;margin-top:2px;";

    card.appendChild(left);
    card.appendChild(chevron);
    card.addEventListener("click", () => onSelect(report));
    return card;
  }

  function openReportDetail(report) {
    const shell = buildShell(report.name, () => openMyWorkspace());
    const body = buildScrollBody();

    const saved = document.createElement("p");
    saved.textContent = `Saved ${formatDate(report.updatedAt)}`;
    saved.style.cssText = "font-size:14px;color:#5c5c5c;margin:0 0 16px;";

    const card = document.createElement("div");
    card.style.cssText =
      "border:1px solid #ebebeb;border-radius:12px;background:#fff;padding:14px 16px;font-size:14px;";

    const rows = [
      ["Last run property", report.propertyLabel],
      ["Period", report.periodLabel],
      ["Compare", report.compareScope],
    ];
    if (report.owner) rows.push(["Owner", report.owner]);

    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.style.cssText =
        "display:flex;justify-content:space-between;gap:16px;padding:6px 0;";
      const dt = document.createElement("span");
      dt.textContent = label;
      dt.style.cssText = "color:#5c5c5c;flex-shrink:0;";
      const dd = document.createElement("span");
      dd.textContent = value;
      dd.style.cssText = "font-weight:600;text-align:right;";
      row.appendChild(dt);
      row.appendChild(dd);
      card.appendChild(row);
    });

    body.appendChild(saved);
    body.appendChild(card);

    shell.appendChild(body);
    openStack(shell);
  }

  async function openMyWorkspace() {
    const shell = buildShell("My Workspace", closeStack);
    const body = buildScrollBody();

    const subtitle = document.createElement("p");
    subtitle.textContent = "Saved reports";
    subtitle.style.cssText = "font-size:14px;color:#5c5c5c;margin:0 0 16px;";

    const loading = document.createElement("p");
    loading.textContent = "Loading reports…";
    loading.style.cssText = "font-size:14px;color:#5c5c5c;";

    const list = document.createElement("div");
    list.style.cssText = "display:flex;flex-direction:column;gap:10px;";

    body.appendChild(subtitle);
    body.appendChild(loading);
    body.appendChild(list);
    shell.appendChild(body);
    openStack(shell);

    let reports = FALLBACK_REPORTS;
    try {
      const res = await fetch(API);
      if (res.ok) {
        const data = await res.json();
        if (data.reports?.length) reports = data.reports;
      }
    } catch {
      /* use fallback */
    }

    loading.remove();
    reports.forEach((report) => {
      list.appendChild(buildReportCard(report, openReportDetail));
    });
  }

  function openStub(label) {
    const shell = buildShell(label, closeStack);
    const body = buildScrollBody();
    const msg = document.createElement("p");
    msg.textContent = "Summit demo — use My Workspace for the Whitfield income statement flow.";
    msg.style.cssText = "font-size:14px;color:#5c5c5c;line-height:20px;margin:0;";
    body.appendChild(msg);
    shell.appendChild(body);
    openStack(shell);
  }

  function handleNavAction(item) {
    if (item.action === "workspace") {
      openMyWorkspace();
      return;
    }
    if (item.action === "stub") {
      openStub(item.label);
    }
  }

  function buildSection() {
    const wrap = document.createElement("div");
    wrap.id = ROOT_ID;
    wrap.style.cssText =
      "margin-top:24px;display:flex;flex-direction:column;gap:12px;font-family:Inter,system-ui,sans-serif;";

    const title = document.createElement("div");
    title.textContent = "Analytics";
    title.style.cssText =
      "font-size:16px;font-weight:600;line-height:22px;color:#191919;";
    wrap.appendChild(title);

    const list = document.createElement("div");
    list.style.cssText = "display:flex;flex-direction:column;gap:8px;";

    NAV.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.cssText =
        "display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:14px 16px;border:1px solid #ebebeb;border-radius:12px;background:#fff;text-align:left;cursor:pointer;box-sizing:border-box;";
      btn.addEventListener("click", () => handleNavAction(item));

      const left = document.createElement("div");
      const name = document.createElement("div");
      name.textContent = item.label;
      name.style.cssText = "font-size:15px;font-weight:600;color:#191919;";
      const hint = document.createElement("div");
      hint.textContent = item.hint;
      hint.style.cssText = "font-size:13px;color:#5c5c5c;margin-top:2px;";
      left.appendChild(name);
      left.appendChild(hint);

      const chevron = document.createElement("span");
      chevron.textContent = "›";
      chevron.style.cssText = "font-size:20px;color:#7a7a7a;line-height:1;";

      btn.appendChild(left);
      btn.appendChild(chevron);
      list.appendChild(btn);
    });

    wrap.appendChild(list);
    return wrap;
  }

  function inject() {
    if (document.getElementById(ROOT_ID)) return true;
    const outcomes = findOutcomesSection();
    if (!outcomes?.parentElement) return false;
    outcomes.parentElement.insertBefore(buildSection(), outcomes.nextSibling);
    return true;
  }

  if (inject()) return;

  const observer = new MutationObserver(() => {
    if (inject()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (inject()) {
      observer.disconnect();
      window.clearInterval(timer);
    } else if (attempts > 120) {
      window.clearInterval(timer);
    }
  }, 400);
})();
