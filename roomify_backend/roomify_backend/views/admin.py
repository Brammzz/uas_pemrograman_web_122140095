from pyramid.view import view_config
from pyramid.response import Response
import json
from datetime import datetime
from sqlalchemy import desc

from .. import models


@view_config(route_name='api_admin_login', request_method='OPTIONS')
def admin_login_options(request):
    """Handle OPTIONS requests for admin login endpoint."""
    response = Response()
    response.headers.update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With'
    })
    return response


def get_token_from_request(request):
    """Helper function to extract and validate admin token from request."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token_str = auth_header.split(' ')[1]
    token = request.dbsession.query(models.Token).filter(
        models.Token.token == token_str,
        models.Token.is_admin == True
    ).first()
    
    if not token or not token.is_valid():
        return None
    
    return token


@view_config(route_name='api_admin_login', renderer='json', request_method='POST')
def admin_login(request):
    """API endpoint for admin login."""
    try:
        # Get JSON data from request body
        try:
            json_body = request.json_body
            email = json_body.get('email')
            password = json_body.get('password')
        except Exception as e:
            print(f"Error parsing JSON: {str(e)}")
            return Response(json.dumps({'message': 'Invalid JSON payload'}),
                          content_type='application/json',
                          status=400)
        
        print(f"Admin login attempt: {email}")
        
        # Validate input
        if not email or not password:
            return Response(json.dumps({'message': 'Email and password are required'}), 
                           content_type='application/json', 
                           status=400)
        
        # Find admin user
        user = request.dbsession.query(models.User).filter(
            models.User.email == email
        ).first()
        
        # Debug info
        if not user:
            print(f"No user found with email: {email}")
            return Response(json.dumps({'message': 'Invalid admin credentials - user not found'}), 
                           content_type='application/json', 
                           status=401)
        
        print(f"User found: {user.username}, is_admin: {user.is_admin}, password match: {user.password == password}")
        
        # Check if user exists and password is correct
        # In production, you would use password hashing
        if not user.is_admin:
            return Response(json.dumps({'message': 'User is not an admin'}), 
                           content_type='application/json', 
                           status=401)
                           
        if user.password != password:
            return Response(json.dumps({'message': 'Invalid password'}), 
                           content_type='application/json', 
                           status=401)
        
        # Generate token
        token = models.Token.create_token(user.id, is_admin=True)
        request.dbsession.add(token)
        
        return {
            'success': True, 
            'token': token.token, 
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin
            }
        }
    except Exception as e:
        import traceback
        print(f"Admin login error: {str(e)}")
        print(traceback.format_exc())
        return Response(json.dumps({'message': f"Server error: {str(e)}"}), 
                       content_type='application/json', 
                       status=500)


@view_config(route_name='api_admin_stats', renderer='json', request_method='GET')
def get_admin_stats(request):
    """API endpoint to get admin dashboard statistics."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        # Get statistics from database
        # 1. Total users
        total_users = request.dbsession.query(models.User).count()
        
        # 2. Total rooms
        total_rooms = request.dbsession.query(models.Room).count()
        
        # 3. Total bookings
        total_bookings = request.dbsession.query(models.Booking).count()
        
        # 4. Total revenue (sum of booking amounts)
        from sqlalchemy import func
        total_revenue_result = request.dbsession.query(func.sum(models.Booking.total_price)).scalar()
        total_revenue = total_revenue_result if total_revenue_result else 0
        
        # 5. Recent bookings (last 5)
        recent_bookings = request.dbsession.query(models.Booking).order_by(desc(models.Booking.created_at)).limit(5).all()
        recent_bookings_list = []
        
        for booking in recent_bookings:
            # Get user and room details
            user = request.dbsession.query(models.User).filter(models.User.id == booking.user_id).first()
            room = request.dbsession.query(models.Room).filter(models.Room.id == booking.room_id).first()
            
            booking_dict = booking.to_dict()
            booking_dict['user'] = user.username if user else 'Unknown'
            booking_dict['room'] = room.name if room else 'Unknown'
            
            recent_bookings_list.append(booking_dict)
        
        # 6. Room statistics
        rooms = request.dbsession.query(models.Room).all()
        room_stats = []
        
        for room in rooms:
            # Count bookings for this room
            room_bookings_count = request.dbsession.query(models.Booking).filter(
                models.Booking.room_id == room.id
            ).count()
            
            # Calculate revenue for this room
            room_revenue_result = request.dbsession.query(func.sum(models.Booking.total_price)).filter(
                models.Booking.room_id == room.id
            ).scalar()
            room_revenue = room_revenue_result if room_revenue_result else 0
            
            room_stats.append({
                'id': room.id,
                'name': room.name,
                'type': room.room_type,
                'price': room.price_per_night,
                'status': 'active' if room.is_available else 'inactive',
                'bookings': room_bookings_count,
                'revenue': room_revenue
            })
        
        return {
            'success': True,
            'stats': {
                'totalVisitors': total_users,  # Simplified: using users as visitors
                'totalBookings': total_bookings,
                'totalRevenue': total_revenue,
                'totalRooms': total_rooms
            },
            'recentBookings': recent_bookings_list,
            'roomStats': room_stats
        }
    except Exception as e:
        import traceback
        print(f"Admin stats error: {str(e)}")
        print(traceback.format_exc())
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json', 
                       status=500)


