from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.core.files.base import ContentFile
from django.conf import settings
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from .models import NewSchoolMember, ApplicationForm, EmploymentHistory, ProfileImage, Tenant
from .serializer import NewSchoolMemberSerializer, CustomTokenObtainPairSerializer, ApplicationFormSerializer
from .permissions import IsAdminUser, IsSelfOrAdmin
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.hashers import make_password
import json
import base64
import logging
from rest_framework import serializers
from django.templatetags.static import static
from .pagination import CustomPagination

logger = logging.getLogger(__name__)

# Custom token view for JWT
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSelfOrAdmin])
def get_newschoolmember(request, tenant_id):
    """
    Retrieves all NewSchoolMembers with pagination.
    """
    try:
        members = NewSchoolMember.objects.filter(tenant=request.tenant)
        paginator = CustomPagination()
        page = paginator.paginate_queryset(members, request)
        if page is not None:
            serializer = NewSchoolMemberSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:
            serializer = NewSchoolMemberSerializer(members, many=True)
            return Response({
                'success': True,
                'message': 'Members retrieved successfully.',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error retrieving members: {e}")
        return Response({
            "success": False,
            "message": "An error occurred while retrieving members.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def add_newschoolmember(request, tenant_id):
    """
    Adds a new NewSchoolMember.
    """
    try:
        serializer = NewSchoolMemberSerializer(data=request.data, context={'tenant': request.tenant})
        if serializer.is_valid(): 
            member = serializer.save(tenant=request.tenant)
            logger.info(f"New member created: {member.username}")
            return Response({
                "success": True,
                "data": serializer.data,
                "message": "Member added successfully."
            }, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Add member failed: {serializer.errors}")
            return Response({
                "success": False,
                "message": "Validation errors occurred.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({
            "success": False,
            "message": "An unexpected error occurred while adding the member.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MemberDetailView(APIView):
    """
    Handles GET, PUT, and DELETE requests for a single NewSchoolMember.
    """
    permission_classes = [IsAuthenticated, IsSelfOrAdmin]

    def get(self, request, tenant_id, member_id):
        try:
            member = get_object_or_404(NewSchoolMember, id=member_id, tenant=request.tenant)
            serializer = NewSchoolMemberSerializer(member)
            return Response({
                "success": True,
                "data": serializer.data,
                "message": "Member retrieved successfully."
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving member: {e}")
            return Response({
                "success": False,
                "message": "An error occurred while retrieving the member.",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, tenant_id, member_id):
        try:
            member = get_object_or_404(NewSchoolMember, id=member_id, tenant=request.tenant)

            if 'member_email' not in request.data or not request.data.get('member_email'):
                return Response({
                    "success": False,
                    "message": "member_email is required and cannot be null."
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = NewSchoolMemberSerializer(
                member, data=request.data, partial=True, context={'tenant': request.tenant}
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "success": True,
                    "data": serializer.data,
                    "message": "Member updated successfully."
                }, status=status.HTTP_200_OK)
            else:
                logger.error(f"Update member failed: {serializer.errors}")
                return Response({
                    "success": False,
                    "message": "Validation errors occurred.",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response({
                "success": False,
                "message": "An unexpected error occurred while updating the member.",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, tenant_id, member_id):
        try:
            member = get_object_or_404(NewSchoolMember, id=member_id, tenant=request.tenant)
            member.delete()
            logger.info(f"Member deleted: {member.username}")
            return Response({
                "success": True,
                "message": "Member deleted successfully."
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting member: {e}")
            return Response({
                "success": False,
                "message": "An error occurred while deleting the member.",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request, tenant_id):
    """
    Handles user login, returning JWT tokens if credentials are valid.
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        logger.info(f"Login attempt for username: {username}")

        if not username or not password:
            logger.warning("Login failed: Missing username or password")
            return Response({
                "success": False,
                "message": "Provide both username and password."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user and user.tenant == request.tenant:
            refresh = RefreshToken.for_user(user)
            return Response({
                "success": True,
                "data": {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'tenant_id': user.tenant.tenant_id
                },
                "message": "Login successful."
            }, status=status.HTTP_200_OK)
        else:
            logger.warning("Login failed: Invalid credentials or tenant mismatch")
            return Response({
                "success": False,
                "message": "Invalid credentials."
            }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        return Response({
            "success": False,
            "message": "An unexpected error occurred during login.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_application_form(request, tenant_id):
    """
    Submits an application form.
    """
    try:
        tenant = get_object_or_404(Tenant, tenant_id=tenant_id)
        serializer = ApplicationFormSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tenant=tenant)
            return Response({
                "success": True,
                "message": "Application submitted successfully."
            }, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Application submission failed: {serializer.errors}")
            return Response({
                "success": False,
                "message": "Validation errors occurred.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error submitting application: {e}")
        return Response({
            "success": False,
            "message": "An unexpected error occurred while submitting the application.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReviewApplication(APIView):
    """
    Reviews an application, approves it, and creates a NewSchoolMember if approved.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, tenant_id, application_id):
        try:
            data = request.data
            tenant = get_object_or_404(Tenant, tenant_id=tenant_id)
            application = get_object_or_404(ApplicationForm, id=application_id, tenant=tenant)
            application.approved = data.get('approved', False)
            application.save()

            if application.approved:
                member_data = {
                    'tenant': tenant,
                    'first_name': application.first_name,
                    'second_name': application.second_name,
                    'family_name': application.family_name,
                    'member_title': application.member_title,
                    'member_industry': application.member_industry,
                    'member_mobile': application.mobile_number,
                    'member_email': data.get('member_email', application.member_email),
                    'username': data.get('username', application.member_email),
                    'password': make_password(data.get('password', 'temporarypassword123')),
                }
                member_serializer = NewSchoolMemberSerializer(data=member_data)
                if member_serializer.is_valid():
                    member_serializer.save(tenant=tenant)
                    return Response({
                        "success": True,
                        "message": "Application approved and member created."
                    }, status=status.HTTP_201_CREATED)
                else:
                    logger.error(f"Member creation failed: {member_serializer.errors}")
                    return Response({
                        "success": False,
                        "message": "Validation errors occurred while creating member.",
                        "errors": member_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "success": True,
                    "message": "Application reviewed successfully."
                }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error reviewing application: {e}")
            return Response({
                "success": False,
                "message": "An unexpected error occurred while reviewing the application.",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PendingApplicationsView(APIView):
    """
    Retrieves all pending applications.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant_id):
        try:
            tenant = get_object_or_404(Tenant, tenant_id=tenant_id)
            pending_applications = ApplicationForm.objects.filter(approved=False, tenant=tenant)
            applications_data = ApplicationFormSerializer(pending_applications, many=True).data
            return Response({
                "success": True,
                "data": applications_data,
                "message": "Pending applications retrieved successfully."
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving pending applications: {e}")
            return Response({
                "success": False,
                "message": "An error occurred while retrieving pending applications.",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def send_application_form_email(request, tenant_id, applicant_email):
    """
    Sends the application form link to the applicant's email.
    """
    try:
        tenant_id = request.tenant.tenant_id
        application_link = f"http://localhost:5173/application-form?email={applicant_email}&tenant_id={tenant_id}"
        send_mail(
            'NewSchool HR Application Form',
            f'Complete your application form here: {application_link}',
            settings.DEFAULT_FROM_EMAIL,
            [applicant_email],
            fail_silently=False,
        )
        return Response({
            "success": True,
            "message": f"Application form sent to {applicant_email}."
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error sending application form email: {e}")
        return Response({
            "success": False,
            "message": "An error occurred while sending the application form email.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
def send_password_reset_link(request, email):
    """
    Sends a password reset link to the specified email.
    """
    try:
        member = get_object_or_404(NewSchoolMember, member_email=email, tenant=request.tenant)
        reset_link = f"http://localhost:5173/reset-password/{member.id}?tenant_id={request.tenant.tenant_id}"
        send_mail(
            'Password Reset Request',
            f'Please click the following link to reset your password: {reset_link}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({
            "success": True,
            "message": f"Password reset link sent to {email}."
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error sending password reset link: {e}")
        return Response({
            "success": False,
            "message": "An error occurred while sending the password reset link.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request, tenant_id):
    """
    Uploads a profile image for a member.
    """
    try:
        member_id = request.data.get('member_id')
        profile_image_data = request.data.get('profileImage')
        member = get_object_or_404(NewSchoolMember, id=member_id, tenant=request.tenant)

        if profile_image_data:
            format, imgstr = profile_image_data.split(';base64,')
            ext = format.split('/')[-1]
            image_data = ContentFile(base64.b64decode(imgstr), name=f"profile_{member.username}.{ext}")

            profile_image, created = ProfileImage.objects.get_or_create(member=member)
            profile_image.image.save(image_data.name, image_data)
            profile_image.save()

            full_image_url = request.build_absolute_uri(profile_image.image.url)

            return Response({
                "success": True,
                "message": "Profile image uploaded successfully.",
                "profile_image_url": full_image_url
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "success": False,
                "message": "No image data provided."
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error uploading profile image: {e}")
        return Response({
            "success": False,
            "message": "An unexpected error occurred while uploading the profile image.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_image(request, tenant_id, member_id):
    """
    Retrieves the profile image URL for a member.
    """
    try:
        member = get_object_or_404(NewSchoolMember, id=member_id, tenant=request.tenant)
        profile_image = ProfileImage.objects.get(member=member)
        
        if profile_image.image:
            image_url = profile_image.image.url
            full_image_url = request.build_absolute_uri(image_url)
        else:
            default_image_url = static('images/default.jpg')
            full_image_url = request.build_absolute_uri(default_image_url)
        
        return Response({
            "success": True,
            "profile_image_url": full_image_url,
            "message": "Profile image retrieved successfully."
        }, status=status.HTTP_200_OK)
    except ProfileImage.DoesNotExist:
        default_image_url = static('images/default.jpg')
        full_image_url = request.build_absolute_uri(default_image_url)
        return Response({
            "success": True,
            "profile_image_url": full_image_url,
            "message": "Default profile image returned."
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error retrieving profile image: {e}")
        return Response({
            "success": False,
            "message": "An error occurred while retrieving the profile image.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for verifying server status.
    """
    logger.debug("Health check endpoint reached")
    return Response({
        "success": True,
        "message": "Server is running."
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_choices(request):
    """
    Returns choices for employment_status and member_country fields.
    """
    try:
        employment_status_choices = NewSchoolMember.EMPLOYMENT_STATUS_CHOICES
        country_choices = NewSchoolMember.COUNTRY_CHOICES

        return Response({
            "success": True,
            "data": {
                "employment_status_choices": employment_status_choices,
                "member_country_choices": country_choices
            },
            "message": "Choices retrieved successfully."
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error retrieving choices: {e}")
        return Response({
            "success": False,
            "message": "An error occurred while retrieving choices.",
            "errors": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
