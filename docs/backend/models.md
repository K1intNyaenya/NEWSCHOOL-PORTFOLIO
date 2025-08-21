### Data Models and Serializers

NewSchoolMember:
- Fields: `id`, `tenant`, `first_name`, `second_name`, `family_name`, `member_title`,
  `member_industry?`, `member_mobile?`, `employment_status? (FT|PT|CT|IN)`,
  `member_country? (KE,TZ,UG,RW,ZW,SA,MZ,GH,UAE,NO,FR,IT)`, `member_email (unique)`,
  `username (unique)`, `is_active`, `is_staff`, `is_superuser`, `role (admin|member|guest)`
- Serializer (`NewSchoolMemberSerializer`) fields: `id, first_name, second_name, family_name, member_title, member_industry, employment_history[], member_mobile, member_email, username, password(write-only), role, employment_status, member_country, tenant_id`
- Validation: unique `username`/`member_email`; `member_mobile` length ≥ 10; `employment_history` is list; `employment_status` among choices

EmploymentHistory:
- Fields: `id`, `member (FK)`, `employer`, `job_title`, `tenant(FK)`
- Serializer (`EmploymentHistorySerializer`) fields: `id, employer, job_title, tenant(read-only)`

ApplicationForm:
- Fields: `id`, `tenant(FK)`, `first_name`, `second_name`, `family_name`, `mobile_number`, `member_title`,
  `member_email`, `member_industry?`, `employment_industry`, `date_of_application(auto)`,
  `reason_for_joining?`, `referred_by_name?`, `referred_by_mobile?`, `vetted_by?`,
  `approved(bool)`, `member_joining_date?`
- Serializer (`ApplicationFormSerializer`): all fields; on approve it creates a `NewSchoolMember` and optionally emails the user

ProfileImage:
- Fields: `member(OneToOne)`, `image (upload_to=profile_images/, nullable)`

Examples:
```json
{
  "id": 12,
  "first_name": "Ada",
  "second_name": "M.",
  "family_name": "Lovelace",
  "member_title": "Engineer",
  "member_industry": "Tech",
  "employment_history": [{"employer":"ACME","job_title":"Dev"}],
  "member_mobile": "+254700000000",
  "member_email": "ada@example.com",
  "username": "ada@example.com",
  "role": "member",
  "employment_status": "FT",
  "member_country": "KE",
  "tenant_id": "TENANT123"
}
```

Management Commands:
- Create tenant: `python manage.py create_tenant <tenant_name> --tenant_domain=<domain> [--tenant_id=<uuid>]`
- Create admin: `python manage.py create_admin <username> <member_email> <password> <tenant_id>`