@view_config(route_name='api_admin_bookings', renderer='json', request_method='GET')
def get_all_bookings(request):
    """API endpoint to get all bookings (admin only)."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        # Get all bookings with related user and room info
        bookings = request.dbsession.query(models.Booking).order_by(
            desc(models.Booking.created_at)
        ).all()
        
        # Prepare enhanced booking data with user and room details
        enhanced_bookings = []
        for booking in bookings:
            booking_data = booking.to_dict()
            
            # Add user name if available
            if booking.user:
                booking_data['user_name'] = booking.user.full_name or booking.user.username
            
            # Add room name if available
            if booking.room:
                booking_data['room_name'] = booking.room.name
            
            enhanced_bookings.append(booking_data)
        
        # Return directly as list for frontend compatibility
        return enhanced_bookings
    except Exception as e:
        try:
            request.registry.logger.error(f"Error fetching admin bookings: {str(e)}")
        except AttributeError:
            import logging
            log = logging.getLogger(__name__)
            log.error(f"Error fetching admin bookings: {str(e)}")
            
        return Response(json.dumps({'message': f'Server error: {str(e)}'}), 
                       content_type='application/json; charset=UTF-8', 
                       status=500)


@view_config(route_name='api_admin_users', renderer='json', request_method='GET')
def get_all_users(request):
    """API endpoint to get all users (admin only)."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        # Get all users
        users = request.dbsession.query(models.User).all()
        
        # Convert to dict for JSON serialization
        users_list = [user.to_dict() for user in users]
        
        return users_list
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json', 
                       status=500)


@view_config(route_name='api_admin_rooms', renderer='json', request_method='GET')
def get_all_rooms_admin(request):
    """API endpoint to get all rooms with booking stats (admin only)."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        # Get all rooms
        rooms = request.dbsession.query(models.Room).all()
        
        # Convert to dict and add booking stats
        rooms_list = []
        for room in rooms:
            room_dict = room.to_dict()
            
            # Count bookings for this room
            booking_count = request.dbsession.query(models.Booking).filter(
                models.Booking.room_id == room.id
            ).count()
            
            room_dict['booking_count'] = booking_count
            rooms_list.append(room_dict)
        
        return rooms_list
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json', 
                       status=500)


@view_config(route_name='api_admin_rooms', renderer='json', request_method='POST')
def create_room(request):
    """API endpoint to create a new room (admin only)."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        # Get JSON data from request body
        json_body = request.json_body
        
        # Create new room
        new_room = models.Room(
            name=json_body.get('name'),
            description=json_body.get('description', ''),
            price_per_night=json_body.get('price_per_night'),
            capacity=json_body.get('capacity', 2),
            room_type=json_body.get('room_type', 'standard'),
            is_available=json_body.get('is_available', True),
            image_url=json_body.get('image_url', ''),
            amenities=json_body.get('amenities', '')
        )
        
        request.dbsession.add(new_room)
        request.dbsession.flush()  # To get the ID
        
        return new_room.to_dict()
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json', 
                       status=500)


