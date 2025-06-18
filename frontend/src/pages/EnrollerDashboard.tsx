// src/pages/EnrollerDashboard.jsx
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
import { toast } from 'sonner';
import Loading from '@/components/Loading';
import { getEnrollerInstitution, getUserSettings } from '@/services/userService'; // Import getUserSettings

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
  const [enrollerSettings, setEnrollerSettings] = useState(null); // State for enroller settings
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      // Changed from /api/enrollment/dashboard/ to /api/enrollment/stats/ based on previous discussion
      // If you changed your backend to /api/enrollment/dashboard/ then use that
      const response = await axios.get('/api/enrollment/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
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

  const fetchEnrollerSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      const settings = await getUserSettings(); // Call the service function
      setEnrollerSettings(settings);
    } catch (err) {
      console.error('Error fetching enroller settings:', err);
      setSettingsError('Failed to load settings');
      toast.error('Settings Error: Failed to load enroller settings.');
    } finally {
      setSettingsLoading(false);
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
      fetchEnrollerSettings() // Fetch settings on refresh
    ]);
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
    // IMPORTANT: Check for 'is_enroller' specifically OR 'is_system_admin'
    if (!user || (!user.is_enroller && !user.is_system_admin)) {
      navigate('/dashboard'); // Redirect if not an enroller or system admin
      return;
    }

    refreshAllData();
    getInstitutionNameForDisplay(); // Fetch institution name when user data is available

    // Set up periodic refresh every 2 minutes
    const refreshInterval = setInterval(refreshAllData, 120000);

    return () => clearInterval(refreshInterval);
  }, [user, navigate]); // Depend on user and navigate

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
    return null; // Don't render anything if not authorized, rely on navigate
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
            <h1 className="text-xl font-bold text-gray-800">
              <span className="text-teal-600 to-emerald-300">{institutionName}</span> Enroller Dashboard
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

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-gray-600">Manage student applications and enrollment processes.</p>
        </div>

        {/* Stats Overview (remains unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            {
              title: 'Total Applications',
              value: dashboardData?.total_applicants || 0, // Adjusted to match `stats` endpoint
              icon: <Users className="h-6 w-6 text-blue-600" />,
              bg: 'bg-blue-100'
            },
            {
              title: 'Pending Review',
              value: dashboardData?.pending_review || 0, // Placeholder, `stats` endpoint doesn't return this
              icon: <Clock className="h-6 w-6 text-amber-600" />,
              bg: 'bg-amber-100'
            },
            {
              title: 'Approved',
              value: dashboardData?.approved || 0, // Placeholder
              icon: <CheckCircle className="h-6 w-6 text-green-600" />,
              bg: 'bg-green-100'
            },
            {
              title: 'Rejected',
              value: dashboardData?.rejected || 0, // Placeholder
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

        {/* Quick Actions (remains unchanged) */}
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
                {/* pending_applications is not part of the /api/enrollment/stats/ endpoint.
                    You need to decide if you want to modify stats, or create a dedicated dashboard endpoint.
                    For now, I'll use dummy data if dashboardData is null/empty, or adjust based on your `stats` actual response.
                    Assuming your `stats` endpoint provides `pending_applications` directly now. */}
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
                {dashboardData?.metrics_chart ? ( // This field might not exist if using `stats`
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
                {dashboardData?.upcoming_deadlines?.length > 0 ? ( // This field might not exist if using `stats`
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

            {/* Enroller Settings Card (New) */}
            <Card>
              <CardHeader>
                <CardTitle>Enroller Settings</CardTitle>
                <CardDescription>Configure your auto-actions and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : settingsError ? (
                  <div className="text-center py-4 text-red-500">
                    <AlertCircle className="h-5 w-5 inline-block mr-2" />
                    {settingsError}
                  </div>
                ) : enrollerSettings ? (
                  <div className="space-y-3 text-sm">
                    <p><strong>Auto-Accept:</strong> {enrollerSettings.enable_auto_accept ? 'Enabled' : 'Disabled'}</p>
                    {enrollerSettings.enable_auto_accept && (
                      <p className="text-xs text-gray-600 ml-2">
                        Min Points: {enrollerSettings.auto_accept_min_points || 'N/A'}
                        {enrollerSettings.auto_accept_programs && enrollerSettings.auto_accept_programs.length > 0 &&
                          ` for ${enrollerSettings.auto_accept_programs.map(p => p.name).join(', ')}`
                        }
                      </p>
                    )}
                    <p><strong>Auto-Review:</strong> {enrollerSettings.enable_auto_review ? 'Enabled' : 'Disabled'}</p>
                    {enrollerSettings.enable_auto_review && enrollerSettings.auto_review_criteria && Object.keys(enrollerSettings.auto_review_criteria).length > 0 && (
                      <p className="text-xs text-gray-600 ml-2">
                        Criteria: {JSON.stringify(enrollerSettings.auto_review_criteria)}
                      </p>
                    )}
                    <p><strong>Auto-Assign Reviewer:</strong> {enrollerSettings.auto_assign_reviewer ? 'Enabled' : 'Disabled'}</p>
                    {enrollerSettings.auto_assign_reviewer && enrollerSettings.default_reviewer_id && (
                      <p className="text-xs text-gray-600 ml-2">
                        Default Reviewer ID: {enrollerSettings.default_reviewer_id}
                      </p>
                    )}
                    {enrollerSettings.advanced_preferences && Object.keys(enrollerSettings.advanced_preferences).length > 0 && (
                      <p className="text-xs text-gray-600">
                        <strong>Advanced:</strong> {JSON.stringify(enrollerSettings.advanced_preferences)}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      // Navigate to the new settings page
                      onClick={() => navigate('/enroller-settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Settings
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-300 mx-auto" />
                    <p className="mt-2 text-gray-500">No enroller settings found.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => navigate('/enroller-settings')}
                    >
                      Set Up Settings
                    </Button>
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