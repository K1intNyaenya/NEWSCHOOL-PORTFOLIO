from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import NewSchoolMember, EmploymentHistory, ApplicationForm
from django.contrib.auth.hashers import make_password

class EmploymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentHistory
        fields = ['id', 'employer', 'job_title']
        extra_kwargs = {
            'employer': {'required': False, 'allow_blank': True},
            'job_title': {'required': False, 'allow_blank': True},
        }

class NewSchoolMemberSerializer(serializers.ModelSerializer):
    employment_history = EmploymentHistorySerializer(many=True, required=False)

    class Meta:
        model = NewSchoolMember
        fields = [
            'id', 'first_name', 'second_name', 'family_name', 'member_title', 
            'member_industry', 'employment_history', 
            'member_mobile', 'member_email', 'username', 'password', 'role'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},  # Password is not required
            'role': {'required': False}
        }

    def create(self, validated_data):
        employment_history_data = validated_data.pop('employment_history', [])
        
        # Set default username to member_email if username is not provided
        validated_data['username'] = validated_data.get('username', validated_data.get('member_email'))

        # Role handling (set default as 'member' if not specified)
        validated_data['role'] = validated_data.get('role', 'member')


        # Hash password if provided
        password = validated_data.pop('password', None)
        member = NewSchoolMember(**validated_data)  # This creates the instance without saving it yet
        if password:
            member.set_password(password)  # Properly hash the password
        member.save()  # Save the member instance to the database
        
        try:
            # Create EmploymentHistory instances
            for job in employment_history_data:
                EmploymentHistory.objects.create(
                    member=member,
                    employer=job.get('employer', ''),
                    job_title=job.get('job_title', '')
                )
            return member
        except Exception as e:
            raise serializers.ValidationError(f"Error creating member: {e}")

    def update(self, instance, validated_data):
        # Handle employment history updates
        employment_history_data = validated_data.pop('employment_history', None)

        # Update basic fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.second_name = validated_data.get('second_name', instance.second_name)
        instance.family_name = validated_data.get('family_name', instance.family_name)
        instance.member_title = validated_data.get('member_title', instance.member_title)
        instance.member_industry = validated_data.get('member_industry', instance.member_industry)
        instance.member_mobile = validated_data.get('member_mobile', instance.member_mobile)
        instance.member_email = validated_data.get('member_email', instance.member_email)
        instance.username = validated_data.get('username', instance.username)

        # Handle password update if provided
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        instance.save()

        # If employment history data is provided, update it
        if employment_history_data is not None:
            # Clear existing employment history
            EmploymentHistory.objects.filter(member=instance).delete()

            # Create new employment history records
            for job in employment_history_data:
                EmploymentHistory.objects.create(
                    member=instance,
                    employer=job.get('employer', ''),
                    job_title=job.get('job_title', '')
                )

        return instance


    def validate_username(self, value):
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
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'")
        
        # Create token with additional role information
        data = super().validate(attrs)
        refresh = self.get_token(user)
        data["role"] = user.role  # Add role to the token response

        return data

class ApplicationFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationForm
        fields = '__all__'
