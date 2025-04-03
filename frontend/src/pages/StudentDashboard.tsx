import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, Inbox, Clock, FileText, Bell, BookOpen, CheckCircle, Clock as ClockIcon, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApplicationPage from './Application';
import Footer from '../components/Footer';
import axios from 'axios';
import Loading from '@/components/Loading';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showApplicationPage, setShowApplicationPage] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'messages', or 'deadlines'
  const [profileCompletion, setProfileCompletion] = useState({
    completion_percentage: 0,
    education_history_count: 0,
    documents_count: 0,
  });

  const fetchProfileCompletion = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/auth/profile-completion/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfileCompletion(response.data);
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    }
  };

  useEffect(() => {
    if (user && user.is_student) {
      fetchApplications();
      fetchProfileCompletion();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/applications/my_applications/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApplications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.is_student) {
    navigate('/dashboard');
    return null;
  }

  const handleApplicationSubmit = () => {
    setShowApplicationPage(false);
    fetchApplications(); // Refresh applications after submission
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (showApplicationPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Application Page Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-teal" />
              <h1 className="text-xl font-bold text-navy">New Application</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowApplicationPage(false)}
                className="bg-white hover:bg-gray-100"
              >
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-teal/10 w-10 h-10 flex items-center justify-center text-teal font-medium">
                  {user.name.charAt(0)}
                </div>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Application Page Content */}
        <main className="container mx-auto py-8 px-6">
          <ApplicationPage
            onSuccess={handleApplicationSubmit}
            onCancel={() => setShowApplicationPage(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-slate-50">
        {/* Dashboard Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-teal" />
              <h1 className="text-xl font-bold text-navy">Student Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-teal/10 w-10 h-10 flex items-center justify-center text-teal font-medium">
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

        {/* Dashboard Content */}
        <main className="container mx-auto py-8 px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
            <p className="text-gray-600">Manage your university applications and track your progress.</p>
          </div>

          {/* Quick Actions - Modified to show active tab with bg-teal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Button
              onClick={() => {
                setActiveTab('applications');
                setShowApplicationPage(false);
              }}
              className={`h-auto py-4 flex gap-3 items-center justify-center ${activeTab === 'applications'
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FilePlus2 className="h-5 w-5" />
              <span>New Application</span>
            </Button>

            <Button
              onClick={() => setActiveTab('messages')}
              className={`h-auto py-4 flex gap-3 items-center justify-center ${activeTab === 'messages'
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Inbox className="h-5 w-5" />
              <span>View Messages</span>
            </Button>

            <Button
              onClick={() => setActiveTab('deadlines')}
              className={`h-auto py-4 flex gap-3 items-center justify-center ${activeTab === 'deadlines'
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Clock className="h-5 w-5" />
              <span>Application Deadlines</span>
            </Button>
          </div>

          {/* Tab Navigation - Keep this if you want both the buttons and tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'applications'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => {
                setActiveTab('applications');
                setShowApplicationPage(false);
              }}
            >
              My Applications
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'messages'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'deadlines'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('deadlines')}
            >
              Deadlines
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'applications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Applications Column */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Applications</CardTitle>
                    <CardDescription>Track the status of your university applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">
                        {error}
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={fetchApplications}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-center text-gray-500 py-8">
                          You haven't started any applications yet.
                        </p>
                        <Button
                          className="w-full mt-4 bg-teal hover:bg-teal-dark"
                          onClick={() => setShowApplicationPage(true)}
                        >
                          Start Your First Application
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="custom-scrollbar max-h-[550px] overflow-y-auto space-y-4 border p-4 rounded-lg bg-white shadow-md">
                          {applications.map((app) => (
                            <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{app.program.name}</h3>
                                  <p className="text-sm text-gray-600">{app.institution?.name || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(app.status)}
                                  <span className={`text-sm ${app.status === 'Approved' ? 'text-green-600' :
                                    app.status === 'Pending' ? 'text-yellow-600' :
                                      app.status === 'Rejected' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                    {app.status}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                  Applied on {formatDate(app.date_applied)}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/applications/${app.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          className="w-full mt-4 bg-teal hover:bg-teal-dark"
                          onClick={() => setShowApplicationPage(true)}
                        >
                          New Application
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {loading &&

                  <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-4 border-teal"></div>
                  </div>

                }
                <Card>
                  <CardHeader>

                    <CardTitle>Profile Completion</CardTitle>
                    <CardDescription>Complete your profile to improve your applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-teal h-2.5 rounded-full"
                        style={{ width: `${profileCompletion.completion_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {profileCompletion.completion_percentage}% complete
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        {profileCompletion.education_history_count > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0"></span>
                        )}
                        <span>Add education history</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        {profileCompletion.documents_count > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0"></span>
                        )}
                        <span>Upload documents</span>
                      </li>

                    </ul>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate('/profile/complete')}
                    >
                      Complete Profile
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resources</CardTitle>
                    <CardDescription>Helpful materials for applicants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-teal" />
                        <a href="#" className="text-teal hover:underline">Application Guide</a>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-teal" />
                        <a href="#" className="text-teal hover:underline">Personal Statement Tips</a>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-teal" />
                        <a href="#" className="text-teal hover:underline">Scholarship Opportunities</a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <Card >
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communications from universities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-teal-600 font-medium">A</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Admissions Office</h3>
                      <p className="text-sm text-gray-500">Your application is under review</p>
                      <p className="text-xs text-gray-400 mt-1">February 28, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">S</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Scholarship Committee</h3>
                      <p className="text-sm text-gray-500">You may qualify for financial aid</p>
                      <p className="text-xs text-gray-400 mt-1">February 15, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'deadlines' && (
            <Card>
              <CardHeader>
                <CardTitle>Application Deadlines</CardTitle>
                <CardDescription>Important dates for your applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Application Submission</h3>
                      <p className="text-sm text-gray-500">Last date to submit your application</p>
                    </div>
                    <span className="font-medium">March 15, 2024</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Document Submission</h3>
                      <p className="text-sm text-gray-500">Last date to submit supporting documents</p>
                    </div>
                    <span className="font-medium">March 22, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Decision Notification</h3>
                      <p className="text-sm text-gray-500">When you'll receive admission decision</p>
                    </div>
                    <span className="font-medium">April 30, 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;