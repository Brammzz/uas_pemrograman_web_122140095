from pyramid.config import Configurator
from pyramid.response import Response
from pyramid.events import NewResponse
import logging
import sys


def add_cors_headers_response_callback(event):
    """Add CORS headers to every response."""
    response = event.response
    # Pastikan header ini selalu ada di setiap respons
    response.headers.update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,Accept,Origin',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'  # 24 hours
    })
    # Jika ini adalah respons preflight, pastikan status code adalah 200
    if event.request.method == 'OPTIONS':
        response.status_code = 200
        print(f"CORS headers added to OPTIONS response: {dict(response.headers)}")
    return response


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    # Configure logging
    log_level = settings.get('log_level', 'INFO')
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        numeric_level = logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=numeric_level,
        format='%(asctime)s %(levelname)s [%(name)s:%(lineno)d] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        stream=sys.stderr
    )
    
    # Create logger for this application
    logger = logging.getLogger('roomify_backend')
    logger.setLevel(numeric_level)
    
    # Log startup information
    logger.info('Starting Roomify Backend with log level: %s', log_level)
    
    with Configurator(settings=settings) as config:
        # Store logger in registry for access throughout the application
        config.registry.logger = logger
        
        config.include('pyramid_jinja2')
        config.include('.models')
        config.include('.routes')
        
        # Add CORS support - simplify the approach
        config.add_subscriber(add_cors_headers_response_callback, NewResponse)
        
        # Configure static file serving - gunakan satu konfigurasi saja
        config.add_static_view('static', 'roomify_backend:static', cache_max_age=3600)
        
        logger.info('Routes configured')
        config.scan()
    return config.make_wsgi_app()


def cors_preflight_view(request):
    """Handle CORS preflight requests."""
    # Pastikan status code adalah 200 OK untuk preflight requests
    response = Response(status=200, body=b'')
    response.headers.update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,Accept,Origin',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'  # 24 hours
    })
    # Tambahkan logging untuk debugging
    print(f"CORS Preflight Response Headers: {dict(response.headers)}")
    return response
