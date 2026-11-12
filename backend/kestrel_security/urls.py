"""
URL configuration for Kestrel Security project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('api/consignments/', include('apps.consignments.urls')),
    path('api/valuations/', include('apps.valuations.urls')),
    path('api/shipments/', include('apps.shipments.urls')),
    path('api/custody/', include('apps.custody.urls')),
    path('api/storage/', include('apps.storage.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/audit/', include('apps.audit.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = 'Kestrel Security Administration'
admin.site.site_title = 'Kestrel Security Admin'
admin.site.index_title = 'Gold & Valuables Consignment Management'
