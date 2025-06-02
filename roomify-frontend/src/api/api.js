import axios from 'axios';

const API_BASE = 'http://localhost:6543/api'; // Ganti jika backend kamu berada di host/port berbeda

// Konfigurasi global untuk Axios
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

// Tambahkan interceptor untuk menangani preflight
axios.interceptors.request.use(function (config) {
  // Pastikan withCredentials konsisten
  config.withCredentials = false;
  return config;
}, function (error) {
  return Promise.reject(error);
});

// ================= USER =================

// Mendapatkan booking user dan statistik
export const getUserBookings = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const res = await axios.get(`${API_BASE}/user/bookings`, config);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Error fetching user bookings:', err.response?.data || err.message);
    return { 
      success: false, 
      message: err.response?.data?.message || 'Failed to fetch bookings' 
    };
  }
};

// Mendapatkan notifikasi user
export const getUserNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const res = await axios.get(`${API_BASE}/user/notifications`, config);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Error fetching notifications:', err.response?.data || err.message);
    return { 
      success: false, 
      message: err.response?.data?.message || 'Failed to fetch notifications' 
    };
  }
};

// Menandai notifikasi sebagai telah dibaca
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const res = await axios.put(`${API_BASE}/user/notifications/${notificationId}/read`, {}, config);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Error marking notification as read:', err.response?.data || err.message);
    return { 
      success: false, 
      message: err.response?.data?.message || 'Failed to mark notification as read' 
    };
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    // Menyesuaikan format data dengan yang diharapkan backend
    const requestData = {
      username: userData.username || userData.name, // Menggunakan username atau name
      email: userData.email,
      password: userData.password,
      full_name: userData.fullName || userData.name,
      phone_number: userData.phoneNumber || ''
    };
    
    // Menambahkan headers untuk membantu dengan CORS
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false // Penting untuk CORS dengan kredensial
    };
    
    const res = await axios.post(`${API_BASE}/register`, requestData, config);
    console.log('Register response:', res.data);
    
    // Memastikan format respons konsisten
    if (res.data && typeof res.data.success === 'boolean') {
      return res.data;
    }
    
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Registration error:', err);
    // Menampilkan informasi error yang lebih detail untuk debugging
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      console.error('Error response headers:', err.response.headers);
      return {
        success: false,
        message: err.response.data?.message || `Error ${err.response.status}: Registrasi gagal`,
        error: err.toString()
      };
    } else if (err.request) {
      // Request dibuat tapi tidak ada response
      console.error('Error request:', err.request);
      return {
        success: false,
        message: 'Tidak ada respons dari server. Pastikan backend sedang berjalan.',
        error: err.toString()
      };
    } else {
      // Kesalahan lainnya
      return {
        success: false,
        message: err.message || 'Terjadi kesalahan saat registrasi',
        error: err.toString()
      };
    }
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log('Attempting login with email:', email);
    
    // Menambahkan headers untuk membantu dengan CORS
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false // Penting untuk CORS dengan kredensial
    };
    
    const res = await axios.post(`${API_BASE}/login`, { email, password }, config);
    console.log('Login response:', res.data);
    
    // Memastikan format respons konsisten
    if (res.data && typeof res.data.success === 'boolean') {
      if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      return res.data;
    }
    
    // Format lama (tanpa success flag)
    const token = res.data.token;
    if (token) {
      localStorage.setItem('token', token);
      return { success: true, data: res.data };
    }
    
    return { success: false, message: 'Format respons tidak valid' };
  } catch (err) {
    console.error('Login error:', err);
    // Menampilkan informasi error yang lebih detail untuk debugging
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      console.error('Error response headers:', err.response.headers);
      return {
        success: false,
        message: err.response.data?.message || `Error ${err.response.status}: Login gagal`,
        error: err.toString()
      };
    } else if (err.request) {
      // Request dibuat tapi tidak ada response
      console.error('Error request:', err.request);
      return {
        success: false,
        message: 'Tidak ada respons dari server. Pastikan backend sedang berjalan.',
        error: err.toString()
      };
    } else {
      // Kesalahan lainnya
      return {
        success: false,
        message: err.message || 'Login gagal',
        error: err.toString()
      };
    }
  }
};

