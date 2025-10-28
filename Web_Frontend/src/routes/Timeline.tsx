import { useEffect, useState } from 'react'
import { fetchActivities } from '../lib/api'

export default function Timeline() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    fetchActivities().then(d => setItems(d.items || []))
  }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Activity Timeline</h1>
      {!items.length && <div className="text-gray-500">No activity yet.</div>}
      <div className="space-y-2">
        {items.map((a, idx) => (
          <div key={idx} className="border rounded p-3">
            <div className="text-sm text-gray-500">{a.timestamp} — {a.type}</div>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(a.meta, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
