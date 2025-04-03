import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Star, ArrowRight, Filter, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

const ProgramsSection = () => {
  const [filter, setFilter] = useState('all');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        console.log("Attempting to fetch programs...");
        const response = await axios.get('/api/all-program-details/');
        console.log("Response received:", response);
        setPrograms(response.data);
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          response: err.response,
          config: err.config
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const filteredPrograms = filter === 'all'
    ? programs
    : programs.filter(program => program.category === filter);

  const searchedPrograms = searchQuery
    ? filteredPrograms.filter(program =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.department.faculty.institution.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : filteredPrograms;

  if (loading) {
    return (
      <section id="programs" className="section">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md dark:bg-navy-dark/50">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between mb-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="programs" className="section">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 p-4 rounded-lg max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Error loading programs: {error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${filter === 'all'
                ? 'bg-teal text-white'
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
                } transition-colors`}
            >
              All Programs
            </button>
            <button
              onClick={() => setFilter('engineering')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${filter === 'engineering'
                ? 'bg-teal text-white'
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
                } transition-colors`}
            >
              Engineering
            </button>
            <button
              onClick={() => setFilter('business')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${filter === 'business'
                ? 'bg-teal text-white'
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
                } transition-colors`}
            >
              Business
            </button>
            <button
              onClick={() => setFilter('medicine')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${filter === 'medicine'
                ? 'bg-teal text-white'
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
                } transition-colors`}
            >
              Medicine
            </button>
            <button
              onClick={() => setFilter('science')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${filter === 'science'
                ? 'bg-teal text-white'
                : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
                } transition-colors`}
            >
              Science
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {searchedPrograms.map((program, index) => (
            <div
              key={program.id}
              className="bg-white rounded-xl overflow-hidden shadow-md card-hover dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={program.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'}
                  alt={program.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                {program.is_new && (
                  <div className="absolute top-4 left-4 bg-teal text-white text-xs font-bold px-2 py-1 rounded">
                    NEW PROGRAM
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy mb-2 dark:text-white">{program.name}</h3>
                <p className="text-slate mb-4">{program.department.faculty.institution.name}</p>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-slate" />
                    <span className="text-sm text-slate">{program.total_enrollment} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-gold" />
                    <span className="text-sm text-slate">
                      {program.rating || 'New'}
                    </span>
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

        {searchedPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No programs found matching your criteria</p>
          </div>
        )}

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