export const getProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const res = await axios.put(`${API_BASE}/profile/update`, profileData, config);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Error updating profile:', err.response?.data || err.message);
    return { 
      success: false, 
      message: err.response?.data?.message || 'Failed to update profile' 
    };
  }
};

// Fungsi untuk mengupload gambar
export const uploadImage = async (file) => {
  try {
    console.log('[uploadImage] Starting image upload process');
    console.log('[uploadImage] File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('[uploadImage] No authentication token found');
      return { success: false, message: 'Authentication required' };
    }
    console.log('[uploadImage] Token available:', token.substring(0, 10) + '...');
    
    // Buat FormData untuk mengirim file
    const formData = new FormData();
    formData.append('file', file);
    console.log('[uploadImage] FormData created with file');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };
    console.log('[uploadImage] Request config prepared');
    
    console.log(`[uploadImage] Sending request to ${API_BASE}/upload/image`);
    const res = await axios.post(`${API_BASE}/upload/image`, formData, config);
    console.log('[uploadImage] Response received:', res.data);
    
    if (res.data && res.data.image_url) {
      console.log('[uploadImage] Image URL received:', res.data.image_url);
      
      // Pastikan URL gambar lengkap
      let fullImageUrl = res.data.image_url;
      if (!fullImageUrl.startsWith('http')) {
        // Perbaikan: URL gambar seharusnya menggunakan base URL tanpa /api
        // dan pastikan tidak ada double slash
        const baseUrl = 'http://localhost:6543';
        const imagePath = res.data.image_url.startsWith('/') ? res.data.image_url : `/${res.data.image_url}`;
        fullImageUrl = `${baseUrl}${imagePath}`;
        console.log('[uploadImage] Converted to full URL:', fullImageUrl);
      }
      
      // Simpan URL lengkap di respons
      res.data.image_url = fullImageUrl;
      
      // Test image URL accessibility
      const imgTest = new Image();
      imgTest.onload = () => console.log('[uploadImage] Image URL is accessible and loads correctly');
      imgTest.onerror = () => console.warn('[uploadImage] Image URL may not be accessible:', fullImageUrl);
      imgTest.src = fullImageUrl;
    }
    
    return { success: true, data: res.data };
  } catch (err) {
    console.error('[uploadImage] Error uploading image:', err);
    console.error('[uploadImage] Error details:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
    
    // Provide more detailed error message
    let errorMessage = 'Failed to upload image';
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message.includes('Network Error')) {
      errorMessage = 'Network error - check if the server is running';
    } else if (err.message.includes('timeout')) {
      errorMessage = 'Request timed out - server may be overloaded';
    }
    
    console.error('[uploadImage] Error message:', errorMessage);
    return { 
      success: false, 
      message: errorMessage,
      details: err.response?.data || err.message
    };
  }
};

// ================= ROOMS =================

export const getRooms = async () => {
  try {
    const res = await axios.get(`${API_BASE}/rooms`);
    console.log('API response:', res.data);
    
    let roomData;
    
    // Jika respons sudah dalam format {success, data}
    if (res.data && typeof res.data.success === 'boolean') {
      roomData = res.data.data;
    }
    // Jika respons adalah array langsung (format lama)
    else if (Array.isArray(res.data)) {
      roomData = res.data;
    }
    // Format lainnya
    else {
      roomData = res.data;
    }
    
    // Debug image URLs dan perbaiki URL gambar jika perlu
    if (Array.isArray(roomData)) {
      console.log('[getRooms] Processing room data for image URLs');
      roomData.forEach(room => {
        if (room.image_url) {
          console.log(`[getRooms] Room ${room.id} original image URL:`, room.image_url);
          
          // Perbaiki URL gambar jika perlu
          if (room.image_url && !room.image_url.startsWith('http')) {
            // Pastikan tidak ada double slash
            if (room.image_url.startsWith('/')) {
              console.log(`[getRooms] Fixing image URL for room ${room.id}`);
              // Simpan URL asli untuk debugging
              room._original_image_url = room.image_url;
            }
          }
        }
      });
    }
    
    // Return data sesuai format
    if (res.data && typeof res.data.success === 'boolean') {
      return res.data;
    } else if (Array.isArray(res.data)) {
      return { success: true, data: res.data };
    } else {
      return { success: true, data: res.data };
    }
  } catch (err) {
    console.error('Error fetching rooms:', err);
    return { success: false, message: err.response?.data?.message || 'Failed to fetch rooms', data: [] };
  }
};

