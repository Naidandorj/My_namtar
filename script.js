const aiChatButton =
  document.getElementById("aiChatButton");

const aiChatBox =
  document.getElementById("aiChatBox");

const aiCloseButton =
  document.getElementById("aiCloseButton");

const aiInput =
  document.getElementById("aiInput");

const aiSendButton =
  document.getElementById("aiSendButton");

const aiMessages =
  document.getElementById("aiMessages");


let conversationHistory = [];


/* OPEN CHAT */

aiChatButton.addEventListener("click", () => {

  aiChatBox.style.display = "flex";

  aiInput.focus();

});


/* CLOSE CHAT */

aiCloseButton.addEventListener("click", () => {

  aiChatBox.style.display = "none";

});


/* ADD MESSAGE */

function addMessage(text, type) {

  const message = document.createElement("div");

  message.className =
    `ai-message ${type}`;

  message.innerHTML =
    text.replace(/\n/g, "<br>");

  aiMessages.appendChild(message);

  aiMessages.scrollTop =
    aiMessages.scrollHeight;
}


/* SEND MESSAGE */

async function sendMessage() {

  const message =
    aiInput.value.trim();

  if (!message) return;


  addMessage(message, "ai-user");

  aiInput.value = "";

  aiSendButton.disabled = true;

  const loading =
    document.createElement("div");

  loading.className =
    "ai-message ai-bot";

  loading.id = "aiLoading";

  loading.innerHTML =
    "⏳ Бодож байна...";

  aiMessages.appendChild(loading);


  try {

    const response =
      await fetch("/api/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          message: message,

          history: conversationHistory

        })

      });


    const data =
      await response.json();


    document
      .getElementById("aiLoading")
      ?.remove();


    if (!response.ok) {

      addMessage(
        "⚠️ Уучлаарай, сервертэй холбогдоход алдаа гарлаа.",
        "ai-bot"
      );

      return;
    }


    addMessage(
      data.answer,
      "ai-bot"
    );


    conversationHistory.push(
      {
        role: "user",
        content: message
      },

      {
        role: "assistant",
        content: data.answer
      }
    );


    conversationHistory =
      conversationHistory.slice(-10);


  } catch (error) {

    console.error(error);

    document
      .getElementById("aiLoading")
      ?.remove();

    addMessage(
      "⚠️ Интернэт эсвэл серверийн алдаа гарлаа.",
      "ai-bot"
    );

  } finally {

    aiSendButton.disabled = false;

    aiInput.focus();

  }
}


/* SEND BUTTON */

aiSendButton.addEventListener(
  "click",
  sendMessage
);


/* ENTER */

aiInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {

      event.preventDefault();

      sendMessage();

    }

  }
);
