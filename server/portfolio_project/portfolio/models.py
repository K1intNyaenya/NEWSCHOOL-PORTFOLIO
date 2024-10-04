from enum import member
from django.db import models

# Create your models here.
class NewSchoolMember(models.Model):
    first_name = models.CharField(max_length=45)
    second_name = models.CharField(max_length=45)
    family_name = models.CharField(max_length=45)
    member_title = models.CharField(max_length=75)
    member_years_of_experience = models.IntegerField()
    previous_employer = models.CharField(max_length=75)
    previous_employer2 = models.CharField(max_length=75)
    previous_employer3 = models.CharField(max_length=75, default='Third Employer')
    previous_employer4 = models.CharField(max_length=75, default='Fourth Employer')
    previous_employer5 = models.CharField(max_length=75, default='Fifth Employer')
    previous_jobtitle = models.CharField(max_length=75)
    previous_jobtitle2 = models.CharField(max_length=75)
    previous_jobtitle3 = models.CharField(max_length=75, default='Prev Job title3')
    previous_jobtitle4 = models.CharField(max_length=75, default='Prev job title 4')
    previous_jobtitle5 = models.CharField(max_length=75, default='Prev Job title5')
    member_mobile = models.CharField(max_length=45, default='No Mobile')
    member_email = models.CharField(max_length=45, default='abc@company.com')
    member_username = models.CharField(max_length=100)
    member_password = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.first_name} {self.second_name} {self.family_name} ({self.member_username})"
