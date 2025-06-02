# Import all views modules
# Avoid circular imports by not importing modules directly
# Modules will be discovered by Pyramid's scan() function

def includeme(config):
    """Include all view modules."""
    # This function will be called by Pyramid's config.scan()
    pass