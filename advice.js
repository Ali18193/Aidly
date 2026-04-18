// ═══════════════════════════════════════════
//  Aidly — Netlify Function: /api/advice
//  Google Gemini API proxy — PULSUZ
// ═══════════════════════════════════════════

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let score, lang;
  try {
    const body = JSON.parse(event.body || '{}');
    score = Number(body.score);
    lang  = body.lang === 'en' ? 'en' : 'az';
    if (isNaN(score) || score < 0 || score > 100) throw new Error('Invalid score');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'score və lang lazımdır' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key konfiqurasiya edilməyib' }) };
  }

  const prompt = lang === 'az'
    ? `Sən Aidly tətbiqinin psixoloji məsləhət sistemisinisən. İstifadəçi stress testini tamamladı. Xal: ${score}/100. Qısa, şəfqətli, praktik Azərbaycan dilində məsləhət ver (3-4 cümlə). Klinik dil işlətmə, sadə danış.`
    : `You are the Aidly app's psychological advice system. The user completed a stress test. Score: ${score}/100. Give brief, compassionate, practical advice in English (3-4 sentences). Use simple, non-clinical language.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini error:', err);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'AI xətası' }) };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ advice: text }),
    };
  } catch (e) {
    console.error('Function error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server xətası' }) };
  }
};