@view_config(route_name='api_admin_room_detail', renderer='json', request_method='PUT')
def update_room(request):
    """API endpoint to update a room (admin only)."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        # Get room ID from URL
        room_id = request.matchdict['id']
        
        # Get room from database
        room = request.dbsession.query(models.Room).filter(
            models.Room.id == room_id
        ).first()
        
        if not room:
            return Response(json.dumps({'message': 'Room not found'}), 
                           content_type='application/json', 
                           status=404)
        
        # Get JSON data from request body
        json_body = request.json_body
        
        # Update room fields
        if 'name' in json_body:
            room.name = json_body['name']
        if 'description' in json_body:
            room.description = json_body['description']
        if 'price_per_night' in json_body:
            room.price_per_night = json_body['price_per_night']
        if 'capacity' in json_body:
            room.capacity = json_body['capacity']
        if 'room_type' in json_body:
            room.room_type = json_body['room_type']
        if 'is_available' in json_body:
            room.is_available = json_body['is_available']
        if 'image_url' in json_body:
            room.image_url = json_body['image_url']
        if 'amenities' in json_body:
            room.amenities = json_body['amenities']
        
        room.updated_at = datetime.now()
        
        return room.to_dict()
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json', 
                       status=500)


@view_config(route_name='api_admin_room_detail', renderer='json', request_method='DELETE')
def delete_room(request):
    """API endpoint to delete a room (admin only)."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        # Get room ID from URL
        room_id = request.matchdict.get('id')
        if not room_id:
            return Response(json.dumps({'message': 'Room ID is required'}), 
                           content_type='application/json', 
                           status=400)
        
        # Find room
        room = request.dbsession.query(models.Room).filter(models.Room.id == room_id).first()
        if not room:
            return Response(json.dumps({'message': 'Room not found'}), 
                           content_type='application/json', 
                           status=404)
        
        # Check if room has bookings
        bookings = request.dbsession.query(models.Booking).filter(models.Booking.room_id == room_id).count()
        if bookings > 0:
            # If room has bookings, just mark it as unavailable instead of deleting
            room.is_available = False
            room.updated_at = datetime.now()
            return {
                'success': True,
                'message': 'Room has existing bookings and has been marked as unavailable',
                'room': room.to_dict()
            }
        else:
            # If no bookings, delete the room
            request.dbsession.delete(room)
            return {
                'success': True,
                'message': 'Room deleted successfully'
            }
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json', 
                       status=500)


@view_config(route_name='api_admin_booking_update', renderer='json', request_method='PUT')
def update_booking_status(request):
    """API endpoint to update a booking status (admin only)."""
    try:
        # Validate admin token
        token = get_token_from_request(request)
        if not token:
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        # Get booking ID from URL
        booking_id = request.matchdict['id']
        
        # Get booking from database with related user and room
        booking = request.dbsession.query(models.Booking).filter(
            models.Booking.id == booking_id
        ).first()
        
        if not booking:
            return Response(json.dumps({'message': 'Booking not found'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=404)
        
        # Get JSON data from request body
        try:
            json_body = request.json_body
        except Exception as e:
            return Response(json.dumps({'message': f'Invalid JSON payload: {str(e)}'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=400)
        
        old_status = booking.status
        
        # Update booking status
        if 'status' in json_body:
            new_status = json_body['status']
            valid_statuses = ['pending', 'paid', 'cancelled', 'completed']
            
            if new_status not in valid_statuses:
                return Response(json.dumps({
                    'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
                }), content_type='application/json; charset=UTF-8', status=400)
                
            booking.status = new_status
            
        booking.updated_at = datetime.now()
        
        # Prepare enhanced booking data with user and room details
        booking_data = booking.to_dict()
        
        # Add user name if available
        if booking.user:
            booking_data['user_name'] = booking.user.full_name or booking.user.username
        
        # Add room name if available
        if booking.room:
            booking_data['room_name'] = booking.room.name
            
        # Create notification if status changed to 'completed'
        if 'status' in json_body and json_body['status'] == 'completed' and old_status != 'completed':
            # Create notification for the user
            room_name = booking.room.name if booking.room else 'Room'
            notification = models.Notification(
                user_id=booking.user_id,
                booking_id=booking.id,
                title='Booking Completed',
                message=f'Your booking for {room_name} has been marked as completed. Thank you for choosing Roomify!',
                is_read=False
            )
            request.dbsession.add(notification)
            
        # Log the status change
        try:
            request.registry.logger.info(f"Booking #{booking.id} status changed from '{old_status}' to '{booking.status}' by admin {token.user_id}")
        except AttributeError:
            import logging
            log = logging.getLogger(__name__)
            log.info(f"Booking #{booking.id} status changed from '{old_status}' to '{booking.status}' by admin {token.user_id}")
        
        return {
            'success': True,
            'message': f'Booking status updated successfully to {booking.status}',
            'booking': booking_data
        }
    except Exception as e:
        try:
            request.registry.logger.error(f"Error updating booking status: {str(e)}")
        except AttributeError:
            import logging
            log = logging.getLogger(__name__)
            log.error(f"Error updating booking status: {str(e)}")
            
        return Response(json.dumps({'message': f'Server error: {str(e)}'}), 
                       content_type='application/json; charset=UTF-8', 
                       status=500)
