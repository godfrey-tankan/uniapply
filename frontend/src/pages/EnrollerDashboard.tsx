import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Inbox, BarChart3, CalendarDays, Bell, BookOpen, Settings,
  CheckCircle, Clock, XCircle, AlertCircle, Mail, PlusCircle,
  Edit, FilePlus, Loader2, ChevronDown, ChevronUp, Send, MessageSquare,
  FolderPlus, Home,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import Loading from '@/components/Loading';
import { getEnrollerInstitution, getUserSettings } from '@/services/userService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogDescription } from '@radix-ui/react-dialog';
import { Sidebar } from '@/components/Sidebar';

const EnrollerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [institutionName, setInstitutionName] = useState('Your Institution');
  const [enrollerSettings, setEnrollerSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    requirements: '',
    duration: '',
    department: '',
    faculty: ''
  });
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    date: '',
    semester: 'FALL'
  });
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    faculty: ''
  });
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    institution: user?.assigned_institution || ''
  });

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const params = {
        page_size: 1000,
      };

      if (user?.assigned_institution) {
        params['program__department__faculty__institution'] = user.assigned_institution;
      }

      const response = await axios.get('/api/applications/', {
        headers: { 'Authorization': `Bearer ${token}` },
        params,
        timeout: 10000
      });

      const apps = Array.isArray(response.data) ? response.data :
        Array.isArray(response.data.results) ? response.data.results : [];

      const stats = {
        total_applicants: apps.length,
        pending_review: apps.filter(app => app.status === 'Pending').length,
        approved: apps.filter(app => app.status === 'Approved').length,
        rejected: apps.filter(app => app.status === 'Rejected').length,
        waitlisted: apps.filter(app => app.status === 'Waitlisted').length,
        deferred: apps.filter(app => app.status === 'Deferred').length,
        applications: apps
      };

      setDashboardData(stats);
    } catch (err) {
      console.error('Error fetching applications data:', err);
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to load applications data';
      setError(errorMessage);
      toast.error(`Dashboard Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user activities
  const fetchUserActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      const token = localStorage.getItem('authToken');

      const response = await axios.get('/api/applications/my_activities/', {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 8000
      });

      return response.data.results || response.data;
    } catch (err) {
      console.error('Error fetching activities:', err);
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to load activities';
      setActivitiesError(errorMessage);
      toast.error(`Activities Error: ${errorMessage}`);
      return [];
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fetch enroller settings
  const fetchEnrollerSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      const settings = await getUserSettings();
      setEnrollerSettings(settings);
    } catch (err) {
      console.error('Error fetching enroller settings:', err);
      setSettingsError('Failed to load settings');
      toast.error('Settings Error: Failed to load enroller settings.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Fetch student messages
  const fetchStudentMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/messages/students/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load student messages');
    }
  };

  // Fetch programs for the institution
  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/programs/', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          institution_id: user?.assigned_institution
        }
      });
      setPrograms(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching programs:', err);
      toast.error('Failed to load programs');
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/departments/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDepartments(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to load departments');
    }
  };

  // Fetch faculties
  const fetchFaculties = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/faculties/', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          institution_id: user?.assigned_institution
        }
      });
      setFaculties(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching faculties:', err);
      toast.error('Failed to load faculties');
    }
  };

  // Fetch deadlines
  const fetchDeadlines = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/deadlines/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeadlines(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching deadlines:', err);
      toast.error('Failed to load deadlines');
    }
  };

  // Send message to student
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/messages/', {
        recipient: selectedStudent.id,
        message: newMessage,
        is_system: false
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('Message sent successfully');
      setNewMessage('');
      fetchStudentMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  // Add new program
  const addProgram = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/create-programs/', newProgram, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('Program added successfully');
      setNewProgram({
        name: '',
        description: '',
        requirements: '',
        duration: '',
        department: '',
        faculty: ''
      });
      fetchPrograms();
    } catch (err) {
      console.error('Error adding program:', err);
      toast.error('Failed to add program');
    }
  };

  // Add new deadline
  const addDeadline = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/deadlines/', newDeadline, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('Deadline added successfully');
      setNewDeadline({
        title: '',
        description: '',
        date: '',
        semester: 'FALL'
      });
      fetchDeadlines();
    } catch (err) {
      console.error('Error adding deadline:', err);
      toast.error('Failed to add deadline');
    }
  };

  // Add new department
  const addDepartment = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/create-departments/', newDepartment, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('Department added successfully');
      setNewDepartment({
        name: '',
        faculty: ''
      });
      fetchDepartments();
    } catch (err) {
      console.error('Error adding department:', err);
      toast.error('Failed to add department');
    }
  };

  // Add new faculty
  const addFaculty = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/faculties/', newFaculty, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('Faculty added successfully');
      setNewFaculty({
        name: '',
        institution: user?.assigned_institution || ''
      });
      fetchFaculties();
    } catch (err) {
      console.error('Error adding faculty:', err);
      toast.error('Failed to add faculty');
    }
  };

  const loadActivities = async () => {
    const data = await fetchUserActivities();
    setActivities(data);
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchDashboardData(),
      loadActivities(),
      fetchEnrollerSettings(),
      fetchStudentMessages(),
      fetchPrograms(),
      fetchDepartments(),
      fetchFaculties(),
      fetchDeadlines()
    ]);
  };

  const getInstitutionNameForDisplay = async () => {
    if (user?.assigned_institution) {
      try {
        const institution = await getEnrollerInstitution(user.assigned_institution);
        setInstitutionName(institution?.name || '-');
      } catch (err) {
        console.error('Error fetching institution name:', err);
        setInstitutionName('Your Institution');
      }
    } else if (user?.is_system_admin) {
      setInstitutionName('Administrator');
    }
  };

  useEffect(() => {
    if (!user || (!user.is_enroller && !user.is_system_admin)) {
      navigate('/dashboard');
      return;
    }

    refreshAllData();
    getInstitutionNameForDisplay();

    const refreshInterval = setInterval(refreshAllData, 120000);
    return () => clearInterval(refreshInterval);
  }, [user, navigate]);

  const getActivityIcon = (action) => {
    const iconMap = {
      'APPROVED': <CheckCircle className="h-4 w-4 text-green-500" />,
      'REJECTED': <XCircle className="h-4 w-4 text-red-500" />,
      'CREATED': <FilePlus className="h-4 w-4 text-blue-500" />,
      'UPDATED': <Edit className="h-4 w-4 text-yellow-500" />,
      'REVIEWED': <Clock className="h-4 w-4 text-purple-500" />,
      'MESSAGE': <Inbox className="h-4 w-4 text-cyan-500" />
    };
    return iconMap[action] || <CheckCircle className="h-4 w-4 text-gray-500" />;
  };

  const getActivityColor = (action) => {
    const colorMap = {
      'APPROVED': 'bg-green-100',
      'REJECTED': 'bg-red-100',
      'CREATED': 'bg-blue-100',
      'UPDATED': 'bg-yellow-100',
      'REVIEWED': 'bg-purple-100',
      'MESSAGE': 'bg-cyan-100'
    };
    return colorMap[action] || 'bg-gray-100';
  };

  if (!user || (!user.is_enroller && !user.is_system_admin)) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={refreshAllData}>Retry</Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {/* {sidebarOpen ? <ChevronLeft /> : <ChevronRight />} */}
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              UniApply - <span className="text-teal-600">{institutionName}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshAllData}
              disabled={loading || activitiesLoading || settingsLoading}
            >
              <Loader2 className={`h-5 w-5 ${(loading || activitiesLoading || settingsLoading) ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-teal-100 w-10 h-10 flex items-center justify-center text-teal-600 font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          institutionName={institutionName}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Scrollable Main Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <main className="container mx-auto py-8 px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
              <p className="text-gray-600">Manage student applications and enrollment processes.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[
                {
                  title: 'Total Applications',
                  value: dashboardData?.total_applicants || 0,
                  icon: <Users className="h-6 w-6 text-blue-600" />,
                  bg: 'bg-blue-100'
                },
                {
                  title: 'Pending Review',
                  value: dashboardData?.pending_review || 0,
                  icon: <Clock className="h-6 w-6 text-amber-600" />,
                  bg: 'bg-amber-100'
                },
                {
                  title: 'Approved',
                  value: dashboardData?.approved || 0,
                  icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                  bg: 'bg-green-100'
                },
                {
                  title: 'Rejected',
                  value: dashboardData?.rejected || 0,
                  icon: <XCircle className="h-6 w-6 text-red-600" />,
                  bg: 'bg-red-100'
                }
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-teal-50 transition-colors duration-200"
                  onClick={() => navigate(`/institution-applications?status=${stat.title.toLowerCase().replace(' ', '-')}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`rounded-full ${stat.bg} p-3`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <Button
                className="h-auto py-4 bg-teal-600 hover:bg-teal-700 flex gap-3 items-center justify-center transition-colors duration-200"
                onClick={() => navigate('/institution-applications')}
              >
                <Users className="h-5 w-5" />
                <span>Review Applications</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex gap-3 items-center justify-center border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                onClick={() => setShowChatModal(true)}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Student Messages</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex gap-3 items-center justify-center border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                onClick={() => navigate('/schedule')}
              >
                <CalendarDays className="h-5 w-5" />
                <span>Schedule Interviews</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex gap-3 items-center justify-center border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                onClick={() => navigate('/programs')}
              >
                <PlusCircle className="h-5 w-5" />
                <span>Manage Programs</span>
              </Button>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Pending Applications</CardTitle>
                    <CardDescription>Applications awaiting your review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.pending_review > 0 ? (
                      <div className="divide-y">
                        {dashboardData.applications
                          .filter(app => app.status === 'Pending')
                          .slice(0, 5)
                          .map((application) => (
                            <div key={application.id} className="py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200">
                              <div>
                                <p className="font-medium">{application.student?.username || 'Unknown Student'}</p>
                                <p className="text-sm text-gray-500">Applied for {application.program?.name || 'Unknown Program'}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(application.date_applied).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="bg-teal-600 hover:bg-teal-700"
                                onClick={() => navigate(`/review-application/${application.id}/`)}
                              >
                                Review
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Inbox className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">No pending applications</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm overflow-auto scrollbar-hide h-96 ">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest actions and updates</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadActivities}
                        disabled={activitiesLoading}
                      >
                        <Loader2 className={`h-4 w-4 mr-2 ${activitiesLoading ? 'animate-spin' : 'hidden'}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activitiesError ? (
                      <div className="text-center py-4 text-red-500">
                        <AlertCircle className="h-5 w-5 inline-block mr-2" />
                        {activitiesError}
                      </div>
                    ) : activitiesLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex gap-3 items-start">
                            <div className={`rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.action)}`}>
                              {getActivityIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{activity.description}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                              {activity.metadata?.program && (
                                <p className="text-xs text-gray-400 truncate">
                                  Program: {activity.metadata.program}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6 h-1/2  overflow-y-scroll">
                {/* Student Messages Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Student Messages</CardTitle>
                    <CardDescription>Recent conversations with students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {messages.length > 0 ? (
                      <div className="space-y-3">
                        {messages.slice(0, 3).map((message) => (
                          <div
                            key={message.id}
                            className="p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-200"
                            onClick={() => {
                              setSelectedStudent(message.student);
                              setShowChatModal(true);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-teal-100 w-8 h-8 flex items-center justify-center text-teal-600">
                                {message.student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{message.student.name}</p>
                                <p className="text-sm text-gray-500 truncate">{message.last_message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">No recent messages</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-teal-500 text-teal-600 hover:bg-teal-700"
                      onClick={() => setShowChatModal(true)}
                    >
                      View All Messages
                    </Button>
                  </CardContent>
                </Card>

                {/* Programs Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Programs</CardTitle>
                    <CardDescription>Manage institution programs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {programs.length > 0 ? (
                      <div className="space-y-3">
                        {programs.slice(0, 3).map((program) => (
                          <div key={program.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors duration-200">
                            <p className="font-medium">{program.name}</p>
                            <p className="text-sm text-gray-500 truncate">{program.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">No programs found</p>
                      </div>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-4 border-teal-500 text-teal-600 hover:bg-teal-700">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Program
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-teal-700">Add New Program</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Fill in the details for the new program
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Program Name
                            </Label>
                            <Input
                              id="name"
                              value={newProgram.name}
                              onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
                              Faculty
                            </Label>
                            <Select
                              value={newProgram.faculty}
                              onValueChange={(value) => setNewProgram({ ...newProgram, faculty: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select faculty" />
                              </SelectTrigger>
                              <SelectContent>
                                {faculties.map((faculty) => (
                                  <SelectItem key={faculty.id} value={faculty.id}>
                                    {faculty.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-teal-600 p-0 hover:bg-teal-700"
                              onClick={() => navigate('/faculties')}
                            >
                              + Add new faculty
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="department" className="block text-sm font-medium text-gray-700">
                              Department
                            </Label>
                            <Select
                              value={newProgram.department}
                              onValueChange={(value) => setNewProgram({ ...newProgram, department: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments
                                  .filter(dept => dept.faculty === newProgram.faculty)
                                  .map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-teal-600 p-0 hover:bg-teal-700"
                              onClick={() => navigate('/departments')}
                            >
                              + Add new department
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </Label>
                            <Textarea
                              id="description"
                              value={newProgram.description}
                              onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 min-h-[100px]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                Duration (years)
                              </Label>
                              <Input
                                type="number"
                                id="duration"
                                value={newProgram.duration}
                                onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                                Requirements
                              </Label>
                              <Input
                                id="requirements"
                                value={newProgram.requirements}
                                onChange={(e) => setNewProgram({ ...newProgram, requirements: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={addProgram}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm"
                          >
                            Save Program
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Deadlines Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                    <CardDescription>Important enrollment dates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deadlines.length > 0 ? (
                      <ul className="space-y-3">
                        {deadlines.slice(0, 3).map((deadline, index) => (
                          <li key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors duration-200">
                            <div className={`rounded-full p-2 ${index % 2 === 0 ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600'}`}>
                              <CalendarDays className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{deadline.title}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(deadline.date).toLocaleDateString()}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">No upcoming deadlines</p>
                      </div>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-4 border-teal-500 text-teal-600 hover:bg-teal-700">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Deadline
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-teal-700">Add New Deadline</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Set an important deadline for applications
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                              Title
                            </Label>
                            <Input
                              id="title"
                              value={newDeadline.title}
                              onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </Label>
                            <Textarea
                              id="description"
                              value={newDeadline.description}
                              onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 min-h-[100px]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Date
                              </Label>
                              <Input
                                type="date"
                                id="date"
                                value={newDeadline.date}
                                onChange={(e) => setNewDeadline({ ...newDeadline, date: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                                Semester
                              </Label>
                              <select
                                id="semester"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={newDeadline.semester}
                                onChange={(e) => setNewDeadline({ ...newDeadline, semester: e.target.value })}
                              >
                                <option value="FALL">Fall Semester</option>
                                <option value="SPRING">Spring Semester</option>
                                <option value="SUMMER">Summer Semester</option>
                                <option value="WINTER">Winter Semester</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={addDeadline}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm"
                          >
                            Save Deadline
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Add Faculty Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Add Faculty</CardTitle>
                    <CardDescription>Create new faculties for your institution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-teal-500 text-teal-600 hover:bg-teal-700">
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Add Faculty
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-teal-700">Add New Faculty</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Create a new faculty for your institution
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="faculty-name" className="block text-sm font-medium text-gray-700">
                              Faculty Name
                            </Label>
                            <Input
                              id="faculty-name"
                              value={newFaculty.name}
                              onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={addFaculty}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm"
                          >
                            Save Faculty
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </ScrollArea>
      </div>

      {/* Footer */}
      <Footer />

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-teal-600 text-white rounded-t-lg">
              <h3 className="font-bold">Student Messages</h3>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-10 rounded-full hover:bg-teal-700"
              >
                ×
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              {/* Students List */}
              <div className="w-1/3 border-r overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.student.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${selectedStudent?.id === message.student.id ? 'bg-teal-50' : ''}`}
                    onClick={() => setSelectedStudent(message.student)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-teal-100 w-8 h-8 flex items-center justify-center text-teal-600">
                        {message.student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{message.student.name}</p>
                        <p className="text-xs text-gray-500 truncate">{message.last_message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Area */}
              <div className="w-2/3 flex flex-col">
                {selectedStudent ? (
                  <>
                    <div className="p-4 border-b flex items-center gap-2">
                      <div className="rounded-full bg-teal-100 w-10 h-10 flex items-center justify-center text-teal-600">
                        {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold">{selectedStudent.name}</h4>
                        <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4 overflow-y-auto bg-gray-50">
                      {messages.find(m => m.student.id === selectedStudent.id)?.messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`mb-3 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}
                        >
                          <div
                            className={`inline-block p-3 rounded-lg max-w-xs ${msg.sender === user.id ? 'bg-teal-100 text-teal-800' : 'bg-gray-200'}`}
                          >
                            {msg.text}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </ScrollArea>
                    <div className="p-4 border-t bg-white">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                        <Button
                          onClick={sendMessage}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a student to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollerDashboard;