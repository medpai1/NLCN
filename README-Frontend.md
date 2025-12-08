# Diet Recommendation System - Frontend

A modern, responsive web frontend for the Diet Recommendation System built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🏠 **Modern Homepage** - Clean, professional landing page with feature overview
- 📊 **BMI Calculator** - Interactive BMI calculation with health insights
- 🍽️ **Diet Recommendations** - Personalized meal recommendations based on health profile
- 🔍 **Custom Food Search** - Advanced recipe search with nutritional filters
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI/UX** - Clean design with smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Charts**: Recharts (for future enhancements)

## Getting Started

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
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
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

1. **Build and run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.frontend.yml up --build
   ```

2. **Or build the Docker image manually**
   ```bash
   docker build -t diet-recommendation-frontend .
   docker run -p 3000:3000 diet-recommendation-frontend
   ```

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── bmi-calculator/          # BMI calculator page
│   ├── diet-recommendation/     # Diet recommendation page
│   └── custom-recommendation/   # Custom food search page
├── components/                   # Reusable components
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Site footer
│   └── RecipeCard.tsx           # Recipe display component
├── lib/                         # Utility libraries
│   └── api.ts                   # API integration
├── public/                      # Static assets
└── styles/                      # Global styles
```

## API Integration

The frontend integrates with the FastAPI backend through the `/lib/api.ts` module. Key features:

- **Health Check**: Verify backend connectivity
- **Recommendations**: Fetch personalized recipe recommendations
- **Image Integration**: Automatic recipe image fetching
- **Error Handling**: Comprehensive error management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Unsplash API key for images | Optional |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting (configure as needed)
- **Tailwind CSS**: Utility-first styling approach

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Production

```bash
# Build production image
docker build -t diet-recommendation-frontend .

# Run production container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api-domain.com \
  diet-recommendation-frontend
```

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Images by [Unsplash](https://unsplash.com/)



