import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing GEMINI_API_KEY" }));
      return;
    }

    const body = req.body ?? {};
    const query = String(body.query ?? "");
    const weightPerCube = Number(body.weightPerCube ?? 0);
    const targetCount = Number(body.targetCount ?? 0);
    const prompt = typeof body.prompt === "string" ? body.prompt : "";

    const finalPrompt =
      (prompt && prompt.trim()) || buildRecipePrompt(query, weightPerCube, targetCount);

    if (!finalPrompt.trim()) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing query/prompt" }));
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: finalPrompt,
      config: { thinkingConfig: { thinkingBudget: 0 } },
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ text: response.text ?? "" }));
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Server error", detail: String(e?.message ?? e) }));
  }
}

function buildRecipePrompt(query: string, weightPerCube: number, targetCount: number) {
  const safeQuery = (query || "").trim();
  if (!safeQuery || !weightPerCube || !targetCount) return "";

  const totalWeight = weightPerCube * targetCount;

  return `이유식 조리법 및 분량 계산 요청: "${safeQuery}".

사용자 조리 목표:
- 큐브 1개당 무게: ${weightPerCube}g
- 만들고 싶은 큐브 총 개수: ${targetCount}개
- 총 완성량 목표: 약 ${totalWeight}g

너는 '밍키봇'이라는 이름의 친절한 이유식 전문가야. 다음 규칙을 엄격히 지켜서 한국어로 답변해줘:
1. 표준 계량 준수: 모든 재료는 반드시 '표준 계량 기준'으로 설명해. (단위: g, ml, 1큰술=15ml, 1작은술=5ml 등)
2. 핵심 요약: 불필요한 미사여구 없이 정보 위주로 아주 간결하게 요약해.
3. 기호 금지: '#', '*' 와 같은 마크다운 기호를 절대 사용하지 마. 제목은 대괄호 [ ] 를 사용하고, 목록은 숫자나 하이픈(-)을 사용해.
4. 구성:
   [장보기 리스트]: ${targetCount}개 큐브를 위해 필요한 생재료의 표준 계량 무게(g)와 부피(ml).
   [조리 단계]: 아주 짧고 명확한 단계별 설명.
   [소분 팁]: ${weightPerCube}g씩 나눌 때의 핵심 팁 1개.

마지막에 "총 ${totalWeight}g 분량 ( ${weightPerCube}g 큐브 ${targetCount}개분)" 문구를 포함해줘.`;
}
