
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Target, Users, Award } from 'lucide-react';
import ScrollReveal from './ui/ScrollReveal';

const About = () => {
  return (
    <section id="about" className="py-20 bg-university-warm/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="section-title text-center">About UniApply</h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="section-subtitle text-center">
              Transforming the university application experience through innovation and accessibility
            </p>
          </ScrollReveal>

          <Tabs defaultValue="mission" className="mt-10">
            <ScrollReveal delay={300}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="mission" className="data-[state=active]:bg-university-light data-[state=active]:text-white">
                  Mission
                </TabsTrigger>
                <TabsTrigger value="vision" className="data-[state=active]:bg-university-light data-[state=active]:text-white">
                  Vision
                </TabsTrigger>
                <TabsTrigger value="values" className="data-[state=active]:bg-university-light data-[state=active]:text-white">
                  Values
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-university-light data-[state=active]:text-white">
                  Team
                </TabsTrigger>
              </TabsList>
            </ScrollReveal>

            <TabsContent value="mission" className="mt-6">
              <ScrollReveal delay={400} className="glass-card p-8 rounded-xl">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-university-warm mr-4">
                    <Target className="h-6 w-6 text-university-DEFAULT" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-university-DEFAULT">Our Mission</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      To democratize access to higher education by creating a unified, intuitive platform that simplifies the university application process. We aim to reduce barriers to education by connecting students with institutions that align with their academic goals and potential.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      UniApply is committed to transforming the traditional application experience through technology, personalization, and support, ensuring every student can confidently navigate their educational journey.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button variant="outline" className="rounded-full">Learn More</Button>
                </div>
              </ScrollReveal>
            </TabsContent>

            <TabsContent value="vision" className="mt-6">
              <ScrollReveal delay={400} className="glass-card p-8 rounded-xl">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-university-warm mr-4">
                    <BookOpen className="h-6 w-6 text-university-DEFAULT" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-university-DEFAULT">Our Vision</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We envision a future where every aspiring student, regardless of background or location, has equal opportunity to pursue higher education. UniApply aims to be the global standard for university applications, recognized for its user-centered design, comprehensive institutional network, and commitment to educational equity.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By 2030, we aim to connect 10 million students annually with their ideal educational paths, while continuously innovating to address evolving needs in the higher education landscape.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button variant="outline" className="rounded-full">Learn More</Button>
                </div>
              </ScrollReveal>
            </TabsContent>

            <TabsContent value="values" className="mt-6">
              <ScrollReveal delay={400} className="glass-card p-8 rounded-xl">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-university-warm mr-4">
                    <Award className="h-6 w-6 text-university-DEFAULT" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-university-DEFAULT">Our Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-university-DEFAULT">Accessibility</h4>
                        <p className="text-sm text-gray-600">Making education pathways accessible to all students regardless of background.</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-university-DEFAULT">Innovation</h4>
                        <p className="text-sm text-gray-600">Continuously improving our platform with cutting-edge technology.</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-university-DEFAULT">Integrity</h4>
                        <p className="text-sm text-gray-600">Maintaining the highest standards of honesty and ethical conduct.</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold mb-2 text-university-DEFAULT">Student-Centered</h4>
                        <p className="text-sm text-gray-600">Putting student needs and experiences at the heart of everything we do.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button variant="outline" className="rounded-full">Learn More</Button>
                </div>
              </ScrollReveal>
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <ScrollReveal delay={400} className="glass-card p-8 rounded-xl">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-full bg-university-warm mr-4">
                    <Users className="h-6 w-6 text-university-DEFAULT" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-university-DEFAULT">Our Team</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      UniApply is powered by a diverse team of education experts, technologists, and former university admissions officers dedicated to transforming the application experience.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="text-center">
                          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-2" />
                          <h4 className="text-sm font-medium">Team Member {i}</h4>
                          <p className="text-xs text-gray-500">Role {i}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button variant="outline" className="rounded-full">View All</Button>
                </div>
              </ScrollReveal>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default About;
