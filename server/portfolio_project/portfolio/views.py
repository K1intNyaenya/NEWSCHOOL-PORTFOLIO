from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
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

logger = logging.getLogger(__name__)

class ApplicationFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationForm
        fields = '__all__'

# Custom token view for JWT
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSelfOrAdmin])
def get_newschoolmember(request, tenant_id):
    """
    Retrieves all NewSchoolMembers with pagination.
    """
    members = NewSchoolMember.objects.filter(tenant=request.tenant)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(members, request)
    if page is not None:
        serializer = NewSchoolMemberSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    serializer = NewSchoolMemberSerializer(members, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def add_newschoolmember(request, tenant_id):
    """
    Adds a new NewSchoolMember.
    """
    try:
        serializer = NewSchoolMemberSerializer(data=request.data)
        if serializer.is_valid(): 
            member = serializer.save(tenant=request.tenant)
            logger.info(f"New member created: {member.username}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Add member failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({"detail": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MemberDetailView(APIView):
    """
    Handles GET, PUT, and DELETE requests for a single NewSchoolMember.
    """
    permission_classes = [IsAuthenticated, IsSelfOrAdmin]

    def get(self, request, tenant_id, member_id):
        member = get_object_or_404(NewSchoolMember, id=member_id, tenant_id=tenant_id)
        serializer = NewSchoolMemberSerializer(member)
        return Response(serializer.data)

    def put(self, request, tenant_id, member_id):
        member = get_object_or_404(NewSchoolMember, id=member_id, tenant_id=tenant_id)
        
        # Check that member_email is present
        if 'member_email' not in request.data or not request.data.get('member_email'):
            return Response({"error": "member_email is required and cannot be null."}, status=status.HTTP_400_BAD_REQUEST)

        # Use the serializer with tenant context
        serializer = NewSchoolMemberSerializer(
            member, data=request.data, partial=True, context={'tenant': request.tenant}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    def delete(self, request, tenant_id, member_id):
        member = get_object_or_404(NewSchoolMember, id=member_id, tenant_id=tenant_id)
        member.delete()
        logger.info(f"Member deleted: {member.username}")
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request, tenant_id):
    """
    Handles user login, returning JWT tokens if credentials are valid.
    """
    username, password = request.data.get('username'), request.data.get('password')
    logger.info(f"Login attempt for username: {username}")
    
    if not username or not password:
        logger.warning("Login failed: Missing username or password")
        return Response({'message': 'Provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user and user.tenant == request.tenant:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'tenant_id': user.tenant.tenant_id
        })
    logger.warning("Login failed: Invalid credentials or tenant mismatch")
    return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_application_form(request, tenant_id):
    # Get the tenant object
    try:
        tenant = Tenant.objects.get(tenant_id=tenant_id)
    except Tenant.DoesNotExist:
        return Response({"error": "Invalid tenant ID."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ApplicationFormSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(tenant=tenant)
        return Response({"message": "Application submitted successfully."}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewApplication(APIView):
    """
    Reviews an application, approves it, and creates a NewSchoolMember if approved.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, tenant_id, application_id):
        data = json.loads(request.body)
        
        # Get tenant based on tenant_id
        tenant = get_object_or_404(Tenant, tenant_id=tenant_id)
        
        # Retrieve the application for the specific tenant
        application = get_object_or_404(ApplicationForm, id=application_id, tenant=tenant)
        application.approved = data.get('approved', False)
        application.save()

        if application.approved:
            member_data = {
                'tenant': tenant,  # Ensure tenant is added to member_data
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
                member_serializer.save(tenant=tenant)  # Save with tenant information
                return JsonResponse({
                    'message': 'Application approved and member created'
                }, status=201)
            return JsonResponse(member_serializer.errors, status=400)
        return JsonResponse({"message": "Application reviewed successfully."}, status=200)

class PendingApplicationsView(APIView):
    """
    Retrieves all pending applications.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tenant_id = kwargs.get('tenant_id')
        tenant = get_object_or_404(Tenant, tenant_id=tenant_id)
        pending_applications = ApplicationForm.objects.filter(approved=False, tenant=tenant)
        applications_data = ApplicationFormSerializer(pending_applications, many=True).data
        return JsonResponse(applications_data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def send_application_form_email(request, tenant_id, applicant_email):
    """
    Sends the application form link to the applicant's email.
    """
    # Use tenant_id from request.tenant set by middleware
    tenant_id = request.tenant.tenant_id

    application_link = f"http://localhost:5173/application-form?email={applicant_email}&tenant_id={tenant_id}"
    send_mail(
        'NewSchool HR Application Form',
        f'Complete your application form here: {application_link}',
        settings.DEFAULT_FROM_EMAIL,
        [applicant_email],
        fail_silently=False,
    )
    return JsonResponse({"message": f"Application form sent to {applicant_email}"})


@csrf_exempt
def send_password_reset_link(request, email):
    """
    Sends a password reset link to the specified email.
    """
    member = get_object_or_404(NewSchoolMember, member_email=email, tenant=request.tenant)
    reset_link = f"http://localhost:5173/reset-password/{member.id}?tenant_id={request.tenant.tenant_id}"
    send_mail(
        'Password Reset Request',
        f'Please click the following link to reset your password: {reset_link}',
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )
    return JsonResponse({"message": f"Password reset link sent to {email}"}, status=200)

@api_view(['POST'])
def upload_profile_image(request, tenant_id):
    member_id = request.data.get('member_id')
    profile_image_data = request.data.get('profileImage')
    member = get_object_or_404(NewSchoolMember, id=member_id, tenant=tenant_id)

    if profile_image_data:
        format, imgstr = profile_image_data.split(';base64,')
        ext = format.split('/')[-1]
        image_data = ContentFile(base64.b64decode(imgstr), name=f"profile_{member.username}.{ext}")

        profile_image, created = ProfileImage.objects.get_or_create(member=member)
        profile_image.image.save(image_data.name, image_data)
        profile_image.save()

        return Response({"message": "Profile image uploaded"}, status=200)
    else:
        return Response({"error": "No image data provided"}, status=400)


@api_view(['GET'])
def get_profile_image(request, tenant_id, member_id):
    # Verify the tenant
    if str(tenant_id) != str(request.tenant.tenant_id):
        return Response({"error": "Invalid tenant ID"}, status=403)

    try:
        member = get_object_or_404(NewSchoolMember, id=member_id, tenant=request.tenant)
        profile_image = ProfileImage.objects.get(member=member)
        
        if profile_image.image:
            image_url = profile_image.image.url
            full_image_url = request.build_absolute_uri(image_url)
        else:
            # Use default image
            default_image_url = static('images/default.jpg')
            full_image_url = request.build_absolute_uri(default_image_url)
        
        return Response({'profile_image_url': full_image_url}, status=200)
    except ProfileImage.DoesNotExist:
        # Use default image
        default_image_url = static('images/default.jpg')
        full_image_url = request.build_absolute_uri(default_image_url)
        return Response({'profile_image_url': full_image_url}, status=200)
    except NewSchoolMember.DoesNotExist:
        return Response({"error": "Member not found"}, status=404)



@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for verifying server status.
    """
    logger.debug("Health check endpoint reached")
    return Response({"status": "Server is running"})

@api_view(['GET'])
def get_choices(request):
    """
    Returns choices for employment_status and member_country fields.
    """
    employment_status_choices = NewSchoolMember.EMPLOYMENT_STATUS_CHOICES
    country_choices = NewSchoolMember.COUNTRY_CHOICES

    return Response({
        "employment_status_choices": employment_status_choices,
        "member_country_choices": country_choices
    })
