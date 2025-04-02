
import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Raymond Ncube',
      role: 'Computer Science Student',
      university: 'HIT',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      quote: 'UniApply streamlined my application process completely. I was able to apply to multiple universities with just one submission, saving me countless hours of duplicate work.',
      rating: 5
    },
    {
      id: 2,
      name: 'Godfrey tankan',
      role: 'Business Administration Student',
      university: 'NUST',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      quote: 'The platform\'s interface is intuitive and user-friendly. I particularly appreciated the real-time application tracking feature, which kept me informed throughout the entire process.',
      rating: 5
    },
    {
      id: 3,
      name: 'Tinashe Timba',
      role: 'Medicine Student',
      university: 'UZ',
      image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      quote: 'As an international student, I faced unique challenges when applying to universities. UniApply provided clear guidance for document submission and visa requirements, making a complex process manageable.',
      rating: 4
    }
  ];

  return (
    <section className="section bg-navy text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-radial from-navy-light/10 to-transparent opacity-70"></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Success Stories</h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 md:mb-16 max-w-3xl mx-auto">
            Hear from students who found their academic path through our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-white/70 text-sm">{testimonial.role}</p>
                  <p className="text-white/60 text-xs">{testimonial.university}</p>
                </div>
              </div>

              <div className="mb-6 relative">
                <Quote size={40} className="absolute -top-4 -left-2 text-teal/20" />
                <p className="text-white/90 relative z-10 leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < testimonial.rating ? 'text-gold fill-gold' : 'text-white/20'}
                  />
                ))}
                <span className="ml-2 text-white/70 text-sm">{testimonial.rating}.0</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join thousands of students who have successfully found their perfect academic match through our platform
          </p>
          <button className="px-8 py-3 bg-teal text-white rounded-md hover:bg-teal-light transition-colors inline-flex items-center justify-center">
            Start Your Application
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
