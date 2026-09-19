import { useState } from 'react'
import Header from './components/Header'
import FlightSearch from './components/FlightSearch'
import PackageSearch from './components/PackageSearch'
import Chatbot from './components/Chatbot'
import LoginModal from './components/LoginModal'
import BookingModal from './components/BookingModal'
import { Palmtree, Mountain, Landmark, Building2, Anchor, Flower2, Heart, X, Sun, Star, Map } from 'lucide-react'
import packagesData from './packages.json'

function App() {
  const [activeTab, setActiveTab] = useState('flights')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [bookingPackage, setBookingPackage] = useState(null)
  const [aiBookingData, setAiBookingData] = useState(null)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })
  const [selectedTourType, setSelectedTourType] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setUser(null)
  }

  const tourTypes = [
    { name: 'Beach & Island', icon: Palmtree, destinations: ['Bali', 'Goa', 'Phuket', 'Mauritius', 'Andaman', 'Kovalam'] },
    { name: 'Hill Station & Nature', icon: Mountain, destinations: ['Wayanad', 'Darjeeling', 'Gangtok', 'Ooty', 'Coonoor', 'Coorg', 'Kashmir', 'Thekkady'] },
    { name: 'Heritage & Culture', icon: Landmark, destinations: ['Rajasthan', 'Agra', 'Delhi', 'Istanbul', 'Egypt'] },
    { name: 'City & Modern Getaways', icon: Building2, destinations: ['London', 'Paris', 'Singapore', 'Kuala Lumpur', 'Abu Dhabi', 'Doha', 'Kuwait', 'Riyadh'] },
    { name: 'Backwaters & Relaxation', icon: Anchor, destinations: ['Alleppey', 'Kumarakom'] },
    { name: 'Religious & Pilgrimage', icon: Flower2, destinations: ['Jeddah', 'Makkah', 'Umrah'] },
    { name: 'Honeymoon & Romantic', icon: Heart, destinations: ['Sri Lanka', 'Phuket', 'Mauritius', 'Thailand', 'Egypt'] },
  ]

  // Filter packages based on selected tour type
  const filteredPackages = selectedTourType 
    ? packagesData.filter(pkg => 
        selectedTourType.destinations.some(dest => 
          pkg.destination.toLowerCase().includes(dest.toLowerCase())
        )
      )
    : []

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col font-sans text-slate-900">
      <Header user={user} onLoginClick={() => setIsLoginOpen(true)} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <div 
        className="relative w-full h-[500px] bg-cover bg-center flex flex-col items-center justify-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-slate-900/40"></div>
        <div className="relative z-10 text-center w-full max-w-4xl px-4 flex flex-col items-center mt-[-40px]">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">Let's travel and explore</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">Discover amazing places at exclusive deals</p>
          
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-6 space-x-2">
            <button
              onClick={() => setActiveTab('flights')}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'flights'
                  ? 'bg-violet-600 text-white'
                  : 'bg-transparent text-white border border-white/50 hover:bg-white/10'
              }`}
            >
              Flights
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'packages'
                  ? 'bg-violet-600 text-white'
                  : 'bg-transparent text-white border border-white/50 hover:bg-white/10'
              }`}
            >
              Packages
            </button>
          </div>

          {/* Search Component (The Pill) */}
          <div className="w-full">
            {activeTab === 'flights' ? <FlightSearch /> : <PackageSearch onBook={(pkg) => setBookingPackage(pkg)} />}
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-16 max-w-6xl">
        {/* Choose Tour Types Section */}
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 mt-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Choose Tour Types</h2>
              <p className="text-slate-500">Select Your Preferred Tour Type</p>
            </div>
            <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-colors">
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {tourTypes.map((tour, index) => {
              const Icon = tour.icon
              const isSelected = selectedTourType?.name === tour.name
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center group cursor-pointer"
                  onClick={() => setSelectedTourType(isSelected ? null : tour)}
                >
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                    isSelected ? 'bg-violet-600' : 'bg-violet-100 group-hover:bg-violet-600'
                  }`}>
                    <Icon className={`h-10 w-10 transition-colors duration-300 ${
                      isSelected ? 'text-white' : 'text-violet-600 group-hover:text-white'
                    }`} strokeWidth={1.5} />
                  </div>
                  <span className={`text-sm font-bold leading-tight w-24 ${
                    isSelected ? 'text-violet-600' : 'text-slate-800'
                  }`}>
                    {tour.name}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Render Filtered Packages */}
          {selectedTourType && (
            <div className="mt-12 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  {selectedTourType.name} Packages
                </h3>
                <button 
                  onClick={() => setSelectedTourType(null)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredPackages.map((pkg) => (
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
                            4.8
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm mb-4 flex-grow flex items-center">
                          <Map className="h-4 w-4 mr-1 text-slate-400" />
                          {pkg.destination}
                        </p>
                        <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-bold">{pkg.duration_days} Days</span>
                            <span className="text-xl font-black text-violet-600">₹{pkg.price}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingPackage(pkg);
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
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                  No packages found for {selectedTourType.name} at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Chatbot 
        onAiBooking={(bookingData) => {
          // Find the actual package object to pass to the modal
          const pkg = packagesData.find(p => p.name.toLowerCase() === bookingData.package_name.toLowerCase())
          if (pkg) {
            setBookingPackage(pkg)
            setAiBookingData(bookingData)
          } else {
            console.error("AI returned a package name that doesn't exist:", bookingData.package_name)
          }
        }}
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={(userData) => {
          setUser(userData)
          setIsLoginOpen(false)
        }} 
      />
      <BookingModal 
        isOpen={!!bookingPackage}
        onClose={() => {
          setBookingPackage(null)
          setAiBookingData(null)
        }}
        selectedPackage={bookingPackage}
        initialData={aiBookingData}
      />
    </div>
  )
}

export default App
