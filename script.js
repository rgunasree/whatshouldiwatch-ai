// WhatShouldIWatch.ai - Main JavaScript File

// Configuration
const CONFIG = {
    TMDB_API_KEY: 'YOUR_TMDB_API_KEY_HERE', // Replace with your actual API key
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    FALLBACK_IMAGE: 'https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=No+Image'
};

// Dynamic Stats Management
const StatsManager = {
    init() {
        this.updateVisitorCount();
        this.updateRecommendationCount();
        this.startCounterAnimation();
    },
    
    updateVisitorCount() {
        let visitors = localStorage.getItem('siteVisitors') || '2347652';
        visitors = parseInt(visitors) + Math.floor(Math.random() * 3) + 1;
        localStorage.setItem('siteVisitors', visitors.toString());
        document.getElementById('totalRecommendations').textContent = visitors.toLocaleString();
    },
    
    updateRecommendationCount() {
        let recommendations = localStorage.getItem('totalRecommendations') || '0';
        recommendations = parseInt(recommendations) + 1;
        localStorage.setItem('totalRecommendations', recommendations.toString());
    },
    
    startCounterAnimation() {
        setInterval(() => {
            this.updateVisitorCount();
        }, 30000); // Update every 30 seconds
    }
};

// OMDb API Functions (Primary)
const OMDbApi = {
    async searchMovie(title) {
        if (CONFIG.OMDB_API_KEY === 'YOUR_OMDB_API_KEY_HERE') {
            console.warn('OMDb API key not configured, using fallback data');
            return null;
        }
        
        try {
            const response = await fetch(
                `${CONFIG.OMDB_BASE_URL}/?apikey=${CONFIG.OMDB_API_KEY}&t=${encodeURIComponent(title)}&plot=short`
            );
            const data = await response.json();
            
            if (data.Response === 'True') {
                return data;
            }
            console.warn('OMDb API returned no results for:', title);
            return null;
        } catch (error) {
            console.error('Error fetching from OMDb:', error);
            return null;
        }
    },
    
    async enhanceShowData(show) {
        const omdbData = await this.searchMovie(show.title);
        if (omdbData) {
            return {
                ...show,
                image: omdbData.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : CONFIG.FALLBACK_IMAGE,
                rating: omdbData.imdbRating && omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : show.rating,
                year: omdbData.Year ? omdbData.Year : show.year,
                description: omdbData.Plot && omdbData.Plot !== 'N/A' ? omdbData.Plot : show.description,
                // Additional OMDb data
                genre: omdbData.Genre,
                director: omdbData.Director,
                actors: omdbData.Actors,
                runtime: omdbData.Runtime,
                boxOffice: omdbData.BoxOffice,
                awards: omdbData.Awards
            };
        }
        return show;
    }
};

// TVMaze API Functions (No key needed!)
const TVMazeApi = {
    async searchShow(title) {
        try {
            const response = await fetch(
                `${CONFIG.TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(title)}`
            );
            const data = await response.json();
            return data[0]?.show || null;
        } catch (error) {
            console.error('Error fetching from TVMaze:', error);
            return null;
        }
    },
    
    async enhanceShowData(show) {
        const tvmazeData = await this.searchShow(show.title);
        if (tvmazeData) {
            return {
                ...show,
                image: tvmazeData.image?.medium || CONFIG.FALLBACK_IMAGE,
                rating: tvmazeData.rating?.average ? tvmazeData.rating.average.toFixed(1) : show.rating,
                year: tvmazeData.premiered ? new Date(tvmazeData.premiered).getFullYear() : show.year,
                description: tvmazeData.summary ? tvmazeData.summary.replace(/<[^>]*>/g, '') : show.description,
                // Additional TVMaze data
                genres: tvmazeData.genres,
                network: tvmazeData.network?.name,
                status: tvmazeData.status,
                episodes: tvmazeData.episodes
            };
        }
        return show;
    }
};

