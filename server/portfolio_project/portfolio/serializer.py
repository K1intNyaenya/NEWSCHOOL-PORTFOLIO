from rest_framework import serializers
from .models import NewSchoolMember

class NewSchoolMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewSchoolMember
        fields = [
            'first_name',
            'second_name',
            'family_name',
            'member_title',
            'member_years_of_experience',
            'previous_employer',
            'previous_employer2',
            'previous_jobtitle',
            'previous_jobtitle2',
            'member_username',
        ]