export default function KPICard({ title, value, icon, color, change }) {
  const colors = {
    green:  'bg-green-50  text-green-700  border-green-200',
    blue:   'bg-blue-50   text-blue-700   border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red:    'bg-red-50    text-red-700    border-red-200',
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs yesterday
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors[color] || colors.green}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
