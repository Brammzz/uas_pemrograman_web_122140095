import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import { getRooms } from '../api/api';

const Home = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await getRooms();
        if (response.success) {
          // Ambil 5 kamar teratas sebagai featured rooms
          setFeaturedRooms(response.data.slice(0, 5));
          console.log('Rooms fetched successfully:', response.data);
        } else {
          console.error('Failed to fetch rooms:', response.message);
          setError(response.message || 'Failed to fetch rooms');
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

  // Tidak lagi menggunakan data dummy

  // Gunakan array kosong jika tidak ada data
  const displayRooms = featuredRooms;

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Enhanced Animations */}
      <div className="relative h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 animate-fade-in-up">
            Selamat Datang di{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer">
              Roomify
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-center mb-8 max-w-3xl animate-slide-in-left" style={{animationDelay: '0.3s'}}>
            Temukan pengalaman menginap yang tak terlupakan dengan kamar-kamar terbaik dan layanan premium
          </p>
          <Link
            to="/rooms"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-lg text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl animate-bounce-in group relative overflow-hidden"
            style={{animationDelay: '0.6s'}}
          >
            <span className="relative z-10">Jelajahi Kamar</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </Link>
        </div>
      </div>

      {/* Search Form with Animation */}
      <div className="max-w-7xl mx-auto animate-slide-in-right" style={{animationDelay: '1s'}}>
        <SearchForm />
      </div>

       {/* Featured Rooms with Staggered Animations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '2s'}}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Kamar Unggulan</h2>
            <p className="text-xl text-gray-600">Pilihan kamar terbaik dan terpopuler kami</p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600">Silakan coba lagi nanti</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayRooms.map((room, index) => {
              const roomAmenities = typeof room.amenities === 'string' ? room.amenities.split(',').map(item => item.trim()) : room.amenities;
              const roomType = room.room_type;
              const roomPrice = room.price_per_night;
              const roomImage = room.image_url;
              const roomCapacity = room.capacity;
              const roomSize = `${20 + (roomCapacity * 5)} m²`; // Kalkulasi ukuran kamar berdasarkan kapasitas
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="relative">
                    {/* Debug info */}
                    {console.log(
                      `[Home Room ${room.id}] Image URL:`, 
                      roomImage, 
                      `| Rendered URL:`, 
                      roomImage && roomImage.startsWith('http') ? roomImage : roomImage ? `http://localhost:6543${roomImage}` : 'placeholder',
                      `| Room data:`, room
                    )}
                    {roomImage ? (
                      <img 
                        src={roomImage && roomImage.startsWith('http') ? roomImage : `http://localhost:6543${roomImage}`}
                        alt={room.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.error(`[Home] Error loading image for room ${room.id}:`, e);
                          // Replace with a text placeholder div instead of another image
                          const parent = e.target.parentNode;
                          if (parent) {
                            const placeholderDiv = document.createElement('div');
                            placeholderDiv.className = 'w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500';
                            placeholderDiv.innerText = 'Gambar Tidak Tersedia';
                            parent.replaceChild(placeholderDiv, e.target);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                        Gambar Tidak Tersedia
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
        </div>
      </section>

      {/* Features Section with Advanced Animations */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '2.5s'}}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mengapa Memilih Roomify?</h2>
            <p className="text-xl text-gray-600">Kemudahan dan kenyamanan dalam satu platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🏨', title: 'Kamar Berkualitas', desc: 'Kamar-kamar terpilih dengan standar kebersihan dan kenyamanan terbaik', delay: '2.7s' },
              { icon: '💳', title: 'Harga Terjangkau', desc: 'Harga kompetitif dengan berbagai pilihan pembayaran yang mudah', delay: '2.9s' },
              { icon: '🛎️', title: 'Layanan 24/7', desc: 'Customer support siap membantu Anda kapan saja dibutuhkan', delay: '3.1s' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 animate-slide-in-left group" style={{animationDelay: feature.delay}}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-2xl animate-float">
                  <span className="text-white text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
