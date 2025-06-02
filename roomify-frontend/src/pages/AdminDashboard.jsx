import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  Users, 
  Hotel, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AdminRoomForm from '../components/AdminRoomForm';
import { getAdminStats, getAdminRooms, createRoom, updateRoom, deleteRoom, getAdminBookings, updateBookingStatus } from '../api/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdminLoggedIn, adminUser, logoutAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State untuk data dari API
  const [rooms, setRooms] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalRooms: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Fungsi untuk mengambil data statistik
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ambil data statistik
      const statsResponse = await getAdminStats();
      console.log('Admin stats response:', statsResponse);
      
      if (statsResponse.success) {
        setStats(statsResponse.stats);
        setRecentBookings(statsResponse.recentBookings);
        setRooms(statsResponse.roomStats);
      } else {
        setError(statsResponse.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk mengambil data booking
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAdminBookings();
      console.log('Admin bookings response:', response);
      
      if (response && Array.isArray(response)) {
        setBookings(response);
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError('Failed to fetch bookings data');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('An error occurred while fetching bookings data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk mengambil data kamar
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAdminRooms();
      console.log('Admin rooms response:', response);
      
      if (response && Array.isArray(response)) {
        setRoomsList(response);
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError('Failed to fetch rooms data');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('An error occurred while fetching rooms data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    
    // Ambil data dashboard saat komponen di-mount
    fetchDashboardData();
    
    // Ambil data berdasarkan tab aktif
    if (activeTab === 'rooms') {
      fetchRooms();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [isAdminLoggedIn, navigate, activeTab]);
  
  // Menampilkan pesan sukses dan menghilangkannya setelah 3 detik
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const handleAddRoom = async (roomData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Konversi data untuk API
      const roomPayload = {
        name: roomData.name,
        description: roomData.description,
        price_per_night: parseInt(roomData.price),
        room_type: roomData.type,
        capacity: parseInt(roomData.maxGuests),
        is_available: true,
        image_url: roomData.image,
        amenities: roomData.facilities
      };
      
      const response = await createRoom(roomPayload);
      console.log('Create room response:', response);
      
      if (response && response.id) {
        // Refresh data kamar
        fetchRooms();
        setSuccessMessage('Kamar berhasil ditambahkan');
      } else {
        setError('Gagal menambahkan kamar');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      setError('Terjadi kesalahan saat menambahkan kamar');
    } finally {
      setLoading(false);
      setShowRoomForm(false);
    }
  };

  const handleEditRoom = async (roomData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Konversi data untuk API
      const roomPayload = {
        name: roomData.name,
        description: roomData.description,
        price_per_night: parseInt(roomData.price),
        room_type: roomData.type,
        capacity: parseInt(roomData.maxGuests),
        is_available: true,
        image_url: roomData.image,
        amenities: roomData.facilities
      };
      
      const response = await updateRoom(editingRoom.id, roomPayload);
      console.log('Update room response:', response);
      
      if (response && response.id) {
        // Refresh data kamar
        fetchRooms();
        setSuccessMessage('Kamar berhasil diperbarui');
      } else {
        setError('Gagal memperbarui kamar');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      setError('Terjadi kesalahan saat memperbarui kamar');
    } finally {
      setLoading(false);
      setEditingRoom(null);
      setShowRoomForm(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kamar ini?')) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await deleteRoom(roomId);
        console.log('Delete room response:', response);
        
        if (response && response.success) {
          // Refresh data kamar
          fetchRooms();
          setSuccessMessage(response.message || 'Kamar berhasil dihapus');
        } else {
          setError(response.message || 'Gagal menghapus kamar');
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        setError('Terjadi kesalahan saat menghapus kamar');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Fungsi untuk mengubah status booking
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const statusLabels = {
      'paid': 'lunas',
      'pending': 'pending',
      'cancelled': 'dibatalkan',
      'completed': 'selesai'
    };
    
    const confirmMessage = newStatus === 'cancelled' 
      ? 'Apakah Anda yakin ingin membatalkan booking ini?' 
      : `Apakah Anda yakin ingin mengubah status booking menjadi ${statusLabels[newStatus]}?`;
    
    if (window.confirm(confirmMessage)) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await updateBookingStatus(bookingId, { status: newStatus });
        console.log('Update booking status response:', response);
        
        if (response && response.success) {
          // Jika respons berhasil, perbarui booking di state lokal
          if (response.booking) {
            // Update booking di state bookings
            setBookings(prevBookings => 
              prevBookings.map(booking => 
                booking.id === bookingId ? response.booking : booking
              )
            );
            
            // Jika booking yang diupdate adalah booking yang sedang ditampilkan detailnya
            if (selectedBooking && selectedBooking.id === bookingId) {
              setSelectedBooking(response.booking);
            }
            
            // Update juga di recentBookings jika ada
            if (recentBookings.length > 0) {
              setRecentBookings(prevBookings => 
                prevBookings.map(booking => 
                  booking.id === bookingId ? response.booking : booking
                )
              );
            }
          } else {
            // Jika tidak ada booking di respons, refresh semua data
            fetchBookings();
          }
          
          setSuccessMessage(`Status booking #${bookingId} berhasil diubah menjadi ${statusLabels[newStatus]}`);
        } else {
          setError(response.message || 'Gagal mengubah status booking');
        }
      } catch (error) {
        console.error('Error updating booking status:', error);
        setError('Terjadi kesalahan saat mengubah status booking');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Visitors</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalVisitors.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalBookings.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CreditCard className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">Rp {(stats.totalRevenue).toLocaleString()}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Rooms</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalRooms}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Hotel className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="overflow-x-auto">
            {recentBookings.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.room}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {booking.total_price.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent bookings found</p>
            )}
          </div>
        </div>

        {/* Room Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Room Performance</h3>
          <div className="overflow-x-auto">
            {rooms.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {room.price.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${room.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.bookings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {room.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center py-4">No rooms found</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Selamat datang Administrator{adminUser?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'rooms', name: 'Kelola Kamar', icon: Hotel },
                { id: 'bookings', name: 'Pembayaran', icon: CreditCard }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && renderOverview()}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Kelola Kamar</h2>
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setShowRoomForm(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>Tambah Kamar</span>
              </button>
            </div>
            
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center mb-4">
                <CheckCircle className="mr-2" size={20} />
                <span>{successMessage}</span>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
                <AlertCircle className="mr-2" size={20} />
                <span>{error}</span>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {roomsList.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kamar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasitas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roomsList.map((room) => (
                        <tr key={room.id}>
                          <td className="px-6 py-4 font-medium">{room.name}</td>
                          <td className="px-6 py-4">{room.room_type}</td>
                          <td className="px-6 py-4">Rp {room.price_per_night.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4">{room.capacity} Tamu</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              room.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {room.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                            </span>
                          </td>
                          <td className="px-6 py-4">{room.booking_count}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button onClick={() => {
                                // Konversi format data untuk form
                                const formattedRoom = {
                                  id: room.id,
                                  name: room.name,
                                  type: room.room_type,
                                  price: room.price_per_night,
                                  description: room.description,
                                  facilities: Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities,
                                  maxGuests: room.capacity,
                                  image: room.image_url
                                };
                                setEditingRoom(formattedRoom);
                                setShowRoomForm(true);
                              }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeleteRoom(room.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-8">Tidak ada data kamar ditemukan</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Data Pembayaran</h2>
            
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center mb-4">
                <CheckCircle className="mr-2" size={20} />
                <span>{successMessage}</span>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
                <AlertCircle className="mr-2" size={20} />
                <span>{error}</span>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {bookings.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Booking</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 font-medium">#{booking.id.toString().padStart(4, '0')}</td>
                          <td className="px-6 py-4">{booking.user_name || booking.user_id}</td>
                          <td className="px-6 py-4">{booking.room_name || booking.room_id}</td>
                          <td className="px-6 py-4">{new Date(booking.check_in_date).toLocaleDateString('id-ID')}</td>
                          <td className="px-6 py-4">{new Date(booking.check_out_date).toLocaleDateString('id-ID')}</td>
                          <td className="px-6 py-4">Rp {booking.total_price.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'paid' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status === 'paid' ? 'Lunas' : 
                               booking.status === 'pending' ? 'Menunggu Pembayaran' : 
                               booking.status === 'cancelled' ? 'Dibatalkan' : 
                               booking.status === 'completed' ? 'Selesai' :
                               booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowBookingDetails(true);
                                }} 
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>
                              
                              {/* Tombol Tandai Lunas - hanya muncul jika status pending */}
                              {booking.status === 'pending' && (
                                <button 
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'paid')} 
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Tandai Lunas"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              
                              {/* Tombol Tandai Selesai - hanya muncul jika status paid */}
                              {booking.status === 'paid' && (
                                <button 
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'completed')} 
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Tandai Selesai"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              
                              {/* Tombol Batalkan - hanya muncul jika status bukan cancelled dan bukan completed */}
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <button 
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')} 
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Batalkan"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-8">Tidak ada data booking ditemukan</p>
                )}
              </div>
            )}
            
            {/* Booking Detail Modal */}
            {showBookingDetails && selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Detail Booking #{selectedBooking.id.toString().padStart(4, '0')}</h3>
                    <button 
                      onClick={() => setShowBookingDetails(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">INFORMASI TAMU</h4>
                      <p className="font-medium">{selectedBooking.user_name || selectedBooking.user_id}</p>
                      <p className="text-gray-600">{selectedBooking.user_email || 'Email tidak tersedia'}</p>
                      <p className="text-gray-600">{selectedBooking.user_phone || 'Telepon tidak tersedia'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">INFORMASI KAMAR</h4>
                      <p className="font-medium">{selectedBooking.room_name}</p>
                      <p className="text-gray-600">{selectedBooking.room_type}</p>
                      <p className="text-gray-600">Kapasitas: {selectedBooking.guests} Tamu</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">TANGGAL MENGINAP</h4>
                      <p className="text-gray-600">Check-in: {new Date(selectedBooking.check_in_date).toLocaleDateString('id-ID')}</p>
                      <p className="text-gray-600">Check-out: {new Date(selectedBooking.check_out_date).toLocaleDateString('id-ID')}</p>
                      <p className="text-gray-600">Durasi: {
                        Math.ceil((new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24))
                      } malam</p>
                    </div>
                                        <div>
                      <h4 className="text-sm font-medium text-gray-500">INFORMASI PEMBAYARAN</h4>
                      <p className="font-medium text-lg">Total: Rp {selectedBooking.total_price.toLocaleString('id-ID')}</p>
                      <div className="flex items-center mt-2">
                        <p className="text-gray-600 mr-2">Status:</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedBooking.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          selectedBooking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedBooking.status === 'paid' ? 'Lunas' : 
                           selectedBooking.status === 'pending' ? 'Menunggu Pembayaran' : 
                           selectedBooking.status === 'cancelled' ? 'Dibatalkan' : 
                           selectedBooking.status === 'completed' ? 'Selesai' :
                           selectedBooking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">Tanggal Booking: {new Date(selectedBooking.created_at).toLocaleString('id-ID')}</p>
                      {selectedBooking.updated_at && selectedBooking.updated_at !== selectedBooking.created_at && (
                        <p className="text-gray-600">Terakhir Diupdate: {new Date(selectedBooking.updated_at).toLocaleString('id-ID')}</p>
                      )}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Metode Pembayaran: Transfer Bank</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedBooking.special_requests && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500">PERMINTAAN KHUSUS</h4>
                      <p className="text-gray-600">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">TINDAKAN</h4>
                    <div className="flex flex-wrap gap-2">
                      {/* Tombol Tandai Lunas - hanya muncul jika status pending */}
                      {selectedBooking.status === 'pending' && (
                        <button 
                          onClick={() => {
                            handleUpdateBookingStatus(selectedBooking.id, 'paid');
                            setShowBookingDetails(false);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Tandai Lunas
                        </button>
                      )}
                      
                      {/* Tombol Tandai Selesai - hanya muncul jika status paid */}
                      {selectedBooking.status === 'paid' && (
                        <button 
                          onClick={() => {
                            handleUpdateBookingStatus(selectedBooking.id, 'completed');
                            setShowBookingDetails(false);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Tandai Selesai
                        </button>
                      )}
                      
                      {/* Tombol Batalkan - hanya muncul jika status bukan cancelled */}
                      {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                        <button 
                          onClick={() => {
                            handleUpdateBookingStatus(selectedBooking.id, 'cancelled');
                            setShowBookingDetails(false);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                        >
                          <XCircle size={16} className="mr-2" />
                          Batalkan Booking
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => setShowBookingDetails(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Room Form Modal */}
      {showRoomForm && (
        <AdminRoomForm
          room={editingRoom}
          onSubmit={editingRoom ? handleEditRoom : handleAddRoom}
          onCancel={() => {
            setShowRoomForm(false);
            setEditingRoom(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
