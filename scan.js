// scan.js — NO demo, no link sending. Shows result only.

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
    if (show) stopScan(); // stop camera if switching away
  }

  tabShow?.addEventListener("click", () => setTab("show"));
  tabCam?.addEventListener("click", () => setTab("cam"));

  // Camera scan
  const startBtn = $("startCam");
  const stopBtn = $("stopCam");
  const video = $("video");
  const canvas = $("canvas");
  const camMsg = $("camMsg");
  const resultText = $("resultText");

  let stream = null;
  let raf = null;

  function setMsg(msg) {
    if (camMsg) camMsg.textContent = msg || "";
  }
  function setResult(msg) {
    if (resultText) resultText.textContent = msg || "No result";
  }

  async function startScan() {
    setMsg("");
    setResult("No result");

    if (!video || !canvas) return;

    // In-app browsers often fail on iOS
    // This message helps you debug quickly.
    if (/Gmail|Instagram|FBAN|FBAV/i.test(navigator.userAgent)) {
      setMsg("If camera doesn’t open, tap … and open this page in Safari.");
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      video.srcObject = stream;
      await video.play();

      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;

      // Prefer BarcodeDetector if available
      if ("BarcodeDetector" in window) {
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        loopBarcodeDetector(detector);
      } else {
        // Fallback: jsQR (works on iPhone Safari)
        if (typeof window.jsQR !== "function") {
          setMsg("QR scanning not supported on this device.");
          return;
        }
        loopJsQR();
      }
    } catch (err) {
      setMsg("Camera blocked. Allow camera permission in Safari settings, then try again.");
    }
  }

  function stopScan() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }

    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }

  function loopBarcodeDetector(detector) {
    const tick = async () => {
      if (!video || !detector) return;

      try {
        const codes = await detector.detect(video);
        if (codes && codes.length) {
          setResult(codes[0].rawValue || "QR detected");
          setMsg("QR detected.");
          // stop after success
          stopScan();
          return;
        }
      } catch {
        // ignore detection errors
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function loopJsQR() {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const tick = () => {
      if (!video || !ctx) return;

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        raf = requestAnimationFrame(tick);
        return;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      const img = ctx.getImageData(0, 0, w, h);
      const code = window.jsQR(img.data, w, h, { inversionAttempts: "attemptBoth" });

      if (code?.data) {
        setResult(code.data);
        setMsg("QR detected.");
        stopScan();
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
  }

  startBtn?.addEventListener("click", startScan);
  stopBtn?.addEventListener("click", stopScan);

  // Default tab
  setTab("show");
});
