"""
ASGI config for kestrel_security project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')

application = get_asgi_application()
