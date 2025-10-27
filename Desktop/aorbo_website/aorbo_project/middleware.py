class NgrokProxyMiddleware:
    """
    Middleware to handle ngrok proxy headers.
    This ensures that Django properly detects HTTPS connections through ngrok.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the request is coming through ngrok
        if 'HTTP_X_FORWARDED_PROTO' in request.META:
            # Set the secure flag based on the X-Forwarded-Proto header
            request.is_secure = lambda: request.META.get('HTTP_X_FORWARDED_PROTO', '').lower() == 'https'
        
        return self.get_response(request)
