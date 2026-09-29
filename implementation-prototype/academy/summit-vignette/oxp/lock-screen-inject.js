/**
 * Summit vignette #8 — OXP Mobile lock screen / text notification.
 *
 * Script beat (0:34): "She opens OXP Mobile" — cuts from an owner text
 * landing on the lock screen straight into the app. This overlays a simple
 * iOS-style lock screen with the incoming Whitfield Capital text on top of
 * the phone mount, then dismisses on tap to reveal Command Center
 * underneath (already loaded, no navigation).
 *
 * `window.__summitShowLockScreen()` is exposed so the Agent Studio preview
 * chrome (outside the phone frame) can replay this for repeat takes.
 */
(function () {
  const OVERLAY_ID = "summit-oxp-lock-screen";
  const API = "/api/summit-vignette/notifications";

  const FALLBACK_NOTIFICATION = {
    title: "Whitfield Capital",
    subtitle:
      "Income statement — Oakwood versus the whole region. How are we doing?",
  };

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

  function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function buildOverlay(notification) {
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.style.cssText =
      "position:absolute;inset:0;z-index:2147483647;display:flex;flex-direction:column;" +
      "align-items:center;background:linear-gradient(160deg,#1c1c2b 0%,#2b2440 55%,#1c1c2b 100%);" +
      "font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;color:#fff;" +
      "border-radius:inherit;overflow:hidden;cursor:pointer;padding:48px 20px 32px;box-sizing:border-box;";

    const now = new Date();

    const time = document.createElement("div");
    time.textContent = formatTime(now);
    time.style.cssText = "font-size:64px;font-weight:600;line-height:1.05;letter-spacing:-1px;";

    const date = document.createElement("div");
    date.textContent = formatDate(now);
    date.style.cssText = "font-size:15px;font-weight:500;color:rgba(255,255,255,0.85);margin-top:6px;";

    const spacer = document.createElement("div");
    spacer.style.cssText = "flex:1;min-height:24px;";

    const banner = document.createElement("div");
    banner.style.cssText =
      "width:100%;max-width:340px;display:flex;gap:12px;align-items:flex-start;" +
      "background:rgba(255,255,255,0.16);backdrop-filter:blur(20px);border-radius:18px;" +
      "padding:14px;box-shadow:0 8px 30px rgba(0,0,0,0.25);animation:summit-notif-drop 0.4s ease-out;";

    const icon = document.createElement("div");
    icon.textContent = "W";
    icon.style.cssText =
      "flex-shrink:0;width:36px;height:36px;border-radius:9px;background:#c0392b;" +
      "display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;";

    const body = document.createElement("div");
    body.style.cssText = "min-width:0;flex:1;text-align:left;";

    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:space-between;gap:8px;";

    const sender = document.createElement("div");
    sender.textContent = notification.title;
    sender.style.cssText = "font-size:14px;font-weight:700;";

    const when = document.createElement("div");
    when.textContent = "now";
    when.style.cssText = "font-size:12px;color:rgba(255,255,255,0.6);flex-shrink:0;";

    row.appendChild(sender);
    row.appendChild(when);

    const message = document.createElement("div");
    message.textContent = notification.subtitle;
    message.style.cssText = "font-size:13px;line-height:18px;margin-top:2px;color:rgba(255,255,255,0.92);";

    body.appendChild(row);
    body.appendChild(message);

    banner.appendChild(icon);
    banner.appendChild(body);

    const spacer2 = document.createElement("div");
    spacer2.style.cssText = "flex:1;min-height:24px;";

    const hint = document.createElement("div");
    hint.textContent = "tap to open";
    hint.style.cssText =
      "font-size:13px;font-weight:500;color:rgba(255,255,255,0.7);letter-spacing:0.5px;text-transform:uppercase;";

    const style = document.createElement("style");
    style.textContent =
      "@keyframes summit-notif-drop{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}";

    overlay.appendChild(style);
    overlay.appendChild(time);
    overlay.appendChild(date);
    overlay.appendChild(spacer);
    overlay.appendChild(banner);
    overlay.appendChild(spacer2);
    overlay.appendChild(hint);

    overlay.addEventListener("click", () => dismissOverlay());

    return overlay;
  }

  function dismissOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.style.transition = "opacity 0.25s ease-out";
    overlay.style.opacity = "0";
    window.setTimeout(() => overlay.remove(), 250);
  }

  async function fetchNotification() {
    try {
      const res = await fetch(API);
      if (res.ok) {
        const data = await res.json();
        const ownerNotification = (data.notifications || []).find(
          (n) => n.category === "owner",
        );
        if (ownerNotification) return ownerNotification;
      }
    } catch (_err) {
      /* use fallback */
    }
    return FALLBACK_NOTIFICATION;
  }

  async function showLockScreen() {
    const mount = findPhoneMount();
    if (!mount) return;
    if (getComputedStyle(mount).position === "static") {
      mount.style.position = "relative";
    }
    document.getElementById(OVERLAY_ID)?.remove();
    const notification = await fetchNotification();
    mount.appendChild(buildOverlay(notification));
  }

  window.__summitShowLockScreen = showLockScreen;

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (findPhoneMount()) {
      window.clearInterval(timer);
      showLockScreen();
    } else if (attempts > 40) {
      window.clearInterval(timer);
    }
  }, 300);
})();
