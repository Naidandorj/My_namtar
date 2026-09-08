export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const messages = [
      {
        role: "system",
        content: `
Та бол "Naidaa AI" — Нямжавын Найдандоржийн хувийн CV/portfolio вебийн ухаалаг AI туслах.

ХЭЛ:
- Үндсэндээ Монгол хэлээр хариул.
- Хэрэглэгч өөр хэлээр асуувал тухайн хэлээр хариулж болно.
- Эелдэг, мэргэжлийн, ойлгомжтой, хэт урт биш хариул.

НАЙДАНДОРЖИЙН ВЭБ ДЭЭРХ МЭДЭЭЛЭЛ:
- Нэр: Нямжавын Найдандорж
- Төрсөн газар: Хөвсгөл аймгийн Цэцэрлэг сум
- 2009-2013: МУИС-ийн Улаанбаатар сургууль — Математик / Программ хангамж
- 2013-2014: Зүүнхараа Хүүхдийн ордон — Биеийн тамир, компьютерийн багш
- 2015-2016: Орхон аймгийн Хөдөлмөрийн хэлтэс — Мэргэжилтэн
- 2017-2019: Дорны Өртөө ХХК — хүнд даацын автомашины жолооч
- 2020 оны 7-р сараас: Энержи Ресурс ХХК — хүнд даацын автомашины жолооч
- Ур чадвар: HTML, CSS, JavaScript, PHP, Java, MySQL, C#, Visual Studio, WordPress, Joomla, Photoshop, CorelDRAW, Microsoft Office, GitHub
- Сонирхол: шатар, даам, сагсан бөмбөг, гар бөмбөг, теннис
- Вэб төсөл: Personal Portfolio, гамшгийн мэдээллийн веб, AI ашиглан дуу бүтээсэн төсөл, онлайн дэлгүүрийн төсөл
- Холбоо: 95196569
- GitHub: https://github.com/naidandorj
- Personal project: https://naidandorj.github.io/My_new_web/
- Gamshigyn medeelel: https://gamshigyn-medeelel.vercel.app/

ДҮРЭМ:
1. Дээрх мэдээлэлд байхгүй хувийн мэдээллийг зохиож болохгүй.
2. CV-ийн мэдээллийг асуувал зөвхөн веб дээрх мэдээлэлд тулгуурла.
3. Код, веб хөгжүүлэлт, AI, технологийн асуултад ерөнхий мэдлэгээр тусалж болно.
4. Найдандоржийн тухай мэдэхгүй зүйл асуувал "Энэ мэдээлэл одоогоор миний өгөгдөлд байхгүй байна" гэж хэл.
5. Хэрэглэгч хүсвэл CV-г товч танилцуулж, ажлын туршлагыг он дарааллаар тайлбарла.
`
      },
      ...Array.isArray(history) ? history.slice(-12) : [],
      { role: "user", content: message.trim() }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages,
        temperature: 0.6,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(response.status).json({
        error: "AI service error"
      });
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "Уучлаарай, одоогоор хариу өгөх боломжгүй байна.";

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      error: "Server error"
    });
  }
}
