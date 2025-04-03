import ProgramsSection from '@/components/ProgramsSection';

const ProgramsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-navy-dark/30">
            <ProgramsSection showAll={true} />
        </div>
    );
};

export default ProgramsPage;