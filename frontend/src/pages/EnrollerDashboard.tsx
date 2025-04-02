import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Inbox, BarChart3, CalendarDays, Bell, BookOpen, Settings,
  CheckCircle, Clock, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EnrollerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.is_student || user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        const response = await axios.get('/api/enrollment/dashboard/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (!user || user.is_student || user.isAdmin) {
    return null;
  }

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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-teal" />
            <h1 className="text-xl font-bold text-navy">Enroller Dashboard</h1>
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

      {/* Main Content */}
      <main className="container mx-auto py-8 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-gray-600">Manage student applications and enrollment processes.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Applications</p>
                  <p className="text-2xl font-bold">{dashboardData?.stats.total_applications || 0}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold">{dashboardData?.stats.pending_review || 0}</p>
                </div>
                <div className="rounded-full bg-amber-100 p-3">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold">{dashboardData?.stats.approved || 0}</p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold">{dashboardData?.stats.rejected || 0}</p>
                </div>
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Button
            className="h-auto py-4 bg-teal hover:bg-teal-dark flex gap-3 items-center justify-center"
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
          {/* Applications Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Applications awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {dashboardData?.pending_applications?.length > 0 ? (
                    dashboardData.pending_applications.map((application) => (
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
                          className="bg-teal hover:bg-teal-dark"
                          onClick={() => navigate(`/applications/${application.id}`)}
                        >
                          Review
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">No pending applications</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recent_activity?.length > 0 ? (
                    dashboardData.recent_activity.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="rounded-full bg-gray-100 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-teal" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
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
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md mb-2">
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
                <ul className="space-y-3">
                  {dashboardData?.upcoming_deadlines?.length > 0 ? (
                    dashboardData.upcoming_deadlines.map((deadline, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-teal" />
                        <div>
                          <p className="font-medium">{deadline.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(deadline.date).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">No upcoming deadlines</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnrollerDashboard;