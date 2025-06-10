from institutions.models import Program
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from applications.models.models import Application
from rest_framework.permissions import  IsAuthenticated
from django.contrib.auth import get_user_model

User = get_user_model()
# Create your views here.
class ProgramRecommendationsForUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            a_level_points = user.a_level_points

            if a_level_points is None:
                return Response({"error": "A-level points not found in your profile. Please update your profile to get recommendations."},
                                status=status.HTTP_400_BAD_REQUEST)

            recommended_programs_data = []
            all_programs = Program.objects.all() # Or filter by active, etc.

            for program in all_programs:
                program_apps = Application.objects.filter(
                    program=program
                ).exclude(student__a_level_points__isnull=True) # Assuming 'student' is a foreign key to UserProfile or has a link to it

                stats = self.calculate_program_stats_for_user(program, a_level_points, program_apps)
                recommended_programs_data.append(stats)

            recommended_programs_data.sort(key=lambda x: x.get('acceptance_probability', 0), reverse=True)

            return Response(recommended_programs_data[:10], status=status.HTTP_200_OK) # Return top 10

        except User.DoesNotExist:
            return Response({"error": "User profile not found. Please complete your profile to get recommendations."},
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception("Error in ProgramRecommendationsForUserView:")
            return Response({"error": f"An internal server error occurred: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def calculate_program_stats_for_user(self, program, student_points, applications):
        total_applicants = applications.count()
        higher_points = applications.filter(student__a_level_points__gt=student_points).count()
        same_points = applications.filter(student__a_level_points=student_points).count()
        lower_points = applications.filter(student__a_level_points__lt=student_points).count()

        if total_applicants == 0:
            acceptance_prob = 0.7 if student_points >= program.min_points_required else 0.3
        else:
            if student_points > program.min_points_required:
                acceptance_prob = 0.8 - (0.3 * (higher_points / total_applicants))
            elif student_points == program.min_points_required:
                acceptance_prob = 0.5
            else:
                acceptance_prob = 0.3 * (1 - (higher_points / total_applicants))

            acceptance_prob = max(0.1, min(0.9, acceptance_prob))

        return {
            'program_id': program.id,
            'program_name': program.name,
            'program_code': program.code,
            'institution': program.department.faculty.institution.name if program.department and program.department.faculty and program.department.faculty.institution else 'N/A',
            'min_points_required': program.min_points_required,
            'student_points': student_points,
            'total_applicants': total_applicants,
            'applicants_with_higher_points': higher_points,
            'applicants_with_same_points': same_points,
            'applicants_with_lower_points': lower_points,
            'acceptance_probability': round(acceptance_prob, 2),
            'required_subjects': program.required_subjects
        }