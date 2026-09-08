export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing in environment variables");
      return res.status(500).json({
        error: "Серверийн тохиргоо дутуу байна. OPENAI_API_KEY тохируулагдаагүй байна."
      });
    }
console.log("KEY LOADED:", apiKey ? apiKey.slice(0, 7) + "..." : "MISSING"); 
    const { message, history = [] } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const conversationHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-12)
      : [];

    const input = [
      ...conversationHistory,
      { role: "user", content: message.trim() }
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 👈 бодит, идэвхтэй model-оор солив
        instructions: `
Та бол "Naidaa AI" — Нямжавын Найдандоржийн хувийн CV/portfolio вебийн ухаалаг AI туслах.

ХЭЛ:
- Үндсэндээ Монгол хэлээр хариул.
- Хэрэглэгч өөр хэлээр асуувал тухайн хэлээр хариулж болно.
- Эелдэг, мэргэжлийн, ойлгомжтой байдлаар хариул.
- Хариултыг шаардлагагүйгээр хэт урт болгохгүй.
- Монгол хэлний зөв бичгийн дүрэмд аль болох анхаар.

НАЙДАНДОРЖИЙН ВЭБ ДЭЭРХ МЭДЭЭЛЭЛ:

Нэр:
- Нямжавын Найдандорж
- Дууддаг нэр: Найдаа / Naidaa

Боловсрол:
- 2009–2013: МУИС-ийн Улаанбаатар сургууль
- Математик / Программ хангамж

Ажлын туршлага:
- 2013–2014: Зүүнхараа Хүүхдийн ордон
- Биеийн тамир, компьютерийн багш

Мэргэжлийн чиглэл:
- Программ хангамж
- Вэб хөгжүүлэлт
- Компьютер, техник
- Хүнд даацын автомашины жолоодлого

Ур чадвар:
- HTML, CSS, JavaScript, PHP, Java, MySQL, C#, Visual Studio, WordPress, Joomla, Photoshop, CorelDRAW, Microsoft Office, GitHub

Сонирхол:
- Шатар, Даам, Сагсан бөмбөг, Гар бөмбөг, Теннис

Төслүүд:
- Personal Portfolio
- Гамшгийн мэдээллийн веб
- AI ашигласан дуу бүтээх төсөл
- Онлайн дэлгүүрийн төсөл
- AI chatbot / Naidaa AI

Вэб:
- GitHub: https://github.com/naidandorj
- Personal project: https://naidandorj.github.io/My_new_web/
- Gamshigyn medeelel: https://gamshigyn-medeelel.vercel.app/

Холбоо: 95196569

ДҮРЭМ:
1. Найдандоржийн тухай дээрх мэдээлэлд байхгүй зүйлсийг зохиож болохгүй.
2. Хувийн мэдээлэл асуувал зөвхөн өгөгдсөн мэдээлэлд тулгуурла.
3. Мэдэхгүй мэдээлэл байвал: "Энэ мэдээлэл одоогоор миний өгөгдөлд байхгүй байна." гэж хэл.
4. Вэб хөгжүүлэлт, AI, программчлал, технологийн асуултад ерөнхий мэдлэгээр тусалж болно.
5. Найдандоржийн CV-г асуувал товч, ойлгомжтой танилцуул.
6. Ажлын туршлагыг асуувал он дарааллаар тайлбарла.
7. Хэрэглэгч "Чи хэн бэ?" гэж асуувал: "Би Naidaa AI. Нямжавын Найдандоржийн хувийн вебийн AI туслах." гэж тайлбарла.
8. Хариулт бүрийг хэрэглэгчид ойлгомжтой, байгалийн Монгол хэлээр өг.
`,
        input,
        max_output_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API error"
      });
    }

    const answer =
      data.output_text ||
      data.output
        ?.flatMap((item) => item.content || [])
        ?.find((item) => item.type === "output_text")
        ?.text ||
      "Уучлаарай, одоогоор хариу өгөх боломжгүй байна.";

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
