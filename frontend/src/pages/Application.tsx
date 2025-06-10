import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Loading from '@/components/Loading';
import SuccessPopup from '@/components/SuccessPopup';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Chatbot from '@/components/Chatbot';



const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
interface ApplicationPageProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const ApplicationPage: React.FC<ApplicationPageProps> = ({ onSuccess, onCancel }) => {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [institutions, setInstitutions] = useState([]);
    const [filteredInstitutions, setFilteredInstitutions] = useState([]);
    const [universities, setUniversities] = useState({});
    const [examBoard, setExamBoard] = useState('zimsec');
    const [olevelSubjects, setOlevelSubjects] = useState('');
    const [alevelPoints, setAlevelPoints] = useState('');
    const [eligibilityStatus, setEligibilityStatus] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [applicationData, setApplicationData] = useState({
        institution: '',
        program: '',
        personalStatement: '',
        documents: [],
    });
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pointsError, setPointsError] = useState('');
    const [showPointsError, setShowPointsError] = useState(false);
    const [existingApplications, setExistingApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('deadlines');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
            fetchInstitutions();
            fetchExistingApplications();
            if (user?.a_level_points > 0) {
                setCurrentStep(2);
            }
        } else {
            setIsAuthenticated(false);
            navigate('/login');
        }
        setLoading(false);
    }, [navigate, user]);




    useEffect(() => {
        if (applicationData.program) {
            const selectedProgram = programs.find(p => p.id == applicationData.program);
            if (selectedProgram) {
                if (user?.a_level_points < selectedProgram.min_points_required) {
                    setPointsError(`This program requires ${selectedProgram.min_points_required} points. You have ${user?.a_level_points || 0} points.`);
                } else {
                    setPointsError('');
                }

                // Check if user already applied to this program
                const alreadyApplied = existingApplications.some(app =>
                    app.program.id == applicationData.program &&
                    app.institution.id == applicationData.institution
                );

                if (alreadyApplied) {
                    setError('You have already applied to this program at this institution.');
                } else {
                    setError(null);
                }
            }
        }
    }, [applicationData.program, applicationData.institution, programs, user, existingApplications]);

    const fetchInstitutions = async () => {
        try {
            const response = await axios.get('/api/institutions/');
            setInstitutions(response.data);
            setFilteredInstitutions(response.data);

            const universitiesData = {};
            response.data.forEach(inst => {
                universitiesData[inst.id] = {
                    name: inst.name,
                    logo: inst.logo || '../../../logos/default.jpg',
                    location: inst.location || 'Unknown Location'
                };
            });
            setUniversities(universitiesData);
        } catch (error) {
            console.error('Error fetching institutions:', error);
        }
    };

    const fetchExistingApplications = async () => {
        try {
            const response = await axios.get('/api/applications/my_applications/');
            setExistingApplications(response.data);
        } catch (error) {
            console.error('Error fetching existing applications:', error);
        }
    };

    const fetchPrograms = async (institutionId) => {
        try {
            setError(null);
            const response = await axios.get(`/api/institutions/${institutionId}/programs/`);
            setPrograms(response.data);
            setFilteredPrograms(response.data);
        } catch (error) {
            console.error('Error fetching programs:', error);
            setError('Failed to load programs. Please try again.');
            setPrograms([]);
            setFilteredPrograms([]);
        }
    };

    const handleInstitutionChange = (e) => {
        const institutionId = e.target.value;
        setApplicationData({ ...applicationData, institution: institutionId, program: '' });
        if (institutionId) {
            fetchPrograms(institutionId);
        }
    };

    const handleProgramChange = (e) => {
        setApplicationData({ ...applicationData, program: e.target.value });
    };

    const handleEligibilityCheck = async () => {
        try {
            const response = await axios.post('/api/analyze-application/', {
                examBoard,
                olevelSubjects,
                alevelPoints
            });

            setEligibilityStatus(response.data.isEligible);

            if (!response.data.isEligible) {
                setError('You are not eligible for this application.');
                return;
            }

            setError(null);
            setCurrentStep(2);
        } catch (error) {
            setEligibilityStatus(false);
            setError('Failed to check eligibility. Please try again.');
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setApplicationData({ ...applicationData, documents: files });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check points requirement again before submitting
        const selectedProgram = programs.find(p => p.id == applicationData.program);
        if (selectedProgram && user?.a_level_points < selectedProgram.min_points_required) {
            setShowPointsError(true);
            return;
        }

        // Check for duplicate application
        const alreadyApplied = existingApplications.some(app =>
            app.program.id == applicationData.program &&
            app.institution.id == applicationData.institution
        );

        if (alreadyApplied) {
            setError('You have already applied to this program at this institution.');
            return;
        }

        setError(null);
        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('institution_id', applicationData.institution);
            formData.append('program_id', applicationData.program);
            formData.append('personal_statement', applicationData.personalStatement);

            applicationData.documents.forEach((file) => {
                formData.append('documents', file);
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            };

            await axios.post('/api/applications/', formData, config);

            setShowSuccessPopup(true);
            setTimeout(() => {
                navigate(`/api/program-details/${applicationData.program}/stats`);
            }, 2000);

        } catch (error) {
            console.error('Error submitting application:', error);
            let errorMessage = 'Failed to submit application. Please try again.';

            if (error.response?.data) {
                // Handle duplicate application error from backend
                console.log('Error response data:', error.response);
                if (error.response.data?.__all__?.includes('already exists') || error.data?.includes('(length')) {
                    errorMessage = 'You have already applied to this program at this institution.';
                    return;
                } else {
                    errorMessage = 'error submitting application.';
                }
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const isSubmitDisabled = () => {
        const alreadyApplied = existingApplications.some(app =>
            app.program.id == applicationData.program &&
            app.institution.id == applicationData.institution
        );

        return isSubmitting ||
            !applicationData.institution &&
            !applicationData.program &&
            !applicationData.personalStatement &&
            alreadyApplied;
    };

    if (loading) return <Loading />;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl">Please login to access the application form.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <main className="flex-grow container mx-auto px-4 py-8">

                <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-xl border border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 flex items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    {showSuccessPopup && (
                        <SuccessPopup
                            message="Application submitted successfully! Redirecting to program details..."
                            onClose={() => setShowSuccessPopup(false)}
                        />
                    )}

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">University Application</h1>
                        <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="flex justify-between items-center mb-8 relative">
                        <div className={`flex flex-col items-center ${currentStep === 1 ? 'text-teal-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-teal-100 border-2 border-teal-500' : 'bg-gray-100'}`}>
                                <span className="font-medium">1</span>
                            </div>
                            <span className="text-sm mt-2">Eligibility</span>
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
                        <div className={`flex flex-col items-center ${currentStep === 2 ? 'text-teal-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-teal-100 border-2 border-teal-500' : 'bg-gray-100'}`}>
                                <span className="font-medium">2</span>
                            </div>
                            <span className="text-sm mt-2">Details</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {showPointsError && pointsError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {pointsError}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">Your education Background:</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Board</label>
                                    <div className="relative">
                                        <select
                                            value={examBoard}
                                            onChange={(e) => setExamBoard(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                                        >
                                            <option value="zimsec">ZIMSEC</option>
                                            <option value="hexco">HEXCO</option>
                                            <option value="cambridge">Cambridge</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">O'Level Passed Subjects</label>
                                    <input
                                        type="number"
                                        value={olevelSubjects}
                                        onChange={(e) => setOlevelSubjects(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Number of passed subjects"
                                        min="1"
                                        max="20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">A'Level Points</label>
                                    <input
                                        type="number"
                                        value={alevelPoints}
                                        onChange={(e) => setAlevelPoints(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Total points obtained"
                                        min="1"
                                        max="48"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleEligibilityCheck}
                                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">Application Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                                    <div className="relative">

                                        <select
                                            name="institution"
                                            onChange={handleInstitutionChange}
                                            value={applicationData.institution}
                                            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                                            required
                                        >
                                            <option value="">-- Select Institution --</option>
                                            {filteredInstitutions.map(inst => (
                                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {applicationData.institution && universities[applicationData.institution] && (
                                        <div className="mt-3 flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div>
                                                <span className="text-sm font-medium text-teal-700">
                                                    Selected Institution:
                                                </span>
                                                <div className="mt-1 border-l-4 border-teal-500 pl-2">
                                                    <p className="font-medium text-gray-600">
                                                        {universities[applicationData.institution].name}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {universities[applicationData.institution].location}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                                    <div className="relative">

                                        <select
                                            name="program"
                                            onChange={handleProgramChange}
                                            value={applicationData.program}
                                            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white disabled:bg-gray-50"
                                            required
                                            disabled={!applicationData.institution}
                                        >
                                            <option value="">-- Select Program --</option>
                                            {filteredPrograms.map(prog => (
                                                <option key={prog.id} value={prog.id}>
                                                    {prog.name} (Requires: {prog.min_points_required} points)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {pointsError && applicationData.program && (
                                        <div className="mt-2 text-sm text-red-600">
                                            {pointsError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Statement</label>
                                <textarea
                                    name="personalStatement"
                                    onChange={(e) => setApplicationData({ ...applicationData, personalStatement: e.target.value })}
                                    value={applicationData.personalStatement}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    rows={6}
                                    required
                                    placeholder="Explain why you're a good candidate for this program (minimum 200 words)..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 200 words</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-300 transition-colors">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div className="mt-4 flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none">
                                            <span>Upload files</span>
                                            <input
                                                type="file"
                                                name="documents"
                                                onChange={handleFileChange}
                                                className="sr-only"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                multiple
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, JPG, or PNG up to 10MB each</p>

                                    {applicationData.documents.length > 0 && (
                                        <div className="mt-4 text-left">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                                            <ul className="space-y-1">
                                                {applicationData.documents.map((file, index) => (
                                                    <li key={index} className="text-sm text-gray-600 flex items-center">
                                                        <svg className="h-4 w-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {file.name} ({Math.round(file.size / 1024)} KB)
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-teal-600 h-2.5 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                    <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                                </div>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 gap-4">
                                {(!user?.a_level_points && currentStep === 2) && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                    disabled={isSubmitDisabled()}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
            <Chatbot />
            <Footer />
        </div>
    );
};

export default ApplicationPage;