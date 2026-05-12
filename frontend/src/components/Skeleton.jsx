import React from 'react'

export default function Skeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card overflow-hidden animate-pulse ${className}`}>
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200"></div>

      {/* Content Placeholder */}
      <div className="p-4 flex flex-col gap-3">
        {/* Category & Title */}
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
        <div className="w-3/4 h-5 bg-gray-200 rounded"></div>

        {/* Price & Weight */}
        <div className="flex items-end justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
            <div className="w-10 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
