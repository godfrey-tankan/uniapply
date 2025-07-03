# applications/services/notifications.py
from django.contrib.auth import get_user_model
from applications.models.models import Notification, Application
from django.utils import timezone

User = get_user_model()

def send_notification(user, title, message, notification_type):
    """
    Send a notification to a user
    """
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False
    )
    
    # In a real app, you would also send email/push notifications here

def notify_students_of_new_program(program):
    """
    Notify students who might be interested in a new program
    """
    # Get students who applied to similar programs or have matching criteria
    students = User.objects.filter(
        is_student=True,
        applications__program__department=program.department
    ).distinct()
    
    for student in students:
        send_notification(
            user=student,
            title="New Program Available",
            message=f"A new program {program.name} has been added that might interest you",
            notification_type="PROGRAM_ADDED"
        )

def notify_students_of_deadline(deadline):
    """
    Notify students with pending applications about a new deadline
    """
    students = User.objects.filter(
        is_student=True,
        applications__status='Pending',
        applications__program__department__faculty__institution=deadline.institution
    ).distinct()
    
    for student in students:
        send_notification(
            user=student,
            title="Important Deadline",
            message=f"New deadline for {deadline.title}: {deadline.date}",
            notification_type="DEADLINE"
        )