'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Menu, X, Utensils } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const { user } = useAuth()
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Recipes', href: '/recipes' },
    { name: 'Meal Planning', href: '/meal-planning' },
    { name: 'Diet Recommendation', href: '/diet-recommendation' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">PlatePlan</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <AuthButtons />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3">
                <AuthButtons mobile onClick={() => setIsMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function AuthButtons({ mobile, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const { user, logout, loading } = useAuth()
  
  if (loading) {
    return (
      <div className={mobile ? 'mt-2' : ''}>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }
  
  if (user) {
    return (
      <div className={mobile ? 'mt-2 space-y-2' : 'flex items-center space-x-3'}>
        <Link 
          href="/meal-planning" 
          className="text-sm text-gray-700 hover:text-primary-600"
          onClick={onClick}
        >
          Hi, {user.username}
        </Link>
        <button 
          onClick={() => { logout(); onClick?.() }} 
          className="btn-secondary text-sm"
        >
          Logout
        </button>
      </div>
    )
  }
  
  return (
    <div className={mobile ? 'mt-2 space-y-2' : 'flex items-center space-x-2'}>
      <Link 
        href="/login" 
        className="btn-secondary text-sm"
        onClick={onClick}
      >
        Login
      </Link>
      <Link 
        href="/register" 
        className="btn-primary text-sm"
        onClick={onClick}
      >
        Sign Up
      </Link>
    </div>
  )
}

