
import React, { useState } from 'react';
import { Search, BookOpen, Users, Star, ArrowRight, Filter } from 'lucide-react';

const ProgramsSection = () => {
  const [filter, setFilter] = useState('all');
  
  const programs = [
    {
      id: 1,
      name: 'Computer Science & AI',
      university: 'Cambridge Technical University',
      category: 'engineering',
      applicants: 1245,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      new: true
    },
    {
      id: 2,
      name: 'Business Administration',
      university: 'National Business School',
      category: 'business',
      applicants: 945,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      new: false
    },
    {
      id: 3,
      name: 'Mechanical Engineering',
      university: 'Institute of Technology',
      category: 'engineering',
      applicants: 732,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      new: false
    },
    {
      id: 4,
      name: 'Medicine & Healthcare',
      university: 'Medical Sciences Academy',
      category: 'medicine',
      applicants: 1532,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      new: true
    },
    {
      id: 5,
      name: 'Environmental Science',
      university: 'Global Environmental Institute',
      category: 'science',
      applicants: 612,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      new: true
    },
    {
      id: 6,
      name: 'Digital Marketing',
      university: 'Creative Media University',
      category: 'business',
      applicants: 875,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      new: false
    },
  ];

  const filteredPrograms = filter === 'all' 
    ? programs 
    : programs.filter(program => program.category === filter);

  return (
    <section id="programs" className="section">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">Explore Programs</h2>
          <p className="section-subtitle">
            Discover the wide range of academic programs available across our partner universities
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div className="relative w-full md:w-1/3">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate" />
            <input
              type="text"
              placeholder="Search programs..."
              className="pl-10 pr-4 py-3 w-full rounded-md border border-slate/20 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
            />
          </div>
          
          <div className="w-full md:w-auto flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === 'all' 
                ? 'bg-teal text-white' 
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
              } transition-colors`}
            >
              All Programs
            </button>
            <button 
              onClick={() => setFilter('engineering')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === 'engineering' 
                ? 'bg-teal text-white' 
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
              } transition-colors`}
            >
              Engineering
            </button>
            <button 
              onClick={() => setFilter('business')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === 'business' 
                ? 'bg-teal text-white' 
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
              } transition-colors`}
            >
              Business
            </button>
            <button 
              onClick={() => setFilter('medicine')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === 'medicine' 
                ? 'bg-teal text-white' 
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
              } transition-colors`}
            >
              Medicine
            </button>
            <button 
              onClick={() => setFilter('science')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === 'science' 
                ? 'bg-teal text-white' 
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
              } transition-colors`}
            >
              Science
            </button>
            <button className="p-2 rounded-md bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program, index) => (
            <div 
              key={program.id} 
              className="bg-white rounded-xl overflow-hidden shadow-md card-hover dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={program.image} 
                  alt={program.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                {program.new && (
                  <div className="absolute top-4 left-4 bg-teal text-white text-xs font-bold px-2 py-1 rounded">
                    NEW PROGRAM
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy mb-2 dark:text-white">{program.name}</h3>
                <p className="text-slate mb-4">{program.university}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-slate" />
                    <span className="text-sm text-slate">{program.applicants} applicants</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-gold" />
                    <span className="text-sm text-slate">{program.rating}/5.0</span>
                  </div>
                </div>
                
                <button className="w-full py-2.5 bg-teal/10 text-teal rounded-md hover:bg-teal/20 transition-colors flex items-center justify-center gap-2">
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-teal text-teal rounded-md hover:bg-teal/5 transition-colors dark:bg-transparent">
            <span>View All Programs</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
