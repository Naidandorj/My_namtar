export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const messages = [
      {
        role: "system",
        content: `
Та Найдандоржийн хувийн веб сайтын AI туслах.

Хэрэглэгчтэй Монгол хэлээр эелдэг, товч бөгөөд ойлгомжтой харилц.

Та дараах зүйлсийн талаар тусалж болно:
- Найдандоржийн танилцуулга
- CV болон ажлын туршлага
- Програмчлал болон веб хөгжүүлэлт
- Технологийн асуулт
- Вэб сайтын талаарх мэдээлэл

Мэдэхгүй зүйлээ зохиож хэлэхгүй.
Хэрэв мэдээлэл байхгүй бол "Энэ мэдээлэл миний өгөгдөлд байхгүй байна" гэж хэл.
        `
      },

      ...history.slice(-10),

      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.4",
          messages,
          temperature: 0.7,
          max_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error: "AI service error"
      });
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "Уучлаарай, одоогоор хариу өгөх боломжгүй байна.";

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
