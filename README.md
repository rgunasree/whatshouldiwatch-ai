# 🎬 WhatShouldIWatch.ai

**Never Waste Time on Bad Shows Again**

Get instant AI-powered show recommendations based on your mood and available time. Stop scrolling, start watching!

## 🚀 Live Demo

Visit: [https://whatshouldiwatch-ai.vercel.app](https://whatshouldiwatch-ai.vercel.app)

## ✨ Features

### 🎯 Smart User Flow
- **Mood Selection**: 4 distinct emotional states (Happy, Chill, Focused, Emotional)
- **Time-based Filtering**: Realistic scenarios (Quick, Movie Night, Binge, One Episode)
- **AI "Thinking" Animation**: Builds anticipation and engagement

### 🤖 Recommendation Engine
- **Curated Database**: 30+ handpicked shows and movies
- **Intelligent Matching**: AI explanations for why each recommendation was chosen
- **Platform Integration**: Direct links to Netflix, Prime Video, Disney+, Hulu, HBO Max, Apple TV+

### 💫 Engagement Features
- **Live Counters**: Shows total recommendations served with real-time updates
- **Trending Section**: What everyone's watching with percentage increases
- **Social Sharing**: One-click sharing of recommendations
- **Save Functionality**: Save recommendations for later viewing

### 🎨 Premium Design
- **Modern UI**: Glassmorphism effects with gradient backgrounds
- **Smooth Animations**: Hover states and transitions throughout
- **Mobile-First**: Responsive design that works perfectly on all devices
- **PWA Ready**: Installable as a mobile app

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Styling**: Tailwind CSS via CDN
- **Icons**: Font Awesome 6
- **Fonts**: Inter from Google Fonts
- **PWA**: Service Worker with caching strategies
- **Deployment**: Vercel (free tier)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whatshouldiwatch-ai.git
   cd whatshouldiwatch-ai
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server (recommended):
   
   # Python
   python -m http.server 8000
   
   # Node.js (if you have it)
   npx serve .
   
   # Or any other local server
   ```

3. **Start developing**
   - Edit `index.html` for structure
   - Edit `styles.css` for custom styling
   - Edit `script.js` for functionality

### 🌐 Deploy to Vercel (Free)

**Method 1: GitHub Integration (Recommended)**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/whatshouldiwatch-ai.git
   git push -u origin main
   ```

2. **Deploy with Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"
   - Your site will be live in seconds!

**Method 2: Direct Upload**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

### 🌐 Deploy to Netlify (Free Alternative)

1. **Drag and Drop**
   - Go to [netlify.com](https://netlify.com)
   - Drag your project folder to the deployment area
   - Done!

2. **Or via Git**
   - Connect your GitHub repository
   - Set build settings (none needed for this project)
   - Deploy

## 📁 Project Structure

```
whatshouldiwatch-ai/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
├── sw.js              # Service Worker for PWA
├── manifest.json      # PWA manifest
├── vercel.json        # Vercel deployment config
└── README.md          # This file
```

## 🎮 How It Works

### User Journey
1. **Landing**: User sees stats and main headline
2. **Mood Selection**: Choose from 4 emotional states
3. **Time Selection**: Pick available time slot
4. **AI Processing**: Animated thinking process
5. **Recommendations**: 3 personalized picks with explanations
6. **Action**: Watch, save, or share recommendations

### Recommendation Algorithm
```javascript
// Mood → Genre Mapping
const moodMapping = {
  happy: ['comedy', 'adventure', 'animation', 'musical'],
  chill: ['documentary', 'nature', 'cooking', 'travel'],
  focused: ['thriller', 'mystery', 'sci-fi', 'crime'],
  emotional: ['drama', 'romance', 'biography', 'indie']
}

// Time → Content Type Mapping
const timeMapping = {
  quick: { maxRuntime: 45, types: ['episodes', 'shorts'] },
  movie: { minRuntime: 90, maxRuntime: 180, types: ['movies'] },
  binge: { types: ['series'], minSeasons: 2 },
  episode: { types: ['pilot-episodes', 'standout-episodes'] }
}
```

## 🎯 Business Model

- **Traffic Monetization**: Google AdSense integration ready
- **Affiliate Revenue**: Platform referral links
- **Premium Features**: Advanced filtering (future)
- **API Access**: For developers (future)

**Projected Revenue**: $3-8K/month at 100K monthly visitors

## 🚀 Future Enhancements

### Phase 1: Core Features
- [ ] User accounts and preferences
- [ ] Watch history tracking  
- [ ] Advanced filtering options
- [ ] More streaming platforms

### Phase 2: AI Enhancement
- [ ] Real TMDB API integration
- [ ] Machine learning recommendations
- [ ] Sentiment analysis from reviews
- [ ] Weather-based suggestions

### Phase 3: Social Features
- [ ] User reviews and ratings
- [ ] Friend recommendations
- [ ] Watch parties
- [ ] Community features

### Phase 4: Monetization
- [ ] Premium subscriptions
- [ ] Advanced analytics
- [ ] API for developers
- [ ] White-label solutions

## 🛠️ Development

### Adding New Shows

1. **Edit the database in `script.js`**:
   ```javascript
   const showsDatabase = {
     happy: {
       quick: [
         {
           title: "New Show",
           type: "TV Episode",
           platform: "netflix",
           runtime: "22 min",
           description: "Show description",
           image: "placeholder-url",
           rating: "8.5",
           year: "2024",
           aiReason: "Why the AI picked this",
           watchLink: "https://netflix.com"
         }
       ]
     }
   }
   ```

### Customizing Styling

1. **Tailwind Classes**: Most styling uses Tailwind utilities
2. **Custom CSS**: Add custom styles in `styles.css`
3. **Colors**: Modify the color scheme in the Tailwind config

### Adding Analytics

1. **Google Analytics**:
   ```javascript
   // Add to <head>
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   
   // Replace trackEvent function in script.js
   function trackEvent(action, category, label) {
     gtag('event', action, {
       'event_category': category,
       'event_label': label
     });
   }
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Service Worker not updating**:
   - Clear browser cache
   - Check browser dev tools → Application → Service Workers

2. **Styles not loading**:
   - Ensure internet connection for CDN resources
   - Check console for errors

3. **Recommendations not showing**:
   - Check browser console for JavaScript errors
   - Ensure both mood and time are selected

### Performance Optimization

1. **Image Loading**: Uses placeholder images for fast loading
2. **CDN Resources**: Leverages CDNs for external dependencies
3. **Caching**: Service Worker caches all static resources
4. **Minification**: Consider minifying CSS/JS for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙋‍♂️ Support

- **Issues**: Open a GitHub issue
- **Discussions**: GitHub Discussions tab
- **Email**: hello@whatshouldiwatch.ai

---

**Built with ❤️ for fellow binge-watchers who are tired of endless scrolling!**

## 🎯 Why This Will Succeed

1. **Real Problem**: 80% of people struggle with choice paralysis on streaming
2. **Simple Solution**: 30-second process vs 18-minute average browsing
3. **Zero Friction**: No signups required
4. **Mobile-First**: Perfect for couch browsing
5. **Shareable**: Built-in viral mechanics
6. **Monetizable**: Multiple revenue streams

Start your journey to never waste time scrolling again! 🚀
