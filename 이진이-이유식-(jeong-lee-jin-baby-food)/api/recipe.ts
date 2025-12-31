export default async function handler(req: any, res: any) {
  // CORS / preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY",
        hint: "Vercel Environment Variables에 GEMINI_API_KEY를 추가하세요.",
      });
    }

    // Vercel이 body를 이미 파싱해주는 경우가 많지만, 안전하게 처리
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { query, weightPerCube, targetCount, prompt } = body || {};

    // 프론트에서 prompt만 보내도 되고, query/weight/target으로 보내도 됨
    const finalPrompt =
      prompt ||
      `이유식 조리법 및 분량 계산 요청: "${query}". 
사용자 조리 목표:
- 큐브 1개당 무게: ${weightPerCube}g
- 만들고 싶은 큐브 총 개수: ${targetCount}개
- 총 완성량 목표: 약 ${Number(weightPerCube) * Number(targetCount)}g

너는 '밍키봇'이라는 이름의 친절한 이유식 전문가야. 다음 규칙을 엄격히 지켜서 한국어로 답변해줘:
1. 표준 계량 준수: 모든 재료는 반드시 '표준 계량 기준'으로 설명해. (단위: g, ml, 1큰술=15ml, 1작은술=5ml 등)
2. 핵심 요약: 불필요한 미사여구 없이 정보 위주로 아주 간결하게 요약해.
3. 기호 금지: '#', '*' 와 같은 마크다운 기호를 절대 사용하지 마. 제목은 대괄호 [ ] 를 사용하고, 목록은 숫자나 하이픈(-)을 사용해.
4. 구성:
   [장보기 리스트]: ${targetCount}개 큐브를 위해 필요한 생재료의 표준 계량 무게(g)와 부피(ml).
   [조리 단계]: 아주 짧고 명확한 단계별 설명.
   [소분 팁]: ${weightPerCube}g씩 나눌 때의 핵심 팁 1개.
마지막에 "총 ${Number(weightPerCube) * Number(targetCount)}g 분량 ( ${weightPerCube}g 큐브 ${targetCount}개분)" 문구를 포함해줘.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });

    const rawText = await r.text();
    if (!r.ok) {
      // 모델 404, 키 권한, 결제/쿼터 등 원인을 그대로 내려주기
      return res.status(500).json({ error: "Server error", detail: rawText });
    }

    const data = JSON.parse(rawText);
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || "";

    return res.status(200).json({ text });
  } catch (e: any) {
    return res.status(500).json({ error: "Unhandled error", detail: String(e?.message || e) });
  }
}
