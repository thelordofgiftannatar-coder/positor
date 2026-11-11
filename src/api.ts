// All /api/* calls go through here.
// - Web / desktop: relative URL (a server answers).
// - Android app: no server, so (a) use the server URL from Settings if set, otherwise
//   (b) call Google Gemini directly with the user's own key (stored only on the phone).
const KEY = 'diario_gemini_key';
const BASE = 'diario_api_base';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';

export const isNative = (): boolean => !!(window as any).Capacitor?.isNativePlatform?.();
export const getGeminiKey = () => localStorage.getItem(KEY) || '';
export const getApiBase = () => (localStorage.getItem(BASE) || (import.meta as any).env?.VITE_API_BASE || '').replace(/\/$/, '');
export const saveAiConnection = (key: string, base: string) => {
  localStorage.setItem(KEY, key.trim());
  localStorage.setItem(BASE, base.trim());
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function gemini(model: string, key: string, body: unknown) {
  const r = await fetch(`${GEMINI}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `Gemini error ${r.status}`);
  return j;
}
const imageOf = (j: any): string | null => {
  for (const p of j?.candidates?.[0]?.content?.parts ?? []) {
    const d = p.inlineData ?? p.inline_data;
    if (d?.data) return `data:${d.mimeType ?? d.mime_type ?? 'image/png'};base64,${d.data}`;
  }
  return null;
};

async function standalone(path: string, init?: RequestInit): Promise<Response> {
  const key = getGeminiKey();
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  if (path === '/api/gemini/generate-image') {
    if (!key) return json({ error: 'Add your Gemini API key in Settings > AI connection.' }, 400);
    const { prompt, resolution = '1K', aspectRatio = '1:1', style = 'Cinematic' } = body;
    const text = `${prompt}, ${style} style, ultra high definition, masterpiece, highly detailed, vivid lighting`;
    const ar = ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1';
    const size = ['1K', '2K', '4K'].includes(resolution) ? resolution : '1K';
    try {
      const url = imageOf(await gemini('gemini-nano-banana-2.1', key, {
        contents: [{ parts: [{ text }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: ar, imageSize: size } },
      }));
      if (url) return json({ success: true, imageUrl: url });
    } catch { /* try fallback model */ }
    try {
      const url = imageOf(await gemini('gemini-3.1-flash-lite-image', key, {
        contents: [{ parts: [{ text }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: ar } },
      }));
      return url ? json({ success: true, imageUrl: url }) : json({ error: 'No image returned' }, 500);
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  if (path === '/api/gemini/assist') {
    if (!key) return json({ result: 'Add your Gemini API key in Settings > AI connection to use the AI assistant.' });
    const { action, text } = body;
    const prompts: Record<string, string> = {
      refine: `Polish and improve this diary note, preserving emotional honesty and fixing clarity:\n\n${text}`,
      summarize: `Provide a concise 1-sentence title and 3 bullet highlights for this entry:\n\n${text}`,
      expand: `Expand on this journal reflection with thoughtful prompt questions and mindful perspective:\n\n${text}`,
      tags: `Extract 3 to 5 relevant short hashtags or labels (comma separated, no hash symbol) for this note:\n\n${text}`,
    };
    try {
      const j = await gemini('gemini-3.8-flash', key, {
        systemInstruction: { parts: [{ text: 'You are an intuitive, private, and empathetic personal diary assistant.' }] },
        contents: [{ parts: [{ text: prompts[action] || `Reflect on this diary note: ${text}` }] }],
      });
      return json({ result: (j?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text || '').join('') });
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  // cloud sync needs a server
  const msg = 'Cloud sync needs a server URL (Settings > AI connection). Use Export / Import for now.';
  return json({ error: msg, message: msg }, 503);
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBase();
  if (base) return fetch(base + path, init);
  if (isNative()) return standalone(path, init);
  return fetch(path, init);
}