// TMDB API Functions (Original - kept as fallback)
const TMDBApi = {
    async searchMovie(title) {
        if (CONFIG.TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
            console.warn('TMDB API key not configured, using fallback data');
            return null;
        }
        
        try {
            const response = await fetch(
                `${CONFIG.TMDB_BASE_URL}/search/multi?api_key=${CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(title)}`
            );
            const data = await response.json();
            return data.results[0] || null;
        } catch (error) {
            console.error('Error fetching from TMDB:', error);
            return null;
        }
    },
    
    getImageUrl(posterPath) {
        return posterPath ? `${CONFIG.TMDB_IMAGE_BASE_URL}${posterPath}` : CONFIG.FALLBACK_IMAGE;
    },
    
    async enhanceShowData(show) {
        const tmdbData = await this.searchMovie(show.title);
        if (tmdbData) {
            return {
                ...show,
                image: this.getImageUrl(tmdbData.poster_path),
                rating: tmdbData.vote_average ? tmdbData.vote_average.toFixed(1) : show.rating,
                year: tmdbData.release_date ? new Date(tmdbData.release_date).getFullYear() : (tmdbData.first_air_date ? new Date(tmdbData.first_air_date).getFullYear() : show.year),
                description: tmdbData.overview || show.description
            };
        }
        return show;
    }
};

// Master API function that tries multiple sources
const MovieAPI = {
    async enhanceShowData(show) {
        // Try OMDb first (for movies)
        if (show.type === 'Movie' || show.type === 'TV Episode') {
            const omdbResult = await OMDbApi.enhanceShowData(show);
            if (omdbResult !== show) return omdbResult;
        }
        
        // Try TVMaze for TV shows
        if (show.type === 'TV Series' || show.type === 'TV Episode') {
            const tvmazeResult = await TVMazeApi.enhanceShowData(show);
            if (tvmazeResult !== show) return tvmazeResult;
        }
        
        // Fallback to TMDB
        const tmdbResult = await TMDBApi.enhanceShowData(show);
        if (tmdbResult !== show) return tmdbResult;
        
        // Return original show if all APIs fail
        return show;
    }
};

