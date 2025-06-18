
import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 px-6 overflow-hidden bg-hero-pattern">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-radial from-transparent to-teal/5 opacity-70"></div>

      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col max-w-xl animate-fade-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-6">
            <CheckCircle size={16} className="mr-2" />
            <span>Application Season 2025 Is Now Open</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy dark:text-white leading-tight mb-6">
            Your Gateway to <span className="text-shimmer">Academic Excellence</span>
          </h1>

          <p className="text-lg text-slate-dark dark:text-slate-light mb-8">
            One application, multiple universities. Simplify your journey to higher education with our unified application platform connecting you to top universities nationwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className="px-8 py-3 bg-teal text-white rounded-md hover:bg-teal-dark transition-colors flex items-center justify-center">
              <Link to="/dashboard" >
                Start Application
              </Link>
              <ArrowRight size={18} className="ml-2" />
            </button>
            <button className="px-8 py-3 bg-white border border-slate text-navy rounded-md hover:bg-slate/5 transition-colors dark:bg-transparent dark:text-white"
              onClick={() => window.scrollTo({ top: document.getElementById('programs')?.offsetTop || 0, behavior: 'smooth' })}
            >
              Explore Programs
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">
                94%
              </div>
              <div className="w-10 h-10 rounded-full bg-navy-light/30 flex items-center justify-center text-navy-light text-xs dark:bg-white/20 dark:text-white">
                87%
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/70 flex items-center justify-center text-navy-light text-xs">
                91%
              </div>
            </div>
            <p className="text-sm text-slate">
              <span className="font-medium">Over 90%</span> application success rate for top programs
            </p>
          </div>
        </div>

        <div className="relative animate-fade-in-right">
          <div className="aspect-square max-w-md mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal to-navy-light opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute inset-4 bg-white rounded-3xl shadow-xl overflow-hidden glass animate-float">
              <div className="h-10 bg-slate/10 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-8 w-3/4 bg-slate/10 rounded-md mb-6"></div>
                <div className="space-y-4">
                  <div className="h-14 bg-teal/10 rounded-md w-full"></div>
                  <div className="h-14 bg-slate/10 rounded-md w-full"></div>
                  <div className="h-14 bg-slate/10 rounded-md w-full"></div>
                  <div className="h-10 bg-teal rounded-md w-1/3 mt-6"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-10 -right-8 bg-white rounded-lg p-4 shadow-lg glass animate-float animate-delay-200">
              <div className="w-40 h-24 flex flex-col justify-between">
                <div className="text-xs text-slate">Applications Status</div>
                <div className="text-2xl font-bold text-navy dark:text-slate-dark">2,578</div>
                <div className="w-full h-1.5 bg-slate/20 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-teal"></div>
                </div>
                <div className="text-xs text-teal">+18% from last year</div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 bg-white rounded-lg p-4 shadow-lg glass animate-float animate-delay-300">
              <div className="w-40 h-24 flex flex-col justify-between">
                <div className="text-xs text-slate">Acceptance Rate</div>
                <div className="text-2xl font-bold text-navy dark:text-slate-dark">87%</div>
                <div className="text-xs text-green-500">Higher than national average</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
