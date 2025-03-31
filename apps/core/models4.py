To add a school model that parents the `StudentClass` model, you can use model inheritance in Django. In this case, you can utilize multi-table inheritance. Here's an updated version of your code with the `School` model added:

```python
from django.contrib.auth.models import AbstractUser
from django.db import models


class Gender:
    MALE = "male"
    FEMALE = "female"
    GENDER_CHOICES = [
        (MALE, "Male"),
        (FEMALE, "Female"),
    ]


class User(AbstractUser):
    """Extends the user's table"""

    gender = models.CharField(choices=Gender.GENDER_CHOICES, max_length=10)
    is_active = models.BooleanField(default=True)
    student_class = models.ForeignKey(
        "StudentClass", on_delete=models.SET_NULL, null=True, blank=True
    )


class Subject(models.Model):
    name = models.CharField(max_length=200, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class School(models.Model):
    """School model"""

    name = models.CharField(max_length=200, unique=True)
    # Add other fields related to the school

    class Meta:
        verbose_name = "School"
        verbose_name_plural = "Schools"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StudentClass(models.Model):
    """Student class category table"""

    name = models.CharField(max_length=200, unique=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Class"
        verbose_name_plural = "Classes"
        ordering = ["name"]

    def __str__(self):
        return self.name


class AcademicTerm(models.Model):
    name = models.CharField(max_length=200, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class AcademicSession(models.Model):
    name = models.CharField(max_length=200, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
```

"""In the updated code, the `School` model is added with a `name` field and any other fields you require for the school. The `StudentClass` model is modified to have a foreign key relationship with the `School` model using `models.ForeignKey(School, on_delete=models.CASCADE)`. This establishes a parent-child relationship between the `School` model and the `StudentClass` model.

Now, each `StudentClass` instance will be associated with a specific school through the foreign key relationship. You can access the school related to a particular `StudentClass` instance using the `school` attribute.

Remember to run the necessary database migrations (`python manage.py makemigrations` and `python manage.py migrate`) after making these changes to update the database schema."""