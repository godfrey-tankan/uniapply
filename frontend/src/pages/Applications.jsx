// src/pages/Applications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
    Users, CheckCircle, Clock, XCircle, Loader2, Search, Filter,
    ChevronLeft, ChevronRight, ArrowUpDown, MoreHorizontal,
    MessageSquare, ChevronDown, ChevronUp, Calendar, BookOpen
} from 'lucide-react';
import axios from 'axios';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import Loading from '@/components/Loading';
import { getEnrollerInstitution } from '@/services/userService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Applications = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [institutionName, setInstitutionName] = useState('Your Institution');
    const [filter, setFilter] = useState('Pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('date_applied');
    const [sortDirection, setSortDirection] = useState('desc');
    const [expandedApplication, setExpandedApplication] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [processingAction, setProcessingAction] = useState(null);
    const [programFilter, setProgramFilter] = useState('all');
    const [availablePrograms, setAvailablePrograms] = useState([]);

    const statusOptions = [
        { value: 'all', label: 'All Statuses', icon: <Users className="h-4 w-4" /> },
        { value: 'Pending', label: 'Pending', icon: <Clock className="h-4 w-4 text-amber-600" /> },
        { value: 'Approved', label: 'Approved', icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
        { value: 'Rejected', label: 'Rejected', icon: <XCircle className="h-4 w-4 text-red-600" /> },
        { value: 'Waitlisted', label: 'Waitlisted', icon: <Clock className="h-4 w-4 text-purple-600" /> },
        { value: 'Deferred', label: 'Deferred', icon: <Clock className="h-4 w-4 text-blue-600" /> },
    ];

    const calculateAcceptanceProbability = (application) => {
        if (!application.student?.a_level_points) return 50;
        const points = application.student.a_level_points;

        // Simple example calculation - adjust based on your criteria
        let probability = 50;
        probability += (points - 10) * 2; // Each point above 10 adds 2%

        // Clamp between 5% and 95%
        return Math.min(95, Math.max(5, Math.round(probability)));
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            const params = {
                status: filter !== 'all' ? filter : undefined,
                page,
                search: searchQuery || undefined,
                ordering: sortDirection === 'asc' ? sortField : `-${sortField}`,
                program: programFilter !== 'all' ? programFilter : undefined,
            };

            // Always filter by assigned institution for enrollers
            if (user?.assigned_institution) {
                params['program__department__faculty__institution'] = user.assigned_institution;
            }

            const response = await axios.get('/api/applications/', {
                headers: { 'Authorization': `Bearer ${token}` },
                params,
                timeout: 10000
            });

            console.log('API Response:', response.data); // Debugging log

            // Ensure we're working with an array
            const apps = Array.isArray(response.data) ? response.data :
                Array.isArray(response.data.results) ? response.data.results : [];

            setApplications(apps);
            setTotalCount(response.data.count || apps.length);
            setTotalPages(Math.ceil((response.data.count || apps.length) / 10) || 1);

            // Extract unique programs from the results
            const programs = [...new Map(apps
                .filter(app => app.program)
                .map(app => [app.program.id, { id: app.program.id, name: app.program.name }])
                .values()
            )];
            setAvailablePrograms(programs);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load applications');
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };
    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            setProcessingAction(applicationId);
            const token = localStorage.getItem('authToken');

            // Prepare the request data with both status and admin_notes
            const requestData = {
                status: newStatus,  // This is required by your backend
                admin_notes: adminNotes || ''  // Ensure we always send a string
            };

            // Make the request to the correct endpoint
            const response = await axios.post(
                `/api/applications/${applicationId}/${newStatus.toLowerCase()}/`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success(`Application status changed to ${newStatus}`);
            setAdminNotes('');
            setExpandedApplication(null);
            fetchApplications();
        } catch (err) {
            console.error('Error updating status:', err);
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.message ||
                `Failed to change status to ${newStatus}`;
            toast.error(errorMessage);
        } finally {
            setProcessingAction(null);
        }
    };
    const toggleExpandApplication = (applicationId) => {
        setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
        setAdminNotes('');
    };

    const getInstitutionNameForDisplay = async () => {
        if (user?.assigned_institution) {
            try {
                const institution = await getEnrollerInstitution(user.assigned_institution);
                setInstitutionName(institution?.name || 'Your Institution');
            } catch (err) {
                console.error('Error fetching institution name:', err);
                setInstitutionName('Your Institution');
            }
        } else if (user?.is_system_admin) {
            setInstitutionName('All Institutions');
        }
    };

    useEffect(() => {
        if (!user || (!user.is_enroller && !user.is_system_admin)) {
            navigate('/dashboard');
            return;
        }

        fetchApplications();
        getInstitutionNameForDisplay();
    }, [user, navigate, filter, page, searchQuery, sortField, sortDirection, programFilter]);

    if (!user || (!user.is_enroller && !user.is_system_admin)) {
        return null;
    }

    if (loading && applications.length === 0) {
        return <Loading />;
    }

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Pending': 'bg-amber-100 text-amber-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Waitlisted': 'bg-purple-100 text-purple-800',
            'Deferred': 'bg-blue-100 text-blue-800',
        };
        return (
            <Badge className={`${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </Badge>
        );
    };

    const handleRowClick = (applicationId) => {
        console.log('Navigating to:', `/review-application/${applicationId}`);
        console.log('Current user:', user);
        navigate(`/review-application/${applicationId}`, { replace: true });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center py-4 px-6">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-teal-600" />
                        <h1 className="text-xl font-bold text-gray-800">
                            <span className="text-teal-600">{institutionName}</span> Applications
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={fetchApplications} disabled={loading}>
                            <Loader2 className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto py-8 px-6">
                <a href='/enroller-dashboard' className="text-teal-600 hover:underline mb-4 inline-block">
                    <ChevronLeft className="inline h-4 w-4 mr-1" />
                    Back to Dashboard
                </a>
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Management</h2>
                    <p className="text-gray-600">Review and manage student applications for {institutionName}</p>
                </div>

                {/* Filter and Search Bar */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by student name, ID, or program..."
                                    className="pl-10 w-full rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Select value={filter} onValueChange={setFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <div className="flex items-center gap-2">
                                                    {status.icon}
                                                    {status.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={programFilter} onValueChange={setProgramFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Programs</SelectItem>
                                        {availablePrograms.map((program) => (
                                            <SelectItem key={program.id} value={program.id}>
                                                {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button onClick={fetchApplications}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>
                                    {filter === 'all' ? 'All Applications' : statusOptions.find(s => s.value === filter)?.label}
                                </CardTitle>
                                <CardDescription>
                                    Showing {applications.length} of {totalCount} applications
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort:</span>
                                <Select
                                    value={`${sortField}:${sortDirection}`}
                                    onValueChange={(value) => {
                                        const [field, direction] = value.split(':');
                                        setSortField(field);
                                        setSortDirection(direction);
                                    }}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date_applied:desc">Newest First</SelectItem>
                                        <SelectItem value="date_applied:asc">Oldest First</SelectItem>
                                        <SelectItem value="student__name:asc">Student (A-Z)</SelectItem>
                                        <SelectItem value="student__name:desc">Student (Z-A)</SelectItem>
                                        <SelectItem value="program__name:asc">Program (A-Z)</SelectItem>
                                        <SelectItem value="program__name:desc">Program (Z-A)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <div className="text-center py-8 text-red-500">
                                <XCircle className="h-12 w-12 mx-auto mb-4" />
                                <p>{error}</p>
                                <Button className="mt-4" onClick={fetchApplications}>Try Again</Button>
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                                <p className="text-gray-500">
                                    {searchQuery ? 'No applications match your search criteria' : 'There are no applications with the current filter'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Program</TableHead>
                                            <TableHead>A-Level Points</TableHead>
                                            <TableHead>Acceptance Probability</TableHead>
                                            <TableHead>Date Applied</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.map((application) => (
                                            <React.Fragment key={application.id}>
                                                <TableRow
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleRowClick(application.id)}
                                                >
                                                    <TableCell>
                                                        <div className="font-medium">{application.student?.username || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{application.student?.email}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{application.program?.name || 'Unknown Program'}</div>
                                                        <div className="text-sm text-gray-500">{application.institution?.name}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {application.student?.a_level_points || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-teal-600 h-2.5 rounded-full"
                                                                style={{ width: `${calculateAcceptanceProbability(application)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                            {calculateAcceptanceProbability(application)}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            {new Date(application.date_applied).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(application.status)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleStatusChange(application.id, 'Approved');
                                                                    }}
                                                                    disabled={application.status === 'Approved' || processingAction === application.id}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleStatusChange(application.id, 'Rejected');
                                                                    }}
                                                                    disabled={application.status === 'Rejected' || processingAction === application.id}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleStatusChange(application.id, 'Waitlisted');
                                                                    }}
                                                                    disabled={application.status === 'Waitlisted' || processingAction === application.id}
                                                                >
                                                                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                                                                    Waitlist
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleExpandApplication(application.id);
                                                                    }}
                                                                >
                                                                    <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                                                                    Add Notes
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedApplication === application.id && (
                                                    <TableRow className="bg-gray-50">
                                                        <TableCell colSpan={7}>
                                                            <div className="p-4 space-y-4">
                                                                <h4 className="font-medium">Add Admin Notes</h4>
                                                                <Textarea
                                                                    placeholder="Enter notes about this application..."
                                                                    value={adminNotes}
                                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => setExpandedApplication(null)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => {
                                                                            // Save notes without changing status
                                                                            setExpandedApplication(null);
                                                                            setAdminNotes('');
                                                                        }}
                                                                    >
                                                                        Save Notes
                                                                    </Button>
                                                                </div>
                                                                {application.admin_notes && (
                                                                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                                                                        <h4 className="font-medium mb-1">Previous Notes</h4>
                                                                        <p className="text-sm">{application.admin_notes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                                {applications.length > 0 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-500">
                                            Page {page} of {totalPages}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page === 1}
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            >
                                                Next <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default Applications;