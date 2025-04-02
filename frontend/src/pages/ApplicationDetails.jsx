import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft, FileText, BarChart2, Users, CheckCircle, Clock,
    XCircle, AlertCircle, ChevronRight, Sparkles, School, Target
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const ApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [programRequirements, setProgramRequirements] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);


    const token = localStorage.getItem('authToken');
    const fetchRecommendations = async (programId, departmentId, studentPoints) => {
        try {
            setLoadingRecommendations(true);

            console.log('Fetching recommendations with:', {
                programId,
                departmentId,
                studentPoints
            });

            const response = await axios.get(
                `/api/programs/${programId}/recommendations/`,
                {
                    params: {
                        points: studentPoints,
                        department_id: departmentId
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Recommendations response:', response.data);
            setRecommendations(response.data);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const fetchApplicationData = async () => {
        try {
            setLoading(true);
            // 1. Fetch application details
            const appResponse = await axios.get(`/api/applications/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setApplication(appResponse.data);
            console.log('Application data:', appResponse.data);

            // 2. Fetch program requirements
            const programId = appResponse.data.program.id;
            const requirementsResponse = await axios.get(
                `/api/programs/${programId}/requirements/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setProgramRequirements(requirementsResponse.data);

            // 3. Fetch recommendations if student has points
            console.log(appResponse.data.student.a_level_points);
            if (appResponse.data.student?.a_level_points) {
                console.log('Student has points, fetching recommendations...', appResponse.data);
                await fetchRecommendations(
                    programId,
                    appResponse.data.department.id,
                    appResponse.data.student.a_level_points
                );
            } else {
                console.log('No student points available, skipping recommendations');
            }

        } catch (err) {
            console.error('Error fetching application data:', err);
            setError(err.response?.data?.message || 'Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicationData();
    }, [id]);



    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'Rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderProbabilityBadge = (probability) => {
        const percentage = Math.round(probability * 100);
        let colorClass = '';

        if (probability >= 0.7) colorClass = 'bg-green-100 text-green-800';
        else if (probability >= 0.4) colorClass = 'bg-yellow-100 text-yellow-800';
        else colorClass = 'bg-red-100 text-red-800';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {percentage}% chance
            </span>
        );
    };

    const renderRecommendations = () => {
        if (loadingRecommendations) {
            return (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                </div>
            );
        }

        if (!recommendations) {
            return (
                <div className="text-center py-4 text-gray-500">
                    <p>No recommendations available</p>
                    <p className="text-sm mt-1">Ensure your A-Level points are entered in your profile</p>
                </div>
            );
        }


        return (
            <div className="space-y-6">
                {/* Current Program Stats */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-teal-600" />
                        <h4 className="font-medium">Your Current Choice</h4>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className="font-medium">{recommendations.current_program.program_name}</h5>
                                <p className="text-sm text-gray-600">{recommendations.current_program.institution}</p>
                            </div>
                            {renderProbabilityBadge(recommendations.current_program.acceptance_probability)}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-gray-500">Your Points</p>
                                <p>{recommendations.current_program.student_points}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Min Required</p>
                                <p>{recommendations.current_program.min_points_required}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Total Applicants</p>
                                <p>{recommendations.current_program.total_applicants}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Higher Points</p>
                                <p>{recommendations.current_program.applicants_with_higher_points}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <h4 className="font-medium">Recommended Alternatives</h4>
                    </div>
                    <div className="space-y-3">
                        {recommendations.alternatives.map((program, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="font-medium">{program.program_name}</h5>
                                        <p className="text-sm text-gray-600">{program.institution}</p>
                                    </div>
                                    {renderProbabilityBadge(program.acceptance_probability)}
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Your Points</p>
                                        <p>{program.student_points}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Min Required</p>
                                        <p>{program.min_points_required}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Applicants</p>
                                        <p>{program.total_applicants}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Higher Points</p>
                                        <p>{program.applicants_with_higher_points}</p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500">Required Subjects:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {program.required_subjects.map((subject, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 w-full"
                                    onClick={() => navigate(`/api/program-details/${program.program_id}/stats`)}
                                >
                                    View Program Details <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error loading application</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => navigate(-1)}>Back to Applications</Button>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Application not found</h3>
                    <p className="text-gray-600 mb-4">The requested application could not be found.</p>
                    <Button onClick={() => navigate(-1)}>Back to Applications</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Applications
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${application.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            application.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                application.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {getStatusIcon(application.status)}
                            <span className="font-medium">{application.status}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Application Overview */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    {application.institution.logo && (
                                        <img
                                            src={`${application.institution.logo}`}
                                            alt="University logo"
                                            className="h-16 w-16 object-contain"
                                        />
                                    )}
                                    <div>
                                        <h1 className="text-2xl font-bold">{application.program.name}</h1>
                                        <p className="text-lg text-gray-600">{application.program.degree_level}</p>
                                        <p className="text-gray-500">{application.institution.name}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Application Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Application ID</p>
                                                <p className="font-medium">{application.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Date Applied</p>
                                                <p className="font-medium">{formatDate(application.date_applied)}</p>
                                            </div>
                                            {application.date_status_changed && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Last Status Update</p>
                                                    <p className="font-medium">{formatDate(application.date_status_changed)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Personal Statement</h3>
                                        <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
                                            {application.personal_statement || 'No personal statement provided'}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Submitted Documents</h3>
                                        <div className="space-y-2">
                                            {application.documents && application.documents.length > 0 ? (
                                                application.documents.map((doc, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                                        <FileText className="h-5 w-5 text-teal-600" />
                                                        <div className="flex-1">
                                                            <p className="font-medium">{doc.file.split('/').pop()}</p>
                                                            <p className="text-sm text-gray-500">{doc.document_type || 'Supporting Document'}</p>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`${doc.file}`, '_blank')}
                                                        >
                                                            View
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">No documents submitted</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Program Requirements */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="h-5 w-5 text-teal-600" />
                                    <CardTitle>Program Requirements</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {programRequirements ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-700">Minimum A-Level Points</p>
                                            <p className="font-medium">{programRequirements.min_points_required || 'Not specified'}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-600">Required Subjects</p>
                                            <div className="text-right ">
                                                {programRequirements.required_subjects?.length > 0 ? (
                                                    programRequirements.required_subjects.map((subject, index) => (
                                                        <p key={index} className="text-sm">{subject + " "}</p>
                                                    ))
                                                ) : (
                                                    <p className="font-medium">None specified</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-600">Acceptance Rate</p>
                                            <p className="font-medium text-teal">
                                                {programRequirements.acceptance_rate ?
                                                    `${programRequirements.acceptance_rate}%` : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Loading requirements...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <School className="h-5 w-5 text-teal-600" />
                                    <CardTitle>Admission Chances</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {renderRecommendations()}
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Application Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="w-px h-12 bg-gray-200 mt-1"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Application Submitted</p>
                                            <p className="text-sm text-gray-500">{formatDate(application.date_applied)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${application.status !== 'Pending' ? 'bg-teal-600' : 'bg-gray-200'
                                                }`}>
                                                {application.status !== 'Pending' ? (
                                                    <CheckCircle className="h-4 w-4 text-white" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                )}
                                            </div>
                                            <div className="w-px h-12 bg-gray-200 mt-1"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Under Review</p>
                                            {application.status !== 'Pending' && application.date_status_changed ? (
                                                <p className="text-sm text-gray-500">Completed on {formatDate(application.date_status_changed)}</p>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    {programRequirements?.review_period ?
                                                        `Typically takes ${programRequirements.review_period} weeks` :
                                                        'In progress'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${['Approved', 'Rejected'].includes(application.status) ? 'bg-teal-600' : 'bg-gray-200'
                                                }`}>
                                                {['Approved', 'Rejected'].includes(application.status) ? (
                                                    <CheckCircle className="h-4 w-4 text-white" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Decision</p>
                                            {['Approved', 'Rejected'].includes(application.status) ? (
                                                <p className="text-sm text-gray-500">
                                                    {application.status} on {formatDate(application.date_status_changed)}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    {programRequirements?.decision_period ?
                                                        `Expected within ${programRequirements.decision_period} weeks` :
                                                        'Pending'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetails;