from pyramid.view import view_config
from pyramid.response import Response
import json
import os
import uuid
import shutil
import logging
from .. import models

log = logging.getLogger(__name__)

@view_config(route_name='api_upload_image', renderer='json', request_method='POST')
def upload_image(request):
    """API endpoint to upload an image"""
    # Jika ini adalah preflight OPTIONS request, tangani dengan benar
    if request.method == 'OPTIONS':
        response = Response(status=200)
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,Accept,Origin',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400'
        })
        return response
    try:
        log.info("Upload image request received")
        
        # Validate admin token
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            log.warning("Authentication required - no Bearer token")
            return Response(json.dumps({'message': 'Authentication required'}), 
                          content_type='application/json; charset=UTF-8', 
                          status=401)
        
        token_str = auth_header.split(' ')[1]
        log.info(f"Token received: {token_str[:5]}...")
        
        # Validate token
        token = request.dbsession.query(models.Token).filter(
            models.Token.token == token_str
        ).first()
        
        if not token:
            log.warning(f"Token not found in database")
            return Response(json.dumps({'message': 'Invalid or expired token'}), 
                          content_type='application/json; charset=UTF-8', 
                          status=401)
        
        if not token.is_valid():
            log.warning(f"Token expired for user_id {token.user_id}")
            return Response(json.dumps({'message': 'Invalid or expired token'}), 
                          content_type='application/json; charset=UTF-8', 
                          status=401)
        
        log.info(f"Token valid for user_id {token.user_id}")
        
        # Get file from request
        if 'file' not in request.POST:
            log.error("No file found in request")
            return Response(json.dumps({'success': False, 'message': 'No file uploaded'}), 
                          content_type='application/json; charset=UTF-8', 
                          status=400)
        
        filename = request.POST['file'].filename
        log.info(f"File received: {filename}")
        
        # Generate unique filename
        file_ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        log.info(f"Generated unique filename: {unique_filename}")
        
        # Define path to save file
        static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'images')
        file_path = os.path.join(static_dir, unique_filename)
        log.info(f"File will be saved to: {file_path}")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        log.info(f"Ensured directory exists: {os.path.dirname(file_path)}")
        
        # Save file
        try:
            with open(file_path, 'wb') as output_file:
                shutil.copyfileobj(request.POST['file'].file, output_file)
            log.info(f"File saved successfully to {file_path}")
        except Exception as e:
            log.error(f"Failed to save file: {str(e)}")
            return Response(json.dumps({'success': False, 'message': f'Failed to save file: {str(e)}'}), 
                          content_type='application/json; charset=UTF-8', 
                          status=500)
        
        # Generate URL for the image - gunakan path relatif yang lebih sederhana
        # Pastikan URL tidak mengandung /api/ karena static folder berada di root
        image_url = f"/static/images/{unique_filename}"
        log.info(f"Generated image URL: {image_url}")
        
        # Untuk debugging, tampilkan URL lengkap yang seharusnya diakses
        full_url = request.application_url.replace('/api', '') + f"/static/images/{unique_filename}"
        log.info(f"Full URL should be: {full_url}")
        
        # Cek apakah file benar-benar ada
        if not os.path.exists(file_path):
            log.error(f"File verification failed - file not found at {file_path}")
            return Response(json.dumps({'success': False, 'message': 'File verification failed'}), 
                          content_type='application/json; charset=UTF-8', 
                          status=500)
        
        # Return success response with image URL
        response_data = {
            'success': True, 
            'message': 'Image uploaded successfully', 
            'image_url': image_url
        }
        log.info(f"Upload completed successfully. Response data: {response_data}")
        
        # Pastikan response menggunakan Response object dengan content-type yang benar
        return Response(
            json.dumps(response_data),
            content_type='application/json; charset=UTF-8',
            status=200
        )
    except Exception as e:
        return Response(json.dumps({'success': False, 'message': str(e)}), 
                      content_type='application/json; charset=UTF-8', 
                      status=500)
