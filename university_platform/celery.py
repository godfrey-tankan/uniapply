import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_platform.settings')

app = Celery('university_platform')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()
