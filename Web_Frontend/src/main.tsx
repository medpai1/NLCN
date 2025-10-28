import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './routes/App'
import Home from './routes/Home'
import Recipes from './routes/Recipes'
import Planner from './routes/Planner'
import Timeline from './routes/Timeline'
import DietRecommendation from './routes/DietRecommendation'
import CustomRecommendation from './routes/CustomRecommendation'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'recipes', element: <Recipes /> },
      { path: 'planner', element: <Planner /> },
      { path: 'timeline', element: <Timeline /> },
      { path: 'recommend/diet', element: <DietRecommendation /> },
      { path: 'recommend/custom', element: <CustomRecommendation /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
