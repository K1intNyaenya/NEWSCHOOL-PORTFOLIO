from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from .models import NewSchoolMember, EmploymentHistory

class EmploymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentHistory
        fields = ['id','employer', 'job_title']  # Ensure correct field name is 'job_title'

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
            'password': {'write_only': True}  # Hide password in the response
        }

    def create(self, validated_data):
        employment_history_data = validated_data.pop('employment_history', [])
        member = NewSchoolMember.objects.create(**validated_data)

        for job in employment_history_data:
            EmploymentHistory.objects.create(
                member=member,
                employer=job.get('employer', ''),
                job_title=job.get('job_title', '')  # Ensure this matches the payload
            )

        return member

    def update(self, instance, validated_data):
        employment_history_data = validated_data.pop('employment_history', None)

    # Update member fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if employment_history_data is not None:
        # Map existing employment history by ID
            existing_jobs = {job.id: job for job in instance.employment_history.all()}

        # Process each job in the input data
        for job_data in employment_history_data:
            job_id = job_data.get('id', None)
            if job_id and job_id in existing_jobs:
                # Update existing job
                job = existing_jobs.pop(job_id)
                for attr, value in job_data.items():
                    setattr(job, attr, value)
                job.save()
            else:
                # Create new job
                EmploymentHistory.objects.create(member=instance, **job_data)

        # Delete jobs not included in the new data
        for job in existing_jobs.values():
            job.delete()

        return instance


    def validate_username(self, value):
        if NewSchoolMember.objects.exclude(pk=self.instance.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        
        return value
    
    def validate_member_email(self, value):
        if self.instance:
            # Exclude the current instance when checking for uniqueness
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
