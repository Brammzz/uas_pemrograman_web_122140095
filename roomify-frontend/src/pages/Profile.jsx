import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Edit, Save, X, Bell, Check } from 'lucide-react';
import { getUserBookings, getUserNotifications, markNotificationAsRead, getProfile, updateProfile } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
  });
  
  const [joinDate, setJoinDate] = useState(null);

  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    completedBookings: 0
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nama depan wajib diisi';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nama belakang wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch user profile, bookings and notifications
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const profileData = await getProfile();
        if (profileData) {
          // Split full_name into firstName and lastName
          let firstName = '';
          let lastName = '';
          
          if (profileData.full_name) {
            const nameParts = profileData.full_name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          // Get additional profile data from localStorage if available
          const additionalProfileData = JSON.parse(localStorage.getItem('additionalProfileData') || '{}');
          
          setFormData({
            firstName,
            lastName,
            email: profileData.email || '',
            phone: profileData.phone_number || '',
            address: additionalProfileData.address || '',
            city: additionalProfileData.city || '',
            zipCode: additionalProfileData.zipCode || '',
            dateOfBirth: additionalProfileData.dateOfBirth || '',
            gender: additionalProfileData.gender || '',
          });
          
          // Set join date from created_at field
          if (profileData.created_at) {
            setJoinDate(new Date(profileData.created_at));
          }
        }

        // Fetch booking data
        const bookingsResponse = await getUserBookings();
        if (bookingsResponse.success && bookingsResponse.data) {
          setBookingStats({
            totalBookings: bookingsResponse.data.stats.total_bookings,
            completedBookings: bookingsResponse.data.stats.completed_bookings
          });
        }

        // Fetch notifications
        const notificationsResponse = await getUserNotifications();
        if (notificationsResponse.success && notificationsResponse.data) {
          setNotifications(notificationsResponse.data.notifications);
          setUnreadCount(notificationsResponse.data.unread_count);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = async (notification) => {
    // Jika notifikasi sudah dibaca, tidak perlu melakukan apa-apa
    if (notification.is_read) return;
    
    try {
      const response = await markNotificationAsRead(notification.id);
      if (response.success) {
        // Update state notifikasi lokal
        setNotifications(prevNotifications => 
          prevNotifications.map(item => 
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        );
        // Update unread count
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const profileData = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone_number: formData.phone
      };
      
      // Save additional profile data to localStorage
      const additionalProfileData = {
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      };
      localStorage.setItem('additionalProfileData', JSON.stringify(additionalProfileData));
      
      // Call API to update profile
      const response = await updateProfile(profileData);
      
      if (response.success) {
        // Update UI with new data
        if (response.data.user) {
          const userData = response.data.user;
          
          // Split full_name into firstName and lastName
          let firstName = '';
          let lastName = '';
          
          if (userData.full_name) {
            const nameParts = userData.full_name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          setFormData(prev => ({
            ...prev,
            firstName,
            lastName,
            email: userData.email || '',
            phone: userData.phone_number || ''
          }));
        }
        
        // Exit edit mode
        setIsEditing(false);
        
        // Show success message
        alert('Profil berhasil diperbarui!');
      } else {
        // Show error message
        alert(`Gagal memperbarui profil: ${response.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form data to original values from backend
    const fetchUserProfile = async () => {
      try {
        const profileData = await getProfile();
        if (profileData) {
          // Split full_name into firstName and lastName
          let firstName = '';
          let lastName = '';
          
          if (profileData.full_name) {
            const nameParts = profileData.full_name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          setFormData({
            firstName,
            lastName,
            email: profileData.email || '',
            phone: profileData.phone_number || '',
            address: '',
            city: '',
            zipCode: '',
            dateOfBirth: '',
            gender: '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
    
    // Clear any errors
    setErrors({});
    
    // Exit edit mode
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header with Notifications */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profil Saya</h1>
            <p className="text-xl text-gray-600">Kelola informasi pribadi Anda</p>
          </div>
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors relative"
            >
              <Bell size={24} className="text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-700">Notifikasi</h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Tidak ada notifikasi</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</p>
                          </div>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-gray-600 mb-4">Member sejak {joinDate ? joinDate.getFullYear() : new Date().getFullYear()}</p>

                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Ubah Foto
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {loading ? '...' : bookingStats.totalBookings}
                    </div>
                    <div className="text-gray-600">Total Pemesanan</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {loading ? '...' : bookingStats.completedBookings}
                    </div>
                    <div className="text-gray-600">Pemesanan Selesai</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Informasi Pribadi</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X size={16} />
                      <span>Batal</span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Depan *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Belakang *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline mr-2" size={16} />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline mr-2" size={16} />
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Alamat
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleChange('zipCode', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save size={16} />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;