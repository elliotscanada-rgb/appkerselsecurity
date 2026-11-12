"""
WSGI config for kestrel_security project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')

application = get_wsgi_application()
