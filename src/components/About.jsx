
import React, { useState } from 'react';
import { BookOpen, Target, Users, Award } from 'lucide-react';
import ScrollReveal from './ui/ScrollReveal';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <section id="about" className="py-20 bg-blue-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">About UniApply</h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Transforming the university application experience through innovation and accessibility
            </p>
          </ScrollReveal>

          <div className="mt-10">
            <ScrollReveal delay={300}>
              <div className="grid w-full grid-cols-4 bg-white rounded-lg p-1 mb-6">
                <button 
                  onClick={() => setActiveTab('mission')}
                  className={`py-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'mission' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  Mission
                </button>
                <button 
                  onClick={() => setActiveTab('vision')}
                  className={`py-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'vision' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  Vision
                </button>
                <button 
                  onClick={() => setActiveTab('values')}
                  className={`py-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'values' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  Values
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`py-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'team' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  Team
                </button>
              </div>
            </ScrollReveal>

            {activeTab === 'mission' && (
              <ScrollReveal delay={400} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-blue-50 mr-4">
                    <Target className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-blue-900">Our Mission</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      To democratize access to higher education by creating a unified, intuitive platform that simplifies the university application process. We aim to reduce barriers to education by connecting students with institutions that align with their academic goals and potential.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      UniApply is committed to transforming the traditional application experience through technology, personalization, and support, ensuring every student can confidently navigate their educational journey.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button className="px-6 py-2 border border-blue-200 rounded-full text-blue-700 hover:bg-blue-50">Learn More</button>
                </div>
              </ScrollReveal>
            )}

            {activeTab === 'vision' && (
              <ScrollReveal delay={400} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-blue-50 mr-4">
                    <BookOpen className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-blue-900">Our Vision</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We envision a future where every aspiring student, regardless of background or location, has equal opportunity to pursue higher education. UniApply aims to be the global standard for university applications, recognized for its user-centered design, comprehensive institutional network, and commitment to educational equity.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By 2030, we aim to connect 10 million students annually with their ideal educational paths, while continuously innovating to address evolving needs in the higher education landscape.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button className="px-6 py-2 border border-blue-200 rounded-full text-blue-700 hover:bg-blue-50">Learn More</button>
                </div>
              </ScrollReveal>
            )}

            {activeTab === 'values' && (
              <ScrollReveal delay={400} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-blue-50 mr-4">
                    <Award className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-blue-900">Our Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-blue-700">Accessibility</h4>
                        <p className="text-sm text-gray-600">Making education pathways accessible to all students regardless of background.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-blue-700">Innovation</h4>
                        <p className="text-sm text-gray-600">Continuously improving our platform with cutting-edge technology.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-blue-700">Integrity</h4>
                        <p className="text-sm text-gray-600">Maintaining the highest standards of honesty and ethical conduct.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-blue-700">Student-Centered</h4>
                        <p className="text-sm text-gray-600">Putting student needs and experiences at the heart of everything we do.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button className="px-6 py-2 border border-blue-200 rounded-full text-blue-700 hover:bg-blue-50">Learn More</button>
                </div>
              </ScrollReveal>
            )}

            {activeTab === 'team' && (
              <ScrollReveal delay={400} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-blue-50 mr-4">
                    <Users className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-blue-900">Our Team</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      UniApply is powered by a diverse team of education experts, technologists, and former university admissions officers dedicated to transforming the application experience.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="text-center">
                          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-2"></div>
                          <h4 className="text-sm font-medium">Team Member {i}</h4>
                          <p className="text-xs text-gray-500">Role {i}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button className="px-6 py-2 border border-blue-200 rounded-full text-blue-700 hover:bg-blue-50">View All</button>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