// Enhanced Database with Real Movie Data
const showsDatabase = {
    happy: {
        quick: [
            {
                title: "The Good Place",
                type: "TV Episode",
                platform: "netflix",
                runtime: "22 min",
                description: "Hilarious philosophical comedy that'll make you laugh and think",
                image: "https://image.tmdb.org/t/p/w500/qIy1QUBhXXjTkx7cKq7e3wR8JgA.jpg",
                rating: "9.0",
                year: "2016",
                aiReason: "Perfect mood booster with quick laughs and feel-good moments. Each episode is self-contained joy.",
                watchLink: "https://netflix.com"
            },
            {
                title: "Brooklyn Nine-Nine",
                type: "TV Episode",
                platform: "hulu",
                runtime: "22 min",
                description: "Workplace comedy with heart and laughs in every episode",
                image: "https://via.placeholder.com/300x450/1CE783/000000?text=Brooklyn+99",
                rating: "8.4",
                year: "2013",
                aiReason: "Light-hearted police comedy that's guaranteed to lift your spirits with clever humor.",
                watchLink: "https://hulu.com"
            },
            {
                title: "Schitt's Creek",
                type: "TV Episode",
                platform: "netflix",
                runtime: "22 min",
                description: "Heartwarming comedy about family finding themselves",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Schitts+Creek",
                rating: "8.5",
                year: "2015",
                aiReason: "Wholesome humor that evolves into genuine heart. Perfect for when you want to smile.",
                watchLink: "https://netflix.com"
            }
        ],
        movie: [
            {
                title: "The Princess Bride",
                type: "Movie",
                platform: "disney",
                runtime: "98 min",
                description: "Classic adventure-comedy that's pure fun for everyone",
                image: "https://via.placeholder.com/300x450/113CCF/FFFFFF?text=Princess+Bride",
                rating: "8.0",
                year: "1987",
                aiReason: "Timeless adventure with romance, comedy, and quotable lines. Guaranteed mood lifter.",
                watchLink: "https://disneyplus.com"
            },
            {
                title: "Paddington 2",
                type: "Movie",
                platform: "prime",
                runtime: "103 min",
                description: "Absolutely delightful family film that radiates pure joy",
                image: "https://via.placeholder.com/300x450/00A8E1/FFFFFF?text=Paddington+2",
                rating: "8.8",
                year: "2017",
                aiReason: "Pure cinematic joy. This film is like a warm hug that makes everything better.",
                watchLink: "https://primevideo.com"
            },
            {
                title: "Spider-Man: Into the Spider-Verse",
                type: "Movie",
                platform: "netflix",
                runtime: "117 min",
                description: "Visually stunning superhero story with heart and humor",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Spider-Verse",
                rating: "8.4",
                year: "2018",
                aiReason: "Vibrant, energetic, and uplifting. Perfect blend of action and heart that'll leave you smiling.",
                watchLink: "https://netflix.com"
            }
        ],
        binge: [
            {
                title: "Ted Lasso",
                type: "TV Series",
                platform: "apple",
                runtime: "3 Seasons",
                description: "Feel-good sports comedy about optimism and kindness",
                image: "https://via.placeholder.com/300x450/000000/FFFFFF?text=Ted+Lasso",
                rating: "8.8",
                year: "2020",
                aiReason: "The ultimate feel-good binge. Ted's optimism is infectious and will restore your faith in people.",
                watchLink: "https://tv.apple.com"
            },
            {
                title: "Queer Eye",
                type: "TV Series",
                platform: "netflix",
                runtime: "7 Seasons",
                description: "Heartwarming makeover show that celebrates self-love",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Queer+Eye",
                rating: "8.5",
                year: "2018",
                aiReason: "Pure positivity and transformation. Each episode is a masterclass in spreading joy and acceptance.",
                watchLink: "https://netflix.com"
            }
        ],
        episode: [
            {
                title: "The Office - Dinner Party",
                type: "TV Episode",
                platform: "netflix",
                runtime: "28 min",
                description: "One of the most hilariously cringe episodes ever made",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=The+Office",
                rating: "9.3",
                year: "2008",
                aiReason: "Legendary episode that perfectly captures The Office's humor. Guaranteed laughs from start to finish.",
                watchLink: "https://netflix.com"
            }
        ]
    },
    chill: {
        quick: [
            {
                title: "The Great British Bake Off",
                type: "TV Episode",
                platform: "netflix",
                runtime: "60 min",
                description: "The most relaxing competition show ever created",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Bake+Off",
                rating: "8.6",
                year: "2010",
                aiReason: "Pure comfort viewing. Gentle competition with soothing voices and delicious bakes.",
                watchLink: "https://netflix.com"
            },
            {
                title: "Planet Earth II",
                type: "Documentary Episode",
                platform: "netflix",
                runtime: "50 min",
                description: "Stunning nature documentary that soothes the soul",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Planet+Earth",
                rating: "9.5",
                year: "2016",
                aiReason: "Breathtaking visuals and David Attenborough's calming narration. Perfect for unwinding.",
                watchLink: "https://netflix.com"
            }
        ],
        movie: [
            {
                title: "My Neighbor Totoro",
                type: "Movie",
                platform: "hbo",
                runtime: "86 min",
                description: "Gentle Studio Ghibli magic that soothes the spirit",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=Totoro",
                rating: "8.2",
                year: "1988",
                aiReason: "Pure cinematic comfort food. Hayao Miyazaki's gentle storytelling is the perfect chill companion.",
                watchLink: "https://hbomax.com"
            },
            {
                title: "Julie & Julia",
                type: "Movie",
                platform: "netflix",
                runtime: "123 min",
                description: "Comforting food movie with Meryl Streep at her best",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Julie+Julia",
                rating: "7.0",
                year: "2009",
                aiReason: "Food, cooking, and life lessons. The perfect comfort movie for a relaxing evening.",
                watchLink: "https://netflix.com"
            }
        ],
        binge: [
            {
                title: "Hometown",
                type: "TV Series",
                platform: "hbo",
                runtime: "4 Seasons",
                description: "Home renovation show that's pure comfort television",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=Hometown",
                rating: "8.1",
                year: "2017",
                aiReason: "The Napiers' genuine warmth and beautiful renovations create the perfect chill binge experience.",
                watchLink: "https://hbomax.com"
            },
            {
                title: "Somebody Feed Phil",
                type: "TV Series",
                platform: "netflix",
                runtime: "6 Seasons",
                description: "Joyful food and travel show with infectious enthusiasm",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Feed+Phil",
                rating: "8.4",
                year: "2018",
                aiReason: "Phil's genuine joy and beautiful food cinematography make for perfect relaxing viewing.",
                watchLink: "https://netflix.com"
            }
        ],
        episode: [
            {
                title: "Bob Ross: The Joy of Painting",
                type: "TV Episode",
                platform: "netflix",
                runtime: "30 min",
                description: "The most relaxing show ever created",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Bob+Ross",
                rating: "9.0",
                year: "1983",
                aiReason: "Bob's soothing voice and positive energy are scientifically proven to reduce stress. Pure zen.",
                watchLink: "https://netflix.com"
            }
        ]
    },
    focused: {
        quick: [
            {
                title: "Black Mirror",
                type: "TV Episode",
                platform: "netflix",
                runtime: "45 min",
                description: "Mind-bending sci-fi that will keep you thinking",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Black+Mirror",
                rating: "8.8",
                year: "2011",
                aiReason: "Each episode is a complete psychological puzzle that demands your full attention and rewards deep thinking.",
                watchLink: "https://netflix.com"
            },
            {
                title: "Sherlock",
                type: "TV Episode",
                platform: "netflix",
                runtime: "90 min",
                description: "Modern take on Holmes with brilliant mysteries",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Sherlock",
                rating: "9.1",
                year: "2010",
                aiReason: "Complex mysteries that challenge your detective skills. Benedict Cumberbatch's performance demands attention.",
                watchLink: "https://netflix.com"
            }
        ],
        movie: [
            {
                title: "Inception",
                type: "Movie",
                platform: "hbo",
                runtime: "148 min",
                description: "Complex heist thriller that bends reality",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=Inception",
                rating: "8.8",
                year: "2010",
                aiReason: "Christopher Nolan's layered masterpiece rewards focused viewing. Every detail matters.",
                watchLink: "https://hbomax.com"
            },
            {
                title: "Blade Runner 2049",
                type: "Movie",
                platform: "prime",
                runtime: "164 min",
                description: "Stunning sci-fi sequel that demands contemplation",
                image: "https://via.placeholder.com/300x450/00A8E1/FFFFFF?text=Blade+Runner",
                rating: "8.0",
                year: "2017",
                aiReason: "Visually spectacular and philosophically deep. Perfect for focused viewing and post-movie discussion.",
                watchLink: "https://primevideo.com"
            }
        ],
        binge: [
            {
                title: "Breaking Bad",
                type: "TV Series",
                platform: "netflix",
                runtime: "5 Seasons",
                description: "The gold standard of television storytelling",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Breaking+Bad",
                rating: "9.5",
                year: "2008",
                aiReason: "Masterful character development and plot progression that rewards focused attention. Peak television.",
                watchLink: "https://netflix.com"
            },
            {
                title: "True Detective",
                type: "TV Series",
                platform: "hbo",
                runtime: "4 Seasons",
                description: "Philosophical crime anthology that challenges viewers",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=True+Detective",
                rating: "8.9",
                year: "2014",
                aiReason: "Dense, atmospheric storytelling that rewards careful attention to detail and philosophy.",
                watchLink: "https://hbomax.com"
            }
        ],
        episode: [
            {
                title: "Westworld - The Maze",
                type: "TV Episode",
                platform: "hbo",
                runtime: "90 min",
                description: "Mind-bending season finale that redefines everything",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=Westworld",
                rating: "9.0",
                year: "2016",
                aiReason: "Complex narrative that reveals layers upon rewatch. Perfect for viewers who love puzzling out plot twists.",
                watchLink: "https://hbomax.com"
            }
        ]
    },
    emotional: {
        quick: [
            {
                title: "This Is Us",
                type: "TV Episode",
                platform: "hulu",
                runtime: "42 min",
                description: "Family drama that explores the depths of human connection",
                image: "https://via.placeholder.com/300x450/1CE783/000000?text=This+Is+Us",
                rating: "8.7",
                year: "2016",
                aiReason: "Emotionally rich storytelling that explores family, loss, and love with genuine depth.",
                watchLink: "https://hulu.com"
            },
            {
                title: "The Handmaid's Tale",
                type: "TV Episode",
                platform: "hulu",
                runtime: "50 min",
                description: "Powerful dystopian drama with emotional intensity",
                image: "https://via.placeholder.com/300x450/1CE783/000000?text=Handmaids+Tale",
                rating: "8.4",
                year: "2017",
                aiReason: "Intense emotional journey that tackles important themes with unflinching honesty.",
                watchLink: "https://hulu.com"
            }
        ],
        movie: [
            {
                title: "Her",
                type: "Movie",
                platform: "hbo",
                runtime: "126 min",
                description: "Intimate exploration of love and loneliness in the digital age",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=Her",
                rating: "8.0",
                year: "2013",
                aiReason: "Deeply moving meditation on connection and technology. Joaquin Phoenix delivers raw emotional honesty.",
                watchLink: "https://hbomax.com"
            },
            {
                title: "Marriage Story",
                type: "Movie",
                platform: "netflix",
                runtime: "137 min",
                description: "Raw, honest portrayal of divorce and family",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=Marriage+Story",
                rating: "7.9",
                year: "2019",
                aiReason: "Unflinching look at relationships ending. Powerful performances that capture real human emotion.",
                watchLink: "https://netflix.com"
            }
        ],
        binge: [
            {
                title: "The Crown",
                type: "TV Series",
                platform: "netflix",
                runtime: "6 Seasons",
                description: "Royal family drama with stunning performances",
                image: "https://via.placeholder.com/300x450/E50914/FFFFFF?text=The+Crown",
                rating: "8.7",
                year: "2016",
                aiReason: "Character-driven historical drama that explores duty, family, and sacrifice with emotional depth.",
                watchLink: "https://netflix.com"
            },
            {
                title: "Six Feet Under",
                type: "TV Series",
                platform: "hbo",
                runtime: "5 Seasons",
                description: "Life, death, and family in profound storytelling",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=Six+Feet+Under",
                rating: "8.7",
                year: "2001",
                aiReason: "Profound exploration of mortality and family dynamics. The series finale is legendary for good reason.",
                watchLink: "https://hbomax.com"
            }
        ],
        episode: [
            {
                title: "The Leftovers - The Departure",
                type: "TV Episode",
                platform: "hbo",
                runtime: "58 min",
                description: "Mysterious drama about loss and searching for meaning",
                image: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=The+Leftovers",
                rating: "8.3",
                year: "2014",
                aiReason: "Emotional exploration of grief and mystery. Perfect for when you want something deeply moving.",
                watchLink: "https://hbomax.com"
            }
        ]
    }
};

