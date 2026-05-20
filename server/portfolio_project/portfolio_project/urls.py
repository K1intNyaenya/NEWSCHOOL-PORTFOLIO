from django.http import HttpResponse
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

# Add a simple view for the root URL
def home_view(request):
    return HttpResponse("Welcome to the Django application!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('portfolio/', include('portfolio.urls')),
    path('', home_view, name='home'),  # Add root route
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
