from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from applications.models.models import ActivityLog
from applications.models.models import Application
from django.core.mail import send_mail
from celery import shared_task

@shared_task
def send_status_email(application, request):
    """
    Send email notification when application status changes
    """
    user = application.student
    context = {
        'user': user,
        'application': application,
        'application_link': request.build_absolute_uri(
            f'/applications/{application.id}/'
        )
    }
    
    subject = f"Application Status Update: {application.program.name}"
    
    # Render HTML content
    html_content = render_to_string(
        'emails/application_status_change.html', 
        context
    )
    
    # Create text version
    text_content = strip_tags(html_content)
    
    # Create email
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    
    try:
        email.send()
        # Log the email sending
        ActivityLog.objects.create(
            user=request.user,
            action='MESSAGE',
            description=f'Sent status email to {user.email}',
            metadata={
                'application_id': application.id,
                'status': application.status
            }
        )
    except Exception as e:
        # Log email sending failure
        ActivityLog.objects.create(
            user=request.user,
            action='ERROR',
            description=f'Failed to send status email to {user.email}',
            metadata={
                'application_id': application.id,
                'error': str(e)
            }
        )

@shared_task
def send_application_confirmation(application, request):
    """
    Send email when application is first created
    """
    # Similar implementation to send_status_email
 
    # using application_created.html template
@shared_task
def send_deadline_event(request, deadline):
    """
    Send email message for new deadlines
    """
    user = request.user
    applicants = Application.objects.filter(
        program__department__faculty__institution=deadline.institution,
        status__in=['Pending', 'Deferred', 'Waitlisted']
    )
    for application in applicants:
        message = (
            f"Dear {application.student.name},\n\n"
            f"Please be informed that a new deadline {deadline.title} has been set.\n"
            f"Deadline Date: {deadline.date}\n"
            f"Description: {deadline.description}\n\n"
        )
        context = {
            'title': 'New Deadline Notification',
            'message': message,
        }


        # Render HTML content
        html_content = render_to_string(
            'emails/notifications.html', 
            context
        )
        
        # Create text version
        text_content = strip_tags(html_content)
        
        # Create email
        email = EmailMultiAlternatives(
            subject='New Deadline Notification',
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        
        try:
            email.send()
            # Log the email sending
            ActivityLog.objects.create(
                user=request.user,
                action='MESSAGE',
                description=f'Sent deadline reminder to {user.email}',
                metadata={
                    'application_id': application.id,
                    'status': application.status
                }
            )
        except Exception as e:
            # Log email sending failure
            ActivityLog.objects.create(
                user=request.user,
                action='ERROR',
                description=f'Failed to send deadline reminder to {user.email}',
                metadata={
                    'application_id': application.id,
                    'error': str(e)
                }
            )

@shared_task
def send_document_request_email(application, documents_requested, request):
    student = application.student
    enroller = request.user

    subject = "Document Request for Your Application"
    from_email = "noreply@university.com"
    to = [student.email]

    context = {
        "student_name": student.name,
        "enroller_name": enroller.name,
        "documents_requested": documents_requested
    }

    text_content = f"{enroller.name} has requested the following documents: {documents_requested}"
    html_content = render_to_string("emails/document_request.html", context)

    email = EmailMultiAlternatives(subject, text_content, from_email, to)
    email.attach_alternative(html_content, "text/html")
    email.send()
    
@shared_task
def send_program_alternative_email(application, alternative_program, request):
    subject = f"Alternative Program Offer for Your Application"
    html_message = render_to_string(
        'emails/alternative_offer.html',
        {
            'student_name': application.student.username,
            'application': application,
            'program_name':application.program.name,
            'alternative_program': alternative_program,
            'enroller_name': request.user.name
        }
    )
    plain_message = strip_tags(html_message)
    send_mail(
        subject,
        plain_message,
        'noreply@universityportal.com',
        [application.student.email],
        html_message=html_message
    )

@shared_task
def send_application_email(application, request, email_type='status_change'):
    """
    Generic function to send different types of application emails
    """
    templates = {
        'status_change': 'emails/application_status_change.html',
        'created': 'emails/application_created.html',
        'deferred': 'emails/application_deferred.html',
        'waitlisted': 'emails/application_waitlisted.html'
    }
    
    subjects = {
        'status_change': f"Application Status Update: {application.program.name}",
        'created': f"Application Received: {application.program.name}",
        'deferred': f"Application Decision Pending: {application.program.name}",
        'waitlisted': f"Application Waitlisted: {application.program.name}"
    }
    
    user = application.student
    context = {
        'user': user.name,
        'application': application,
        'application_link': request.build_absolute_uri(
            f'/applications/{application.id}/'
        ),
        'email_type': email_type
    }
    
    # Render HTML content
    html_content = render_to_string(templates[email_type], context)
    
    # Create text version
    text_content = strip_tags(html_content)
    
    # Create email
    email = EmailMultiAlternatives(
        subject=subjects[email_type],
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    
    try:
        email.send()
        # Log the email sending
        ActivityLog.objects.create(
            user=request.user,
            action='MESSAGE',
            description=f'Sent {email_type} email to {user.email}',
            metadata={
                'application_id': application.id,
                'status': application.status,
                'email_type': email_type
            }
        )
        return True
    except Exception as e:
        # Log email sending failure
        ActivityLog.objects.create(
            user=request.user,
            action='ERROR',
            description=f'Failed to send {email_type} email to {user.email}',
            metadata={
                'application_id': application.id,
                'error': str(e),
                'email_type': email_type
            }
        )
        return False