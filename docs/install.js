(() => {
  const banner = document.getElementById("install-banner");
  const bannerText = document.getElementById("install-banner-text");
  const installBtn = document.getElementById("install-btn");
  const dismissBtn = document.getElementById("install-dismiss");

  const DISMISS_KEY = "rxconsult_install_dismissed";

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  if (isStandalone || sessionStorage.getItem(DISMISS_KEY)) {
    return;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    bannerText.textContent = "Install this app on your phone for one-tap offline access at the counter.";
    installBtn.hidden = false;
    banner.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    banner.hidden = true;
  });

  dismissBtn.addEventListener("click", () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    banner.hidden = true;
  });

  if (isIOS) {
    bannerText.innerHTML =
      "To install: tap the <strong>Share</strong> icon in Safari, then choose " +
      "<strong>“Add to Home Screen.”</strong>";
    installBtn.hidden = true;
    banner.hidden = false;
  }
})();
