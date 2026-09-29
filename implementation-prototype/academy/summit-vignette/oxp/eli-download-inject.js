/**
 * Summit vignette #8 — auto-download CSV/PDF when ELI Console export completes.
 */
(function () {
  if (window.__summitEliDownloadPatched) return;
  window.__summitEliDownloadPatched = true;

  const nativeFetch = window.fetch.bind(window);

  function triggerDownload(url, filename) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename || "export.csv";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function resolveAppUrl(path) {
    if (!path || path.startsWith("http")) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (
      window.location.pathname.includes("/entrata-3.0/") &&
      !normalized.startsWith("/entrata-3.0/")
    ) {
      return `/entrata-3.0${normalized}`;
    }
    return normalized;
  }

  window.fetch = async function summitEliFetch(input, init) {
    const response = await nativeFetch(input, init);
    const url =
      typeof input === "string"
        ? input
        : input && typeof input.url === "string"
          ? input.url
          : "";

    if (!url.includes("eli/chat/completions")) {
      return response;
    }

    try {
      const payload = await response.clone().json();
      const download = payload && payload.summitDownload;
      if (download && typeof download.url === "string") {
        window.setTimeout(() => {
          triggerDownload(resolveAppUrl(download.url), download.filename);
        }, 350);
      }
    } catch (_err) {
      // Ignore parse errors — normal completions responses still render.
    }

    return response;
  };
})();
