# PlatePlan - Smart Meal Planning & Recipe Management

A comprehensive meal planning and recipe management platform inspired by ManageMeals, built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

### Core Features (ManageMeals-inspired)
- 🍽️ **Recipe Management** - Create, edit, and organize your personal recipe collection
- 📅 **Meal Planning** - Plan your weekly meals with smart calendar and nutrition tracking
- 🔍 **Advanced Search** - Find recipes by ingredients, nutrition, categories, and tags
- ⭐ **Rating & Reviews** - Rate and review recipes with community feedback
- ❤️ **Favorites** - Save your favorite recipes for quick access
- 📊 **Nutrition Tracking** - Track daily nutrition goals and meal logging

### Health & Wellness Features
- 📊 **BMI Calculator** - Calculate BMI with health insights and recommendations
- 🎯 **Diet Recommendations** - AI-powered meal suggestions based on health goals
- 🔬 **Custom Food Search** - Advanced recipe filtering with nutritional requirements
- 📈 **Progress Tracking** - Monitor your health journey with detailed analytics

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend Integration**: FastAPI
- **Deployment**: Docker support

## 📱 Pages & Features

### 1. **Homepage** (`/`)
- Modern hero section with PlatePlan branding
- Feature overview with 4 main sections
- Statistics and social proof
- Call-to-action buttons

### 2. **Recipe Management** (`/recipes`)
- Browse and search recipe collection
- Grid/List view toggle
- Category and tag filtering
- Sort by name, rating, calories, or cooking time
- Quick stats dashboard
- Add new recipe functionality

### 3. **Meal Planning** (`/meal-planning`)
- Weekly calendar view
- Daily meal planning interface
- Nutrition summary for each day
- Weekly overview statistics
- Quick actions sidebar

### 4. **BMI Calculator** (`/bmi-calculator`)
- Interactive BMI calculation
- Health category classification
- BMR calculation
- Calorie recommendations
- Health insights and tips

### 5. **Diet Recommendations** (`/diet-recommendation`)
- Comprehensive health profile form
- Personalized meal recommendations
- Calorie planning with different goals
- Meal distribution planning


## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Diet-Recommendation-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   copy env.local.example .env.local
   ```
   
   Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.frontend.yml up --build
```

## 📁 Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with PlatePlan branding
│   ├── page.tsx                 # Homepage
│   ├── recipes/                 # Recipe management
│   │   └── page.tsx            # Recipe collection page
│   ├── meal-planning/          # Meal planning
│   │   └── page.tsx            # Calendar and planning interface
│   ├── bmi-calculator/         # BMI calculator
│   │   └── page.tsx            # BMI calculation page
│   ├── diet-recommendation/    # Diet recommendations
│   │   └── page.tsx            # Health profile and recommendations
│   └── custom-recommendation/  # Custom food search
│       └── page.tsx            # Advanced recipe search
├── components/                   # Reusable components
│   ├── Header.tsx               # Navigation with PlatePlan branding
│   ├── Footer.tsx               # Footer with updated features
│   └── RecipeCard.tsx           # Recipe display component
├── lib/                         # Utility libraries
│   └── api.ts                   # API integration
└── styles/                      # Global styles
```

## 🎨 Design Features

### ManageMeals-inspired Design
- **Clean, Modern Interface** - Professional design with excellent UX
- **Responsive Layout** - Optimized for desktop, tablet, and mobile
- **Consistent Branding** - PlatePlan identity throughout
- **Smooth Animations** - Hover effects and transitions
- **Accessible Design** - Proper contrast and keyboard navigation

### Color Scheme
- **Primary**: Blue theme (#0ea5e9)
- **Secondary**: Gray palette
- **Accent**: Green for success states
- **Typography**: Inter font family

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Unsplash API key for images | Optional |

### Next.js Configuration
- **App Router**: Enabled for modern routing
- **Standalone Output**: Docker-optimized builds
- **Image Optimization**: Remote patterns configured
- **TypeScript**: Strict type checking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Docker Production
```bash
docker build -t plateplan-frontend .
docker run -p 3000:3000 plateplan-frontend
```

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔄 API Integration

The frontend integrates with your existing FastAPI backend:

- **Health Check**: `/` endpoint
- **Recommendations**: `/predict/` endpoint
- **Recipe Data**: Mock data with real API structure
- **Image Integration**: Unsplash API for recipe images

## 📊 Features Comparison with ManageMeals

✅ **Implemented Features:**
- Recipe management and organization
- Meal planning calendar
- Advanced search and filtering
- Recipe cards with detailed information
- Responsive design
- Modern UI/UX
- Docker support

🔄 **Planned Features:**
- User authentication and profiles
- Recipe rating and review system
- Shopping list generation
- Social features and sharing
- Advanced nutrition analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [ManageMeals](https://github.com/managemeals/manage-meals-web)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Images by [Unsplash](https://unsplash.com/)

---

**PlatePlan** - Your comprehensive meal planning and recipe management platform! 🍽️✨


