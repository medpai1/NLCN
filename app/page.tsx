import Link from 'next/link'
import { ArrowRight, Calculator, Utensils, Search, TrendingUp, Users, Shield } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Utensils,
      title: 'Recipe Management',
      description: 'Create, edit, and organize your personal recipe collection with detailed nutrition info.',
      href: '/recipes',
    },
    {
      icon: TrendingUp,
      title: 'Meal Planning',
      description: 'Plan your weekly meals with our smart calendar and nutrition tracking.',
      href: '/meal-planning',
    },
    {
      icon: Calculator,
      title: 'BMI Calculator',
      description: 'Calculate your Body Mass Index and get personalized health insights.',
      href: '/bmi-calculator',
    },
    {
      icon: Search,
      title: 'Smart Recommendations',
      description: 'Get AI-powered meal recommendations based on your health goals.',
      href: '/diet-recommendation',
    },
  ]

  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Users' },
    { icon: Utensils, value: '500K+', label: 'Recipes Available' },
    { icon: TrendingUp, value: '95%', label: 'Accuracy Rate' },
    { icon: Shield, value: '100%', label: 'Privacy Focused' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              PlatePlan
              <span className="text-primary-600"> - Smart Meal Planning</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your comprehensive meal planning and recipe management platform. 
              Plan meals, discover recipes, track nutrition, and achieve your health goals with AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/diet-recommendation" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/bmi-calculator" className="btn-secondary text-lg px-8 py-3">
                Calculate BMI
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Healthy Eating
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform combines advanced machine learning with nutritional science 
              to provide you with the best dietary recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our content-based recommendation system uses advanced machine learning algorithms 
              to provide personalized dietary suggestions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Input Your Data
              </h3>
              <p className="text-gray-600">
                Provide your age, weight, height, activity level, and dietary preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Our machine learning model analyzes your data and nutritional requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Recommendations
              </h3>
              <p className="text-gray-600">
                Receive personalized meal recommendations with detailed nutritional information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Healthy Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their eating habits with our 
            personalized diet recommendations.
          </p>
          <Link href="/diet-recommendation" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg inline-flex items-center transition-colors duration-200">
            Get Your Recommendations
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

