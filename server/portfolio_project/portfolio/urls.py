from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    CustomTokenObtainPairView, 
    get_newschoolmember, 
    add_newschoolmember, 
    member_detail, 
    login_view,
    submit_application_form, 
    review_application, 
    get_pending_applications, 
    send_application_form_email,
    send_password_reset_link,
)
from django.urls import path

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('NewSchoolMember/', get_newschoolmember, name='get_newschoolmember'),
    path('NewSchoolMember/add/', add_newschoolmember, name='add_newschoolmember'),
    path('NewSchoolMember/<int:pk>/', member_detail, name='member_detail'),
    path('api/login/', login_view, name='login'),
    path('submit-application-form/', submit_application_form, name='submit_application_form'),
    path('review-application/<int:application_id>/', review_application, name='review_application'),
    path('pending-applications/', get_pending_applications, name='pending_applications'),
    path('send-application-email/<str:applicant_email>/', send_application_form_email, name='send_application_email'),
    path('portfolio/send-reset-password-link/<str:email>/', send_password_reset_link, name='send_reset_password_link'),
]
