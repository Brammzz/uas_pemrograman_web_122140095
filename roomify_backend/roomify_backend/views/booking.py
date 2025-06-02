from pyramid.view import view_config
from pyramid.response import Response
import json
from datetime import datetime
from .. import models

@view_config(route_name='api_bookings', renderer='json', request_method='POST')
def create_booking(request):
    """API endpoint to create a new booking"""
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
            
        # Get JSON data from request body
        json_body = request.json_body
        room_id = json_body.get('room_id')
        check_in_date = json_body.get('check_in_date')
        check_out_date = json_body.get('check_out_date')
        guests = json_body.get('guests', 1)
        
        # Validate input
        if not room_id or not check_in_date or not check_out_date:
            return Response(json.dumps({'message': 'Missing required fields'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=400)
        
        # Get the room
        room = request.dbsession.query(models.Room).filter(
            models.Room.id == room_id
        ).first()
        
        if not room:
            return Response(json.dumps({'message': 'Room not found'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=404)
        
        # Check room availability
        if not room.is_available:
            return Response(json.dumps({'message': 'Room is not available'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=400)
        
        # Convert string dates to datetime.date objects
        from datetime import datetime
        
        try:
            # Parse check-in date
            if isinstance(check_in_date, str):
                check_in_date = datetime.strptime(check_in_date, '%Y-%m-%d').date()
                
            # Parse check-out date
            if isinstance(check_out_date, str):
                check_out_date = datetime.strptime(check_out_date, '%Y-%m-%d').date()
        except ValueError as e:
            return Response(json.dumps({'message': f'Invalid date format. Please use YYYY-MM-DD format: {str(e)}'}),
                           content_type='application/json; charset=UTF-8',
                           status=400)
        
        # Create booking
        new_booking = models.Booking(
            user_id=token.user_id,
            room_id=room_id,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            guests=guests,
            total_price=json_body.get('total_price', room.price_per_night),
            status='pending',
            special_requests=json_body.get('special_requests', '')
        )
        
        request.dbsession.add(new_booking)
        request.dbsession.flush()  # To get the ID
        
        return new_booking.to_dict()
    except json.JSONDecodeError:
        return Response(json.dumps({'message': 'Invalid JSON format in request body'}),
                       content_type='application/json; charset=UTF-8',
                       status=400)
    except ValueError as e:
        return Response(json.dumps({'message': f'Validation error: {str(e)}'}),
                       content_type='application/json; charset=UTF-8',
                       status=400)
    except KeyError as e:
        return Response(json.dumps({'message': f'Missing required field: {str(e)}'}),
                       content_type='application/json; charset=UTF-8',
                       status=400)
    except Exception as e:
        # Log the error for server-side debugging
        try:
            # Coba gunakan logger dari registry
            request.registry.logger.error(f"Error creating booking: {str(e)}")
        except AttributeError:
            # Fallback ke standard logging jika registry.logger tidak tersedia
            import logging
            log = logging.getLogger(__name__)
            log.error(f"Error creating booking: {str(e)}")
            
        return Response(json.dumps({'message': 'An unexpected error occurred. Please try again later.'}),
                       content_type='application/json; charset=UTF-8',
                       status=500)
