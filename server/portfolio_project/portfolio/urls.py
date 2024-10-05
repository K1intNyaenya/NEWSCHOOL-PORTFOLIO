from django.urls import path
from .views import get_newschoolmember, add_newschoolmember, member_detail, login_view

urlpatterns = [
    path('NewSchoolMember/', get_newschoolmember, name='get_members'),
    path('NewSchoolMember/add', add_newschoolmember, name='add_newschoolmember'),
    path('NewSchoolMember/<int:pk>/', member_detail, name='member_detail'),
    path('api/login/', login_view, name='login'),
]
