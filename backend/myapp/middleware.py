from django.utils.deprecation import MiddlewareMixin
from threading import local


_request_local = local()


def get_current_user():
    return getattr(_request_local, "user", None)


class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _request_local.user = getattr(request, "user", None)
        try:
            return self.get_response(request)
        finally:
            _request_local.user = None


class XFrameOptionsMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        response['X-Frame-Options'] = 'ALLOW-FROM http://localhost:3000'
        return response
