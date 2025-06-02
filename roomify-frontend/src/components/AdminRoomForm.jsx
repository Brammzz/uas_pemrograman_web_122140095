import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { uploadImage } from '../api/api';

const AdminRoomForm = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    price: 0,
    description: '',
    facilities: '',
    maxGuests: 2,
    size: '',
    image: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        type: room.type || 'Standard',
        price: room.price || 0,
        description: room.description || '',
        facilities: Array.isArray(room.facilities) ? room.facilities.join(', ') : (room.facilities || ''),
        maxGuests: room.maxGuests || 2,
        size: room.size || '',
        image: room.image || ''
      });
      
      // Jika ada gambar, tampilkan preview
      if (room.image) {
        setImagePreview(room.image.startsWith('http') ? room.image : `http://localhost:6543${room.image}`);
      }
    }
  }, [room]);

  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nama kamar wajib diisi';
    if (!formData.type) newErrors.type = 'Tipe kamar wajib dipilih';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Harga harus lebih dari 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('[AdminRoomForm] File selected:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      setImageFile(file);
      setUploadError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('[AdminRoomForm] Preview generated');
        setImagePreview(reader.result);
      };
      reader.onerror = (error) => {
        console.error('[AdminRoomForm] Error generating preview:', error);
        setUploadError('Gagal membuat preview gambar');
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageFile) {
      console.warn('[AdminRoomForm] No image file selected for upload');
      setUploadError('Pilih file gambar terlebih dahulu');
      return false;
    }
    
    console.log('[AdminRoomForm] Starting image upload process');
    try {
      setUploading(true);
      const response = await uploadImage(imageFile);
      console.log('[AdminRoomForm] Upload response:', response);
      
      if (response.success) {
        console.log('[AdminRoomForm] Upload successful, image URL:', response.data.image_url);
        // Set image URL to form data
        setFormData(prev => {
          const newFormData = {
            ...prev,
            image: response.data.image_url
          };
          console.log('[AdminRoomForm] Updated form data with image URL:', newFormData);
          return newFormData;
        });
        setUploadError('');
        return true;
      } else {
        console.error('[AdminRoomForm] Upload failed:', response.message);
        setUploadError(response.message || 'Gagal mengupload gambar');
        return false;
      }
    } catch (error) {
      console.error('[AdminRoomForm] Upload error:', error);
      setUploadError('Error: ' + (error.message || 'Gagal mengupload gambar'));
      return false;
    } finally {
      console.log('[AdminRoomForm] Upload process completed');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[AdminRoomForm] Form submission started');
    
    if (!validateForm()) {
      console.warn('[AdminRoomForm] Form validation failed');
      return;
    }
    
    // Upload image first if selected
    if (imageFile) {
      console.log('[AdminRoomForm] Image file detected, starting upload');
      const uploadSuccess = await handleImageUpload();
      if (!uploadSuccess) {
        console.error('[AdminRoomForm] Image upload failed, stopping form submission');
        return;
      }
      console.log('[AdminRoomForm] Image upload successful');
    } else {
      console.log('[AdminRoomForm] No new image to upload');
    }

    const roomData = {
      ...formData,
      facilities: formData.facilities
        ? formData.facilities.split(',').map(f => f.trim())
        : []
    };
    
    console.log('[AdminRoomForm] Submitting room data:', roomData);
    onSubmit(roomData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {room ? 'Edit Kamar' : 'Tambah Kamar Baru'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-sm">Nama Kamar</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Masukkan nama kamar"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="type" className="block mb-1 font-medium text-sm">Tipe Kamar</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block mb-1 font-medium text-sm">Harga per Malam (Rp)</label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                className={`w-full rounded-md border px-3 py-2 ${errors.price ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="0"
                min="0"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="maxGuests" className="block mb-1 font-medium text-sm">Maksimal Tamu</label>
              <select
                id="maxGuests"
                value={formData.maxGuests}
                onChange={(e) => handleChange('maxGuests', parseInt(e.target.value))}
                className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Tamu</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="size" className="block mb-1 font-medium text-sm">Luas Kamar</label>
              <input
                id="size"
                type="text"
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="contoh: 35 m²"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-sm">Gambar Kamar</label>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    id="image-url"
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                  <span className="text-gray-500 text-sm">ATAU</span>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <label htmlFor="image-upload" className="cursor-pointer flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg">
                      <Upload size={18} />
                      <span>Pilih File</span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imageFile && (
                      <span className="ml-3 text-sm text-gray-600">{imageFile.name}</span>
                    )}
                    {uploading && (
                      <div className="ml-3 animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    )}
                  </div>
                  
                  {uploadError && (
                    <p className="text-red-600 text-sm">{uploadError}</p>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-h-48 object-cover"
                      onError={(e) => {
                        console.error('[AdminRoomForm] Preview image load error');
                        // Ganti dengan div teks biasa saat error
                        const parent = e.target.parentNode;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-48 bg-gray-100 flex items-center justify-center';
                          placeholder.innerHTML = '<span class="text-gray-500 font-medium">Gambar Tidak Tersedia</span>';
                          parent.replaceChild(placeholder, e.target);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-medium text-sm">Deskripsi Kamar</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan deskripsi kamar..."
            />
          </div>

          <div>
            <label htmlFor="facilities" className="block mb-1 font-medium text-sm">Fasilitas (pisahkan dengan koma)</label>
            <input
              id="facilities"
              type="text"
              value={formData.facilities}
              onChange={(e) => handleChange('facilities', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="WiFi Gratis, AC, TV, Balkon"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {room ? 'Update Kamar' : 'Tambah Kamar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRoomForm;
