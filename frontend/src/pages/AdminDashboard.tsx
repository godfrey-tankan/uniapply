import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Building, Database, ChevronRight, Bell, BookOpen,
  Settings, PieChart, UserPlus, School, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/Loading';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Add a loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // If user data is not available yet, just return without doing anything.
      return;
    }

    // Once the user is loaded, check if they are an admin
    if (!user.is_system_admin) {
      navigate('/dashboard');  // Redirect non-admin users
    } else {
      setLoading(false);  // Set loading to false once the user is confirmed as admin
    }
  }, [user, navigate]);

  if (loading) {
    // Optionally, you can return a loading spinner or something similar
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-teal" />
            <h1 className="text-xl font-bold text-navy">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 w-10 h-10 flex items-center justify-center text-purple-600 font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">System Administration</h2>
          <p className="text-gray-600">Manage users, universities, and system settings.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">1,245</p>
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
                  <p className="text-sm font-medium text-gray-500">Universities</p>
                  <p className="text-2xl font-bold">56</p>
                </div>
                <div className="rounded-full bg-amber-100 p-3">
                  <School className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Applications</p>
                  <p className="text-2xl font-bold">3,891</p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">System Alerts</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Button className="h-auto py-4 bg-purple-600 hover:bg-purple-700 flex gap-3 items-center justify-center">
            <UserPlus className="h-5 w-5" />
            <span>Add New User</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex gap-3 items-center justify-center">
            <Building className="h-5 w-5" />
            <span>Manage Universities</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex gap-3 items-center justify-center">
            <Settings className="h-5 w-5" />
            <span>System Settings</span>
          </Button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest user registrations and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">User #{i}</p>
                        <p className="text-sm text-gray-500">{i % 2 === 0 ? 'New registration' : 'Updated profile'}</p>
                        <p className="text-xs text-gray-400">{i} hour{i !== 1 ? 's' : ''} ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Server Status</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Database</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Storage</p>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">72% Used</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">API Services</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of user types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md mb-2">
                  <PieChart className="h-16 w-16 text-gray-300" />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal rounded-full"></div>
                      <span className="text-sm">Students</span>
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Enrollers</span>
                    </div>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Administrators</span>
                    </div>
                    <span className="text-sm font-medium">7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>System notifications requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="rounded-full bg-red-100 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">High server load detected</p>
                      <p className="text-xs text-gray-500">Today, 10:45 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="rounded-full bg-amber-100 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Storage capacity warning</p>
                      <p className="text-xs text-gray-500">Yesterday, 3:30 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
