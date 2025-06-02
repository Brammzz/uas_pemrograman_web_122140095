import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import { getRoomById } from '../api/api';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useBooking();
  const { isLoggedIn } = useUser();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await getRoomById(id);
        if (response.success) {
          setRoom(response.data);
        } else {
          setError('Failed to fetch room details');
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('An error occurred while fetching room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-700">Memuat detail kamar...</h1>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kamar Tidak Ditemukan</h1>
          <Link to="/rooms" className="text-blue-600 hover:text-blue-800">
            Kembali ke Daftar Kamar
          </Link>
        </div>
      </div>
    );
  }

  const handleBookRoom = () => {
    // Periksa apakah pengguna sudah login
    if (!isLoggedIn) {
      // Simpan informasi kamar dan URL tujuan di localStorage untuk digunakan setelah login
      localStorage.setItem('redirectAfterLogin', `/booking/${room.id}`);
      
      // Arahkan pengguna ke halaman login
      navigate('/login', { state: { message: 'Silakan login terlebih dahulu untuk memesan kamar', redirectTo: `/booking/${room.id}` } });
      return;
    }
    
    // Jika sudah login, lanjutkan proses pemesanan
    // Ensure we're using the API data structure
    const bookingRoom = {
      id: room.id,
      name: room.name,
      type: room.room_type,
      price: room.price_per_night,
      image: room.image_url,
      capacity: room.capacity
    };
    
    dispatch({ type: 'SET_SELECTED_ROOM', payload: bookingRoom });
    navigate(`/booking/${room.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Debug info for main image */}
                {process.env.NODE_ENV === 'development' && console.log(
                  `[RoomDetail] Main Image URL for room ${room.id}:`, 
                  room.image_url, 
                  `| Rendered URL:`, 
                  room.image_url && room.image_url.startsWith('http') ? room.image_url : room.image_url ? `http://localhost:6543${room.image_url}` : 'placeholder',
                  `| Room data:`, room
                )}
                {room.image_url ? (
                  <img 
                    src={room.image_url && room.image_url.startsWith('http') ? room.image_url : `http://localhost:6543${room.image_url}`}
                    alt={room.name} 
                    className="w-full h-64 md:h-80 object-cover" 
                    onError={(e) => {
                      console.error(`[RoomDetail] Error loading main image for room ${room.id}:`, e);
                      // Replace with a text placeholder div instead of another image
                      const parent = e.target.parentNode;
                      if (parent) {
                        const placeholderDiv = document.createElement('div');
                        placeholderDiv.className = 'w-full h-64 md:h-80 bg-gray-200 flex items-center justify-center text-gray-500';
                        placeholderDiv.innerText = 'Gambar Tidak Tersedia';
                        parent.replaceChild(placeholderDiv, e.target);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gray-200 flex items-center justify-center text-gray-500">
                    Gambar Tidak Tersedia
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2">
                  {/* Debug info for secondary image */}
                  {console.log(
                    `[RoomDetail] Secondary Image URL for room ${room.id}:`, 
                    room.image_url
                  )}
                  {/* First secondary image */}
                  {room.image_url ? (
                    <img 
                      src={room.image_url && room.image_url.startsWith('http') ? room.image_url : `http://localhost:6543${room.image_url}`}
                      alt={`${room.name} view 1`} 
                      className="w-full h-32 md:h-39 object-cover" 
                      onError={(e) => {
                        console.error(`[RoomDetail] Error loading secondary image 1 for room ${room.id}:`, e);
                        // Replace with a text placeholder div instead of another image
                        const parent = e.target.parentNode;
                        if (parent) {
                          const placeholderDiv = document.createElement('div');
                          placeholderDiv.className = 'w-full h-32 md:h-39 bg-gray-200 flex items-center justify-center text-gray-500';
                          placeholderDiv.innerText = 'Gambar Tidak Tersedia';
                          parent.replaceChild(placeholderDiv, e.target);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 md:h-39 bg-gray-200 flex items-center justify-center text-gray-500">
                      Gambar Tidak Tersedia
                    </div>
                  )}
                  
                  {/* Second secondary image */}
                  {console.log(
                    `[RoomDetail] Secondary Image 2 URL for room ${room.id}:`, 
                    room.image_url
                  )}
                  {room.image_url ? (
                    <img 
                      src={room.image_url && room.image_url.startsWith('http') ? room.image_url : `http://localhost:6543${room.image_url}`}
                      alt={`${room.name} view 2`} 
                      className="w-full h-32 md:h-39 object-cover" 
                      onError={(e) => {
                        console.error(`[RoomDetail] Error loading secondary image 2 for room ${room.id}:`, e);
                        // Replace with a text placeholder div instead of another image
                        const parent = e.target.parentNode;
                        if (parent) {
                          const placeholderDiv = document.createElement('div');
                          placeholderDiv.className = 'w-full h-32 md:h-39 bg-gray-200 flex items-center justify-center text-gray-500';
                          placeholderDiv.innerText = 'Gambar Tidak Tersedia';
                          parent.replaceChild(placeholderDiv, e.target);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 md:h-39 bg-gray-200 flex items-center justify-center text-gray-500">
                      Gambar Tidak Tersedia
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                  <div className="text-lg text-gray-600">{room.room_type} Room</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    Rp {room.price_per_night.toLocaleString('id-ID')}
                  </div>
                  <div className="text-gray-600">/malam (belum termasuk pajak)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{`${room.capacity * 10} m²`}</div>
                  <div className="text-gray-600">Luas Kamar</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{room.capacity}</div>
                  <div className="text-gray-600">Max Tamu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{room.bed_type || 'Standard'}</div>
                  <div className="text-gray-600">Tempat Tidur</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Deskripsi</h3>
                <p className="text-gray-700">{room.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fasilitas Kamar</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(typeof room.amenities === 'string' ? 
                    room.amenities.split(',').map(a => a.trim()) : 
                    room.amenities).map((facility, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Rp {room.price_per_night.toLocaleString('id-ID')}
                </div>
                <div className="text-gray-600">/malam (belum termasuk pajak)</div>
              </div>

              <div className="space-y-4 mb-6">
                <input type="date" className="w-full border border-gray-300 rounded-lg p-2" />
                <input type="date" className="w-full border border-gray-300 rounded-lg p-2" />
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  {Array.from({ length: room.capacity }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Tamu
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleBookRoom}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Pesan Sekarang
              </button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Pembatalan gratis hingga 24 jam sebelum check-in
              </div>

              <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Harga per malam</span>
                  <span>Rp {(room.price_per_night || room.price).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak & biaya</span>
                  <span>Rp {((room.price_per_night || room.price) * 0.1).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Rp {((room.price_per_night || room.price) * 1.1).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
