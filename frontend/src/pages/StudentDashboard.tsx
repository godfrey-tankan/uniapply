import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, Inbox, Clock, FileText, Bell, BookOpen, CheckCircle, Clock as ClockIcon, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApplicationPage from './Application';
import Footer from '../components/Footer';
import axios from 'axios';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showApplicationPage, setShowApplicationPage] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.is_student) {
      fetchApplications();
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Button
            onClick={() => setShowApplicationPage(true)}
            className="h-auto py-4 bg-teal hover:bg-teal-dark flex gap-3 items-center justify-center"
          >
            <FilePlus2 className="h-5 w-5" />
            <span>New Application</span>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex gap-3 items-center justify-center">
            <Inbox className="h-5 w-5" />
            <span>View Messages</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex gap-3 items-center justify-center">
            <Clock className="h-5 w-5" />
            <span>Application Deadlines</span>
          </Button>
        </div>

        {/* Dashboard Content */}
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
                  <div className="space-y-4">
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

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Important dates for your applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  No upcoming deadlines.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>Complete your profile to improve your applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div className="bg-teal h-2.5 rounded-full w-2/5"></div>
                </div>
                <p className="text-sm text-gray-600 mb-4">40% complete</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0"></span>
                    <span>Add education history</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0"></span>
                    <span>Upload documents</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0"></span>
                    <span>Complete personal statement</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
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
        <Footer />
      </main>
    </div>
  );
};

export default StudentDashboard;