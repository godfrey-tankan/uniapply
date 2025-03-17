
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FileText, ChevronRight } from 'lucide-react';
import ScrollReveal from './ui/ScrollReveal';

const NewsCard = ({ 
  title, 
  excerpt, 
  date, 
  category, 
  delay 
}: { 
  title: string; 
  excerpt: string; 
  date: string; 
  category: string; 
  delay: number; 
}) => (
  <ScrollReveal delay={delay}>
    <div className="glass-card p-6 rounded-xl h-full flex flex-col hover:shadow-md transition-all duration-300">
      <div className="mb-3">
        <Badge className="bg-university-light/20 text-university-DEFAULT hover:bg-university-light/30">
          {category}
        </Badge>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-university-DEFAULT">{title}</h3>
      <p className="text-sm text-gray-600 mb-4 flex-grow">{excerpt}</p>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>{date}</span>
        </div>
        <a href="#" className="flex items-center text-university-light hover:text-university-DEFAULT">
          Read More <ChevronRight className="h-4 w-4 ml-1" />
        </a>
      </div>
    </div>
  </ScrollReveal>
);

const MemoCard = ({ 
  title, 
  issuer, 
  date, 
  delay 
}: { 
  title: string; 
  issuer: string; 
  date: string; 
  delay: number; 
}) => (
  <ScrollReveal delay={delay}>
    <div className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
      <div className="p-2 rounded-md bg-university-warm mr-4">
        <FileText className="h-5 w-5 text-university-DEFAULT" />
      </div>
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 mb-2">Issued by: {issuer}</p>
        <div className="flex items-center text-xs text-gray-500">
          <CalendarDays className="h-3 w-3 mr-1" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  </ScrollReveal>
);

const News = () => {
  const newsItems = [
    {
      title: "New Medical Programs Added for 2023",
      excerpt: "Fifteen new medical programs have been added to the platform, including specialized courses in pediatrics and cardiology from top universities.",
      date: "July 15, 2023",
      category: "New Programs"
    },
    {
      title: "Application Fee Waiver for International Students",
      excerpt: "Eligible international students can now apply for application fee waivers. Check your eligibility and the required documentation.",
      date: "July 10, 2023",
      category: "Announcement"
    },
    {
      title: "Student Success Stories: Class of 2022",
      excerpt: "Read inspiring success stories from students who found their perfect university match through our platform last year.",
      date: "July 5, 2023",
      category: "Success Stories"
    }
  ];

  const memos = [
    {
      title: "Updated Admission Requirements for Engineering Programs",
      issuer: "Admissions Committee",
      date: "July 18, 2023"
    },
    {
      title: "System Maintenance Scheduled for July 25",
      issuer: "Technical Support",
      date: "July 17, 2023"
    },
    {
      title: "2023 Scholarship Opportunities Now Available",
      issuer: "Financial Aid Office",
      date: "July 16, 2023"
    },
    {
      title: "New Document Verification Process",
      issuer: "Verification Department",
      date: "July 15, 2023"
    },
    {
      title: "Changes to Application Deadlines for Fall Semester",
      issuer: "Academic Calendar Committee",
      date: "July 14, 2023"
    }
  ];

  return (
    <section id="news" className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <ScrollReveal>
              <h2 className="section-title">Latest News</h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-lg text-muted-foreground mb-10">
                Stay updated with the latest announcements and features
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item, index) => (
                <NewsCard
                  key={index}
                  title={item.title}
                  excerpt={item.excerpt}
                  date={item.date}
                  category={item.category}
                  delay={300 + index * 100}
                />
              ))}
            </div>
          </div>

          <div>
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6">Recent Memos</h2>
            </ScrollReveal>

            <div className="glass-card p-4 rounded-xl">
              <div className="space-y-2 divide-y divide-gray-100">
                {memos.map((memo, index) => (
                  <MemoCard
                    key={index}
                    title={memo.title}
                    issuer={memo.issuer}
                    date={memo.date}
                    delay={300 + index * 100}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;
