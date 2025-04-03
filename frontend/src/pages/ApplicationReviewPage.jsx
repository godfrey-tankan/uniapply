import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CheckCircle, Clock, XCircle, List, ChevronLeft, Save, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const ApplicationReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [admin_notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user || !user.is_university_admin) {
            navigate('/dashboard');
            return;
        }

        const fetchApplication = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`/api/applications/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setApplication(response.data);
                setStatus(response.data.status);
                setNotes(response.data.admin_notes || '');
            } catch (err) {
                console.error('Error fetching application:', err);
                setError(err.response?.data?.message || 'Failed to load application');
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [id, user, navigate]);

    const handleStatusChange = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('authToken');

            let endpoint = '';
            let data = { admin_notes };

            // Determine which endpoint to call based on status
            switch (status) {
                case 'Approved':
                    endpoint = 'approve';
                    break;
                case 'Rejected':
                    endpoint = 'reject';
                    break;
                case 'Waitlisted':
                    endpoint = 'waitlist';
                    break;
                case 'Deferred':
                    endpoint = 'defer';
                    break;
                default:
                    throw new Error('Invalid status selected');
            }

            await axios.post(
                `/api/applications/${id}/${endpoint}/`,
                data,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Refresh application data
            const response = await axios.get(`/api/applications/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setApplication(response.data);
            toast.success(`Application ${status.toLowerCase()} successfully!`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update application status');
        } finally {
            setSaving(false);
        }
    };

    const getStatusIcon = () => {
        switch (application?.status) {
            case 'Approved':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'Waitlisted':
                return <List className="h-5 w-5 text-amber-500" />;
            case 'Deferred':
                return <Clock className="h-5 w-5 text-blue-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error loading application</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => navigate('/dashboard')}>Back to Home</Button>
                </div>
            </div>
        );
    }

    if (!application) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <Toaster position="top-right" />

            <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mb-6 flex items-center gap-2"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to Home
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Application Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Review</CardTitle>
                            <CardDescription>
                                Application for {application.program_name} at {application.university_name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Student</h4>
                                    <p className="font-medium">{application.student_name}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Application Date</h4>
                                    <p>{new Date(application.date_applied).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Current Status</h4>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon()}
                                        <span>{application.status}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                                    <p>{new Date(application.date_updated).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Statement</h4>
                                <div className="border rounded-md p-4 bg-gray-50">
                                    <p className="whitespace-pre-line">{application.personal_statement}</p>
                                </div>
                            </div>

                            {application.documents && application.documents.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Supporting Documents</h4>
                                    <div className="space-y-2">
                                        {application.documents.map((doc) => (
                                            <a
                                                key={doc.id}
                                                href={doc.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-teal-600 hover:text-teal-800 hover:underline"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span>{doc.file.split('/').pop()}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Actions</CardTitle>
                            <CardDescription>Update the application status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Approved">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>Approve</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Rejected">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span>Reject</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Waitlisted">
                                            <div className="flex items-center gap-2">
                                                <List className="h-4 w-4 text-amber-500" />
                                                <span>Waitlist</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Deferred">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-blue-500" />
                                                <span>Defer</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                <Textarea
                                    value={admin_notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes about this application..."
                                    rows={5}
                                />
                            </div>

                            <Button
                                onClick={handleStatusChange}
                                disabled={saving || status === application.status}
                                className="w-full bg-teal hover:bg-teal-dark"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Status
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                            <CardDescription>Previous status changes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-gray-100 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-4 w-4 text-teal" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Application submitted</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(application.date_applied).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {application.date_status_changed && (
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-full bg-gray-100 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                                            {getStatusIcon()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Status changed to {application.status}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(application.date_status_changed).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ApplicationReviewPage;