import React, { useState, useEffect, useMemo } from 'react';
import { getRooms } from '../api/api';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const Rooms = () => {
  const { state, dispatch } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await getRooms();
        if (response.success) {
          setAllRooms(response.data);
        } else {
          setError('Failed to fetch rooms');
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('An error occurred while fetching rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Mengambil tipe kamar unik dari data API
  const roomTypes = useMemo(() => {
    // Pastikan allRooms adalah array sebelum memanggil map
    if (!Array.isArray(allRooms)) {
      console.warn('allRooms is not an array:', allRooms);
      return ['all']; // Nilai default jika bukan array
    }
    
    const types = allRooms.map(room => room.room_type);
    const uniqueTypes = [...new Set(types)];
    return ['all', ...uniqueTypes];
  }, [allRooms]);

  // Gunakan array kosong jika allRooms bukan array
  const displayRooms = Array.isArray(allRooms) ? allRooms : [];
  
  const filteredRooms = useMemo(() => {
    return displayRooms.filter(room => {
      const roomType = room.room_type;
      const roomPrice = room.price_per_night;
      
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (roomType && roomType.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = state.searchFilters.roomType === 'all' || roomType === state.searchFilters.roomType;
      const matchesPrice = roomPrice >= state.searchFilters.priceRange[0] && 
                          roomPrice <= state.searchFilters.priceRange[1];
      
      return matchesSearch && matchesType && matchesPrice;
    });
  }, [searchQuery, state.searchFilters, allRooms]);

  const handlePriceRangeChange = (value, index) => {
  const newRange = [...state.searchFilters.priceRange];
  newRange[index] = parseInt(value);
  dispatch({
    type: 'SET_SEARCH_FILTERS',
    payload: { priceRange: newRange }
  });
}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kamar Tersedia</h1>
          <p className="text-xl text-gray-600">Temukan kamar yang sempurna untuk Anda</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau tipe kamar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Room Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kamar</label>
              <select
                value={state.searchFilters.roomType}
                onChange={(e) => dispatch({
                  type: 'SET_SEARCH_FILTERS',
                  payload: { roomType: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roomTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Semua Tipe' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  step="50000"
                  value={state.searchFilters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange(e.target.value, 1)}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Rp 0</span>
                  <span>Rp {state.searchFilters.priceRange[1].toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat kamar...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16 bg-red-50 rounded-xl p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-700 mb-2">Error</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              Menampilkan {filteredRooms.length} dari {allRooms.length} kamar
            </p>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
            // Handle different property names between API and current implementation
            const roomType = room.room_type;
            const roomPrice = room.price_per_night;
            const roomImage = room.image_url;
            const roomCapacity = room.capacity;
            const roomSize = `${room.capacity * 10} m²`; // Kalkulasi ukuran kamar berdasarkan kapasitas
            const roomAmenities = room.amenities ? 
              (typeof room.amenities === 'string' ? room.amenities.split(',').map(a => a.trim()) : room.amenities) : 
              [];
            
            return (
              <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                <div className="relative">
                  {/* Debug info */}
                  {console.log(
                    `[Room ${room.id}] Image URL:`, 
                    roomImage, 
                    `| Rendered URL:`, 
                    roomImage && roomImage.startsWith('http') ? roomImage : roomImage ? `http://localhost:6543${roomImage}` : 'placeholder',
                    `| Room data:`, room
                  )}
                  {roomImage ? (
                    <img
                      src={roomImage.startsWith('http') ? roomImage : `http://localhost:6543${roomImage}`}
                      alt={room.name}
                      className="w-full h-48 object-cover"
                      onLoad={(e) => {
                        console.log(`[Room ${room.id}] Image loaded successfully:`, e.target.src);
                      }}
                      onError={(e) => {
                        console.error(`[Room ${room.id}] Image load error:`, {
                          originalSrc: e.target.src,
                          roomImageValue: roomImage
                        });
                        // Ganti dengan div teks biasa saat error
                        const parent = e.target.parentNode;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-48 bg-gray-100 flex items-center justify-center';
                          placeholder.innerHTML = '<span class="text-gray-500 font-medium">Gambar Tidak Tersedia</span>';
                          parent.replaceChild(placeholder, e.target);
                          console.log(`[Room ${room.id}] Replaced with text placeholder`);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">Gambar Tidak Tersedia</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {roomType}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {roomSize} • {roomCapacity} Tamu
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm flex-grow">{room.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.isArray(roomAmenities) && roomAmenities.slice(0, 3).map((facility, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {facility}
                      </span>
                    ))}
                    {Array.isArray(roomAmenities) && roomAmenities.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{roomAmenities.length - 3} lainnya
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        Rp {roomPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="text-gray-600 ml-1">/malam</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/rooms/${room.id}`}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm text-center"
                      >
                        Detail
                      </Link>
                      <Link
                        to={`/booking/${room.id}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                      >
                        Pesan
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Kamar Ditemukan</h3>
            <p className="text-gray-600 mb-6">Coba ubah filter pencarian atau kata kunci Anda</p>
            <button
              onClick={() => {
                setSearchQuery('');
                dispatch({
                  type: 'SET_SEARCH_FILTERS',
                  payload: {
                    priceRange: [0, 2000000],
                    roomType: 'all',
                    facilities: [],
                  }
                });
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
