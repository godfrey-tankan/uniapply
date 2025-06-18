import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Inbox, BarChart3, CalendarDays, Bell, BookOpen, Settings,
  CheckCircle, Clock, XCircle, AlertCircle,
  Edit, FilePlus, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '@/components/Footer';
import { toast } from 'sonner'; // Assuming you're using Sonner for toast notifications
import Loading from '@/components/Loading';

const EnrollerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const response = await axios.get('/api/enrollment/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 seconds timeout
      });

      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(`Dashboard Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      const token = localStorage.getItem('authToken');

      const response = await axios.get('/api/applications/my_activities/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 8000 // 8 seconds timeout
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

  const loadActivities = async () => {
    const data = await fetchUserActivities();
    setActivities(data);
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchDashboardData(),
      loadActivities()
    ]);
  };

  useEffect(() => {
    if (!user || user.is_student || user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    refreshAllData();

    // Set up periodic refresh every 2 minutes
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

  if (!user || user.is_student || user.isAdmin) {
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-teal-600" />
            <h1 className="text-xl font-bold text-gray-800">Enroller Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={refreshAllData}
              disabled={loading || activitiesLoading}
            >
              <Loader2 className={`h-5 w-5 ${(loading || activitiesLoading) ? 'animate-spin' : ''}`} />
            </Button> */}
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

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-gray-600">Manage student applications and enrollment processes.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            {
              title: 'Total Applications',
              value: dashboardData?.stats?.total_applications || 0,
              icon: <Users className="h-6 w-6 text-blue-600" />,
              bg: 'bg-blue-100'
            },
            {
              title: 'Pending Review',
              value: dashboardData?.stats?.pending_review || 0,
              icon: <Clock className="h-6 w-6 text-amber-600" />,
              bg: 'bg-amber-100'
            },
            {
              title: 'Approved',
              value: dashboardData?.stats?.approved || 0,
              icon: <CheckCircle className="h-6 w-6 text-green-600" />,
              bg: 'bg-green-100'
            },
            {
              title: 'Rejected',
              value: dashboardData?.stats?.rejected || 0,
              icon: <XCircle className="h-6 w-6 text-red-600" />,
              bg: 'bg-red-100'
            }
          ].map((stat, index) => (
            <Card key={index}>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Button
            className="h-auto py-4 bg-teal-600 hover:bg-teal-700 flex gap-3 items-center justify-center"
            onClick={() => navigate('/applications')}
          >
            <Users className="h-5 w-5" />
            <span>Review Applications</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex gap-3 items-center justify-center"
            onClick={() => navigate('/messages')}
          >
            <Inbox className="h-5 w-5" />
            <span>Student Messages</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex gap-3 items-center justify-center"
            onClick={() => navigate('/schedule')}
          >
            <CalendarDays className="h-5 w-5" />
            <span>Schedule Interviews</span>
          </Button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Applications awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.pending_applications?.length > 0 ? (
                  <div className="divide-y">
                    {dashboardData.pending_applications.map((application) => (
                      <div key={application.id} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{application.student_name}</p>
                          <p className="text-sm text-gray-500">Applied for {application.program_name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(application.date_applied).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => navigate(`/review-application/${application.id}`)}
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

            <Card>
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Metrics</CardTitle>
                <CardDescription>This month's application statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.metrics_chart ? (
                  <img
                    src={`data:image/png;base64,${dashboardData.metrics_chart}`}
                    alt="Application metrics chart"
                    className="w-full h-auto rounded border"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md border">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <p className="text-sm text-gray-600 text-center mt-2">
                  {dashboardData?.metrics_summary || 'Application metrics not available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Important enrollment dates</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.upcoming_deadlines?.length > 0 ? (
                  <ul className="space-y-3">
                    {dashboardData.upcoming_deadlines.map((deadline, index) => (
                      <li key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EnrollerDashboard;