
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-university-DEFAULT text-white">
      <div className="container px-4 mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-display font-semibold">UniApply</span>
            </div>
            <p className="text-white/80 mb-6">
              One platform for all your university applications. Discover, apply, and succeed with our streamlined process.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#programs" className="text-white/80 hover:text-white transition-colors">Programs</a>
              </li>
              <li>
                <a href="#statistics" className="text-white/80 hover:text-white transition-colors">Statistics</a>
              </li>
              <li>
                <a href="#news" className="text-white/80 hover:text-white transition-colors">News & Updates</a>
              </li>
              <li>
                <a href="#about" className="text-white/80 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-university-light" />
                <span className="text-white/80">123 Education Ave, Academic District, CA 90210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-university-light" />
                <a href="mailto:info@uniapply.com" className="text-white/80 hover:text-white transition-colors">
                  info@uniapply.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-university-light" />
                <a href="tel:+11234567890" className="text-white/80 hover:text-white transition-colors">
                  +1 (123) 456-7890
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Subscribe</h3>
            <p className="text-white/80 mb-4">
              Stay updated with the latest programs and application deadlines.
            </p>
            <div className="flex space-x-2">
              <Input 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-university-light"
              />
              <Button className="bg-university-light hover:bg-university-light/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/20" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            &copy; 2023 UniApply. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/60 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-white/60 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-white/60 hover:text-white text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