// Global variables
let selectedMood = null;
let selectedTime = null;
let currentRecommendations = [];

// Counter animation
function animateCounter(element, target, duration = 2000) {
    const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Initialize counters with random increments
function initializeCounters() {
    const recommendationsCounter = document.getElementById('totalRecommendations');
    const baseCount = 2347652;
    const randomIncrement = Math.floor(Math.random() * 100) + 1;
    
    // Animate to a slightly higher number to show "live" updates
    setTimeout(() => {
        animateCounter(recommendationsCounter, baseCount + randomIncrement, 1500);
    }, 500);
    
    // Update counter every 30 seconds
    setInterval(() => {
        const currentCount = parseInt(recommendationsCounter.textContent.replace(/,/g, ''));
        const newIncrement = Math.floor(Math.random() * 10) + 1;
        animateCounter(recommendationsCounter, currentCount + newIncrement, 1000);
    }, 30000);
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('show');
    });
    
    // Close mobile menu when clicking on a link
    mobileMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('show');
        }
    });
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mood selection functionality
function initializeMoodSelection() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const timeSelection = document.getElementById('timeSelection');
    
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all mood buttons
            moodButtons.forEach(btn => {
                btn.classList.remove('border-purple-400', 'bg-white/30');
                btn.classList.add('border-white/20');
            });
            
            // Add active state to clicked button
            button.classList.remove('border-white/20');
            button.classList.add('border-purple-400', 'bg-white/30');
            
            selectedMood = button.dataset.mood;
            
            // Show time selection with animation
            timeSelection.classList.remove('hidden');
            timeSelection.style.opacity = '0';
            setTimeout(() => {
                timeSelection.style.opacity = '1';
                timeSelection.style.transition = 'opacity 0.5s ease';
            }, 100);
            
            // Scroll to time selection
            setTimeout(() => {
                timeSelection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 200);
        });
    });
}

