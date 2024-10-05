from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import NewSchoolMember

class NewSchoolMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewSchoolMember
        fields = ['first_name', 'second_name', 'family_name', 'member_title', 
                  'member_years_of_experience', 'previous_employer1', 
                  'previous_jobtitle1', 'previous_employer2', 'previous_jobtitle2',
                  'previous_employer3', 'previous_jobtitle3', 
                  'previous_employer4', 'previous_jobtitle4', 
                  'previous_employer5', 'previous_jobtitle5', 
                  'member_mobile', 'member_email', 'member_username', 
                  'member_password']  # member_password included for input only
        extra_kwargs = {
            'member_password': {'write_only': True}  # Hide password in the response
        }

    def create(self, validated_data):
        # Hash the password before saving it
        validated_data['member_password'] = make_password(validated_data['member_password'])
        return NewSchoolMember.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Hash the password only if it's provided in the update request
        if 'member_password' in validated_data:
            validated_data['member_password'] = make_password(validated_data['member_password'])
        return super(NewSchoolMemberSerializer, self).update(instance, validated_data)

    def validate_member_username(self, value):
        if NewSchoolMember.objects.filter(member_username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