export const getRoomById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/rooms/${id}`);
    console.log(`Room ${id} API response:`, res.data);
    
    let roomData;
    
    // Jika respons sudah dalam format {success, data}
    if (res.data && typeof res.data.success === 'boolean') {
      roomData = res.data.data;
    }
    // Jika respons adalah objek langsung (format lama)
    else {
      roomData = res.data;
    }
    
    // Debug image URL dan perbaiki URL gambar jika perlu
    if (roomData && roomData.image_url) {
      console.log(`[getRoomById] Room ${id} original image URL:`, roomData.image_url);
      
      // Perbaiki URL gambar jika perlu
      if (roomData.image_url && !roomData.image_url.startsWith('http')) {
        // Pastikan tidak ada double slash
        if (roomData.image_url.startsWith('/')) {
          console.log(`[getRoomById] Fixing image URL for room ${id}`);
          // Simpan URL asli untuk debugging
          roomData._original_image_url = roomData.image_url;
        }
      }
    }
    
    // Return data sesuai format
    if (res.data && typeof res.data.success === 'boolean') {
      return res.data;
    } else {
      return { success: true, data: res.data };
    }
  } catch (err) {
    console.error(`Error fetching room ${id}:`, err);
    return { success: false, message: err.response?.data?.message || 'Failed to fetch room details', data: null };
  }
};

// ================= BOOKING =================

export const bookRoom = async (roomId, bookingDetails) => {
  // Validasi input sebelum mengirim ke server
  if (!roomId) {
    return { success: false, message: 'ID kamar tidak valid' };
  }
  
  if (!bookingDetails) {
    return { success: false, message: 'Detail pemesanan tidak valid' };
  }
  
  if (!bookingDetails.check_in_date || !bookingDetails.check_out_date) {
    return { success: false, message: 'Tanggal check-in dan check-out wajib diisi' };
  }
  
  // Validasi token
  const token = localStorage.getItem('token');
  if (!token) {
    return { success: false, message: 'Anda harus login terlebih dahulu untuk memesan kamar', requiresAuth: true };
  }
  
  try {
    console.log('Booking room with details:', { roomId, ...bookingDetails });
    
    const res = await axios.post(`${API_BASE}/bookings`, {
      room_id: roomId,
      ...bookingDetails
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    
    console.log('Booking response:', res.data);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Error booking room:', err);
    
    // Menangani berbagai jenis error
    if (err.response) {
      // Server merespons dengan status error
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      
      // Menangani error berdasarkan status kode
      if (err.response.status === 401) {
        return { 
          success: false, 
          message: 'Sesi login Anda telah berakhir. Silakan login kembali.',
          requiresAuth: true
        };
      } else if (err.response.status === 400) {
        return { 
          success: false, 
          message: err.response.data?.message || 'Data pemesanan tidak valid. Silakan periksa kembali input Anda.'
        };
      } else if (err.response.status === 404) {
        return { 
          success: false, 
          message: 'Kamar yang Anda pilih tidak ditemukan atau tidak tersedia lagi.'
        };
      } else {
        return {
          success: false,
          message: err.response.data?.message || `Error ${err.response.status}: Gagal memesan kamar`
        };
      }
    } else if (err.request) {
      // Request dibuat tapi tidak ada response dari server
      console.error('Error request:', err.request);
      return {
        success: false,
        message: 'Tidak ada respons dari server. Silakan coba lagi nanti.'
      };
    } else {
      // Error lainnya
      return {
        success: false,
        message: err.message || 'Terjadi kesalahan saat memesan kamar. Silakan coba lagi.'
      };
    }
  }
};

// ================= ADMIN =================

export const adminLogin = async (credentials) => {
  try {
    console.log('Attempting admin login with:', credentials.email);
    const { email, password } = credentials;
    
    // Add headers to help with CORS and content type issues
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const res = await axios.post(`${API_BASE}/admin/login`, { email, password }, config);
    console.log('Admin login response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Admin login error:', error);
    // If we get a backend error, we'll still return a structured response
    // so the frontend can handle it gracefully
    if (error.response) {
      console.error('Error response:', error.response.data);
      return {
        success: false,
        message: error.response.data.message || 'Authentication failed'
      };
    } else if (error.request) {
      console.error('No response received');
      return {
        success: false,
        message: 'No response from server. Please check if the backend is running.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'Unknown error occurred'
      };
    }
  }
};

// Admin Stats
export const getAdminStats = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get(`${API_BASE}/admin/stats`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    if (error.response) {
      return { success: false, message: error.response.data.message || 'Failed to fetch stats' };
    } else if (error.request) {
      return { success: false, message: 'No response from server' };
    } else {
      return { success: false, message: error.message || 'Unknown error occurred' };
    }
  }
};

// Admin Rooms
export const getAdminRooms = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get(`${API_BASE}/admin/rooms`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching admin rooms:', error);
    if (error.response) {
      return { success: false, message: error.response.data.message || 'Failed to fetch rooms' };
    } else if (error.request) {
      return { success: false, message: 'No response from server' };
    } else {
      return { success: false, message: error.message || 'Unknown error occurred' };
    }
  }
};

export const createRoom = async (roomData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.post(`${API_BASE}/admin/rooms`, roomData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error creating room:', error);
    if (error.response) {
      return { success: false, message: error.response.data.message || 'Failed to create room' };
    } else if (error.request) {
      return { success: false, message: 'No response from server' };
    } else {
      return { success: false, message: error.message || 'Unknown error occurred' };
    }
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.put(`${API_BASE}/admin/rooms/${id}`, roomData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error updating room:', error);
    if (error.response) {
      return { success: false, message: error.response.data.message || 'Failed to update room' };
    } else if (error.request) {
      return { success: false, message: 'No response from server' };
    } else {
      return { success: false, message: error.message || 'Unknown error occurred' };
    }
  }
};

export const deleteRoom = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.delete(`${API_BASE}/admin/rooms/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error deleting room:', error);
    if (error.response) {
      return { success: false, message: error.response.data.message || 'Failed to delete room' };
    } else if (error.request) {
      return { success: false, message: 'No response from server' };
    } else {
      return { success: false, message: error.message || 'Unknown error occurred' };
    }
  }
};

