from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import NewSchoolMember, EmploymentHistory, ApplicationForm
from django.contrib.auth.hashers import make_password
import logging
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import BaseUserManager

logger = logging.getLogger(__name__)

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
            'member_mobile', 'member_email', 'username', 'password', 'role', 'employment_status',
            'member_country'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'role': {'required': False}
        }

    def create(self, validated_data):
        employment_history_data = validated_data.pop('employment_history', [])
        validated_data['username'] = validated_data.get('username', validated_data.get('member_email'))
        validated_data['role'] = validated_data.get('role', 'member')

        password = validated_data.pop('password', None)
        member = NewSchoolMember(**validated_data)
        if password:
            member.set_password(password)
        member.save()
        
        try:
            for job in employment_history_data:
                EmploymentHistory.objects.create(
                    member=member,
                    employer=job.get('employer', ''),
                    job_title=job.get('job_title', '')
                )
            return member
        except Exception as e:
            logger.error(f"Error creating member: {e}")
            raise serializers.ValidationError(f"Error creating member: {e}")

    def update(self, instance, validated_data):
        employment_history_data = validated_data.pop('employment_history', None)
        role = validated_data.get('role', instance.role)

        if instance.role != 'admin' and role == 'admin':
            raise serializers.ValidationError("Only admins can assign the 'admin' role.")

        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.second_name = validated_data.get('second_name', instance.second_name)
        instance.family_name = validated_data.get('family_name', instance.family_name)
        instance.member_title = validated_data.get('member_title', instance.member_title)
        instance.member_industry = validated_data.get('member_industry', instance.member_industry)
        instance.member_mobile = validated_data.get('member_mobile', instance.member_mobile)
        instance.member_email = validated_data.get('member_email', instance.member_email)
        instance.username = validated_data.get('username', instance.username)
        instance.role = role
        

        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        instance.save()

        if employment_history_data is not None:
            EmploymentHistory.objects.filter(member=instance).delete()
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
                logger.warning(f"Failed login attempt for username: {username}")
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'")
        
        data = super().validate(attrs)
        refresh = self.get_token(user)
        data["role"] = user.role

        logger.info(f"Login successful for user: {username} with role: {user.role}")
        return data

class ApplicationFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationForm
        fields = '__all__'

    def update(self, instance, validated_data):
        approved = validated_data.get('approved', instance.approved)

        if approved and not instance.approved:
            # Only create a NewSchoolMember if approval status changes to True
            try:
                with transaction.atomic():
                    # Generate password and create the member
                    password = BaseUserManager().make_random_password()
                    user = NewSchoolMember.objects.create_user(
                        username=instance.member_email,
                        member_email=instance.member_email,
                        first_name=instance.first_name,
                        second_name=instance.second_name,
                        family_name=instance.family_name,
                        password=password
                    )
                    logger.info(
                        f"NewSchoolMember created from approved application. "
                        f"Application ID: {instance.id}, Email: {instance.member_email}"
                    )

                    # (Optional) Send notification email
                    if settings.EMAIL_HOST:
                        try:
                            send_mail(
                                subject="Your Application Has Been Approved",
                                message=(
                                    f"Hello {instance.first_name},\n\n"
                                    "Congratulations! Your application has been approved.\n"
                                    f"Username: {instance.member_email}\n"
                                    "Please use the 'Forgot Password' option to set your password initially.\n\n"
                                    "Thank you!"
                                ),
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[instance.member_email],
                                fail_silently=False,
                            )
                            logger.info(f"Approval email sent to {instance.member_email}")
                        except Exception as e:
                            logger.error(f"Error sending approval email to {instance.member_email}: {e}")
                            # Optionally, you could raise a warning or handle the failed email scenario differently

            except Exception as e:
                logger.error(f"Error creating NewSchoolMember from application ID {instance.id}: {e}")
                raise serializers.ValidationError("An error occurred during member creation from application.")

        # Save the application form with any updates
        return super().update(instance, validated_data)