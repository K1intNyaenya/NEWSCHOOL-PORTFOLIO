from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import NewSchoolMember, ApplicationForm, EmploymentHistory
from .serializer import NewSchoolMemberSerializer, CustomTokenObtainPairSerializer
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import json
import logging
from django.core.mail import send_mail
from django.conf import settings



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
def get_newschoolmember(request):
    members = NewSchoolMember.objects.all()
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(members, request)
    if page is not None:
        serializer = NewSchoolMemberSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    serializer = NewSchoolMemberSerializer(members, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def add_newschoolmember(request):
    print("Received request data:", request.data)
    try:
        serializer = NewSchoolMemberSerializer(data=request.data)
        if serializer.is_valid():
            print("Serializer data is valid.")
            member = serializer.save()
            print("Member saved successfully.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Unexpected error in view: {e}")
        return Response({"detail": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
def member_detail(request, pk):
    try:
        member = NewSchoolMember.objects.get(pk=pk)
    except NewSchoolMember.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = NewSchoolMemberSerializer(member)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = NewSchoolMemberSerializer(member, data=request.data)
        if serializer.is_valid():
            if 'password' in request.data:
                password = request.data['password']
                serializer.validated_data['password'] = make_password(password)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'message': 'Please provide both username and password'}, 
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.id,
            'username': user.username,
            'email': user.member_email,
        }, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid credentials'}, 
                        status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({'message': 'This is a protected view!'})


@csrf_exempt
def submit_application_form(request):
    if request.method == "POST":
        data = json.loads(request.body)
        application = ApplicationForm.objects.create(
            first_name=data['first_name'],
            second_name=data['second_name'],
            family_name=data['family_name'],
            mobile_number=data['mobile_number'],
            member_title=data['member_title'],
            member_industry=data['member_industry'],
            employment_industry=data['employment_industry'],
            reason_for_joining=data['reason_for_joining'],
            referred_by_name=data['referred_by_name'],
            referred_by_mobile=data['referred_by_mobile']
        )
        return JsonResponse({"message": "Application submitted successfully."}, status=201)
    
    return JsonResponse({"error": "Method not allowed. Use POST to submit the form."}, status=405)


@csrf_exempt
def review_application(request, application_id):
    if request.method == "POST":
        data = json.loads(request.body)
        application = get_object_or_404(ApplicationForm, id=application_id)
        
        # Update the application with any new vetting or joining info
        application.vetted_by = data.get('vetted_by', application.vetted_by)
        application.approved = data.get('approved', False)
        application.member_joining_date = data.get('member_joining_date', None)
        application.save()

        if application.approved:
            member_data = {
                'first_name': application.first_name,
                'second_name': application.second_name,
                'family_name': application.family_name,
                'member_title': application.member_title,
                'member_industry': application.member_industry,
                'member_mobile': application.mobile_number,
                'member_email': data.get('member_email', f"{application.first_name.lower()}@example.com"),
                'username': data.get('username', f"{application.first_name.lower()}{application.id}"),
                'password': make_password(data.get('password', 'temporarypassword123')),
            }

            member_serializer = NewSchoolMemberSerializer(data=member_data)
            if member_serializer.is_valid():
                member = member_serializer.save()
                
                EmploymentHistory.objects.create(
                    member=member,
                    employer=application.employment_industry,
                    job_title=application.member_title,
                )
                
                return JsonResponse({"message": "Application approved and new member added successfully."}, status=201)
            else:
                return JsonResponse(member_serializer.errors, status=400)

        return JsonResponse({"message": "Application reviewed and marked as not approved."}, status=200)

    return JsonResponse({"error": "Method not allowed. Use POST to review the application."}, status=405)

logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_pending_applications(request):
    try:
        pending_applications = ApplicationForm.objects.filter(approved=False)
        applications_data = [{
            'id': app.id,
            'first_name': app.first_name,
            'second_name': app.second_name,
            'family_name': app.family_name,
            'date_of_application': app.date_of_application,
            'mobile_number': app.mobile_number,
            'member_title': app.member_title,
            'member_industry': app.member_industry,
            'employment_industry': app.employment_industry,
            'reason_for_joining': app.reason_for_joining,
            'referred_by_name': app.referred_by_name,
            'referred_by_mobile': app.referred_by_mobile,
            'vetted_by': app.vetted_by,
            'approved': app.approved,
        } for app in pending_applications]

        return JsonResponse(applications_data, safe=False)
    
    except ApplicationForm.DoesNotExist:
        logger.error("No pending applications found.")
        return JsonResponse({"error": "No pending applications found."}, status=404)
    
    except Exception as e:
        logger.error(f"Error retrieving pending applications: {e}")
        return JsonResponse({"error": "An error occurred while fetching pending applications."}, status=500)


def send_application_form_email(request, applicant_email):
    subject = 'Complete Your Application Form'
    application_link = 'http://yourdomain.com/application-form/'  # Replace with the actual URL
    message = f'Please complete your application form at the following link: {application_link}'
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [applicant_email],
        fail_silently=False,
    )

    return JsonResponse({"message": f"Application form sent to {applicant_email} successfully."})


@csrf_exempt
def send_password_reset_link(request, email):
    try:
        member = get_object_or_404(NewSchoolMember, member_email=email)
        
        # Create a reset link or token
        reset_link = f"http://yourdomain.com/reset-password/{member.id}"  # Replace with actual link generation logic
        
        # Send the reset link via email
        send_mail(
            'Password Reset Request',
            f'Please click the following link to reset your password: {reset_link}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return JsonResponse({"message": f"Password reset link sent to {email} successfully."}, status=200)
    
    except NewSchoolMember.DoesNotExist:
        return JsonResponse({"error": "User with this email does not exist."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)