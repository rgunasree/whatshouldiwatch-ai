// /api/trending.js - Serverless function to return TMDB trending items

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'TMDB_API_KEY not set' });

    const url = new URL('https://api.themoviedb.org/3/trending/all/week');
    url.searchParams.set('api_key', apiKey);
    const r = await fetch(url.toString());
    if (!r.ok) return res.status(502).json({ error: 'tmdb_error' });
    const data = await r.json();

    const results = (data.results || []).slice(0, 10).map((it, i) => ({
      title: it.title || it.name,
      type: it.media_type === 'tv' ? 'TV Series' : 'Movie',
      image: it.poster_path ? `https://image.tmdb.org/t/p/w500${it.poster_path}` : null,
      rating: it.vote_average ? it.vote_average.toFixed(1) : null,
      year: (it.release_date || it.first_air_date || '').slice(0,4),
      aiReason: `Trending #${i+1} this week`,
      platform: ['netflix','prime','hulu','disney'][Math.floor(Math.random()*4)],
      watchLink: `https://www.justwatch.com/us/search?q=${encodeURIComponent(it.title || it.name)}`
    }));

    res.status(200).json({ results });
  } catch (e) {
    console.error('trending error', e);
    res.status(500).json({ error: 'internal_error' });
  }
}
