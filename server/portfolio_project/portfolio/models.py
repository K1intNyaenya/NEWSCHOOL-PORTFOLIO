from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.hashers import make_password

class NewSchoolMember(models.Model):
    first_name = models.CharField(max_length=45)
    second_name = models.CharField(max_length=45)
    family_name = models.CharField(max_length=45)
    member_title = models.CharField(max_length=75)
    member_years_of_experience = models.IntegerField()

    # Previous Employment Information
    previous_employer1 = models.CharField(max_length=75, blank=True, null=True)
    previous_jobtitle1 = models.CharField(max_length=75, blank=True, null=True)

    previous_employer2 = models.CharField(max_length=75, blank=True, null=True)
    previous_jobtitle2 = models.CharField(max_length=75, blank=True, null=True)

    previous_employer3 = models.CharField(max_length=75, blank=True, null=True)
    previous_jobtitle3 = models.CharField(max_length=75, blank=True, null=True)
    
    previous_employer4 = models.CharField(max_length=75, blank=True, null=True)
    previous_jobtitle4 = models.CharField(max_length=75, blank=True, null=True)

    previous_employer5 = models.CharField(max_length=75, blank=True, null=True)
    previous_jobtitle5 = models.CharField(max_length=75, blank=True, null=True)

    # Contact Information
    member_mobile = models.CharField(
        max_length=15,
        default='No Mobile',
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
