def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')
    
    # API Routes - Rooms
    config.add_route('api_rooms', '/api/rooms', request_method=['GET'])
    config.add_route('api_room', '/api/rooms/{id}', request_method=['GET'])
    config.add_route('api_room_create', '/api/rooms', request_method=['POST'])
    
    # API Routes - Authentication
    config.add_route('api_register', '/api/register')
    config.add_route('api_login', '/api/login')
    config.add_route('api_profile', '/api/profile')
    config.add_route('api_update_profile', '/api/profile/update', request_method=['PUT'])
    config.add_route('api_admin_login', '/api/admin/login')
    
    # API Routes - Bookings
    config.add_route('api_bookings', '/api/bookings')
    config.add_route('api_user_bookings', '/api/user/bookings', request_method=['GET'])
    config.add_route('api_admin_bookings', '/api/admin/bookings', request_method=['GET'])
    
    # API Routes - Notifications
    config.add_route('api_user_notifications', '/api/user/notifications', request_method=['GET'])
    config.add_route('api_user_notification_read', '/api/user/notifications/{id}/read', request_method=['PUT'])
    
    # API Routes - Admin
    config.add_route('api_admin_stats', '/api/admin/stats')
    config.add_route('api_admin_users', '/api/admin/users')
    # Gunakan satu route untuk GET dan POST
    config.add_route('api_admin_rooms', '/api/admin/rooms', request_method=['GET', 'POST'])
    # Route untuk operasi pada room tertentu (update, delete)
    config.add_route('api_admin_room_detail', '/api/admin/rooms/{id}', request_method=['PUT', 'DELETE'])
    config.add_route('api_admin_booking_update', '/api/admin/bookings/{id}', request_method=['PUT'])
    
    # Route untuk upload gambar - terima POST dan OPTIONS untuk CORS
    config.add_route('api_upload_image', '/api/upload/image', request_method=['POST', 'OPTIONS'])
