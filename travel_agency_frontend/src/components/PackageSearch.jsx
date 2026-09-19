import { useState } from 'react'
import { ChevronDown, Search, Map, Sun, Star, X } from 'lucide-react'
import packageData from '../packages.json'

export default function PackageSearch({ onBook }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [destination, setDestination] = useState('')

  const packageDestinations = [
    'Abu Dhabi Explorer', 'Agra & Delhi Golden Triangle', 'Alleppey Backwaters, Kerala',
    'Andaman & Nicobar Islands', 'Bali Island Getaway', 'Coorg, Karnataka',
    'Darjeeling & Gangtok', 'Doha City Break', 'Egypt Cairo & Nile Cruise', 'Goa Beaches',
    'Istanbul, Turkey', 'Jeddah & Makkah Umrah Package', 'Kashmir Valley',
    'Kovalam Beach, Kerala', 'Kuala Lumpur & Genting Highlands', 'Kumarakom, Kerala',
    'Kuwait City Break', 'London & Edinburgh, UK', 'Mauritius Island Honeymoon',
    'Ooty & Coonoor, Tamil Nadu', 'Paris & Swiss Alps Europe Tour', 'Phuket Island Escape',
    'Rajasthan Heritage (Jaipur-Udaipur-Jodhpur)', 'Riyadh City Tour', 'Singapore City & Sentosa',
    'Sri Lanka Highlights (Colombo-Kandy-Ella)', 'Thailand Bangkok & Pattaya',
    'Thekkady, Kerala', 'Wayanad, Kerala'
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    
    setTimeout(() => {
      // Filter the imported package data based on user selection
      const results = packageData.filter(
        p => p.destination === destination
      ).map(p => ({
        ...p,
        days: `${p.duration_days} Days`,
        rating: 4.8 // Mock rating since it's not in CSV
      }))
      
      setPackages(results)
      setLoading(false)
    }, 800)
  }

  const clearSearch = () => {
    setPackages([])
    setSearched(false)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex bg-white rounded-full p-2 items-center shadow-lg w-full max-w-4xl mx-auto">
        <div className="flex-1 flex items-center px-4 md:px-6">
          <Map className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0" />
          <div className="flex flex-col w-full text-left relative">
            <span className="text-xs font-bold text-slate-900 mb-1">Destination</span>
            <select
              className="w-full bg-transparent text-slate-500 text-sm focus:outline-none appearance-none cursor-pointer"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            >
              <option value="" disabled>Where do you want to go?</option>
              {packageDestinations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
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

        {!loading && searched && packages.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
            <button 
              onClick={clearSearch}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-6 pr-8">Available Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.package_id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col group cursor-pointer">
                  <div className="h-48 bg-slate-200 relative overflow-hidden">
                    <img 
                      src={`https://loremflickr.com/400/300/${encodeURIComponent(pkg.destination.split(',')[0].trim().replace(/\s+/g, ''))},landscape/all`} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow bg-white z-10 relative">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-violet-600 transition-colors">{pkg.name}</h3>
                      <div className="flex items-center text-amber-500 text-sm font-black bg-amber-50 px-2 py-0.5 rounded">
                        <Star className="h-3.5 w-3.5 fill-current mr-1" />
                        {pkg.rating}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 flex-grow flex items-center"><Map className="h-4 w-4 mr-1 text-slate-400" />{pkg.destination}</p>
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">{pkg.days}</span>
                        <span className="text-xl font-black text-violet-600">₹{pkg.price}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onBook) onBook(pkg);
                        }}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md hover:shadow-lg"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && searched && packages.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 relative">
            <button 
              onClick={clearSearch}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            No packages found. Try a different destination.
          </div>
        )}
      </div>
    </div>
  )
}
