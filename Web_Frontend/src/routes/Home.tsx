import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, white 2px, transparent 2px)'}} />
        <div className="relative px-8 py-14 md:px-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Plan delicious meals from your nutrition goals</h1>
          <p className="mt-4 text-emerald-100 max-w-2xl">Browse thousands of recipes, personalize recommendations, and build a weekly plan that fits your lifestyle.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/recipes" className="px-5 py-3 bg-white text-emerald-700 rounded-lg font-medium shadow hover:shadow-md">Browse Recipes</Link>
            <Link to="/planner" className="px-5 py-3 bg-emerald-700/50 rounded-lg font-medium border border-white/30 hover:bg-emerald-700/60">Open Planner</Link>
            <Link to="/recommend/diet" className="px-5 py-3 bg-emerald-700/50 rounded-lg font-medium border border-white/30 hover:bg-emerald-700/60">Diet Recommendation</Link>
            <Link to="/recommend/custom" className="px-5 py-3 bg-emerald-700/50 rounded-lg font-medium border border-white/30 hover:bg-emerald-700/60">Custom Recommendation</Link>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-6">What you can do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Powerful search</div>
            <p className="mt-2 text-gray-600">Find recipes by name, ingredients, and nutrition ranges.</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Personalized picks</div>
            <p className="mt-2 text-gray-600">Get content-based recommendations from your calorie and macro targets.</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Weekly planning</div>
            <p className="mt-2 text-gray-600">Organize meals and keep track of your plan with a simple weekly view.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
