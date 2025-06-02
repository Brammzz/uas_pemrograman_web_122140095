from pyramid.view import view_config
from pyramid.response import Response
import json
from sqlalchemy import desc
from .. import models

@view_config(route_name='api_user_bookings', renderer='json', request_method='GET')
def get_user_bookings(request):
    """API endpoint to get user bookings"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(json.dumps({'message': 'Authentication required'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        token_str = auth_header.split(' ')[1]
        
        # Validate token
        token = request.dbsession.query(models.Token).filter(
            models.Token.token == token_str
        ).first()
        
        if not token or not token.is_valid():
            return Response(json.dumps({'message': 'Invalid or expired token'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        # Get bookings for this user
        bookings = request.dbsession.query(models.Booking).filter(
            models.Booking.user_id == token.user_id
        ).order_by(desc(models.Booking.created_at)).all()
        
        # Prepare response with enhanced booking data
        result = []
        for booking in bookings:
            booking_data = booking.to_dict()
            # Add room name if available
            if booking.room:
                booking_data['room_name'] = booking.room.name
                booking_data['room_image'] = booking.room.image_url
            result.append(booking_data)
        
        # Get booking statistics
        total_bookings = len(bookings)
        completed_bookings = sum(1 for booking in bookings if booking.status == 'completed')
        
        return {
            'bookings': result,
            'stats': {
                'total_bookings': total_bookings,
                'completed_bookings': completed_bookings
            }
        }
    except Exception as e:
        # Log the error for server-side debugging
        try:
            request.registry.logger.error(f"Error getting user bookings: {str(e)}")
        except AttributeError:
            import logging
            log = logging.getLogger(__name__)
            log.error(f"Error getting user bookings: {str(e)}")
            
        return Response(json.dumps({'message': f'An error occurred: {str(e)}'}),
                       content_type='application/json; charset=UTF-8',
                       status=500)

@view_config(route_name='api_user_notifications', renderer='json', request_method='GET')
def get_user_notifications(request):
    """API endpoint to get user notifications"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(json.dumps({'message': 'Authentication required'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        token_str = auth_header.split(' ')[1]
        
        # Validate token
        token = request.dbsession.query(models.Token).filter(
            models.Token.token == token_str
        ).first()
        
        if not token or not token.is_valid():
            return Response(json.dumps({'message': 'Invalid or expired token'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        # Get notifications for this user
        notifications = request.dbsession.query(models.Notification).filter(
            models.Notification.user_id == token.user_id
        ).order_by(desc(models.Notification.created_at)).all()
        
        # Convert to dict for JSON response
        result = [notification.to_dict() for notification in notifications]
        
        # Count unread notifications
        unread_count = sum(1 for notification in notifications if not notification.is_read)
        
        return {
            'notifications': result,
            'unread_count': unread_count
        }
    except Exception as e:
        # Log the error for server-side debugging
        try:
            request.registry.logger.error(f"Error getting user notifications: {str(e)}")
        except AttributeError:
            import logging
            log = logging.getLogger(__name__)
            log.error(f"Error getting user notifications: {str(e)}")
            
        return Response(json.dumps({'message': f'An error occurred: {str(e)}'}),
                       content_type='application/json; charset=UTF-8',
                       status=500)

@view_config(route_name='api_user_notification_read', renderer='json', request_method='PUT')
def mark_notification_read(request):
    """API endpoint to mark a notification as read"""
    try:
        # Get notification ID from URL
        notification_id = request.matchdict.get('id')
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(json.dumps({'message': 'Authentication required'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        token_str = auth_header.split(' ')[1]
        
        # Validate token
        token = request.dbsession.query(models.Token).filter(
            models.Token.token == token_str
        ).first()
        
        if not token or not token.is_valid():
            return Response(json.dumps({'message': 'Invalid or expired token'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=401)
        
        # Get notification and verify it belongs to this user
        notification = request.dbsession.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == token.user_id
        ).first()
        
        if not notification:
            return Response(json.dumps({'message': 'Notification not found or not authorized'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=404)
        
        # Mark as read
        notification.is_read = True
        request.dbsession.add(notification)
        
        # Get updated unread count
        unread_count = request.dbsession.query(models.Notification).filter(
            models.Notification.user_id == token.user_id,
            models.Notification.is_read == False
        ).count()
        
        return {
            'success': True,
            'message': 'Notification marked as read',
            'unread_count': unread_count
        }
    except Exception as e:
        # Log the error for server-side debugging
        try:
            request.registry.logger.error(f"Error marking notification as read: {str(e)}")
        except AttributeError:
            import logging
            log = logging.getLogger(__name__)
            log.error(f"Error marking notification as read: {str(e)}")
            
        return Response(json.dumps({'message': f'An error occurred: {str(e)}'}),
                       content_type='application/json; charset=UTF-8',
                       status=500)
