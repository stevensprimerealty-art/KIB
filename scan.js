// scan.js — QR page (NO demo payment, NO fake success)

window.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const tabShow = $("tabShow");
  const tabCam = $("tabCam");
  const panelShow = $("panelShow");
  const panelCam = $("panelCam");

  function setTab(which) {
    const show = which === "show";
    tabShow?.classList.toggle("is-active", show);
    tabCam?.classList.toggle("is-active", !show);
    tabShow?.setAttribute("aria-selected", show ? "true" : "false");
    tabCam?.setAttribute("aria-selected", show ? "false" : "true");
    if (panelShow) panelShow.hidden = !show;
    if (panelCam) panelCam.hidden = show;

    // stop camera when switching away
    if (show) stopCamera();
  }

  tabShow?.addEventListener("click", () => setTab("show"));
  tabCam?.addEventListener("click", () => setTab("cam"));

  // -------------------------
  // Show QR + Copy (NO DEMO)
  // -------------------------
  const copyBtn = $("copyLink");
  const copyMsg = $("copyMsg");

  // ✅ Put your REAL payment string / URL here (or leave empty)
  const PAYMENT_STRING = ""; // e.g. "https://stevensprimerealty-art.github.io/KIB/pay"

  copyBtn?.addEventListener("click", async () => {
    // If you don't have a real value yet, show INVALID (as you requested)
    if (!PAYMENT_STRING) {
      if (copyMsg) copyMsg.textContent = "Invalid. Contact bank • More information.";
      return;
    }

    try {
      await navigator.clipboard.writeText(PAYMENT_STRING);
      if (copyMsg) copyMsg.textContent = "Copied.";
    } catch {
      if (copyMsg) copyMsg.textContent = "Copy not supported on this device.";
    }
  });

  // -------------------------
  // Camera scan (NO DEMO)
  // -------------------------
  const startBtn = $("startCam");
  const stopBtn = $("stopCam");
  const video = $("video");
  const result = $("scanResult");
  const fallback = $("fallback");

  let stream = null;
  let raf = null;
  let detector = null;

  function setResult(text) {
    if (result) result.textContent = text || "";
  }

  function setFallback(text) {
    if (fallback) fallback.textContent = text || "";
  }

  async function startCamera() {
    setResult("");
    setFallback("");

    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasBarcodeDetector = "BarcodeDetector" in window;

    if (!hasGetUserMedia) {
      setFallback("Camera not supported on this browser. Use “Show QR” option.");
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      if (video) {
        video.srcObject = stream;
        await video.play();
      }

      if (stopBtn) stopBtn.disabled = false;

      if (!hasBarcodeDetector) {
        setFallback("QR scan not supported here. Try Chrome on mobile or use “Show QR”.");
        return;
      }

      detector = new BarcodeDetector({ formats: ["qr_code"] });

      const loop = async () => {
        if (!video || video.readyState < 2 || !detector) {
          raf = requestAnimationFrame(loop);
          return;
        }

        try {
          const codes = await detector.detect(video);
          if (codes && codes.length) {
            // ✅ We do NOT treat scanned QR as success
            setResult("Invalid. Contact bank • More information.");
            stopCamera();
            return;
          }
        } catch {
          // ignore
        }

        raf = requestAnimationFrame(loop);
      };

      raf = requestAnimationFrame(loop);
    } catch {
      setFallback("Could not access camera. Allow permission or use “Show QR”.");
    }
  }

  function stopCamera() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    detector = null;

    if (video) {
      video.pause?.();
      video.srcObject = null;
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }

    if (stopBtn) stopBtn.disabled = true;
  }

  startBtn?.addEventListener("click", startCamera);
  stopBtn?.addEventListener("click", stopCamera);
});
