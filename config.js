// Configuration file for WhatShouldIWatch.ai
// This file contains API keys and other sensitive configuration

const CONFIG = {
    // OMDb API Configuration (Alternative to TMDB)
    // Get your free API key from: http://www.omdbapi.com/apikey.aspx
    OMDB_API_KEY: 'b83b1a77', // Free API key with 1000 requests/day
    OMDB_BASE_URL: 'https://www.omdbapi.com',
    
    // TVMaze API (No key required!)
    TVMAZE_BASE_URL: 'https://api.tvmaze.com',
    
    // TMDB (The Movie Database) - Original option
    TMDB_API_KEY: 'YOUR_TMDB_API_KEY_HERE',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    
    // Fallback configuration
    FALLBACK_IMAGE: 'https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=No+Image',
    
    // Analytics Configuration
    GOOGLE_ANALYTICS_ID: 'GA_MEASUREMENT_ID', // Replace with your GA4 measurement ID
    
    // Site Configuration
    SITE_URL: 'https://whatshouldiwatch-ai.vercel.app',
    SITE_NAME: 'WhatShouldIWatch.ai',
    
    // Feature Flags
    ENABLE_TMDB_API: true,
    ENABLE_ANALYTICS: true,
    ENABLE_SERVICE_WORKER: true,
    
    // Real movie poster URLs (direct links that work without API)
    MOVIE_POSTERS: {
        'The Good Place': 'https://image.tmdb.org/t/p/w500/qIy1QUBhXXjTkx7cKq7e3wR8JgA.jpg',
        'Brooklyn Nine-Nine': 'https://image.tmdb.org/t/p/w500/hgRMSOt7a1b8qyQR68vUixJPang.jpg',
        'Schitts Creek': 'https://image.tmdb.org/t/p/w500/iRfSzrPS5VYWQv7KVSEg2BZZL6C.jpg',
        'The Princess Bride': 'https://image.tmdb.org/t/p/w500/njJHjJZx6nYfcwOJ7rCjXcVLQ10.jpg',
        'Paddington 2': 'https://image.tmdb.org/t/p/w500/qrJUN8qnGb3gjhrs2HIJNHIkA7k.jpg',
        'Spider-Man: Into the Spider-Verse': 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
        'Ted Lasso': 'https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg',
        'Queer Eye': 'https://image.tmdb.org/t/p/w500/79OjlJhYgPVNJ8d7hZDGKp5nY3h.jpg',
        'The Office': 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
        'The Great British Bake Off': 'https://image.tmdb.org/t/p/w500/eIpnNYt0qXK8H8lmdV0Hxsb2tKw.jpg',
        'Planet Earth II': 'https://image.tmdb.org/t/p/w500/aPWR0r6hQZZqMtgZ5YYC2XMD3Yx.jpg',
        'My Neighbor Totoro': 'https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg',
        'Julie & Julia': 'https://image.tmdb.org/t/p/w500/oCm8BKqsQmgClZTRvYUU9cPGKx9.jpg',
        'Black Mirror': 'https://image.tmdb.org/t/p/w500/5UaYsGZOFhjFDwQh6GuLjjA5WSpO.jpg',
        'Sherlock': 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
        'Inception': 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
        'Blade Runner 2049': 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        'Breaking Bad': 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
        'True Detective': 'https://image.tmdb.org/t/p/w500/cuV2O5ZyDLHSOWzg3nLVljp1ubw.jpg',
        'Westworld': 'https://image.tmdb.org/t/p/w500/eAzxVHhQeM9gHhsZNPkBuPXXiKz.jpg',
        'This Is Us': 'https://image.tmdb.org/t/p/w500/qQOdNwSkmCO2RNc2LXdMWW3G8T4.jpg',
        'The Handmaids Tale': 'https://image.tmdb.org/t/p/w500/tDt7TBJtRkUBnqKFbGSe3QSUYrW.jpg',
        'Her': 'https://image.tmdb.org/t/p/w500/lEIaL12hSkqqe83kgADkbUqEnvk.jpg',
        'Marriage Story': 'https://image.tmdb.org/t/p/w500/2/pZekG75UQhH0CJrpgnNqACrsOIHEpbIQ.jpg',
        'The Crown': 'https://image.tmdb.org/t/p/w500/zLSKVi0lBYa6ivQ4LmK44tOJgWI.jpg',
        'Six Feet Under': 'https://image.tmdb.org/t/p/w500/zuhJQHSjHzQjt3b6rr5k3a9LppJ.jpg',
        'The Leftovers': 'https://image.tmdb.org/t/p/w500/ri8Dc0tJDCTSMkKeDJyPB8xGQgr.jpg'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Instructions for setup:
/*
TO SET UP REAL MOVIE DATA - MULTIPLE OPTIONS:

🔥 EASIEST: OMDb API (Recommended)
1. Go to: http://www.omdbapi.com/apikey.aspx
2. Enter email, select "FREE" plan (1,000 requests/day)
3. Check email for API key
4. Replace 'YOUR_OMDB_API_KEY_HERE' with your key

✅ NO API KEY NEEDED: TVMaze API
- Works immediately, no registration required!
- Great for TV shows and series data
- Unlimited requests

🎬 ALTERNATIVE: TMDB API (Original)
1. Go to: https://www.themoviedb.org/
2. Create account → Settings → API → Request key
3. Replace 'YOUR_TMDB_API_KEY_HERE' with your key

📊 ANALYTICS SETUP:
1. Go to: https://analytics.google.com/
2. Create property → Get GA4 Measurement ID (G-xxxxxxx)
3. Replace 'GA_MEASUREMENT_ID' in index.html

🚀 UPDATE SITE URL:
- Replace SITE_URL with your actual Vercel URL

With any API setup, your site will have:
✅ Real movie posters and data
✅ Live visitor analytics  
✅ Dynamic content updates
✅ Current ratings and descriptions
*/
