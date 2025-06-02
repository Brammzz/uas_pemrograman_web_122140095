from pyramid.view import view_config
from pyramid.response import Response
import json
from datetime import datetime
from .. import models

@view_config(route_name='api_register', renderer='json', request_method='POST')
def register(request):
    """API endpoint to register a new user"""
    try:
        # Get JSON data from request body
        json_body = request.json_body
        username = json_body.get('username')
        password = json_body.get('password')
        email = json_body.get('email')
        
        # Validate input
        if not username or not password or not email:
            return Response(json.dumps({'message': 'Username, email, and password are required'}), 
                           content_type='application/json', 
                           status=400)
        
        # Check if username already exists
        existing_user = request.dbsession.query(models.User).filter(
            models.User.username == username
        ).first()
        
        if existing_user:
            return Response(json.dumps({'message': 'Username already exists'}), 
                           content_type='application/json', 
                           status=400)
        
        # Check if email already exists
        existing_email = request.dbsession.query(models.User).filter(
            models.User.email == email
        ).first()
        
        if existing_email:
            return Response(json.dumps({'message': 'Email already exists'}), 
                           content_type='application/json', 
                           status=400)
        
        # Create new user (in a real app, you would hash the password)
        new_user = models.User(
            username=username,
            email=email,
            password=password,  # In production, this would be hashed
            full_name=json_body.get('full_name', ''),
            phone_number=json_body.get('phone_number', ''),
            is_admin=False
        )
        
        request.dbsession.add(new_user)
        
        return {'success': True, 'message': 'User registered successfully'}
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json; charset=UTF-8', 
                       status=500)

@view_config(route_name='api_login', renderer='json', request_method='POST')
def login(request):
    """API endpoint to login a user"""
    try:
        # Get JSON data from request body
        json_body = request.json_body
        email = json_body.get('email')
        password = json_body.get('password')
        
        # Validate input
        if not email or not password:
            return Response(json.dumps({'message': 'Email and password are required'}), 
                           content_type='application/json', 
                           status=400)
        
        # Find user by email
        user = request.dbsession.query(models.User).filter(
            models.User.email == email
        ).first()
        
        # Check if user exists and password is correct
        # In production, you would verify the hashed password
        if not user or user.password != password:
            return Response(json.dumps({'message': 'Invalid email or password'}), 
                           content_type='application/json', 
                           status=401)
        
        # Generate token
        token = models.Token.create_token(user.id, is_admin=user.is_admin)
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
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json; charset=UTF-8', 
                       status=500)

@view_config(route_name='api_profile', renderer='json', request_method='GET')
def profile(request):
    """API endpoint to get user profile"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(json.dumps({'message': 'Invalid authorization header'}), 
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
        
        # Get user from token
        user = request.dbsession.query(models.User).filter(
            models.User.id == token.user_id
        ).first()
        
        if not user:
            return Response(json.dumps({'message': 'User not found'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=404)
        
        # Return user profile (excluding password)
        return user.to_dict()
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json; charset=UTF-8', 
                       status=500)

# Admin login endpoint is now in admin.py
# This was removed to avoid route conflicts

@view_config(route_name='api_update_profile', renderer='json', request_method='PUT')
def update_profile(request):
    """API endpoint to update user profile"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(json.dumps({'message': 'Invalid authorization header'}), 
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
        
        # Get user from token
        user = request.dbsession.query(models.User).filter(
            models.User.id == token.user_id
        ).first()
        
        if not user:
            return Response(json.dumps({'message': 'User not found'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=404)
        
        # Get profile data from request body
        try:
            profile_data = request.json_body
        except Exception:
            return Response(json.dumps({'message': 'Invalid JSON body'}), 
                           content_type='application/json; charset=UTF-8', 
                           status=400)
        
        # Update user fields
        if 'full_name' in profile_data:
            user.full_name = profile_data['full_name']
        
        if 'phone_number' in profile_data:
            user.phone_number = profile_data['phone_number']
        
        if 'email' in profile_data:
            # Check if email is already taken by another user
            existing_user = request.dbsession.query(models.User).filter(
                models.User.email == profile_data['email'],
                models.User.id != user.id
            ).first()
            
            if existing_user:
                return Response(json.dumps({'message': 'Email already in use'}), 
                               content_type='application/json; charset=UTF-8', 
                               status=400)
            
            user.email = profile_data['email']
        
        # Update timestamp
        user.updated_at = datetime.now()
        
        # Save changes
        request.dbsession.add(user)
        
        # Return updated user profile
        return {'success': True, 'message': 'Profile updated successfully', 'user': user.to_dict()}
    except Exception as e:
        return Response(json.dumps({'message': str(e)}), 
                       content_type='application/json; charset=UTF-8', 
                       status=500)
