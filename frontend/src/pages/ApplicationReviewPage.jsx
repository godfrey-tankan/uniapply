import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CheckCircle, Clock, XCircle, List, ChevronLeft, Save, FileText, MessageSquare, Send, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

const ApplicationReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('Approved');
    const [admin_notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [requestedDocuments, setRequestedDocuments] = useState('');
    const [programAlternatives, setProgramAlternatives] = useState([]);
    const [suitabilityScore, setSuitabilityScore] = useState(0);

    useEffect(() => {
        if (!user || (!user.is_enroller && !user.is_system_admin)) {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');

                // Fetch application data
                const appResponse = await axios.get(`/api/applications/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setApplication(appResponse.data);
                setStatus(appResponse.data.status);
                setNotes(appResponse.data.admin_notes || '');

                // Fetch chat messages
                const messagesResponse = await axios.get(`/api/applications/${id}/messages/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMessages(messagesResponse.data);

                // Calculate suitability score
                if (appResponse.data.student?.a_level_points && appResponse.data.program?.min_points_required) {
                    const score = calculateSuitabilityScore(
                        appResponse.data.student.a_level_points,
                        appResponse.data.program.min_points_required
                    );
                    setSuitabilityScore(score);
                }

                // Fetch program alternatives
                if (appResponse.data.program?.id) {
                    const alternativesResponse = await axios.get(
                        `/api/programs/${appResponse.data.program.id}/recommendations?points=${appResponse.data.student?.a_level_points || 0}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    setProgramAlternatives(alternativesResponse.data.alternatives || []);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Failed to load application data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user, navigate]);

    const calculateSuitabilityScore = (studentPoints, programMinPoints) => {
        if (!studentPoints || !programMinPoints) return 50;

        const pointsDifference = studentPoints - programMinPoints;
        let score = 50; // Base score

        if (pointsDifference > 0) {
            score += Math.min(40, pointsDifference * 5); // Up to +40 for exceeding requirements
        } else if (pointsDifference < 0) {
            score -= Math.min(40, Math.abs(pointsDifference) * 3); // Up to -40 for being below
        }

        return Math.max(5, Math.min(95, score)); // Keep between 5-95%
    };

    const handleStatusChange = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('authToken');

            let endpoint = '';
            let data = { admin_notes };

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

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `/api/applications/${id}/messages/`,
                { content: newMessage },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setMessages([...messages, response.data]);
            setNewMessage('');
            toast.success('Message sent');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleRequestDocuments = async () => {
        if (!requestedDocuments.trim()) {
            toast.error('Please specify which documents you need');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `/api/applications/${id}/request_documents/`,
                { documents_requested: requestedDocuments },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            toast.success('Document request sent to student');
            setRequestDialogOpen(false);
            setRequestedDocuments('');
        } catch (error) {
            console.error('Error requesting documents:', error);
            toast.error('Failed to send document request');
        }
    };

    const handleOfferAlternative = async (programId) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `/api/applications/${id}/offer_alternative/`,
                { alternative_program_id: programId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            toast.success('Alternative program offered to student');
        } catch (error) {
            console.error('Error offering alternative:', error);
            toast.error('Failed to offer alternative program');
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
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <Toaster position="top-right" />

                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Application Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Review</CardTitle>
                                <CardDescription>
                                    Application for {application.program?.name || 'Unknown Program'} at {application.institution?.name || 'Unknown Institution'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Suitability Score */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-500">Applicant Suitability</h4>
                                        <Badge variant="outline">{suitabilityScore}% Match</Badge>
                                    </div>
                                    <Progress value={suitabilityScore} className="h-2" />
                                    {suitabilityScore < 50 && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            This applicant is below the typical requirements for this program
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Student</h4>
                                        <p className="font-medium">{application.student?.username || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">A-Level Points</h4>
                                        <p>{application.student?.a_level_points || 'N/A'}</p>
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
                                </div>

                                {/* Documents Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-500">Supporting Documents</h4>
                                        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Request Documents
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Request Additional Documents</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <p className="text-sm text-gray-600">
                                                        Specify which additional documents you need from the applicant:
                                                    </p>
                                                    <Textarea
                                                        value={requestedDocuments}
                                                        onChange={(e) => setRequestedDocuments(e.target.value)}
                                                        placeholder="E.g. Certified copies of certificates, proof of residence, etc."
                                                        rows={4}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleRequestDocuments}>
                                                            Send Request
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {application.documents?.length > 0 ? (
                                        <div className="border rounded-md p-4 bg-gray-50 space-y-2">
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
                                    ) : (
                                        <div className="border rounded-md p-4 bg-gray-50 text-gray-500">
                                            No documents uploaded yet
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Statement</h4>
                                    <div className="border rounded-md p-4 bg-gray-50">
                                        <p className="whitespace-pre-line">{application.personal_statement || 'No personal statement provided'}</p>
                                    </div>
                                </div>

                                {/* Program Alternatives */}
                                {programAlternatives.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Alternative Programs</h4>
                                        <div className="space-y-2">
                                            {programAlternatives.map((program) => (
                                                <Card key={program.program_id} className="p-3">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">{program.program_name}</p>
                                                            <p className="text-sm text-gray-600">{program.institution}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline">{program.acceptance_probability * 100}% Match</Badge>
                                                                <span className="text-xs text-gray-500">
                                                                    Min. {program.min_points_required} points
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleOfferAlternative(program.program_id)}
                                                        >
                                                            Offer Alternative
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chat Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Communication
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border rounded-lg p-4 h-64 overflow-y-auto">
                                    {messages.length > 0 ? (
                                        <div className="space-y-4">
                                            {messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs p-3 rounded-lg ${message.sender.id === user.id ? 'bg-teal-100' : 'bg-gray-100'}`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(message.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500">
                                            No messages yet
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button onClick={handleSendMessage}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
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
                                    className="w-full"
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
                                            <FileText className="h-4 w-4 text-teal-600" />
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
            <Footer />
        </>
    );
};

export default ApplicationReviewPage;