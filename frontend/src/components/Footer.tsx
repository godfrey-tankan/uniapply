
import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-white pt-16 pb-6">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap size={32} className="text-teal" />
              <span className="text-xl font-bold">UniApply</span>
            </div>
            <p className="text-white/70 mb-6">
              Simplifying university applications and connecting students with their ideal academic programs since 2018.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-teal hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-teal hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-teal hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-teal hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Programs</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Universities</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Application Guide</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Success Stories</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Scholarships</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Blog</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-teal transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="text-teal mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white/70">123 Education Avenue, Academic District, ED 12345</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-teal mr-3 flex-shrink-0" />
                <span className="text-white/70">+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-teal mr-3 flex-shrink-0" />
                <span className="text-white/70">support@uniapply.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-3">Subscribe to our newsletter</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-teal"
                />
                <button className="px-4 py-2 bg-teal text-white rounded-r-md hover:bg-teal-dark transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} UniApply. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
