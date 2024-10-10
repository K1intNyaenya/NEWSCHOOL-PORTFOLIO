from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import CustomTokenObtainPairView, get_newschoolmember, add_newschoolmember, member_detail, login_view,submit_application_form, review_application
from django.urls import path

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('NewSchoolMember/', get_newschoolmember, name='get_newschoolmember'),
    path('NewSchoolMember/add/', add_newschoolmember, name='add_newschoolmember'),  # Added trailing slash
    path('NewSchoolMember/<int:pk>/', member_detail, name='member_detail'),
    path('api/login/', login_view, name='login'),
    path('submit-application-form/', submit_application_form, name='submit_application_form'),
    path('review-application/<int:application_id>/', review_application, name='review_application'),
]
