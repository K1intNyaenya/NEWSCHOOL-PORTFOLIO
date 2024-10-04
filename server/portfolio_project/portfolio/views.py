from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
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
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def member_detail(request, pk):
    try:
        NewSchoolMember = NewSchoolMember.objects.get(pk=pk)
    except NewSchoolMember.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = NewSchoolMemberSerializer(NewSchoolMember)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = NewSchoolMemberSerializer(NewSchoolMember, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        NewSchoolMember.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

