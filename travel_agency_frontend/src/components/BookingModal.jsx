import { useState, useEffect } from 'react'
import {
  X,
  User,
  Mail,
  Phone,
  Users,
  Calendar,
  MessageSquare,
  CreditCard,
  ChevronLeft
} from 'lucide-react'

export default function BookingModal({
  isOpen,
  onClose,
  selectedPackage,
  initialData
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelers: 1,
    travelDate: '',
    notes: ''
  })

  const [step, setStep] = useState(1)

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.customer_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        travelers: initialData.travelers || 1,
        travelDate: initialData.travelDate || '',
        notes: initialData.notes || ''
      })

      setStep(2)
    } else if (!isOpen) {
      setStep(1)

      setFormData({
        name: '',
        email: '',
        phone: '',
        travelers: 1,
        travelDate: '',
        notes: ''
      })
    }
  }, [isOpen, initialData])

  if (!selectedPackage) return null

  const totalPrice =
    parseFloat(selectedPackage.price.replace(/,/g, '') || 0) *
    Number(formData.travelers)

  const handleProceedToBilling = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePayment = async () => {
    try {
      console.log('Sending booking to backend...')

      const response = await fetch(
        'https://travel-web-45r8.onrender.com/book',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            package_id: selectedPackage.package_id,
            package_name: selectedPackage.name,
            amount_paid: totalPrice
          })
        }
      )

      const data = await response.json()

      console.log(
        'Booking API response:',
        response.status,
        data
      )

      if (!response.ok) {
        throw new Error(
          data.detail ||
          `Booking failed with status ${response.status}`
        )
      }

      console.log('Booking confirmed successfully:', data)

      setStep(3)

      setTimeout(() => {
        setStep(1)

        setFormData({
          name: '',
          email: '',
          phone: '',
          travelers: 1,
          travelDate: '',
          notes: ''
        })

        onClose()
      }, 4000)

    } catch (error) {
      console.error('Booking failed:', error)

      alert(`Booking failed: ${error.message}`)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 ${
        isOpen
          ? 'opacity-100 visible'
          : 'opacity-0 invisible pointer-events-none'
      }`}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative transition-all duration-300 transform max-h-[90vh] flex flex-col ${
          isOpen
            ? 'scale-100 translate-y-0'
            : 'scale-95 translate-y-8'
        }`}
      >

        {/* HEADER */}
        <div className="bg-violet-600 p-6 text-white relative flex-shrink-0">

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-violet-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>

          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="absolute top-4 left-4 text-violet-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <h2
            className={`text-2xl font-extrabold pr-8 ${
              step === 2 ? 'pl-10' : ''
            }`}
          >
            {step === 1
              ? 'Book Your Trip'
              : step === 2
              ? 'Final Billing'
              : 'Success'}
          </h2>

          <p
            className={`text-violet-100 mt-1 font-medium ${
              step === 2 ? 'pl-10' : ''
            }`}
          >
            {selectedPackage.name}
          </p>

          <div
            className={`mt-3 inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
              step === 2 ? 'ml-10' : ''
            }`}
          >
            Total: ₹{totalPrice.toLocaleString('en-IN')}
          </div>

        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto">

          {/* SUCCESS */}
          {step === 3 && (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-300">

              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">

                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>

              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Payment Successful!
              </h3>

              <p className="text-slate-500">
                Thank you, {formData.name}. We will contact you at{' '}
                {formData.email} shortly with your itinerary details.
              </p>

            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form
              className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300"
              onSubmit={handleProceedToBilling}
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* NAME */}
                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name
                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                      placeholder="John Doe"
                    />

                  </div>

                </div>

                {/* EMAIL */}
                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                      placeholder="john@gmail.com"
                    />

                  </div>

                </div>

                {/* PHONE */}
                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mobile Number
                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                      placeholder="+91 98765 43210"
                    />

                  </div>

                </div>

                {/* TRAVELERS */}
                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    No. of Persons
                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-slate-400" />
                    </div>

                    <input
                      type="number"
                      name="travelers"
                      min="1"
                      max="20"
                      value={formData.travelers}
                      onChange={handleChange}
                      required
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                    />

                  </div>

                </div>

                {/* TRAVEL DATE */}
                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Expected Travel Date
                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-slate-400" />
                    </div>

                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      onClick={(e) =>
                        e.currentTarget.showPicker?.()
                      }
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm cursor-pointer"
                    />

                  </div>

                </div>

                {/* NOTES */}
                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Special Requests (Optional)
                  </label>

                  <div className="relative">

                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                    </div>

                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm resize-none"
                      placeholder="E.g., Vegetarian meals, window seats..."
                    />

                  </div>

                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl mt-6 flex justify-center items-center gap-2"
              >
                Proceed to Billing
              </button>

            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* BOOKING SUMMARY */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">

                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
                  Booking Summary
                </h3>

                <div className="space-y-3 text-sm mb-4">

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">
                      Name:
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formData.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">
                      Contact:
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formData.phone}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">
                      Date:
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formData.travelDate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">
                      Travelers:
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formData.travelers} Person(s)
                    </span>
                  </div>

                </div>

                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 pt-2">
                  Package Details
                </h3>

                <div className="space-y-2 text-sm text-slate-600 mb-4">

                  <p>
                    <span className="font-semibold text-slate-700">
                      Destination:
                    </span>{' '}
                    {selectedPackage.destination}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-700">
                      Duration:
                    </span>{' '}
                    {selectedPackage.duration_days} Days
                  </p>

                  <p>
                    <span className="font-semibold text-slate-700">
                      Accommodation:
                    </span>{' '}
                    {selectedPackage.hotel}
                  </p>

                  <div className="pt-1">

                    <span className="font-semibold text-slate-700 block mb-1">
                      Inclusions:
                    </span>

                    <ul className="list-disc pl-4 text-xs space-y-1">

                      {selectedPackage.inclusions
                        ?.split(';')
                        .map((inc, i) => (
                          <li key={i}>
                            {inc.trim()}
                          </li>
                        ))}

                    </ul>

                  </div>

                </div>

                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-slate-200">

                  <span className="text-slate-800">
                    Total Amount:
                  </span>

                  <span className="text-violet-600">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>

                </div>

              </div>

              {/* PAYMENT */}
              <div>

                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase flex items-center gap-2">

                  <CreditCard className="w-4 h-4 text-violet-600" />

                  Payment Details

                </h3>

                <div className="space-y-3">

                  <input
                    type="text"
                    placeholder="Card Number (Mock)"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                  />

                  <div className="grid grid-cols-2 gap-3">

                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                    />

                    <input
                      type="text"
                      placeholder="CVV"
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                    />

                  </div>

                </div>

              </div>

              {/* PAY BUTTON */}
              <button
                onClick={handlePayment}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2"
              >
                Pay ₹{totalPrice.toLocaleString('en-IN')}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}