// Time selection functionality
function initializeTimeSelection() {
    const timeButtons = document.querySelectorAll('.time-btn');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all time buttons
            timeButtons.forEach(btn => {
                btn.classList.remove('border-purple-400', 'bg-white/30');
                btn.classList.add('border-white/20');
            });
            
            // Add active state to clicked button
            button.classList.remove('border-white/20');
            button.classList.add('border-purple-400', 'bg-white/30');
            
            selectedTime = button.dataset.time;
            
            // Start AI thinking process
            startAiThinking();
        });
    });
}

// AI thinking animation and process
function startAiThinking() {
    const aiThinking = document.getElementById('aiThinking');
    const thinkingText = document.getElementById('thinkingText');
    
    // Show AI thinking section
    aiThinking.classList.remove('hidden');
    aiThinking.style.opacity = '0';
    setTimeout(() => {
        aiThinking.style.opacity = '1';
        aiThinking.style.transition = 'opacity 0.5s ease';
    }, 100);
    
    // Scroll to AI thinking
    setTimeout(() => {
        aiThinking.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 200);
    
    // Thinking messages
    const thinkingMessages = [
        "Analyzing your preferences...",
        "Checking trending shows...",
        "Finding perfect matches...",
        "Almost ready...",
        "Preparing your recommendations..."
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        thinkingText.textContent = thinkingMessages[messageIndex];
        messageIndex++;
        
        if (messageIndex >= thinkingMessages.length) {
            clearInterval(messageInterval);
            setTimeout(() => {
                showRecommendations();
            }, 1000);
        }
    }, 800);
}

