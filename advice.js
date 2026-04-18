// ═══════════════════════════════════════════
//  Aidly — Netlify Function: /api/advice
//  Claude API proxy — API key server tərəfdə
// ═══════════════════════════════════════════

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Preflight
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
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'score (0-100) and lang (az/en) required' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  const prompt = lang === 'az'
    ? `Sən Aidly tətbiqinin psixoloji məsləhət sistemisinisən. İstifadəçi stress testini tamamladı. Xal: ${score}/100. Qısa, şəfqətli, praktik Azərbaycan dilində məsləhət ver (3-4 cümlə). Klinik dil işlətmə, sadə danış.`
    : `You are the Aidly app's psychological advice system. The user completed a stress test. Score: ${score}/100. Give brief, compassionate, practical advice in English (3-4 sentences). Use simple, non-clinical language.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Anthropic error:', err);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream API error' }) };
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ advice: text }),
    };
  } catch (e) {
    console.error('Function error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
