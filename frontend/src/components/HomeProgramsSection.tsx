import { ArrowRight } from 'lucide-react';
import ProgramsSection from './ProgramsSection';
import { useNavigate } from 'react-router-dom';

const HomeProgramsSection = () => {
    const navigate = useNavigate();

    return (
        <section id="programs" className="section">
            <ProgramsSection showAll={false} />
            <div className="mt-12 text-center">
                <button
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-teal text-teal rounded-md hover:bg-teal/5 transition-colors dark:bg-transparent"
                    onClick={() => navigate('/programs')}
                >
                    <span>View All Programs</span>
                    <ArrowRight size={18} />
                </button>
            </div>
        </section>
    );
};

export default HomeProgramsSection;