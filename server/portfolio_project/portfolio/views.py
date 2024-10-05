from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from .models import NewSchoolMember
from .serializer import NewSchoolMemberSerializer

@api_view(['GET'])
def get_newschoolmember(request):
    members = NewSchoolMember.objects.all()  # Fetch all members
    serializer = NewSchoolMemberSerializer(members, many=True)  # for multiple members
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def add_newschoolmember(request):
    serializer = NewSchoolMemberSerializer(data=request.data)
    if serializer.is_valid():
        # Hash the password before saving
        member_password = request.data.get('member_password')
        serializer.validated_data['member_password'] = make_password(member_password)
        serializer.save()  # Save the member with the hashed password
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