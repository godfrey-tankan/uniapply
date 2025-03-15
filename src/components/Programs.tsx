
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Clock, Users, ChevronRight } from 'lucide-react';
import ScrollReveal from './ui/ScrollReveal';

const ProgramCard = ({ 
  title, 
  university, 
  field, 
  seats, 
  deadline, 
  popular = false,
  delay,
  index
}: { 
  title: string; 
  university: string; 
  field: string; 
  seats: number; 
  deadline: string; 
  popular?: boolean;
  delay: number;
  index: number;
}) => (
  <ScrollReveal delay={delay} direction={index % 2 === 0 ? 'right' : 'left'}>
    <div className="program-card">
      {popular && (
        <Badge className="absolute top-4 right-4 bg-university-light">Popular</Badge>
      )}
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <span className="inline-block text-xs font-medium bg-university-warm text-university-DEFAULT px-3 py-1 rounded-full">
            {field}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-1 text-university-DEFAULT">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{university}</p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span>{seats} seats</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>Closes: {deadline}</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full justify-between">
            View Program <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </ScrollReveal>
);

const Programs = () => {
  const programs = [
    {
      title: "Computer Science BSc",
      university: "MIT University",
      field: "Technology",
      seats: 150,
      deadline: "Aug 30",
      popular: true
    },
    {
      title: "Business Administration",
      university: "Harvard Business School",
      field: "Business",
      seats: 200,
      deadline: "Sep 15",
      popular: true
    },
    {
      title: "Mechanical Engineering",
      university: "Stanford University",
      field: "Engineering",
      seats: 120,
      deadline: "Aug 25",
      popular: false
    },
    {
      title: "Medicine & Surgery",
      university: "Johns Hopkins University",
      field: "Medicine",
      seats: 80,
      deadline: "Jul 31",
      popular: true
    },
    {
      title: "Environmental Science",
      university: "University of California",
      field: "Science",
      seats: 100,
      deadline: "Sep 10",
      popular: false
    },
    {
      title: "Digital Media Design",
      university: "Rhode Island School of Design",
      field: "Arts",
      seats: 75,
      deadline: "Aug 20",
      popular: false
    },
  ];

  return (
    <section id="programs" className="py-20 bg-university-warm/20">
      <div className="container px-4 mx-auto">
        <ScrollReveal>
          <h2 className="section-title text-center">Featured Programs</h2>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p className="section-subtitle text-center">
            Explore our most popular academic programs across top universities
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <ProgramCard
              key={index}
              title={program.title}
              university={program.university}
              field={program.field}
              seats={program.seats}
              deadline={program.deadline}
              popular={program.popular}
              delay={300 + index * 100}
              index={index}
            />
          ))}
        </div>

        <ScrollReveal delay={600}>
          <div className="mt-12 text-center">
            <Button className="bg-university-DEFAULT hover:bg-university-DEFAULT/90 rounded-full px-8 py-6">
              View All Programs <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Programs;
