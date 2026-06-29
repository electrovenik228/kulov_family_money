from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update a local development admin user"

    def handle(self, *args, **options):
        user_model = get_user_model()
        user, created = user_model.objects.update_or_create(
            username="admin",
            defaults={
                "email": "admin@kulov.money",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        user.set_password("admin12345")
        user.save()

        action = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Development admin {action}: admin / admin12345"))
