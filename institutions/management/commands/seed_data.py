from django.core.management.base import BaseCommand
from institutions.models import Institution, Faculty, Department, Program
from datetime import date

class Command(BaseCommand):
    help = 'Seed data for institutions, faculties, departments, and programs'
    Institution.objects.all().delete()
    Faculty.objects.all().delete()
    Department.objects.all().delete()
    Program.objects.all().delete()
    def handle(self, *args, **kwargs):
        # Example institution data
        institutions_data = [
            {"name": "University of Zimbabwe", "location": "Harare", "description": "A leading university in Zimbabwe."},
            {"name": "NUST", "location": "Bulawayo", "description": "A top institution for science and technology."},
            {"name": "Chinhoyi University of Technology", "location": "Chinhoyi", "description": "Known for technology-focused programs."},
            {"name": "Midlands State University", "location": "Gweru", "description": "Offers diverse academic programs."},
            {"name": "Harare Institute of Technology", "location": "Harare", "description": "Specialized in IT and business programs."},
        ]

        # Faculties, Departments, and Programs data with unique faculty codes
        faculties_data = {
            "University of Zimbabwe": [
                {"name": "Faculty of Engineering", "code": "UZ-ENG", "description": "Focuses on engineering disciplines.", "departments": [
                    {"name": "Department of Computer Science", "description": "Offers programs in computer science.", "programs": [
                        {"name": "BSc Computer Science", "code": "UZ-CSC01", "min_points_required": 12, "total_enrollment": 100, "description": "A program in computer science.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5000},
                        {"name": "MSc Computer Science", "code": "UZ-CSC02", "min_points_required": 10, "total_enrollment": 50, "description": "A master's program in computer science.", "start_date": date(2023, 9, 1), "end_date": date(2025, 6, 30), "fee": 7000}
                    ]},
                    {"name": "Department of Mechanical Engineering", "description": "Specializes in mechanical engineering.", "programs": [
                        {"name": "BEng Mechanical Engineering", "code": "UZ-MECH01", "min_points_required": 13, "total_enrollment": 120, "description": "A program in mechanical engineering.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6000},
                        {"name": "MEng Mechanical Engineering", "code": "UZ-MECH02", "min_points_required": 11, "total_enrollment": 80, "description": "Master's program in mechanical engineering.", "start_date": date(2023, 9, 1), "end_date": date(2025, 6, 30), "fee": 8000}
                    ]},
                    {"name": "Department of Civil Engineering", "description": "Offers programs in civil engineering.", "programs": [
                        {"name": "BEng Civil Engineering", "code": "UZ-CIV01", "min_points_required": 14, "total_enrollment": 110, "description": "A program in civil engineering.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6500},
                    ]},
                ]},
                {"name": "Faculty of Arts", "code": "UZ-ART", "description": "Provides arts and humanities education.", "departments": [
                    {"name": "Department of English Literature", "description": "Focuses on English and literature programs.", "programs": [
                        {"name": "BA English Literature", "code": "UZ-ENG01", "min_points_required": 10, "total_enrollment": 150, "description": "A program in English literature.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 4000},
                        {"name": "MA English Literature", "code": "UZ-ENG02", "min_points_required": 9, "total_enrollment": 70, "description": "Master's program in English literature.", "start_date": date(2023, 9, 1), "end_date": date(2025, 6, 30), "fee": 5000}
                    ]},
                    {"name": "Department of History", "description": "Offers programs in history and culture.", "programs": [
                        {"name": "BA History", "code": "UZ-HIS01", "min_points_required": 11, "total_enrollment": 140, "description": "A program in history.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 4000}
                    ]},
                ]},
                {"name": "Faculty of Social Sciences", "code": "UZ-SOC", "description": "Focuses on social sciences and humanities.", "departments": [
                    {"name": "Department of Psychology", "description": "Offers programs in psychology.", "programs": [
                        {"name": "BSc Psychology", "code": "UZ-PSY01", "min_points_required": 12, "total_enrollment": 90, "description": "A program in psychology.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5000}
                    ]},
                    {"name": "Department of Sociology", "description": "Focuses on sociology and social studies.", "programs": [
                        {"name": "BA Sociology", "code": "UZ-SOC01", "min_points_required": 10, "total_enrollment": 130, "description": "A program in sociology.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 4500}
                    ]},
                ]}
            ],
            "NUST": [
                {"name": "Faculty of Engineering", "code": "NUST-ENG", "description": "Engineering focused faculty.", "departments": [
                    {"name": "Department of Computer Engineering", "description": "Offers programs in computer engineering.", "programs": [
                        {"name": "BSc Computer Engineering", "code": "NUST-CEN01", "min_points_required": 13, "total_enrollment": 80, "description": "A program in computer engineering.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6000}
                    ]},
                    {"name": "Department of Electrical Engineering", "description": "Offers programs in electrical engineering.", "programs": [
                        {"name": "BEng Electrical Engineering", "code": "NUST-ELE01", "min_points_required": 14, "total_enrollment": 100, "description": "A program in electrical engineering.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6500}
                    ]},
                ]},
                {"name": "Faculty of Business", "code": "NUST-BUS", "description": "Focuses on business and economics.", "departments": [
                    {"name": "Department of Business Management", "description": "Offers programs in business management.", "programs": [
                        {"name": "BCom Business Management", "code": "NUST-BOM01", "min_points_required": 12, "total_enrollment": 200, "description": "A business management program.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5500}
                    ]},
                    {"name": "Department of Economics", "description": "Offers programs in economics.", "programs": [
                        {"name": "BCom Economics", "code": "NUST-ECO01", "min_points_required": 10, "total_enrollment": 160, "description": "A program in economics.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5000}
                    ]},
                ]},
                {"name": "Faculty of Applied Sciences", "code": "NUST-SCI", "description": "Focuses on applied science disciplines.", "departments": [
                    {"name": "Department of Biotechnology", "description": "Offers programs in biotechnology.", "programs": [
                        {"name": "BSc Biotechnology", "code": "NUST-BIO01", "min_points_required": 11, "total_enrollment": 100, "description": "A program in biotechnology.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5200}
                    ]},
                    {"name": "Department of Environmental Science", "description": "Offers programs in environmental science.", "programs": [
                        {"name": "BSc Environmental Science", "code": "NUST-ENV01", "min_points_required": 12, "total_enrollment": 110, "description": "A program in environmental science.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5500}
                    ]},
                ]}
            ],
            "Chinhoyi University of Technology": [
                {"name": "Faculty of Science", "code": "CUT-SCI", "description": "Science-focused faculty.", "departments": [
                    {"name": "Department of Mathematics", "description": "Offers programs in mathematics.", "programs": [
                        {"name": "BSc Mathematics", "code": "CUT-MAT01", "min_points_required": 10, "total_enrollment": 120, "description": "A program in mathematics.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5000}
                    ]},
                    {"name": "Department of Physics", "description": "Offers programs in physics.", "programs": [
                        {"name": "BSc Physics", "code": "CUT-PHY01", "min_points_required": 15, "total_enrollment": 100, "description": "A program in physics.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5200}
                    ]},
                ]},
                {"name": "Faculty of Health Sciences", "code": "CUT-HEA", "description": "Health sciences faculty.", "departments": [
                    {"name": "Department of Nursing", "description": "Offers programs in nursing.", "programs": [
                        {"name": "BSc Nursing", "code": "CUT-NUR01", "min_points_required": 12, "total_enrollment": 150, "description": "A program in nursing.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5500}
                    ]},
                    {"name": "Department of Pharmacy", "description": "Offers programs in pharmacy.", "programs": [
                        {"name": "BPharm Pharmacy", "code": "CUT-PHA01", "min_points_required": 13, "total_enrollment": 120, "description": "A program in pharmacy.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6000}
                    ]},
                ]},
            ],
            "Midlands State University": [
                {"name": "Faculty of Law", "code": "MSU-LAW", "description": "Law-focused faculty.", "departments": [
                    {"name": "Department of Commercial Law", "description": "Offers programs in commercial law.", "programs": [
                        {"name": "LLB Commercial Law", "code": "MSU-CL01", "min_points_required": 12, "total_enrollment": 80, "description": "A program in commercial law.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6000}
                    ]},
                    {"name": "Department of Criminal Law", "description": "Offers programs in criminal law.", "programs": [
                        {"name": "LLB Criminal Law", "code": "MSU-CR01", "min_points_required": 11, "total_enrollment": 70, "description": "A program in criminal law.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5500}
                    ]},
                ]},
                {"name": "Faculty of Education", "code": "MSU-EDU", "description": "Education-focused faculty.", "departments": [
                    {"name": "Department of Educational Psychology", "description": "Offers programs in educational psychology.", "programs": [
                        {"name": "BEd Educational Psychology", "code": "MSU-EDP01", "min_points_required": 10, "total_enrollment": 100, "description": "A program in educational psychology.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5000}
                    ]},
                    {"name": "Department of Curriculum Development", "description": "Offers programs in curriculum development.", "programs": [
                        {"name": "BEd Curriculum Development", "code": "MSU-CUR01", "min_points_required": 11, "total_enrollment": 90, "description": "A program in curriculum development.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5500}
                    ]},
                ]},
            ],
            "Harare Institute of Technology": [
                {"name": "Faculty of Information Technology", "code": "HIT-IT", "description": "IT-focused faculty.", "departments": [
                    {"name": "Department of Software Engineering", "description": "Offers programs in software engineering.", "programs": [
                        {"name": "BSc Software Engineering", "code": "HIT-SWE01", "min_points_required": 13, "total_enrollment": 100, "description": "A program in software engineering.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6000}
                    ]},
                    {"name": "Department of Information Systems", "description": "Offers programs in information systems.", "programs": [
                        {"name": "BSc Information Systems", "code": "HIT-IS01", "min_points_required": 12, "total_enrollment": 80, "description": "A program in information systems.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5500}
                    ]},
                ]},
                {"name": "Faculty of Business and Management", "code": "HIT-BM", "description": "Business and management faculty.", "departments": [
                    {"name": "Department of Marketing", "description": "Offers programs in marketing.", "programs": [
                        {"name": "BCom Marketing", "code": "HIT-MAR01", "min_points_required": 11, "total_enrollment": 120, "description": "A program in marketing.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 5500}
                    ]},
                    {"name": "Department of Finance", "description": "Offers programs in finance.", "programs": [
                        {"name": "BCom Finance", "code": "HIT-FIN01", "min_points_required": 12, "total_enrollment": 100, "description": "A program in finance.", "start_date": date(2023, 9, 1), "end_date": date(2027, 6, 30), "fee": 6000}
                    ]},
                ]},
            ],
        }

        # Loop over the institutions and create their faculties, departments, and programs
        for institution_data in institutions_data:
            institution, created = Institution.objects.get_or_create(**institution_data)
            
            if created:
                self.stdout.write(f"Created institution: {institution.name}")
            else:
                self.stdout.write(f"Institution {institution.name} already exists.")
            
            # Get faculties for this institution
            for faculty_data in faculties_data.get(institution.name, []):
                faculty, created = Faculty.objects.get_or_create(
                    institution=institution,
                    code=faculty_data["code"],
                    defaults={
                        'name': faculty_data["name"],
                        'description': faculty_data["description"]
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Successfully created faculty {faculty.name}"))
                else:
                    self.stdout.write(self.style.WARNING(f"Faculty {faculty.name} already exists"))
                
                # Create departments for each faculty
                for department_data in faculty_data["departments"]:
                    department, created = Department.objects.get_or_create(
                        name=department_data["name"],
                        faculty=faculty,
                        defaults={'description': department_data["description"]}
                    )
                    
                    if created:
                        self.stdout.write(f"Created department: {department.name}")
                    else:
                        self.stdout.write(f"Department {department.name} already exists.")
                    
                    # Create programs for each department
                    for program_data in department_data["programs"]:
                        program, created = Program.objects.get_or_create(
                            name=program_data["name"],
                            code=program_data["code"],
                            department=department,
                            defaults={
                                'min_points_required': program_data["min_points_required"],
                                'total_enrollment': program_data["total_enrollment"],
                                'description': program_data["description"],
                                'start_date': program_data["start_date"],
                                'end_date': program_data["end_date"],
                                'fee': program_data["fee"]
                            }
                        )
                        
                        if created:
                            self.stdout.write(f"Created program: {program.name}")
                        else:
                            self.stdout.write(f"Program {program.name} already exists.")
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data for institutions, faculties, departments, and programs!'))