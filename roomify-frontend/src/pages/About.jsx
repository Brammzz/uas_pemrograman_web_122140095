
import React from 'react';
import { Building2, Users, Award, Heart } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Kamar Tersedia', value: '500+', icon: Building2 },
    { label: 'Tamu Puas', value: '50K+', icon: Users },
    { label: 'Penghargaan', value: '25+', icon: Award },
    { label: 'Tahun Pengalaman', value: '15+', icon: Heart },
  ];

  const values = [
    {
      title: 'Kenyamanan Terbaik',
      description: 'Kami berkomitmen memberikan pengalaman menginap yang tak terlupakan dengan standar kualitas tertinggi.',
      icon: '🏨',
    },
    {
      title: 'Pelayanan Prima',
      description: 'Tim profesional kami siap melayani 24/7 untuk memastikan setiap kebutuhan Anda terpenuhi.',
      icon: '🛎️',
    },
    {
      title: 'Harga Terjangkau',
      description: 'Nikmati fasilitas mewah dengan harga yang kompetitif dan berbagai pilihan pembayaran.',
      icon: '💰',
    },
    {
      title: 'Lokasi Strategis',
      description: 'Berlokasi di pusat kota dengan akses mudah ke berbagai destinasi wisata dan bisnis.',
      icon: '📍',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Enhanced Animations */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Tentang{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer">
              Roomify
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed animate-slide-in-left" style={{animationDelay: '0.3s'}}>
            Lebih dari sekedar tempat menginap, kami adalah rumah kedua Anda
          </p>
        </div>
      </div>

      {/* Stats Section with Counter Animation */}
      <div className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.3) 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-scale-in group" style={{animationDelay: `${0.6 + index * 0.1}s`}}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-2xl animate-pulse-glow">
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section with Parallax Effect */}
      <div className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left" style={{animationDelay: '1s'}}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 group hover:text-blue-600 transition-colors duration-300">
                Cerita Kami
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '1.2s'}}>
                  Dimulai dari sebuah visi sederhana pada tahun 2009, Roomify hadir untuk mengubah 
                  cara orang menikmati pengalaman menginap. Kami percaya bahwa setiap perjalanan 
                  layak mendapatkan tempat istirahat yang sempurna.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '1.4s'}}>
                  Dengan dedikasi tinggi terhadap kualitas dan inovasi, kami terus berkembang 
                  menjadi salah satu platform reservasi terpercaya di Indonesia. Setiap kamar 
                  yang kami tawarkan telah melalui seleksi ketat untuk memastikan standar 
                  kenyamanan terbaik.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '1.6s'}}>
                  Hari ini, ribuan tamu mempercayakan pengalaman menginap mereka kepada kami, 
                  dan kami bangga menjadi bagian dari perjalanan hidup mereka.
                </p>
              </div>
            </div>
            <div className="relative animate-slide-in-right" style={{animationDelay: '1.8s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl transform rotate-6 opacity-20 animate-float"></div>
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop"
                alt="Tim Roomify"
                className="rounded-xl shadow-2xl w-full transform hover:scale-105 transition-all duration-500 hover:shadow-3xl relative z-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section with Card Animations */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '3s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '2s'}}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nilai-Nilai Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prinsip-prinsip yang memandu setiap langkah perjalanan kami
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg text-center transform hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 animate-bounce-in group hover:bg-gradient-to-br hover:from-white hover:to-blue-50"
                style={{animationDelay: `${2.2 + index * 0.1}s`}}
              >
                <div className="text-4xl mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-float">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section with Gradient Animation */}
      <div className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in-up" style={{animationDelay: '2.6s'}}>
            Siap Memulai Perjalanan Anda?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto animate-slide-in-left" style={{animationDelay: '2.8s'}}>
            Bergabunglah dengan ribuan tamu yang telah merasakan pengalaman menginap terbaik bersama kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{animationDelay: '3s'}}>
            <a
              href="/rooms"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
            >
              <span className="relative z-10">Jelajahi Kamar</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </a>
            <a
              href="/contact"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 font-bold px-8 py-4 rounded-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
            >
              <span className="relative z-10">Hubungi Kami</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