// Generate recommendations based on mood and time
function generateRecommendations() {
    if (!selectedMood || !selectedTime) return [];
    
    const categoryShows = showsDatabase[selectedMood]?.[selectedTime] || [];
    
    // Shuffle and take 3 recommendations
    const shuffled = [...categoryShows].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

// Show recommendations
async function showRecommendations() {
    const aiThinking = document.getElementById('aiThinking');
    const recommendations = document.getElementById('recommendations');
    const recommendationCards = document.getElementById('recommendationCards');
    
    // Hide AI thinking
    aiThinking.style.opacity = '0';
    setTimeout(() => {
        aiThinking.classList.add('hidden');
    }, 300);
    
    // Generate base recommendations
    const baseRecommendations = generateRecommendations();
    
    // Enhance recommendations with live API data
    const enhancedRecommendations = [];
    for (const show of baseRecommendations) {
        try {
            const enhancedShow = await MovieAPI.enhanceShowData(show);
            enhancedRecommendations.push(enhancedShow);
        } catch (error) {
            console.warn('Failed to enhance show data for:', show.title, error);
            enhancedRecommendations.push(show); // Use original data as fallback
        }
    }
    
    currentRecommendations = enhancedRecommendations;
    
    // Clear previous cards
    recommendationCards.innerHTML = '';
    
    // Create recommendation cards with enhanced data
    currentRecommendations.forEach((show, index) => {
        const card = createRecommendationCard(show, index);
        recommendationCards.appendChild(card);
    });
    
    // Show recommendations section
    setTimeout(() => {
        recommendations.classList.remove('hidden');
        recommendations.style.opacity = '0';
        setTimeout(() => {
            recommendations.style.opacity = '1';
            recommendations.style.transition = 'opacity 0.5s ease';
            
            // Scroll to recommendations
            setTimeout(() => {
                recommendations.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 200);
        }, 100);
    }, 500);
}

// Create recommendation card
function createRecommendationCard(show, index) {
    const card = document.createElement('div');
    card.className = 'recommendation-card glass-card p-6 rounded-2xl recommendation-reveal';
    
    const platformClass = `platform-${show.platform}`;
    
    card.innerHTML = `
        <div class="relative mb-4">
            <img src="${show.image}" alt="${show.title}" 
                 class="w-full h-64 object-cover rounded-xl shadow-lg">
            <div class="absolute top-3 right-3">
                <div class="platform-badge ${platformClass}">
                    <i class="fas fa-play mr-1"></i>
                    ${show.platform.toUpperCase()}
                </div>
            </div>
            <div class="absolute bottom-3 left-3">
                <div class="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span class="text-yellow-400 font-bold">★ ${show.rating}</span>
                    <span class="text-gray-300 text-sm ml-2">${show.year}</span>
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <h3 class="text-xl font-bold mb-1">${show.title}</h3>
            <p class="text-purple-300 text-sm font-medium">${show.type} • ${show.runtime}</p>
        </div>
        
        <p class="text-gray-300 mb-4 text-sm leading-relaxed">${show.description}</p>
        
        <div class="bg-purple-500/20 rounded-lg p-3 mb-4">
            <div class="flex items-start">
                <div class="text-purple-400 mr-2 mt-1">
                    <i class="fas fa-brain"></i>
                </div>
                <div>
                    <div class="text-purple-300 font-semibold text-xs mb-1">AI PICKED THIS BECAUSE:</div>
                    <div class="text-gray-300 text-sm">${show.aiReason}</div>
                </div>
            </div>
        </div>
        
        <div class="flex gap-2">
            <a href="${show.watchLink}" target="_blank" 
               class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                      text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 text-center">
                <i class="fas fa-play mr-2"></i>Watch Now
            </a>
            <button onclick="saveRecommendation('${show.title}')" 
                    class="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Save recommendation functionality
function saveRecommendation(title) {
    // Get saved recommendations from localStorage
    let saved = JSON.parse(localStorage.getItem('savedRecommendations') || '[]');
    
    if (!saved.includes(title)) {
        saved.push(title);
        localStorage.setItem('savedRecommendations', JSON.stringify(saved));
        
        // Show feedback
        showNotification(`${title} saved to your list!`, 'success');
    } else {
        showNotification(`${title} is already in your saved list!`, 'info');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    
    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
    } else {
        notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Share recommendations functionality
function initializeSharing() {
    const shareBtn = document.getElementById('shareRecommendations');
    
    shareBtn.addEventListener('click', () => {
        if (currentRecommendations.length === 0) return;
        
        const moodEmojis = {
            happy: '😊',
            chill: '😴',
            focused: '🤔',
            emotional: '😢'
        };
        
        const timeLabels = {
            quick: 'Quick Watch',
            movie: 'Movie Night',
            binge: 'Binge Session',
            episode: 'One Episode'
        };
        
        const shareText = `Just got amazing ${timeLabels[selectedTime]} recommendations from WhatShouldIWatch.ai! ${moodEmojis[selectedMood]}

My mood: ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}
Time available: ${timeLabels[selectedTime]}

Top picks:
${currentRecommendations.map((show, i) => `${i + 1}. ${show.title} (${show.platform.toUpperCase()})`).join('\n')}

Never waste time scrolling again! 🎬
https://whatshouldiwatch-ai.vercel.app`;
        
        // Try native sharing first, fall back to clipboard
        if (navigator.share) {
            navigator.share({
                title: 'My WhatShouldIWatch.ai Recommendations',
                text: shareText,
                url: 'https://whatshouldiwatch-ai.vercel.app'
            });
        } else {
            // Copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification('Recommendations copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Recommendations copied to clipboard!', 'success');
            });
        }
    });
}

