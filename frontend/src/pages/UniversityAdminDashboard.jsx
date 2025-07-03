// UniversityAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    Users, BookOpen, FolderPlus, FilePlus, UserPlus, Settings,
    ChevronDown, ChevronUp, Home, Bell, Mail, CalendarDays,
    CheckCircle, Clock, XCircle, AlertCircle, PlusCircle, Edit, ChevronRight, ChevronLeft, Loader2
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Loading from '@/components/Loading';
import { CustomSidebar } from '@/components/CustomSidebar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UniversityAdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [enrollers, setEnrollers] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    console.log('faculties....', faculties)
    console.log('departments.....', departments)
    console.log('programs....', programs)
    // Form states
    const [newEnroller, setNewEnroller] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [newFaculty, setNewFaculty] = useState({ name: '', code: '' });
    const [newDepartment, setNewDepartment] = useState({ name: '', faculty: '' });
    const [newProgram, setNewProgram] = useState({
        name: '',
        code: '',
        department: '',
        min_points_required: 5,
        required_subjects: 'Mathematics,English',
        description: ''
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get('/api/university-admin/dashboard_stats/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.response?.data?.error || 'Failed to load dashboard data');
            toast.error('Dashboard Error: Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('/api/university-admin/list_enrollers/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setEnrollers(response.data);
        } catch (err) {
            console.error('Error fetching enrollers:', err);
            toast.error('Failed to load enrollers');
        }
    };

    const fetchFaculties = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('/api/university-admin/faculties/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFaculties(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching faculties:', err);
            toast.error('Failed to load faculties');
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('/api/university-admin/departments/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setDepartments(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
            toast.error('Failed to load departments');
        }
    };

    const fetchPrograms = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('/api/university-admin/programs/', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { institution_id: user?.assigned_institution }
            });
            setPrograms(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching programs:', err);
            toast.error('Failed to load programs');
        }
    };

    const createEnroller = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('/api/university-admin/create_enroller/', newEnroller, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Enroller created successfully');
            setNewEnroller({ name: '', email: '', password: '' });
            fetchEnrollers();
        } catch (err) {
            console.error('Error creating enroller:', err);
            toast.error('Failed to create enroller');
        }
    };

    const createFaculty = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('/api/university-admin/manage_faculty/', newFaculty, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Faculty created successfully');
            setNewFaculty({ name: '', code: '' });
            fetchFaculties();
        } catch (err) {
            console.error('Error creating faculty:', err);
            toast.error('Failed to create faculty');
        }
    };

    const createDepartment = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('/api/university-admin/manage_department/', newDepartment, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Department created successfully');
            setNewDepartment({ name: '', faculty: '' });
            fetchDepartments();
        } catch (err) {
            console.error('Error creating department:', err);
            toast.error('Failed to create department');
        }
    };

    const createProgram = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('/api/university-admin/manage_program/', newProgram, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Program created successfully');
            setNewProgram({
                name: '',
                code: '',
                department: '',
                min_points_required: 5,
                required_subjects: 'Mathematics,English',
                description: ''
            });
            fetchPrograms();
        } catch (err) {
            console.error('Error creating program:', err);
            toast.error('Failed to create program');
        }
    };

    const refreshAllData = async () => {
        await Promise.all([
            fetchDashboardData(),
            fetchEnrollers(),
            fetchFaculties(),
            fetchDepartments(),
            fetchPrograms()
        ]);
    };

    useEffect(() => {
        if (!user || !user.is_university_admin) {
            navigate('/dashboard');
            return;
        }

        refreshAllData();
    }, [user, navigate]);

    if (!user || !user.is_university_admin) {
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
                            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">
                            UniApply - <span className="text-teal-600">University Admin Dashboard</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={refreshAllData}
                            disabled={loading}
                        >
                            <Loader2 className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
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
            <div className="flex flex-1 overflow-hidden">
                <CustomSidebar
                    institutionName={user.assigned_institution?.name || 'University Admin'}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isUniversityAdmin={true}
                />

                <ScrollArea className="flex-1 overflow-y-auto">
                    <main className="container mx-auto py-8 px-6">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">University Administration</h2>
                            <p className="text-gray-600">Manage your institution's academic structure and enrollment processes.</p>
                        </div>

                        {/* Application Trends */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Application Trends</CardTitle>
                                    <CardDescription>Monthly application submissions</CardDescription>
                                </CardHeader>
                                <CardContent className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats?.application_trends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Application Status Distribution</CardTitle>
                                    <CardDescription>Current status of all applications</CardDescription>
                                </CardHeader>
                                <CardContent className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats?.status_distribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                                nameKey="status"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {stats?.status_distribution?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Popular Programs */}
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Most Popular Programs</CardTitle>
                                    <CardDescription>Programs with highest application volume</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={stats?.program_popularity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="applications_count" fill="#0d9488" name="Applications" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Management Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Enrollers Management */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Enrollers</CardTitle>
                                            <CardDescription>Manage institution enrollers</CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-2">
                                                    <UserPlus className="h-4 w-4" /> Add Enroller
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create New Enroller</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Full Name</Label>
                                                        <Input
                                                            id="name"
                                                            value={newEnroller.name}
                                                            onChange={(e) => setNewEnroller({ ...newEnroller, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={newEnroller.email}
                                                            onChange={(e) => setNewEnroller({ ...newEnroller, email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">Password</Label>
                                                        <Input
                                                            id="password"
                                                            type="password"
                                                            value={newEnroller.password}
                                                            onChange={(e) => setNewEnroller({ ...newEnroller, password: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={createEnroller}>Create Enroller</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Last Login</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {enrollers.map((enroller) => (
                                                    <TableRow key={enroller.id}>
                                                        <TableCell>{enroller.name}</TableCell>
                                                        <TableCell>{enroller.email}</TableCell>
                                                        <TableCell>
                                                            {enroller.last_login ? new Date(enroller.last_login).toLocaleString() : 'Never'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Faculties Management */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Faculties</CardTitle>
                                            <CardDescription>Manage institution faculties</CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-2">
                                                    <FolderPlus className="h-4 w-4" /> Add Faculty
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create New Faculty</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="faculty-name">Faculty Name</Label>
                                                        <Input
                                                            id="faculty-name"
                                                            value={newFaculty.name}
                                                            onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="faculty-code">Faculty Code</Label>
                                                        <Input
                                                            id="faculty-code"
                                                            value={newFaculty.code}
                                                            onChange={(e) => setNewFaculty({ ...newFaculty, code: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={createFaculty}>Create Faculty</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Applications</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {faculties.map((faculty) => (
                                                    <TableRow key={faculty.id}>
                                                        <TableCell>{faculty.name}</TableCell>
                                                        <TableCell>{faculty.code}</TableCell>
                                                        <TableCell>
                                                            {faculty.applications_count || 0}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Departments & Programs */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Departments Management */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Departments</CardTitle>
                                            <CardDescription>Manage academic departments</CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-2">
                                                    <FolderPlus className="h-4 w-4" /> Add Department
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create New Department</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="department-name">Department Name</Label>
                                                        <Input
                                                            id="department-name"
                                                            value={newDepartment.name}
                                                            onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="department-faculty">Faculty</Label>
                                                        <Select
                                                            value={newDepartment.faculty}
                                                            onValueChange={(value) => setNewDepartment({ ...newDepartment, faculty: value })}
                                                        >
                                                            <SelectTrigger>
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
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={createDepartment}>Create Department</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Faculty</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {departments.map((dept) => (
                                                    <TableRow key={dept.id}>
                                                        <TableCell>{dept.name}</TableCell>
                                                        <TableCell>
                                                            {dept.faculty__name}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Programs Management */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Programs</CardTitle>
                                            <CardDescription>Manage academic programs</CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-2">
                                                    <FilePlus className="h-4 w-4" /> Add Program
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Create New Program</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="program-name">Program Name</Label>
                                                        <Input
                                                            id="program-name"
                                                            value={newProgram.name}
                                                            onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="program-code">Program Code</Label>
                                                            <Input
                                                                id="program-code"
                                                                value={newProgram.code}
                                                                onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="program-points">Minimum Points</Label>
                                                            <Input
                                                                id="program-points"
                                                                type="number"
                                                                value={newProgram.min_points_required}
                                                                onChange={(e) => setNewProgram({ ...newProgram, min_points_required: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="program-department">Department</Label>
                                                        <Select
                                                            value={newProgram.department}
                                                            onValueChange={(value) => setNewProgram({ ...newProgram, department: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {departments.map((dept) => (
                                                                    <SelectItem key={dept.id} value={dept.id}>
                                                                        {dept.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="program-subjects">Required Subjects</Label>
                                                        <Input
                                                            id="program-subjects"
                                                            value={newProgram.required_subjects}
                                                            onChange={(e) => setNewProgram({ ...newProgram, required_subjects: e.target.value })}
                                                            placeholder="Comma separated list (e.g., Mathematics,English)"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="program-description">Description</Label>
                                                        <Input
                                                            id="program-description"
                                                            value={newProgram.description}
                                                            onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={createProgram}>Create Program</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Min Points</TableHead>
                                                    <TableHead>Department</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {programs.map((program) => (
                                                    <TableRow key={program.id}>
                                                        <TableCell>{program.name}</TableCell>
                                                        <TableCell>{program.code}</TableCell>
                                                        <TableCell>{program.min_points_required}</TableCell>
                                                        <TableCell>
                                                            {program.department__name}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </ScrollArea>
            </div>
        </div>
    );
};

export default UniversityAdminDashboard;