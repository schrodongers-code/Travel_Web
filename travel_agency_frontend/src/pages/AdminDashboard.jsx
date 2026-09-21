import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CalendarDays, IndianRupee, FileText } from 'lucide-react';
import AdminAssistant from '../components/AdminAssistant';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://travel-web-45r8.onrender.com/bookings') // Replace with your backend URL
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setBookings(data.bookings);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch bookings', err);
        setLoading(false);
      });
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Nav */}
      <div className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-violet-400" />
          <h1 className="text-xl font-bold">Staff Dashboard</h1>
        </div>
        <button 
          onClick={() => window.location.href = '/'} 
          className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
        >
          Exit to Customer Site
        </button>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="bg-violet-100 p-3 rounded-full text-violet-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Bookings</p>
              <h3 className="text-2xl font-bold">{bookings.length}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Travelers</p>
              <h3 className="text-2xl font-bold">{bookings.reduce((sum, b) => sum + (b.travelers_count || 0), 0)}</h3>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Recent Bookings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4 font-semibold">Ref ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Package</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading bookings...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No bookings yet.</td></tr>
                ) : (
                  bookings.map(bkg => (
                    <tr key={bkg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-violet-600">{bkg.booking_reference}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{bkg.customer_name}</div>
                        <div className="text-xs text-slate-500">{bkg.customer_email}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-700">{bkg.package_name}</td>
                      <td className="p-4 text-sm text-slate-700">{bkg.travel_date}</td>
                      <td className="p-4 text-sm font-semibold">₹{bkg.amount_paid}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                          {bkg.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff AI Assistant */}
      <AdminAssistant />
    </div>
  );
}