// Reset and try again functionality
function initializeTryAgain() {
    const tryAgainBtn = document.getElementById('getNewRecommendations');
    
    tryAgainBtn.addEventListener('click', () => {
        // Reset selections
        selectedMood = null;
        selectedTime = null;
        currentRecommendations = [];
        
        // Reset UI
        document.querySelectorAll('.mood-btn, .time-btn').forEach(btn => {
            btn.classList.remove('border-purple-400', 'bg-white/30');
            btn.classList.add('border-white/20');
        });
        
        // Hide sections
        document.getElementById('timeSelection').classList.add('hidden');
        document.getElementById('aiThinking').classList.add('hidden');
        document.getElementById('recommendations').classList.add('hidden');
        
        // Scroll back to mood selection
        document.querySelector('.mood-btn').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    });
}

// Keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Number keys for mood selection
        if (e.key >= '1' && e.key <= '4' && !selectedMood) {
            const moodButtons = document.querySelectorAll('.mood-btn');
            const index = parseInt(e.key) - 1;
            if (moodButtons[index]) {
                moodButtons[index].click();
            }
        }
        
        // Arrow keys for time selection
        if (selectedMood && !selectedTime) {
            const timeButtons = document.querySelectorAll('.time-btn');
            if (e.key === 'ArrowLeft' || e.key === '1') timeButtons[0]?.click();
            if (e.key === 'ArrowUp' || e.key === '2') timeButtons[1]?.click();
            if (e.key === 'ArrowRight' || e.key === '3') timeButtons[2]?.click();
            if (e.key === 'ArrowDown' || e.key === '4') timeButtons[3]?.click();
        }
        
        // R to reset
        if (e.key.toLowerCase() === 'r' && currentRecommendations.length > 0) {
            document.getElementById('getNewRecommendations').click();
        }
        
        // S to share
        if (e.key.toLowerCase() === 's' && currentRecommendations.length > 0) {
            document.getElementById('shareRecommendations').click();
        }
    });
}

