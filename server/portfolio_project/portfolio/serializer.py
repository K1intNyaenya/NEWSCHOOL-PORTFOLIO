from rest_framework import serializers
from .models import NewSchoolMember
from django.contrib.auth.hashers import make_password


class NewSchoolMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewSchoolMember
        fields = [
            'first_name',
            'second_name',
            'family_name',
            'member_title',
            'member_years_of_experience',
            'previous_employer1',
            'previous_jobtitle1',
            'previous_employer2',
            'previous_jobtitle2',
            'previous_employer3',
            'previous_jobtitle3',
            'previous_employer4',
            'previous_jobtitle4',
            'previous_employer5',
            'previous_jobtitle5',
            'member_mobile',
            'member_email',
            'member_username',
            'member_password',
        ]

    def create(self, validated_data):
        
        member_password = validated_data.pop('member_password', None)
        if member_password:
            validated_data['member_password'] = make_password(member_password)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        
        member_password = validated_data.pop('member_password', None)
        if member_password:
            validated_data['member_password'] = make_password(member_password)
        return super().update(instance, validated_data)
