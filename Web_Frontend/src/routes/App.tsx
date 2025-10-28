import { Link, Outlet, useLocation } from 'react-router-dom'

export default function App() {
  const { pathname } = useLocation()
  const linkClass = (p: string) => `px-3 py-2 rounded-md text-sm font-medium ${pathname===p? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-green-100'}`
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">Diet & Meal Planner</Link>
          <nav className="flex gap-2">
            <Link className={linkClass('/')} to="/">Home</Link>
            <Link className={linkClass('/recipes')} to="/recipes">Recipes</Link>
            <Link className={linkClass('/planner')} to="/planner">Planner</Link>
            <Link className={linkClass('/timeline')} to="/timeline">Timeline</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">© {new Date().getFullYear()} Diet & Meal Planner</div>
      </footer>
    </div>
  )
}
