
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GraduationCap, Menu, X, Search } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4',
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-university-DEFAULT" />
          <span className="text-xl font-display font-semibold text-university-DEFAULT">UniApply</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#programs" className="link-underline text-sm font-medium text-gray-800">Programs</a>
          <a href="#statistics" className="link-underline text-sm font-medium text-gray-800">Statistics</a>
          <a href="#news" className="link-underline text-sm font-medium text-gray-800">News & Memos</a>
          <a href="#about" className="link-underline text-sm font-medium text-gray-800">About</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button className="bg-university-DEFAULT hover:bg-university-DEFAULT/90">
            Apply Now
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {isMobileMenuOpen && (
          <div className="fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-md shadow-md p-4 border-t border-gray-100 animate-fade-in z-40 md:hidden">
            <nav className="flex flex-col gap-4 mb-4">
              <a 
                href="#programs" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Programs
              </a>
              <a 
                href="#statistics" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Statistics
              </a>
              <a 
                href="#news" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News & Memos
              </a>
              <a 
                href="#about" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
            </nav>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button className="bg-university-DEFAULT hover:bg-university-DEFAULT/90">
                Apply Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
