import React, { useState, useEffect, useRef } from 'react'
import { useLocationCtx } from '../context/LocationContext'

const HYDERABAD_AREAS = [
  'Banjara Hills','Jubilee Hills','Madhapur','Gachibowli','Kondapur',
  'Hitech City','Kukatpally','Miyapur','Manikonda','Narsingi',
  'Ameerpet','Begumpet','Secunderabad','Sainikpuri','Uppal',
  'Dilsukhnagar','LB Nagar','Mehdipatnam','Tolichowki','Attapur',
  'Nizampet','Bachupally','Kompally','Alwal','Malkajgiri',
  'Tarnaka','Habsiguda','Vanasthalipuram','Saroornagar','Nagole',
]

export default function LocationPicker({ onClose }) {
  const { setLocation } = useLocationCtx()
  const [search, setSearch] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [detectedArea, setDetectedArea] = useState('')
  const [gpsError, setGpsError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])

  const filtered = search.trim()
    ? HYDERABAD_AREAS.filter(a => a.toLowerCase().includes(search.toLowerCase()))
    : HYDERABAD_AREAS

  function pick(area) {
    setLocation({ area, city: 'Hyderabad' })
    onClose()
  }

  async function detectLocation() {
    setDetecting(true)
    setGpsError('')
    setDetectedArea('')
    if (!navigator.geolocation) {
      setGpsError('GPS not supported on this browser')
      setDetecting(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon, accuracy } = pos.coords
          // Use zoom=16 for street-level detail, zoom=14 for area-level
          const zoom = accuracy < 100 ? 16 : accuracy < 500 ? 14 : 12
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=${zoom}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en-IN,en' } }
          )
          const data = await res.json()
          const addr = data.address || {}

          // Indian address hierarchy: most specific first
          const area =
            addr.neighbourhood ||   // most specific locality
            addr.suburb ||          // suburb / area
            addr.village ||         // village
            addr.town ||            // town
            addr.city_district ||   // district within city
            addr.county ||          // broader area
            addr.state_district ||  // state district
            addr.city ||
            'Hyderabad'

          const city = addr.city || addr.town || addr.county || 'Hyderabad'

          setDetectedArea(area)
          setLocation({ area, city, coords: { lat, lon }, accuracy })
        } catch {
          // Nominatim failed — still use GPS coords and show generic label
          setLocation({ area: 'Current Location', city: 'Hyderabad' })
        }
        setDetecting(false)
        onClose()
      },
      (err) => {
        setGpsError(
          err.code === 1 ? 'Location access denied. Please allow location access in your browser settings.' :
          err.code === 2 ? 'Could not detect location. Try searching your area below.' :
          'Detection timed out. Try searching your area below.'
        )
        setDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Your Location</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 border-2 border-gray-200 focus-within:border-forest-400 rounded-xl px-4 py-3 transition-colors">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search area or locality…"
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Use current location */}
          <button
            onClick={detectLocation}
            disabled={detecting}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-forest-300 hover:bg-forest-50 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-full bg-forest-100 group-hover:bg-forest-200 flex items-center justify-center flex-shrink-0 transition-colors">
              {detecting ? (
                <svg className="w-5 h-5 text-forest-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              )}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-forest-600">
                {detecting ? 'Detecting your location…' : 'Use My Current Location'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {detecting ? 'Please wait' : 'Enable your current location for better services'}
              </p>
            </div>
            {!detecting && (
              <span className="text-xs font-bold text-forest-600 border border-forest-300 px-3 py-1 rounded-lg flex-shrink-0">
                Enable
              </span>
            )}
          </button>

          {/* GPS error */}
          {gpsError && (
            <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{gpsError}</p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-xs text-gray-400 font-medium">Popular areas in Hyderabad</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>

          {/* Area list */}
          <div className="max-h-52 overflow-y-auto -mx-1 px-1 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No areas found</p>
            ) : (
              filtered.map(area => (
                <button
                  key={area}
                  onClick={() => pick(area)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-forest-50 hover:text-forest-700 text-left transition-colors group"
                >
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-forest-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-forest-700">{area}</span>
                  <span className="text-xs text-gray-300 ml-auto">Hyderabad</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
