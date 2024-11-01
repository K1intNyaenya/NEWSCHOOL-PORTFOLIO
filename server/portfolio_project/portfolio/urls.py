from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    MemberDetailView,
    get_newschoolmember,
    add_newschoolmember,
    login_view,
    submit_application_form,
    ReviewApplication,
    PendingApplicationsView,
    send_application_form_email,
    send_password_reset_link,
    upload_profile_image,
    get_profile_image,
    health_check
)

urlpatterns = [
    # JWT token endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Member endpoints
    path('NewSchoolMember/', get_newschoolmember, name='get_newschoolmember'),
    path('NewSchoolMember/add/', add_newschoolmember, name='add_newschoolmember'),
    path('NewSchoolMember/<int:pk>/', MemberDetailView.as_view(), name='member_detail'),

    # Authentication and application endpoints
    path('api/login/', login_view, name='login'),
    path('submit-application-form/', submit_application_form, name='submit_application_form'),
    path('review-application/<int:application_id>/', ReviewApplication.as_view(), name='review_application'),
    path('pending-applications/', PendingApplicationsView.as_view(), name='pending_applications'),

    # Email endpoints
    path('send-application/<str:applicant_email>/', send_application_form_email, name='send_application_email'),
    path('send-reset-password-link/<str:email>/', send_password_reset_link, name='send_reset_password_link'),

    # Profile image endpoints
    path('upload-profile-image/', upload_profile_image, name='upload_profile_image'),
    path('get-profile-image/<int:member_id>/', get_profile_image, name='get_profile_image'),

    # Health check endpoint
    path('health-check/', health_check, name='health_check'),
]
