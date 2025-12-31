import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const prompt = (req.body && (req.body as any).prompt) || "";
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: String(prompt) }] }],
        }),
      }
    );

    const text = await r.text();
    // Gemini 에러를 그대로 보여주기(원인 파악용)
    return res.status(r.status).send(text);
  } catch (e: any) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message ?? e) });
  }
}
