from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.hashers import make_password
from .models import NewSchoolMember
from .serializer import NewSchoolMemberSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token




@api_view(['GET'])
def get_newschoolmember(request):
    paginator = PageNumberPagination()
    members = NewSchoolMember.objects.all()  # Fetch all members
    paginated_members = paginator.paginate_queryset(members, request)  # Paginate the queryset
    serializer = NewSchoolMemberSerializer(paginated_members, many=True)  # for multiple members
    return paginator.get_paginated_response(serializer.data)  # Return paginated response

@api_view(['POST'])
def add_newschoolmember(request):
    serializer = NewSchoolMemberSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
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
            if 'member_password' in request.data:
                member_password = request.data['member_password']
                serializer.validated_data['member_password'] = make_password(member_password)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        member.delete()  # Use the member instance
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def login_view(request):
    member_username = request.data.get('member_username')  # Get username
    password = request.data.get('password')

    # Authenticate using the custom backend with member_username
    user = authenticate(request, username=member_username, password=password)

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
