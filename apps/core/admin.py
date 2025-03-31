from django.contrib import admin
from django.apps import apps
from . import models
app_models = apps.get_models()

for model in app_models:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
