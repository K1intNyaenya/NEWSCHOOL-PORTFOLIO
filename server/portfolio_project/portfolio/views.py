from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import NewSchoolMember
from .serializer import NewSchoolMemberSerializer, CustomTokenObtainPairSerializer
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView



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
    # Logging incoming request data for debugging
    print("Received request data:", request.data)
    
    serializer = NewSchoolMemberSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        # Logging successful data processing
        print("Processed data for serializer:", serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        # Logging validation errors
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def member_detail(request, pk):
    try:
        member = NewSchoolMember.objects.get(pk=pk)  # Use lowercase for instance
    except NewSchoolMember.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = NewSchoolMemberSerializer(member)  # Use member instance
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = NewSchoolMemberSerializer(member, data=request.data)
        if serializer.is_valid():
            # If updating password, ensure it's hashed
            if 'password' in request.data:
                password = request.data['password']
                serializer.validated_data['password'] = make_password(password)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        member.delete()  # Use the member instance
        return Response(status=status.HTTP_204_NO_CONTENT)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Allow any user to access this endpoint
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'message': 'Please provide both username and password'}, 
                        status=status.HTTP_400_BAD_REQUEST)

    # Authenticate using member_username and member_password
    user = authenticate(request, username=username, password=password)

    if user is not None:
        # Create JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),  # Return the refresh token
            'access': str(refresh.access_token),  # Return the access token
            'user_id': user.id,
            'username': user.username,  # Use the correct field
            'email': user.member_email,  # Use the correct field
        }, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid credentials'}, 
                        status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    # This view is protected and requires a valid JWT
    return Response({'message': 'This is a protected view!'})