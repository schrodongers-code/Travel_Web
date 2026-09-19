import { useState } from 'react'
import { ChevronDown, Search, MapPin, X } from 'lucide-react'
import flightData from '../flights.json'

export default function FlightSearch() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const flightOrigins = ['BLR', 'BOM', 'CCJ', 'CNN', 'COK', 'DEL', 'HYD', 'MAA', 'TRV']
  const flightDestinations = ['AUH', 'BLR', 'BOM', 'DEL', 'DOH', 'DXB', 'HYD', 'JED', 'KUL', 'KWI', 'LHR', 'MAA', 'MCT', 'RUH', 'SIN']

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    
    setTimeout(() => {
      // Filter the imported flight data based on user selection
      const results = flightData.filter(
        f => f.origin === origin && f.destination === destination
      ).map(f => ({
        id: f.flight_id,
        airline: f.airline,
        route: `${f.origin} - ${f.destination}`,
        departure: f.departure,
        arrival: f.arrival,
        price: `₹${f.price}`
      }))
      
      setFlights(results)
      setLoading(false)
    }, 800)
  }

  const clearSearch = () => {
    setFlights([])
    setSearched(false)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex bg-white rounded-full p-2 items-center shadow-lg w-full max-w-4xl mx-auto">
        <div className="flex-1 flex items-center px-4 md:px-6 border-r border-slate-200">
          <MapPin className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0" />
          <div className="flex flex-col w-full text-left relative">
            <span className="text-xs font-bold text-slate-900 mb-1">From</span>
            <select
              className="w-full bg-transparent text-slate-500 text-sm focus:outline-none appearance-none cursor-pointer"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            >
              <option value="" disabled>Enter Origin City</option>
              {flightOrigins.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-0 bottom-1 pointer-events-none" />
          </div>
        </div>
        
        <div className="flex-1 flex items-center px-4 md:px-6">
          <MapPin className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0" />
          <div className="flex flex-col w-full text-left relative">
            <span className="text-xs font-bold text-slate-900 mb-1">To</span>
            <select
              className="w-full bg-transparent text-slate-500 text-sm focus:outline-none appearance-none cursor-pointer"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            >
              <option value="" disabled>Enter Destination City</option>
              {flightDestinations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-0 bottom-1 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-4 ml-2 flex-shrink-0 transition-colors shadow-md"
        >
          <Search className="h-6 w-6" />
        </button>
      </form>

      {/* Results Section */}
      <div className="container mx-auto max-w-4xl mt-12 text-left">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        )}

        {!loading && searched && flights.length > 0 && (
          <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
            <button 
              onClick={clearSearch}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4 pr-8">Available Flights</h3>
            {flights.map((flight) => (
              <div key={flight.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between hover:border-violet-300 hover:shadow-sm transition-all bg-slate-50/50">
                <div className="flex flex-col mb-4 md:mb-0 w-48">
                  <span className="font-bold text-slate-900 text-lg">{flight.airline}</span>
                  <span className="text-slate-500 text-sm">{flight.route}</span>
                </div>
                <div className="flex flex-col items-center mb-4 md:mb-0 flex-grow">
                  <span className="font-bold text-slate-800">{flight.departure}</span>
                  <div className="w-32 h-px bg-slate-300 my-2 relative">
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 px-2 rounded-full">Direct</span>
                  </div>
                  <span className="font-bold text-slate-800">{flight.arrival}</span>
                </div>
                <div className="flex flex-col items-end w-32">
                  <span className="text-2xl font-black text-violet-600">{flight.price}</span>
                  <button className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors w-full">
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searched && flights.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 relative">
            <button 
              onClick={clearSearch}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            No flights found for this route. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  )
}
