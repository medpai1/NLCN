import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { PlannerProvider } from '@/components/PlannerProvider'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PlatePlan - Smart Meal Planning & Recipe Management',
  description: 'Your comprehensive meal planning and recipe management platform. Plan meals, discover recipes, track nutrition, and achieve your health goals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <AuthProvider>
            <PlannerProvider>
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </PlannerProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}

