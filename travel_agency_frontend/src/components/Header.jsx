import { Phone, Search, Globe, MessageCircle, Mail, MapPin, User as UserIcon, LogOut } from 'lucide-react'

export default function Header({ user, onLoginClick, onLogout }) {
  return (
    <header className="bg-white w-full">
      {/* Top Bar */}
      <div className="w-full bg-indigo-50/50 border-b border-indigo-100 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs text-slate-600 font-medium">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span>Follow us:</span>
              <div className="flex space-x-2">
                <Globe className="h-3.5 w-3.5 cursor-pointer hover:text-violet-600" />
                <MessageCircle className="h-3.5 w-3.5 cursor-pointer hover:text-violet-600" />
                <Mail className="h-3.5 w-3.5 cursor-pointer hover:text-violet-600" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-3.5 w-3.5" />
              <span>+91 (942) 674-7757</span>
            </div>
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="flex items-center font-bold text-violet-700">
                  <UserIcon className="h-3.5 w-3.5 mr-1" />
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button onClick={onLogout} className="flex items-center hover:text-red-600 font-semibold tracking-wider transition-colors">
                  <LogOut className="h-3.5 w-3.5 mr-1" /> LOGOUT
                </button>
              </div>
            ) : (
              <button onClick={onLoginClick} className="hover:text-violet-600 font-semibold tracking-wider transition-colors">LOGIN</button>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-violet-600 text-white p-1.5 rounded-md transform -rotate-12">
            <Globe className="h-6 w-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-serif">JETSETTER</span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Travel</span>
          </div>
        </div>
        
        <nav className="hidden md:flex space-x-8 text-sm font-semibold text-slate-700">
          <a href="#" className="hover:text-violet-600 transition-colors">Home</a>
          <a href="#" className="hover:text-violet-600 transition-colors">About</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Destination</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Tour</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Blog</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Hotels</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Pages</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Contact</a>
        </nav>

        <button className="bg-violet-600 hover:bg-violet-700 text-white p-2.5 rounded-full transition-colors">
          <Search className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
