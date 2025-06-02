
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-bold">Roomify</span>
            </div>
            <p className="text-gray-400">
              Platform reservasi penginapan terpercaya untuk pengalaman menginap yang tak terlupakan.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Navigasi</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors">
                Beranda
              </Link>
              <Link to="/rooms" className="block text-gray-400 hover:text-white transition-colors">
                Kamar
              </Link>
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">
                Tentang
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Kontak
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Layanan</h3>
            <div className="space-y-2">
              <p className="text-gray-400">Reservasi Online</p>
              <p className="text-gray-400">Customer Support 24/7</p>
              <p className="text-gray-400">Pembatalan Gratis</p>
              <p className="text-gray-400">Konfirmasi Instan</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <div className="space-y-2 text-gray-400">
              <p>Email: info@roomify.com</p>
              <p>Telepon: +62 21 1234 5678</p>
              <p>WhatsApp: +62 812 3456 7890</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Roomify. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
