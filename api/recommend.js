// /api/recommend.js - Serverless function to return real-time recommendations from TMDB

export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const { mood = 'happy', time = 'movie' } = req.query;
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'TMDB_API_KEY not set' });
    }

    const TMDB = 'https://api.themoviedb.org/3';

    const movieGenres = {
      comedy: 35, family: 10751, animation: 16, music: 10402, adventure: 12,
      documentary: 99, thriller: 53, mystery: 9648, scifi: 878, crime: 80,
      drama: 18, romance: 10749, history: 36
    };
    const tvGenres = {
      comedy: 35, family: 10751, animation: 16, kids: 10762,
      documentary: 99, thriller: 9648, mystery: 9648, scifi: 10765, crime: 80,
      drama: 18
    };

    const moodToGenres = {
      happy: { movie: ['comedy','family','animation','adventure'], tv: ['comedy','family','animation'] },
      chill: { movie: ['documentary','family','animation'], tv: ['documentary','family','kids','animation'] },
      focused: { movie: ['thriller','mystery','scifi','crime'], tv: ['thriller','mystery','scifi','crime'] },
      emotional: { movie: ['drama','romance','history'], tv: ['drama','romance'] }
    };

    const timeToFilters = {
      quick: { type: 'mixed', movie: { with_runtime_lte: 95 }, tv: { with_runtime_lte: 45 } },
      movie: { type: 'movie', movie: { with_runtime_gte: 90, with_runtime_lte: 180 } },
      binge: { type: 'tv', tv: { with_runtime_gte: 25, sort_by: 'popularity.desc' } },
      episode: { type: 'tv', tv: { with_runtime_lte: 60 } }
    };

    const pick = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

    async function tmdb(path, params = {}) {
      const url = new URL(TMDB + path);
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('language', 'en-US');
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) url.searchParams.set(k.replace(/_/g, '.'), String(v));
      });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeout);
      if (!r.ok) throw new Error('TMDB error ' + r.status);
      return r.json();
    }

    const moodCfg = moodToGenres[mood] || moodToGenres.happy;
    const timeCfg = timeToFilters[time] || timeToFilters.movie;

    const queries = [];
    const addDiscover = async (kind) => {
      const genres = (kind === 'movie' ? moodCfg.movie : moodCfg.tv) || [];
      const with_genres = genres
        .map(g => (kind === 'movie' ? movieGenres[g] : tvGenres[g]))
        .filter(Boolean)
        .join(',');
      const filters = timeCfg[kind] || {};
      const baseParams = {
        include_adult: false,
        sort_by: filters.sort_by || 'vote_average.desc',
        'vote_count.gte': 100,
        with_genres,
      };
      if (filters.with_runtime_gte) baseParams['with_runtime.gte'] = filters.with_runtime_gte;
      if (filters.with_runtime_lte) baseParams['with_runtime.lte'] = filters.with_runtime_lte;
      const path = kind === 'movie' ? '/discover/movie' : '/discover/tv';
      const data = await tmdb(path, baseParams);
      return (data.results || []).map((it) => ({
        id: it.id,
        title: it.title || it.name,
        type: kind === 'movie' ? 'Movie' : 'TV Series',
        platform: ['netflix','prime','hulu','disney'][Math.floor(Math.random()*4)],
        runtime: kind === 'movie' ? `${it.runtime || filters.with_runtime_lte || 120} min` : 'TV Series',
        description: it.overview || '',
        image: it.poster_path ? `https://image.tmdb.org/t/p/w500${it.poster_path}` : null,
        rating: it.vote_average ? it.vote_average.toFixed(1) : null,
        year: (it.release_date || it.first_air_date || '').slice(0,4),
        aiReason: `Matches ${mood} mood for ${time} time` ,
        watchLink: `https://www.justwatch.com/us/search?q=${encodeURIComponent(it.title || it.name)}`
      }));
    };

    if (timeCfg.type === 'movie') {
      queries.push(addDiscover('movie'));
    } else if (timeCfg.type === 'tv') {
      queries.push(addDiscover('tv'));
    } else {
      queries.push(addDiscover('movie'));
      queries.push(addDiscover('tv'));
    }

    const resultsArrays = await Promise.allSettled(queries);
    const items = resultsArrays.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    const dedup = new Map();
    items.forEach(i => { if (i.title && !dedup.has(i.title)) dedup.set(i.title, i); });
    const final = pick(Array.from(dedup.values()), 6).map((i, idx) => ({
      ...i,
      aiReason: `${i.aiReason} • pick #${idx+1}`
    }));

    return res.status(200).json({ results: final });
  } catch (e) {
    console.error('recommend error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
}
