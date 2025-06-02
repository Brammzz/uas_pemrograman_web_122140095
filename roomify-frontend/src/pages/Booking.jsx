import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Calendar, Users } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import { getRoomById, bookRoom } from '../api/api';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useBooking();
  const { user, isLoggedIn } = useUser();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    specialRequests: '',
    checkIn: state.bookingDetails.checkIn || '',
    checkOut: state.bookingDetails.checkOut || '',
    guests: state.bookingDetails.guests || 1,
  });

  const [currentStep, setCurrentStep] = useState(1);

  // Periksa status login pengguna
  useEffect(() => {
    if (!isLoggedIn) {
      // Simpan URL tujuan di localStorage untuk digunakan setelah login
      localStorage.setItem('redirectAfterLogin', `/booking/${id}`);
      
      // Arahkan pengguna ke halaman login
      navigate('/login', { 
        state: { 
          message: 'Silakan login terlebih dahulu untuk memesan kamar', 
          redirectTo: `/booking/${id}` 
        } 
      });
    }
  }, [isLoggedIn, id, navigate]);

  // Fetch room data from API
  useEffect(() => {
    // Hanya lanjutkan jika pengguna sudah login
    if (!isLoggedIn) return;
    
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await getRoomById(id);
        if (response.success) {
          console.log('[Booking] Room data received:', response.data);
          console.log('[Booking] Room capacity:', response.data.capacity);
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

  // Set selected room in booking context
  useEffect(() => {
    if (room && !state.selectedRoom) {
      console.log('[Booking] Setting selected room with capacity:', room.capacity);
      const bookingRoom = {
        id: room.id,
        name: room.name,
        type: room.room_type,
        price: room.price_per_night,
        image: room.image_url,
        maxGuests: room.capacity || 2 // Gunakan capacity dari room atau default ke 2 jika tidak ada
      };
      dispatch({ type: 'SET_SELECTED_ROOM', payload: bookingRoom });
    }
  }, [room, state.selectedRoom, dispatch]);
  
  // Kode useEffect untuk redirect ke login sudah ditangani di atas

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut || !room) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return 0;
    const roomPrice = room.price_per_night || room.price;
    const subtotal = roomPrice * nights;
    const tax = Math.round(subtotal * 0.1);
    return subtotal + tax;
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      // Validasi form sebelum pindah ke langkah berikutnya
      if (!isStep1Valid()) {
        setBookingError('Silakan lengkapi semua informasi yang diperlukan');
        return;
      }
      setBookingError(null);
      setCurrentStep(2);
    } else {
      try {
        setBookingError(null);
        
        // Validasi tanggal
        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkIn < today) {
          setBookingError('Tanggal check-in tidak boleh di masa lalu');
          return;
        }
        
        if (checkOut <= checkIn) {
          setBookingError('Tanggal check-out harus setelah tanggal check-in');
          return;
        }
        
        const nights = calculateNights();
        if (nights <= 0) {
          setBookingError('Durasi menginap tidak valid');
          return;
        }
        
        // Validasi jumlah tamu
        if (formData.guests <= 0 || formData.guests > room.capacity) {
          setBookingError(`Jumlah tamu harus antara 1 dan ${room.capacity}`);
          return;
        }
        
        const roomPrice = room.price_per_night || room.price;
        
        const bookingData = {
          room_id: room.id,
          check_in_date: formData.checkIn,
          check_out_date: formData.checkOut,
          guests: formData.guests,
          total_price: calculateTotal(),
          special_requests: formData.specialRequests,
          status: 'pending' // Ubah status menjadi pending, biarkan admin yang mengkonfirmasi
        };
        
        // Tampilkan loading state
        setLoading(true);
        
        const response = await bookRoom(room.id, bookingData);
        
        if (response.success) {
          // Booking berhasil
          setBookingSuccess(true);
          setBookingError(null);
          
          // Simpan informasi booking ke context
          dispatch({
            type: 'SET_BOOKING_DETAILS',
            payload: {
              ...bookingData,
              bookingId: response.data.id,
              roomName: room.name,
              roomType: room.room_type,
              roomImage: room.image_url
            }
          });
          
          // Redirect ke halaman profil setelah beberapa detik
          setTimeout(() => {
            navigate('/profile', { state: { bookingSuccess: true } });
          }, 2000);
        } else {
          // Booking gagal
          setBookingSuccess(false);
          
          // Cek apakah error terkait autentikasi
          if (response.requiresAuth) {
            // Simpan URL tujuan untuk redirect setelah login
            localStorage.setItem('redirectAfterLogin', `/booking/${id}`);
            
            // Redirect ke halaman login
            navigate('/login', { 
              state: { 
                message: response.message || 'Silakan login kembali untuk melanjutkan pemesanan', 
                redirectTo: `/booking/${id}` 
              } 
            });
            return;
          }
          
          // Tampilkan pesan error
          setBookingError(response.message || 'Gagal membuat pemesanan. Silakan coba lagi.');
        }
      } catch (err) {
        console.error('Error creating booking:', err);
        setBookingSuccess(false);
        setBookingError('Terjadi kesalahan saat memproses pemesanan Anda. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    }
  };

  const isStep1Valid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.checkIn &&
      formData.checkOut &&
      calculateNights() > 0
    );
  };

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
          <button
            onClick={() => navigate('/rooms')}
            className="text-blue-600 hover:text-blue-800"
          >
            Kembali ke Daftar Kamar
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pemesanan Berhasil!</h2>
          <p className="text-gray-600 mb-6">Terima kasih telah memesan kamar di Roomify. Detail pemesanan telah dikirim ke email Anda.</p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Lihat Pemesanan Saya
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="font-medium">Detail Pemesanan</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="font-medium">Pembayaran</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <>
                  {/* Guest Information */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Tamu</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Depan *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Belakang *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nomor Telepon *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Pemesanan</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline mr-2" size={16} />
                          Check-in *
                        </label>
                        <input
                          type="date"
                          value={formData.checkIn}
                          onChange={(e) => handleInputChange('checkIn', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline mr-2" size={16} />
                          Check-out *
                        </label>
                        <input
                          type="date"
                          value={formData.checkOut}
                          onChange={(e) => handleInputChange('checkOut', e.target.value)}
                          min={formData.checkIn || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Users className="inline mr-2" size={16} />
                          Jumlah Tamu *
                        </label>
                        <select
                          value={formData.guests}
                          onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {room && room.capacity ? (
                            // Gunakan capacity dari room sebagai batas maksimum tamu
                            Array.from({ length: room.capacity }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} {i === 0 ? 'Tamu' : 'Tamu'}
                              </option>
                            ))
                          ) : (
                            // Fallback jika capacity tidak tersedia
                            <option value={1}>1 Tamu</option>
                          )}
                        </select>
                        {/* Debug info */}
                        {console.log('[Booking] Room capacity:', room?.capacity, 'Current guests:', formData.guests)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permintaan Khusus
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Non-smoking room, early check-in, dll."
                      />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    <CreditCard className="inline mr-2" />
                    Informasi Pembayaran
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Kartu *
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Kadaluarsa *
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama di Kartu *
                      </label>
                      <input
                        type="text"
                        placeholder="Nama sesuai kartu"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
                )}
                <button
                  type="submit"
                  disabled={(currentStep === 1 && !isStep1Valid()) || bookingError}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {currentStep === 1 ? 'Lanjut ke Pembayaran' : 'Konfirmasi Pemesanan'}
                </button>
                
                {bookingError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                    {bookingError}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Pemesanan</h3>
              
              <div className="flex space-x-4 mb-6">
                <img
                  src={room.image_url || room.image || 'https://via.placeholder.com/400x300?text=Room+Image'}
                  alt={room.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Room+Image';
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{room.name}</h4>
                  <p className="text-gray-600 text-sm">{room.room_type} Room</p>
                  <p className="text-blue-600 font-semibold">
                    Rp {room.price_per_night.toLocaleString('id-ID')}/malam
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Check-in:</span>
                  <span className="font-medium">
                    {formData.checkIn ? new Date(formData.checkIn).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Check-out:</span>
                  <span className="font-medium">
                    {formData.checkOut ? new Date(formData.checkOut).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Durasi:</span>
                  <span className="font-medium">{calculateNights()} malam</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tamu:</span>
                  <span className="font-medium">{formData.guests} orang</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({calculateNights()} malam):</span>
                  <span>Rp {((room.price_per_night || room.price) * calculateNights()).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak & biaya:</span>
                  <span>Rp {Math.round((room.price_per_night || room.price) * calculateNights() * 0.1).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Pembatalan gratis hingga 24 jam sebelum check-in
                </p>
                <p className="text-sm text-green-800">
                  ✓ Konfirmasi pemesanan instan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