// Admin Bookings
export const getAdminBookings = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get(`${API_BASE}/admin/bookings`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    if (error.response) {
      return { success: false, message: error.response.data.message || 'Failed to fetch bookings' };
    } else if (error.request) {
      return { success: false, message: 'No response from server' };
    } else {
      return { success: false, message: error.message || 'Unknown error occurred' };
    }
  }
};

export const updateBookingStatus = async (id, statusData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.put(`${API_BASE}/admin/bookings/${id}`, statusData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    console.log('Update booking status response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Menangani error berdasarkan status kode
      if (error.response.status === 401) {
        return { 
          success: false, 
          message: 'Sesi admin Anda telah berakhir. Silakan login kembali.'
        };
      } else if (error.response.status === 400) {
        return { 
          success: false, 
          message: error.response.data?.message || 'Data status tidak valid. Silakan periksa kembali.'
        };
      } else if (error.response.status === 404) {
        return { 
          success: false, 
          message: 'Booking tidak ditemukan.'
        };
      } else {
        return {
          success: false,
          message: error.response.data?.message || `Error ${error.response.status}: Gagal mengubah status booking`
        };
      }
    } else if (error.request) {
      return { success: false, message: 'Tidak ada respons dari server. Silakan coba lagi nanti.' };
    } else {
      return { success: false, message: error.message || 'Terjadi kesalahan saat mengubah status booking.' };
    }
  }
};

// Admin Users
export const getAdminUsers = async () => {
  const token = localStorage.getItem('adminToken');
  const res = await axios.get(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
