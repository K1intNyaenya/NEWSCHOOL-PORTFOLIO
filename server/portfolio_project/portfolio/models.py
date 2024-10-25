from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class NewSchoolMemberManager(BaseUserManager):
    def create_user(self, username, member_email, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username must be set')
        if not member_email:
            raise ValueError('The Email must be set')

        user = self.model(username=username, member_email=member_email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, member_email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, member_email, password, **extra_fields)


class NewSchoolMember(AbstractBaseUser):
    first_name = models.CharField(max_length=45)
    second_name = models.CharField(max_length=45)
    family_name = models.CharField(max_length=45)
    member_title = models.CharField(max_length=75)
    member_industry = models.CharField(blank=True, null=True, max_length=75)

    member_mobile = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
        )]
    )

    member_email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['member_email']

    objects = NewSchoolMemberManager()

    def __str__(self):
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
    

class ProfileImage(models.Model):
    member = models.OneToOneField(
        NewSchoolMember, 
        related_name='profile_image', 
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    def __str__(self):
        return f"Profile image for {self.member.username}"