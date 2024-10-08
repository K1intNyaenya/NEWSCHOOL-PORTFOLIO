from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from .models import NewSchoolMember

class NewSchoolMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewSchoolMember
        fields = [
            'first_name', 'second_name', 'family_name', 'member_title', 
            'member_years_of_experience', 'previous_employer1', 
            'previous_jobtitle1', 'previous_employer2', 'previous_jobtitle2',
            'previous_employer3', 'previous_jobtitle3', 
            'previous_employer4', 'previous_jobtitle4', 
            'previous_employer5', 'previous_jobtitle5', 
            'member_mobile', 'member_email', 'username', 
            'password'  # Include password for input only
        ]
        extra_kwargs = {
            'password': {'write_only': True}  # Hide password in the response
        }

    def create(self, validated_data):
        # Hash the password before saving it
        validated_data['password'] = make_password(validated_data['password'])
        return NewSchoolMember.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Hash the password only if it's provided in the update request
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super(NewSchoolMemberSerializer, self).update(instance, validated_data)

    def validate_username(self, value):
        # Check if username is already taken
        if NewSchoolMember.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def validate_member_email(self, value):
        # Check if email is already registered
        if NewSchoolMember.objects.filter(member_email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_member_mobile(self, value):
        # Validate length of mobile number
        if len(value) < 10:  # Assuming a minimum length for mobile numbers
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
