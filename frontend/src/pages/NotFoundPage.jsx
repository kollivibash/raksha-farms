import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-8xl mb-6">🌿</span>
      <h1 className="text-6xl font-black text-forest-500 mb-2">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</p>
      <p className="text-gray-400 mb-8 max-w-xs">Looks like this page went back to the farm. Let's get you somewhere fresh.</p>
      <div className="flex gap-3">
        <Link to="/" className="bg-forest-500 hover:bg-forest-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Go Home
        </Link>
        <Link to="/my-orders" className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors">
          My Orders
        </Link>
      </div>
    </div>
  )
}
