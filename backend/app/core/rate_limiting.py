from slowapi import Limiter
from slowapi.util import get_remote_address

def _get_remote_address(request):
    ident = get_remote_address(request)
    return ident

limiter = Limiter(key_func=_get_remote_address)
