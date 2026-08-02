(() => {
  const panel = document.getElementById("install-panel");
  const dismissBtn = document.getElementById("install-dismiss");

  const variants = {
    notMobile: document.getElementById("install-not-mobile"),
    iosSafari: document.getElementById("install-ios-safari"),
    iosOther: document.getElementById("install-ios-other"),
    android: document.getElementById("install-android"),
    already: document.getElementById("install-already"),
  };

  const installBtn = document.getElementById("install-btn");
  const androidSteps = document.getElementById("install-android-steps");
  const urlText = document.getElementById("install-url-text");

  const DISMISS_KEY = "rxconsult_install_dismissed";

  function showOnly(key) {
    for (const [k, el] of Object.entries(variants)) {
      if (el) el.hidden = k !== key;
    }
  }

  async function copyLink(feedbackEl) {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      // Fallback for browsers/contexts without Clipboard API access.
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err2) {
        // ignore; feedback still shows the link for manual copy
      }
      document.body.removeChild(textarea);
    }
    if (feedbackEl) {
      feedbackEl.hidden = false;
      feedbackEl.textContent = `Link copied: ${url} — now open Safari and paste it in.`;
    }
  }

  const copyBtnSafari = document.getElementById("copy-link-btn-safari");
  const copyFeedbackSafari = document.getElementById("copy-link-feedback-safari");
  if (copyBtnSafari) copyBtnSafari.addEventListener("click", () => copyLink(copyFeedbackSafari));

  const copyBtnOther = document.getElementById("copy-link-btn-other");
  const copyFeedbackOther = document.getElementById("copy-link-feedback-other");
  if (copyBtnOther) copyBtnOther.addEventListener("click", () => copyLink(copyFeedbackOther));

  const ua = navigator.userAgent;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  if (isStandalone) {
    showOnly("already");
    dismissBtn.hidden = true;
    return;
  }

  if (sessionStorage.getItem(DISMISS_KEY)) {
    panel.hidden = true;
    return;
  }

  dismissBtn.addEventListener("click", () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    panel.hidden = true;
  });

  // iPadOS 13+ sends a desktop-class UA string, so also check for a
  // touch-capable "Mac" as a stand-in for "this is actually an iPad."
  const isIPadDesktopUA = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || isIPadDesktopUA;
  const isAndroid = /Android/.test(ua);

  if (isIOS) {
    const isOtherIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|mercury|DuckDuckGo/.test(ua);
    showOnly(isOtherIOSBrowser ? "iosOther" : "iosSafari");
    return;
  }

  if (isAndroid) {
    showOnly("android");
    androidSteps.hidden = false; // always show manual steps as a fallback

    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.hidden = false;
      androidSteps.hidden = true; // the button is more reliable than the steps, prefer it
    });

    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
      androidSteps.hidden = false;
    });

    window.addEventListener("appinstalled", () => {
      showOnly("already");
      dismissBtn.hidden = true;
    });
    return;
  }

  // Desktop / unrecognized device: point them at opening the link on a phone.
  urlText.textContent = window.location.href;
  showOnly("notMobile");
})();
