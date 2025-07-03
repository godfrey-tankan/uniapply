import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import {
    BarChart, BookOpen, Users, Clock, CheckCircle, XCircle,
    FileText, ArrowLeft, CalendarDays, LineChart, PieChart,
    AlertCircle, Sparkles, Target, ChevronRight, Lock, BarChart2
} from 'lucide-react';
import {
    LineChart as RechartsLine,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
    BarChart as RechartsBar,
    Bar,
    Legend
} from 'recharts';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Chatbot from '../components/Chatbot';
import { ScrollArea } from "@/components/ui/scroll-area";

const COLORS = ['#2dd4bf', '#34d399', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa', '#fbbf24'];

const ApplicationTrendChart = ({ data }) => {
    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLine data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2dd4bf"
                        strokeWidth={2}
                        dot={{ fill: '#2dd4bf', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                </RechartsLine>
            </ResponsiveContainer>
        </div>
    );
};

const AcceptanceRateChart = ({ acceptanceRate, rejectionRate }) => {
    const data = [
        { name: 'Accepted', value: acceptanceRate, color: '#10b981' },
        { name: 'Rejected', value: rejectionRate, color: '#ef4444' }
    ];

    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBar data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Bar dataKey="value" fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </RechartsBar>
            </ResponsiveContainer>
        </div>
    );
};

const DemographicsPieChart = ({ data, title }) => {
    return (
        <div className="h-64">
            <h4 className="text-sm font-medium mb-2 text-center text-gray-700">{title}</h4>
            <ResponsiveContainer width="100%" height="90%">
                <RechartsPie>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                        {data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value}`, 'Count']}
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '10px' }}
                    />
                </RechartsPie>
            </ResponsiveContainer>
        </div>
    );
};

const PointsDistributionChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="h-80">
            <h4 className="text-sm font-medium mb-2 text-center text-gray-700">Points Distribution</h4>
            <ResponsiveContainer width="100%" height="90%">
                <RechartsBar data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="range"
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </RechartsBar>
            </ResponsiveContainer>
        </div>
    );
};

const ProgramDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch program data without authentication
                const programResponse = await axios.get(`/api/program-details/${id}/`);
                setProgram(programResponse.data);

                // Try to fetch stats and application data if user is logged in
                if (user) {
                    const token = localStorage.getItem('authToken');

                    const [statsResponse, applicationResponse] = await Promise.all([
                        axios.get(`/api/program-details/${id}/stats/`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }).catch(() => ({ data: null })), // Gracefully handle failure

                        user?.is_student ?
                            axios.get(`/api/application/check/?program_id=${id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            }).catch(() => ({ data: { has_applied: false, status: null } }))
                            : Promise.resolve({ data: { has_applied: false, status: null } })
                    ]);

                    setStats(statsResponse.data);

                    if (user?.is_student) {
                        setHasApplied(applicationResponse.data.has_applied);
                        setApplicationStatus(applicationResponse.data.status);

                        if (applicationResponse.data.has_applied && user?.a_level_points) {
                            await fetchRecommendations(programResponse.data);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Failed to load program details');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id, user]);

    const fetchRecommendations = async (programData) => {
        try {
            setLoadingRecommendations(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `/api/programs/${id}/recommendations/`,
                {
                    params: {
                        points: user.a_level_points,
                        department_id: programData.department?.id
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setRecommendations(response.data);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const getStatusConfig = (status) => {
        const statusLower = status?.toLowerCase();
        const configs = {
            accepted: {
                icon: <CheckCircle className="h-5 w-5" />,
                bg: 'bg-green-50',
                text: 'text-green-700',
                label: 'Accepted'
            },
            rejected: {
                icon: <XCircle className="h-5 w-5" />,
                bg: 'bg-red-50',
                text: 'text-red-700',
                label: 'Rejected'
            },
            waitlisted: {
                icon: <Clock className="h-5 w-5" />,
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                label: 'Waitlisted'
            },
            pending: {
                icon: <AlertCircle className="h-5 w-5" />,
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                label: 'Pending'
            },
            default: {
                icon: <AlertCircle className="h-5 w-5" />,
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                label: 'Status Unknown'
            }
        };
        return configs[statusLower] || configs.default;
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

    const RecommendationsSection = () => {
        if (!user) {
            return (
                <div className="text-center py-4 text-gray-500">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Lock className="h-4 w-4" />
                        <span>Sign in to view personalized recommendations</span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/login', { state: { from: `/programs/${id}` } })}
                        className="mt-2"
                    >
                        Sign In
                    </Button>
                </div>
            );
        }

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
                    <ScrollArea className="h-96 rounded-md border p-4">
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
                                        onClick={() => navigate(`/programs/${program.program_id}`)}
                                    >
                                        View Program Details <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        );
    };

    const handleApply = () => {
        if (!user) {
            navigate('/auth', { state: { from: `/programs/${id}`, action: 'apply' } });
        } else {
            navigate(`/apply?program_id=${id}`);
        }
    };

    const ProtectedContent = ({ children, fallback = null }) => {
        if (!user) {
            return fallback || (
                <div className="text-center py-4 text-gray-500">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Lock className="h-4 w-4" />
                        <span>Sign in to view this content</span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/auth', { state: { from: `/programs/${id}` } })}
                        className="mt-2"
                    >
                        Sign In
                    </Button>
                </div>
            );
        }
        return children;
    };

    // Prepare data for charts
    const genderData = stats?.demographics?.gender
        ? Object.entries(stats.demographics.gender).map(([name, value]) => ({ name, value }))
        : [];

    const provinceData = stats?.demographics?.province
        ? Object.entries(stats.demographics.province).map(([name, value]) => ({ name, value }))
        : [];

    const pointsDistributionData = stats?.points_distribution
        ? Object.entries(stats.points_distribution).map(([range, count]) => ({ range, count }))
        : [];

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
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error loading program</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => navigate(-1)}>Back to Programs</Button>
                </div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Program not found</h3>
                    <p className="text-gray-600 mb-4">The requested program could not be found.</p>
                    <Button onClick={() => navigate(-1)}>Back to Programs</Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                            Back to Programs
                        </Button>

                        <div className="flex items-center gap-4">
                            {user?.is_student && hasApplied ? (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-md">
                                    {getStatusConfig(applicationStatus).icon}
                                    <span>You've already applied to this program - </span>
                                    <span className={`font-medium text-sm rounded-md px-3 py-1 ${getStatusConfig(applicationStatus).bg} ${getStatusConfig(applicationStatus).text}`}>
                                        {getStatusConfig(applicationStatus).label}
                                    </span>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleApply}
                                    className="bg-teal-600 hover:bg-teal-700"
                                >
                                    {user ? 'Apply Now' : 'Sign In to Apply'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <BookOpen className="h-8 w-8 text-teal-600" />
                                        <div>
                                            <h1 className="text-2xl font-bold">{program.name}</h1>
                                            <p className="text-gray-600">{program.code}</p>
                                            <p className="text-gray-500">{program.department?.name}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Minimum A-Level Points</p>
                                            <p className="font-medium">{program.min_points_required}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Required Subjects</p>
                                            <div className="flex flex-wrap gap-1">
                                                {program.requirements?.map((subject, index) => (
                                                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Program Duration</p>
                                            <p className="font-medium">
                                                {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Enrollment</p>
                                            <p className="font-medium">{program.total_enrollment}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                                        <p className="text-gray-700">{program.description || 'No description available'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <LineChart className="h-5 w-5 text-teal-600" />
                                        <CardTitle>Application Trends</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {stats?.application_trends?.length > 0 ? (
                                        <ApplicationTrendChart data={stats.application_trends} />
                                    ) : (
                                        <ProtectedContent
                                            fallback={
                                                <div className="text-center py-4 text-gray-500">
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <Lock className="h-4 w-4" />
                                                        <span>Sign in to view application trends</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => navigate('/login', { state: { from: `/programs/${id}` } })}
                                                        className="mt-2"
                                                    >
                                                        Sign In
                                                    </Button>
                                                </div>
                                            }
                                        >
                                            <p className="text-center text-gray-500 py-4">No application data available</p>
                                        </ProtectedContent>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <BarChart2 className="h-5 w-5 text-teal-600" />
                                        <CardTitle>Points Distribution</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ProtectedContent>
                                        {pointsDistributionData.length > 0 ? (
                                            <PointsDistributionChart data={pointsDistributionData} />
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No points distribution data available</p>
                                        )}
                                    </ProtectedContent>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-teal-600" />
                                        <CardTitle>Admission Statistics</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ProtectedContent
                                        fallback={
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span>Acceptance Rate</span>
                                                    <span className="font-medium">Sign in to view</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Average Points</span>
                                                    <span className="font-medium">Sign in to view</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Current Applications</span>
                                                    <span className="font-medium">Sign in to view</span>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <>
                                            {stats?.acceptance_rate && (
                                                <AcceptanceRateChart
                                                    acceptanceRate={stats.acceptance_rate}
                                                    rejectionRate={100 - stats.acceptance_rate}
                                                />
                                            )}
                                            <div className="flex justify-between">
                                                <span>Acceptance Rate</span>
                                                <span className="font-medium">
                                                    {stats?.acceptance_rate ? `${stats.acceptance_rate}%` : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Average Points</span>
                                                <span className="font-medium">
                                                    {stats?.average_points ? Math.round(stats.average_points) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Current Applications</span>
                                                <span className="font-medium">
                                                    {stats?.current_applications || '0'}
                                                </span>
                                            </div>
                                        </>
                                    </ProtectedContent>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5 text-teal-600" />
                                        <CardTitle>Demographics</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ProtectedContent
                                        fallback={
                                            <div className="text-center py-4 text-gray-500">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <Lock className="h-4 w-4" />
                                                    <span>Sign in to view demographics</span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigate('/login', { state: { from: `/programs/${id}` } })}
                                                    className="mt-2"
                                                >
                                                    Sign In
                                                </Button>
                                            </div>
                                        }
                                    >
                                        {genderData.length > 0 && (
                                            <DemographicsPieChart
                                                data={genderData}
                                                title="Gender Distribution"
                                            />
                                        )}
                                        {provinceData.length > 0 && (
                                            <DemographicsPieChart
                                                data={provinceData}
                                                title="Province Distribution"
                                            />
                                        )}
                                        {genderData.length === 0 && provinceData.length === 0 && (
                                            <p className="text-center text-gray-500 py-4">No demographic data available</p>
                                        )}
                                    </ProtectedContent>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-teal-600" />
                                        <CardTitle>Your Admission Chances</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <RecommendationsSection />
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-teal-600" />
                                        <CardTitle>Important Dates</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Application Deadline</span>
                                        <span className="font-medium">
                                            {program.application_deadline ?
                                                new Date(program.application_deadline).toLocaleDateString() :
                                                'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Decision Deadline</span>
                                        <span className="font-medium">
                                            {program.decision_deadline ?
                                                new Date(program.decision_deadline).toLocaleDateString() :
                                                'N/A'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <Chatbot />
            <Footer />
        </div>
    );
};

export default ProgramDetails;