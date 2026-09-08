/* ==========================================================================
   NAIDAA AI + INTRO VIDEO
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ------------------------------------------------------------------------
     NAIDAA AI
  ------------------------------------------------------------------------ */
  const fab = document.getElementById("naidaaAiFab");
  const panel = document.getElementById("naidaaAiPanel");
  const closeBtn = document.getElementById("naidaaAiClose");
  const input = document.getElementById("naidaaAiInput");
  const sendBtn = document.getElementById("naidaaAiSend");
  const messages = document.getElementById("naidaaAiMessages");
  const suggestions = document.getElementById("naidaaAiSuggestions");

  let conversationHistory = [];
  let busy = false;

  function openAI() {
    panel?.classList.add("open");
    input?.focus();
  }

  function closeAI() {
    panel?.classList.remove("open");
  }

  function addMessage(text, role) {
    const row = document.createElement("div");
    row.className = `naidaa-ai-msg ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "naidaa-ai-bubble";
    bubble.textContent = text;

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
    return row;
  }

  function addTyping() {
    const row = document.createElement("div");
    row.className = "naidaa-ai-msg bot";
    row.id = "naidaaAiTyping";

    const bubble = document.createElement("div");
    bubble.className = "naidaa-ai-bubble naidaa-ai-typing";
    bubble.innerHTML = "<b></b><b></b><b></b>";

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
  }

  async function sendAIMessage(text) {
    const message = String(text || "").trim();
    if (!message || busy) return;

    busy = true;
    sendBtn.disabled = true;

    addMessage(message, "user");
    input.value = "";
    addTyping();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: conversationHistory
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {}

      document.getElementById("naidaaAiTyping")?.remove();

      if (!response.ok) {
        throw new Error(data.error || "AI service error");
      }

      const answer = data.answer || "Уучлаарай, хариу олдсонгүй.";
      addMessage(answer, "bot");

      conversationHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: answer }
      );
      conversationHistory = conversationHistory.slice(-12);

    } catch (error) {
      console.error(error);
      document.getElementById("naidaaAiTyping")?.remove();

      addMessage(
        "⚠️ Naidaa AI-тэй холбогдоход алдаа гарлаа. Vercel-ийн Environment Variables дээр OPENAI_API_KEY зөв тохируулагдсан эсэхийг шалгана уу.",
        "bot"
      );
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  fab?.addEventListener("click", () => {
    if (panel.classList.contains("open")) closeAI();
    else openAI();
  });

  closeBtn?.addEventListener("click", closeAI);

  sendBtn?.addEventListener("click", () => sendAIMessage(input.value));

  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendAIMessage(input.value);
    }
  });

  suggestions?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;
    openAI();
    sendAIMessage(button.dataset.question);
  });

  /* ------------------------------------------------------------------------
     INTRO VIDEO
  ------------------------------------------------------------------------ */
  const overlay = document.getElementById("introVideo");
  const video = document.getElementById("introPlayer");
  const skip = document.getElementById("skipIntro");
  const unmuteBtn = document.getElementById("unmuteBtn");
  const cv = document.getElementById("cvPage");
  const progress = document.getElementById("introProgress");

  if (!overlay || !video || !cv) return;

  document.body.classList.add("intro-lock");

  let closed = false;

  function revealCV() {
    if (closed) return;
    closed = true;

    if (progress) progress.style.width = "100%";
    overlay.classList.add("hide");
    cv.classList.add("ready");
    document.body.classList.remove("intro-lock");

    setTimeout(() => overlay.remove(), 1200);
  }

  video.addEventListener("timeupdate", () => {
    if (video.duration && isFinite(video.duration) && progress) {
      progress.style.width =
        (video.currentTime / video.duration * 100) + "%";
    }
  });

  video.addEventListener("ended", revealCV);
  video.addEventListener("error", revealCV);
  skip?.addEventListener("click", revealCV);

  unmuteBtn?.addEventListener("click", () => {
    video.muted = false;
    video.volume = 1;
    unmuteBtn.style.display = "none";
  });

  video.play().catch(() => {});
});