// Analytics tracking (placeholder for Google Analytics)
function trackEvent(action, category = 'engagement', label = '') {
    // This would integrate with Google Analytics
    console.log(`Analytics: ${category} - ${action} - ${label}`);
    
    // Example: gtag('event', action, { 'event_category': category, 'event_label': label });
}

// Initialize performance monitoring
function initializePerformanceMonitoring() {
    // Track page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${Math.round(loadTime)}ms`);
        
        // Track to analytics
        trackEvent('page_load_time', 'performance', Math.round(loadTime).toString());
    });
    
    // Track recommendation generation time
    window.trackRecommendationTime = (startTime) => {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        console.log(`Recommendations generated in ${duration}ms`);
        trackEvent('recommendation_time', 'performance', duration.toString());
    };
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 WhatShouldIWatch.ai loaded successfully!');
    
    initializeCounters();
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeMoodSelection();
    initializeTimeSelection();
    initializeSharing();
    initializeTryAgain();
    initializeKeyboardNavigation();
    initializePerformanceMonitoring();
    
    // Track initial page view
    trackEvent('page_view', 'navigation', 'home');
    
    console.log('✅ All systems initialized!');
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe trending items and feature cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.trending-item, .feature-card').forEach(item => {
        observer.observe(item);
    });
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateRecommendations,
        saveRecommendation,
        showsDatabase
    };
}
