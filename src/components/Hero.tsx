
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import ScrollReveal from './ui/ScrollReveal';

const Hero = () => {
  return (
    <div className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-b from-university-warm/30 to-white">
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-university-light/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-university-accent/5 rounded-full blur-3xl -z-10" />
      
      <div className="container px-4 mx-auto pt-16 md:pt-20 lg:pt-32 pb-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-1/2">
            <ScrollReveal delay={100}>
              <p className="text-sm font-semibold text-university-light uppercase tracking-wider mb-3">
                University Central Application System
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={300}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-university-DEFAULT leading-tight mb-6">
                Your Future <br />
                <span className="text-university-light">Begins Here</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={500}>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                One application platform for all universities. Discover programs, track applications, and secure your academic future with our streamlined application system.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={700}>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button className="bg-university-DEFAULT hover:bg-university-DEFAULT/90 text-white rounded-full py-6 px-8 text-base font-medium">
                  Start Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="rounded-full py-6 px-8 border-university-light/20 text-university-DEFAULT text-base font-medium">
                  Explore Programs
                </Button>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={900}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-university-light mr-2" />
                  <span className="text-sm text-gray-700">300+ Universities</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-university-light mr-2" />
                  <span className="text-sm text-gray-700">10,000+ Programs</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-university-light mr-2" />
                  <span className="text-sm text-gray-700">Simple Application</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-university-light mr-2" />
                  <span className="text-sm text-gray-700">24/7 Support</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
          
          <div className="w-full lg:w-1/2">
            <ScrollReveal delay={500} direction="left">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-university-DEFAULT/20 to-transparent rounded-2xl" />
                <div className="absolute inset-0 flex items-end p-8">
                  <div className="glass-card p-6 rounded-xl w-full">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-university-DEFAULT">Application Period Open</h3>
                        <p className="text-sm text-gray-600">Fall 2023 Semester</p>
                      </div>
                      <Button className="bg-university-light hover:bg-university-light/90 h-8 px-3">Apply</Button>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-university-light h-full rounded-full" style={{ width: '70%' }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Application opens</span>
                        <span>70% filled</span>
                        <span>Closing soon</span>
                      </div>
                    </div>
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="University Students"
                  className="w-full h-auto object-cover rounded-2xl shadow-xl"
                  style={{ minHeight: '500px' }}
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
