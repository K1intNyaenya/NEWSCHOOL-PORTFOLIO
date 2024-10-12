from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import NewSchoolMember, EmploymentHistory

class EmploymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentHistory
        fields = ['id', 'employer', 'job_title']

class NewSchoolMemberSerializer(serializers.ModelSerializer):
    employment_history = EmploymentHistorySerializer(many=True)

    class Meta:
        model = NewSchoolMember
        fields = [
            'id', 'first_name', 'second_name', 'family_name', 'member_title', 
            'member_industry', 'employment_history', 
            'member_mobile', 'member_email', 'username', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        employment_history_data = validated_data.pop('employment_history', [])
        try:
            # Create the NewSchoolMember instance
            member = NewSchoolMember.objects.create(**validated_data)
            print("NewSchoolMember created with ID:", member.pk)  # Debug logging

            # Create EmploymentHistory instances
            for job in employment_history_data:
                EmploymentHistory.objects.create(
                    member=member,
                    employer=job.get('employer', ''),
                    job_title=job.get('job_title', '')
                )
            return member
        except Exception as e:
            print(f"Error while creating NewSchoolMember: {e}")
            raise serializers.ValidationError("An error occurred while creating the member.")

    def validate_username(self, value):
        # Check if self.instance exists before accessing pk
        if self.instance and NewSchoolMember.objects.exclude(pk=self.instance.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        elif not self.instance and NewSchoolMember.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_member_email(self, value):
        if self.instance:
            if NewSchoolMember.objects.exclude(pk=self.instance.pk).filter(member_email=value).exists():
                raise serializers.ValidationError("This email is already registered.")
        else:
            if NewSchoolMember.objects.filter(member_email=value).exists():
                raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_member_mobile(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Mobile number must be at least 10 digits long.")
        return value

    def validate_employment_history(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Employment history must be a list.")
        for job in value:
            if 'employer' not in job or 'job_title' not in job:
                raise serializers.ValidationError("Each job entry must include 'employer' and 'job_title'.")
        return value

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if username and password:
            user = authenticate(request=self.context.get('request'), 
                                username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'")

        return super().validate(attrs)
