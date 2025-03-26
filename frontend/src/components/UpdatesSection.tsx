
import React from 'react';
import { Bell, CalendarDays, Clock, ChevronRight } from 'lucide-react';

const UpdatesSection = () => {
  const updates = [
    {
      id: 1,
      title: 'Application Deadline Extension for Engineering Programs',
      category: 'Announcement',
      date: 'January 15, 2024',
      timeToRead: '2 min read',
      excerpt: 'The application deadline for all engineering programs has been extended by two weeks to accommodate the high volume of applicants.',
      important: true
    },
    {
      id: 2,
      title: 'New Scholarship Opportunities for International Students',
      category: 'Scholarship',
      date: 'January 12, 2024',
      timeToRead: '3 min read',
      excerpt: 'Introducing new merit-based scholarships specifically designed for international students applying to STEM programs.',
      important: false
    },
    {
      id: 3,
      title: 'Virtual Campus Tours Now Available for All Partner Universities',
      category: 'Feature Update',
      date: 'January 8, 2024',
      timeToRead: '4 min read',
      excerpt: 'Explore campus facilities and academic environments from the comfort of your home with our new virtual tour feature.',
      important: false
    },
    {
      id: 4,
      title: 'Required Document Updates for Medical School Applications',
      category: 'Important Notice',
      date: 'January 5, 2024',
      timeToRead: '5 min read',
      excerpt: 'Medical school applicants should note changes to required documentation for the upcoming application cycle.',
      important: true
    },
  ];

  const memos = [
    {
      id: 1,
      title: 'Expedited Review Process for Early Decision Applicants',
      date: 'January 18, 2024'
    },
    {
      id: 2,
      title: 'Updated Application Evaluation Criteria for Business Programs',
      date: 'January 16, 2024'
    },
    {
      id: 3,
      title: 'System Maintenance Schedule - January 20-21',
      date: 'January 14, 2024'
    },
  ];

  return (
    <section id="updates" className="section">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">Updates & Memos</h2>
          <p className="section-subtitle">
            Stay informed with the latest announcements, news, and important information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-navy mb-6 dark:text-white">Latest News</h3>
            <div className="space-y-6">
              {updates.map((update, index) => (
                <div 
                  key={update.id} 
                  className="bg-white rounded-xl p-6 shadow-md card-hover dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        update.category === 'Announcement' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        update.category === 'Important Notice' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        update.category === 'Scholarship' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {update.category}
                      </span>
                      {update.important && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          <Bell size={12} className="mr-1" />
                          Important
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-slate">
                      <CalendarDays size={14} className="mr-1" />
                      {update.date}
                      <span className="mx-2">•</span>
                      <Clock size={14} className="mr-1" />
                      {update.timeToRead}
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-navy mb-2 dark:text-white">{update.title}</h4>
                  <p className="text-slate-dark mb-4 dark:text-slate-light">{update.excerpt}</p>
                  
                  <button className="inline-flex items-center text-teal hover:text-teal-dark transition-colors">
                    <span>Read more</span>
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate text-navy rounded-md hover:bg-slate/5 transition-colors dark:bg-transparent dark:text-white dark:border-slate-dark">
                <span>View All Updates</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-navy mb-6 dark:text-white">Recent Memos</h3>
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in-right">
              <div className="p-6 bg-navy text-white">
                <h4 className="text-lg font-bold mb-1">Admin Memos</h4>
                <p className="text-white/80 text-sm">Important notices for all users</p>
              </div>
              
              <div className="divide-y divide-slate/10">
                {memos.map((memo) => (
                  <div key={memo.id} className="p-4 hover:bg-slate/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate">{memo.date}</span>
                    </div>
                    <h5 className="text-navy font-medium mt-1 dark:text-white">{memo.title}</h5>
                    <button className="mt-2 text-xs text-teal flex items-center">
                      <span>View memo</span>
                      <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-slate/5 dark:bg-navy-light/5">
                <button className="w-full py-2 text-sm text-center text-navy dark:text-white hover:underline">
                  View All Memos
                </button>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-teal to-teal-dark rounded-xl p-6 text-white shadow-md animate-fade-in-right animate-delay-200">
              <h4 className="text-xl font-bold mb-4">Application Reminder</h4>
              <p className="mb-6">Early decision applications for Fall 2024 are closing soon. Don't miss the opportunity to secure your spot.</p>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-xs mb-1">Deadline</div>
                <div className="text-lg font-bold">February 15, 2024</div>
                <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                  <div className="w-2/3 h-full bg-white"></div>
                </div>
                <div className="text-xs mt-1">30 days remaining</div>
              </div>
              <button className="w-full py-3 bg-white text-teal font-medium rounded-md mt-4 hover:bg-white/90 transition-colors">
                Submit Your Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;
