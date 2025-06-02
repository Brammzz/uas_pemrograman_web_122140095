from pyramid.view import view_config
from pyramid.response import Response
import json
from .. import models

@view_config(route_name='api_rooms', renderer='json', request_method='GET')
def get_rooms(request):
    """API endpoint to get all available rooms"""
    try:
        # Query all available rooms
        rooms = request.dbsession.query(models.Room).filter(
            models.Room.is_available == True
        ).all()
        
        # Convert to dict for JSON serialization
        rooms_list = [room.to_dict() for room in rooms]
        
        return {'success': True, 'data': rooms_list}
    except Exception as e:
        return Response(json.dumps({'success': False, 'message': str(e)}), 
                       content_type='application/json', 
                       status=500)

@view_config(route_name='api_room', renderer='json', request_method='GET')
def get_room(request):
    """API endpoint to get a room by ID"""
    try:
        room_id = int(request.matchdict['id'])
        
        # Query room by ID
        room = request.dbsession.query(models.Room).filter(
            models.Room.id == room_id
        ).first()
        
        if not room:
            return Response(json.dumps({'success': False, 'message': 'Room not found'}), 
                           content_type='application/json', 
                           status=404)
        
        return {'success': True, 'data': room.to_dict()}
    except Exception as e:
        return Response(json.dumps({'success': False, 'message': str(e)}), 
                       content_type='application/json', 
                       status=500)

@view_config(route_name='api_room_create', renderer='json', request_method='POST')
def create_room(request):
    """API endpoint to create a new room (admin only)"""
    try:
        # Validate admin token
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        token_str = auth_header.split(' ')[1]
        
        # Validate token is admin
        token = request.dbsession.query(models.Token).filter(
            models.Token.token == token_str,
            models.Token.is_admin == True
        ).first()
        
        if not token or not token.is_valid():
            return Response(json.dumps({'message': 'Admin authentication required'}), 
                           content_type='application/json', 
                           status=401)
        
        # Get JSON data from request body
        json_body = request.json_body
        name = json_body.get('name')
        description = json_body.get('description')
        price_per_night = json_body.get('price_per_night')
        
        # Validate input
        if not name or not description or not price_per_night:
            return Response(json.dumps({'message': 'Name, description, and price are required'}), 
                           content_type='application/json', 
                           status=400)
        
        # Create new room
        new_room = models.Room(
            name=name,
            description=description,
            price_per_night=price_per_night,
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
