import React, { useState, useEffect } from 'react';
import { Search, Star, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

// Image dictionary
const PROGRAM_IMAGES = {
  engineering: [
    'https://images.unsplash.com/photo-1627634777217-c864268db30c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1581094794329-c811329a7274?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1581094271901-8022df4466f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  ],
  medicine: [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  ],
  science: [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  ],
  other: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  ]
};

// Helper function to get a random image
const getRandomImage = (category: string) => {
  const images = PROGRAM_IMAGES[category as keyof typeof PROGRAM_IMAGES] || PROGRAM_IMAGES.other;
  return images[Math.floor(Math.random() * images.length)];
};

interface Program {
  id: number;
  name: string;
  start_date: string;
  min_points_required: number;
  department: {
    name: string;
    faculty: {
      institution: {
        name: string;
      };
    };
  };
  image?: string;
  rating?: number;
  is_new?: boolean;
  category?: string;
  institution_name?: string;
  imageCategory?: string;
}

const ProgramsSection = ({ showAll = false }) => {
  const [filter, setFilter] = useState('all');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const getProgramCategory = (departmentName?: string) => {
    if (!departmentName) return 'other';
    const lowerName = departmentName.toLowerCase();
    if (lowerName.includes('engineering')) return 'engineering';
    if (lowerName.includes('business')) return 'business';
    if (lowerName.includes('medicine')) return 'medicine';
    if (lowerName.includes('science')) return 'science';
    return 'other';
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('/api/all-program-details/');
        const processedPrograms = response.data.map((program: Program) => ({
          ...program,
          is_new: isProgramNew(program.start_date),
          category: getProgramCategory(program.department?.name)
        }));
        setPrograms(processedPrograms);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const isProgramNew = (startDate: string) => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return new Date(startDate) > twoYearsAgo;
  };

  const filteredPrograms = filter === 'all'
    ? programs
    : programs.filter(program => program.category === filter);

  const searchedPrograms = searchQuery
    ? filteredPrograms.filter(program => {
      const searchLower = searchQuery.toLowerCase();
      return (
        program.name?.toLowerCase().includes(searchLower) ||
        program.department?.name?.toLowerCase().includes(searchLower) ||
        program.department?.faculty?.institution?.name?.toLowerCase().includes(searchLower)
      );
    })
    : filteredPrograms;

  const displayedPrograms = showAll ? searchedPrograms : searchedPrograms.slice(0, 6);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div>
      <Navbar />
      <section id="programs" className="section">
        <div className="container mx-auto">
          <Header showAll={showAll} />
          <SearchAndFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filter={filter}
            setFilter={setFilter}
          />
          <ProgramGrid
            programs={displayedPrograms}
            navigate={navigate}
          />
          {displayedPrograms.length === 0 && <NoProgramsFound />}
        </div>
      </section>
      {showAll && <Footer />}
    </div>
  );
};

const LoadingSkeleton = () => (
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

const ErrorDisplay = ({ error }: { error: string }) => (
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

const Header = ({ showAll }: { showAll: boolean }) => (
  <div className="text-center mb-16">
    <h2 className="section-title">{showAll ? 'All Programs' : 'Featured Programs'}</h2>
    <p className="section-subtitle">
      {showAll ? 'Browse through our comprehensive list of academic programs' : 'Discover our featured academic programs'}
    </p>
  </div>
);

const SearchAndFilter = ({ searchQuery, setSearchQuery, filter, setFilter }: any) => (
  <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
    <div className="relative w-full md:w-1/3">
      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate" />
      <input
        type="text"
        placeholder="Search programs, departments or institutions..."
        className="pl-10 pr-4 py-3 w-full rounded-md border border-slate/20 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <div className="w-full md:w-auto flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
      {['all', 'engineering', 'business', 'medicine', 'science'].map((category) => (
        <button
          key={category}
          onClick={() => setFilter(category)}
          className={`px-4 py-2 rounded-md whitespace-nowrap capitalize ${filter === category
            ? 'bg-teal text-white'
            : 'bg-slate/10 text-navy-light hover:bg-slate/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10'
            } transition-colors`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
);

const ProgramGrid = ({ programs, navigate }: { programs: Program[], navigate: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {programs.map((program) => (
      <ProgramCard
        key={program.id}
        program={program}
        onClick={() => navigate(`/api/program-details/${program.id}/stats`)}
      />
    ))}
  </div>
);

const NoProgramsFound = () => (
  <div className="text-center py-12">
    <p className="text-gray-500">No programs found matching your criteria</p>
  </div>
);

const ProgramCard = ({ program, onClick }: { program: Program, onClick: () => void }) => (
  <div
    className="bg-white rounded-xl overflow-hidden shadow-md card-hover dark:bg-navy-dark/50 dark:border dark:border-white/10"
    onClick={onClick}
  >
    <div className="relative h-48 overflow-hidden">
      <img
        src={program.image || getRandomImage(program.category || 'other')}
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
      <div className="space-y-1 mb-4">
        <p className="text-slate">{program.institution_name || 'Unknown Institution'}</p>
        <p className="text-slate text-sm">{program.department?.name || 'Unknown Department'}</p>
        <p className="text-slate text-sm">Points Required: {program.min_points_required}</p>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <Star size={16} className="text-gold" />
          <span className="text-sm text-slate">
            {program.rating || 'New'}
          </span>
        </div>
      </div>
      <button
        className="w-full py-2.5 bg-teal/10 text-teal rounded-md hover:bg-teal/20 transition-colors flex items-center justify-center gap-2"
      >
        <span>View Details</span>
        <ArrowRight size={16} />
      </button>
    </div>
  </div>
);

export default ProgramsSection;