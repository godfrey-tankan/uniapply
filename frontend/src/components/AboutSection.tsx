
import React from 'react';
import { CheckCircle2, Target, Award, Users, BookOpen, Sparkles } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="section bg-gray-50 dark:bg-navy-dark/30">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="section-title">About UniApply</h2>
          <p className="section-subtitle">
            Our platform connects students to universities with a streamlined application process designed 
            for the modern educational landscape
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="animate-fade-in">
            <div className="mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-navy text-white mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4 dark:text-white">Our Vision</h3>
              <p className="text-slate-dark dark:text-slate-light mb-6 leading-relaxed">
                To revolutionize university admissions by creating a unified, accessible platform where 
                academic potential meets opportunity, regardless of background or location.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Equitable access to higher education for all students',
                  'Simplified application processes that eliminate unnecessary barriers',
                  'Data-driven admissions for more holistic candidate evaluation',
                  'Technology that connects qualified students with the right institutions'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 size={20} className="text-teal mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-dark dark:text-slate-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-teal text-white mb-6">
                <Award size={28} />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4 dark:text-white">Our Mission</h3>
              <p className="text-slate-dark dark:text-slate-light mb-6 leading-relaxed">
                To provide a seamless, transparent application experience that empowers students to showcase 
                their unique strengths while helping universities identify diverse, qualified candidates.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Build technology that makes university applications accessible to all',
                  'Create transparency in the admissions process',
                  'Reduce administrative burden for both students and institutions',
                  'Foster connections between students and programs that match their potential'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 size={20} className="text-teal mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-dark dark:text-slate-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-100">
              <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mb-6">
                <Users className="text-navy dark:text-teal" size={24} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3 dark:text-white">Student-Centered</h3>
              <p className="text-slate-dark dark:text-slate-light">
                Our platform is designed with students' needs at the core, simplifying what is often a 
                complex and stressful process.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-200">
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="text-teal" size={24} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3 dark:text-white">Educational Excellence</h3>
              <p className="text-slate-dark dark:text-slate-light">
                We partner with top universities that share our commitment to educational excellence and 
                student success.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-300">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="text-gold" size={24} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3 dark:text-white">Innovation</h3>
              <p className="text-slate-dark dark:text-slate-light">
                We constantly evolve our platform with cutting-edge technology to make the application 
                process more efficient and effective.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-navy to-navy-dark rounded-xl p-8 shadow-md text-white animate-fade-in animate-delay-400">
              <h3 className="text-xl font-bold mb-4">Our Impact</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">150+</p>
                  <p className="text-white/80 text-sm">Partner Universities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">95K+</p>
                  <p className="text-white/80 text-sm">Students Served</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-white/80 text-sm">Acceptance Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
