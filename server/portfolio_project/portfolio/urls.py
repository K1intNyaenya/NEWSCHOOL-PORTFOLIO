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
    get_choices,
    health_check
)

urlpatterns = [
    # JWT token endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Member endpoints
    path('<str:tenant_id>/NewSchoolMember/', get_newschoolmember, name='get_newschoolmember'),
    path('<uuid:tenant_id>/NewSchoolMember/add/', add_newschoolmember, name='add_newschoolmember'),
    path('<str:tenant_id>/NewSchoolMember/<int:member_id>/', MemberDetailView.as_view(), name='member_detail'),

    # Authentication and application endpoints
    path('<str:tenant_id>/api/login/', login_view, name='login'),
    path('<str:tenant_id>/submit-application-form/', submit_application_form, name='submit_application_form'),
    path('<str:tenant_id>/review-application/<int:application_id>/', ReviewApplication.as_view(), name='review_application'),
    path('<str:tenant_id>/pending-applications/', PendingApplicationsView.as_view(), name='pending_applications'),

    # Email endpoints
    path('<str:tenant_id>/send-application/<str:applicant_email>/', send_application_form_email, name='send_application_email'),
    path('<str:tenant_id>/send-reset-password-link/<str:email>/', send_password_reset_link, name='send_reset_password_link'),

    # Profile image endpoints
    path('<str:tenant_id>/upload-profile-image/', upload_profile_image, name='upload_profile_image'),
    path('<str:tenant_id>/get-profile-image/<int:member_id>/', get_profile_image, name='get_profile_image'),

    # Health check endpoint
    path('health-check/', health_check, name='health_check'),

    # Choices endpoint
    path('<str:tenant_id>/choices/', get_choices, name='get_choices'),
]
