from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid


# Tenant model, defining each tenant's unique identifier and domain information
class Tenant(models.Model):
    tenant_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_name = models.CharField(max_length=255)
    tenant_domain = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant_name} - {self.tenant_id}"


# Custom User Manager for handling NewSchoolMember creation and management
class NewSchoolMemberManager(BaseUserManager):
    def create_user(self, username, member_email, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username must be set')
        if not member_email:
            raise ValueError('The Email must be set')

        extra_fields.setdefault('role', 'member')
        user = self.model(username=username, member_email=member_email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, member_email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        return self.create_user(username, member_email, password, **extra_fields)


# NewSchoolMember model, extending AbstractBaseUser with custom fields for role, employment status, etc.
class NewSchoolMember(AbstractBaseUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('guest', 'Guest'),
    ]

    FULL_TIME = 'FT'
    PART_TIME = 'PT'
    CONTRACTOR = 'CT'
    INTERN = 'IN'

    EMPLOYMENT_STATUS_CHOICES = [
        (FULL_TIME, 'Full-Time'),
        (PART_TIME, 'Part-Time'),
        (CONTRACTOR, 'Contractor'),
        (INTERN, 'Intern'),
    ]

    COUNTRY_CHOICES = [
        ('KE', 'Kenya'),
        ('TZ', 'Tanzania'),
        ('UG', 'Uganda'),
        ('RW', 'Rwanda'),
        ('ZW', 'Zimbabwe'),
        ('SA', 'South Africa'),
        ('MZ', 'Mozambique'),
        ('GH', 'Ghana'),
        ('UAE', 'United Arab Emirates'),
        ('NO', 'Norway'),
        ('FR', 'France'),
        ('IT', 'Italy'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True)
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

    employment_status = models.CharField(
        max_length=75,
        choices=EMPLOYMENT_STATUS_CHOICES,
        blank=True,
        null=True
    )

    member_country = models.CharField(
        max_length=75,
        choices=COUNTRY_CHOICES,
        blank=True,
        null=True
    )

    member_email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['member_email']

    objects = NewSchoolMemberManager()

    def __str__(self):
        return f"{self.first_name} {self.second_name} {self.family_name} ({self.username})"


# EmploymentHistory model linked to NewSchoolMember with job details
class EmploymentHistory(models.Model):
    member = models.ForeignKey(NewSchoolMember, related_name='employment_history', on_delete=models.CASCADE)
    employer = models.CharField(max_length=100)
    job_title = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.member.first_name} {self.member.family_name} - {self.job_title} at {self.employer}"


# ApplicationForm model for handling application information before becoming a member
class ApplicationForm(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True)
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

    vetted_by = models.CharField(max_length=100, blank=True, null=True)
    approved = models.BooleanField(default=False)
    member_joining_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Application by {self.first_name} {self.second_name} {self.family_name}"


# Signal to create NewSchoolMember upon application approval
@receiver(post_save, sender=ApplicationForm)
def create_member_from_application(sender, instance, created, **kwargs):
    """
    Signal to create a NewSchoolMember upon application approval.
    """
    if created and instance.approved:
        NewSchoolMember.objects.create_user(
            username=instance.member_email,
            member_email=instance.member_email,
            first_name=instance.first_name,
            second_name=instance.second_name,
            family_name=instance.family_name,
            password=BaseUserManager().make_random_password()
        )


# ProfileImage model, allowing a one-to-one relationship with NewSchoolMember
class ProfileImage(models.Model):
    member = models.OneToOneField(
        NewSchoolMember,
        related_name='profile_image',
        on_delete=models.CASCADE
    )
    image = models.ImageField(
        upload_to='profile_images/', 
        null=True, 
        blank=True, 
        default='http://localhost:5173/images/default.jpg'
    )

    def __str__(self):
        return f"Profile image for {self.member.username}"
