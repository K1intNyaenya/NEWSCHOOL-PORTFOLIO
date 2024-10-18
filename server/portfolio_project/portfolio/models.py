from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.hashers import make_password

class NewSchoolMember(models.Model):
    first_name = models.CharField(max_length=45)
    second_name = models.CharField(max_length=45)
    family_name = models.CharField(max_length=45)
    member_title = models.CharField(max_length=75)
    member_industry = models.CharField(
        blank=True,
        null=True,
        max_length=75)  # New field for industry

    # Contact Information
    member_mobile = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
        )]
    )
    
    member_email = models.EmailField(max_length=75, default='abc@company.com')
    
    username = models.CharField(max_length=100, unique=True)  # Unique username
    password = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        # Hash the password before saving
        if not self.password.startswith('pbkdf2_sha256$'):  # Check if password is already hashed
            self.password = make_password(self.password)
        super(NewSchoolMember, self).save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.first_name} {self.second_name} {self.family_name} ({self.username})"


class EmploymentHistory(models.Model):
    member = models.ForeignKey(NewSchoolMember, related_name='employment_history', on_delete=models.CASCADE)
    employer = models.CharField(max_length=100)
    job_title = models.CharField(max_length=100)


    
    def __str__(self):
        return f"{self.member.first_name} {self.member.family_name} - {self.job_title} at {self.employer}"
    
class ApplicationForm(models.Model):
    # Applicant's Information
    first_name = models.CharField(max_length=45)
    second_name = models.CharField(max_length=45)
    family_name = models.CharField(max_length=45)
    mobile_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
        )]
    )
    member_title = models.CharField(max_length=75)
    member_email = models.EmailField(max_length=75, default='abc@company.com')
    member_industry = models.CharField(max_length=75, blank=True, null=True)
    employment_industry = models.CharField(max_length=75)
    
    # Application Details
    date_of_application = models.DateField(auto_now_add=True)
    reason_for_joining = models.TextField(blank=True, null=True)
    referred_by_name = models.CharField(max_length=75, blank=True, null=True)
    referred_by_mobile = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
        )]
    )

    # Vetting and Approval
    vetted_by = models.CharField(max_length=100, blank=True, null=True)
    approved = models.BooleanField(default=False)
    member_joining_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Application by {self.first_name} {self.second_name} {self.family_name}"
