import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';

const SearchForm = () => {
  const { state, dispatch } = useBooking();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState(state.bookingDetails);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_BOOKING_DETAILS', payload: searchData });
    navigate('/rooms');
  };

  const handleChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 -mt-16 relative z-10 mx-4 md:mx-8">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check-in</label>
          <input
            type="date"
            value={searchData.checkIn}
            min={today}
            onChange={(e) => handleChange('checkIn', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check-out</label>
          <input
            type="date"
            value={searchData.checkOut}
            min={searchData.checkIn || today}
            onChange={(e) => handleChange('checkOut', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tamu</label>
          <select
            value={searchData.guests}
            onChange={(e) => handleChange('guests', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Tamu</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Kamar</label>
          <select
            value={searchData.rooms}
            onChange={(e) => handleChange('rooms', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num} Kamar</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Search size={20} />
            <span>Cari Kamar</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
