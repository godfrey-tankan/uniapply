import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Building, Database, ChevronRight, Bell, BookOpen,
  Settings, UserPlus, School, AlertTriangle, Cpu, HardDrive,
  MemoryStick, Server, Gauge, CalendarClock, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/Loading';
import Footer from '@/components/Footer';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [universityAdmins, setUniversityAdmins] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastUpdated, setLastUpdated] = useState(null);

  // Form states
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    institution: ''
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const [statsRes, metricsRes, institutionsRes, adminsRes] = await Promise.all([
        axios.get('/api/system-admin/dashboard_stats/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/system-admin/system_metrics/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/institutions/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/system-admin/list_university_admins/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setSystemMetrics(metricsRes.data);
      setInstitutions(institutionsRes.data.results || institutionsRes.data);
      setUniversityAdmins(adminsRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      toast.error('Dashboard Error: Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createUniversityAdmin = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/system-admin/create_university_admin/', newAdmin, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('University admin created successfully');
      setNewAdmin({ name: '', email: '', password: '', institution: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating university admin:', err);
      toast.error('Failed to create university admin');
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!user.is_system_admin) {
      navigate('/dashboard');
    } else {
      fetchDashboardData();

      // Set up periodic refresh
      const interval = setInterval(fetchDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [user, navigate, refreshInterval]);

  if (!user || !user.is_system_admin) {
    return null;
  }

  if (loading && !stats) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchDashboardData}>Retry</Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const userDistributionData = stats?.user_stats?.user_distribution?.map(item => ({
    name: item.is_student ? 'Students' : item.is_enroller ? 'Enrollers' : 'Admins',
    value: item.count,
    color: item.is_student ? '#0088FE' : item.is_enroller ? '#00C49F' : '#FFBB28'
  }));

  const applicationTrendsData = stats?.application_trends?.map(item => ({
    name: `${new Date(2000, item.month - 1).toLocaleString('default', { month: 'short' })} ${item.year}`,
    applications: item.count
  }));

  const institutionPerformanceData = stats?.institution_stats?.map(item => ({
    name: item.name,
    programs: item.num_programs,
    applications: item.num_applications
  }));

  return (
    <div>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-teal-600" />
              <h1 className="text-xl font-bold text-gray-800">System Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 w-10 h-10 flex items-center justify-center text-purple-600 font-medium">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
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
            <p className="text-gray-600">
              Manage users, universities, and system settings.
              {lastUpdated && (
                <span className="text-xs text-gray-400 ml-2">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{stats?.user_stats?.total_users || 0}</p>
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
                    <p className="text-2xl font-bold">{institutions.length}</p>
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
                    <p className="text-2xl font-bold">
                      {stats?.application_trends?.reduce((sum, item) => sum + item.count, 0) || 0}
                    </p>
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
                    <p className="text-sm font-medium text-gray-500">System Health</p>
                    <p className="text-2xl font-bold">
                      {systemMetrics?.cpu_usage < 80 ? 'Good' : 'Warning'}
                    </p>
                  </div>
                  <div className="rounded-full bg-red-100 p-3">
                    <Gauge className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-auto py-4 bg-purple-600 hover:bg-purple-700 flex gap-3 items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                  <span>Add University Admin</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New University Admin</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                      id="admin-name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      placeholder="Admin Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      placeholder="admin@university.edu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      placeholder="Set a strong password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-institution">Institution</Label>
                    <Select
                      value={newAdmin.institution}
                      onValueChange={(value) => setNewAdmin({ ...newAdmin, institution: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutions.map((institution) => (
                          <SelectItem key={institution.id} value={institution.id}>
                            {institution.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createUniversityAdmin}>Create Admin</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="h-auto py-4 flex gap-3 items-center justify-center"
              onClick={() => navigate('/manage-institutions')}
            >
              <Building className="h-5 w-5" />
              <span>Manage Universities</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex gap-3 items-center justify-center"
              onClick={() => navigate('/system-settings')}
            >
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
                  <CardTitle>Application Trends</CardTitle>
                  <CardDescription>Monthly application submissions</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={applicationTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="applications" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Real-time system metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">CPU Usage</h3>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${systemMetrics?.cpu_usage || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {systemMetrics?.cpu_usage || 0}% utilized
                      </p>

                      <div className="flex items-center gap-2 mt-6">
                        <MemoryStick className="h-5 w-5 text-purple-500" />
                        <h3 className="font-medium">Memory Usage</h3>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${systemMetrics?.memory?.usage || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {systemMetrics?.memory?.used || 0} GB of {systemMetrics?.memory?.total || 0} GB used
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">Disk Usage</h3>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${systemMetrics?.disk?.usage || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {systemMetrics?.disk?.used || 0} GB of {systemMetrics?.disk?.total || 0} GB used
                      </p>

                      <div className="flex items-center gap-2 mt-6">
                        <Server className="h-5 w-5 text-amber-500" />
                        <h3 className="font-medium">Database</h3>
                      </div>
                      <p className="text-sm">
                        Size: {systemMetrics?.database_size_mb || 0} MB
                      </p>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-gray-500" />
                        <p className="text-xs text-gray-500">
                          Uptime: {systemMetrics?.system_info?.uptime || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>System-wide user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {stats?.recent_activities?.map((activity, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="rounded-full bg-teal-100 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {activity.user__name} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of user types</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userDistributionData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>University Admins</CardTitle>
                  <CardDescription>Active university administrators</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Institution</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {universityAdmins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.name}</TableCell>
                            <TableCell>{admin.assigned_institution__name || 'Unassigned'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;