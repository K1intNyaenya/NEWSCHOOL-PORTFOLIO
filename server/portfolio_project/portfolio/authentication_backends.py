from django.contrib.auth.backends import BaseBackend
from .models import NewSchoolMember

class MemberBackend(BaseBackend):
    def authenticate(self, request, member_username=None, password=None):
        try:
            member = NewSchoolMember.objects.get(member_username=member_username)
            if member.check_password(password):
                return member
        except NewSchoolMember.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return NewSchoolMember.objects.get(pk=user_id)
        except NewSchoolMember.DoesNotExist:
            return None