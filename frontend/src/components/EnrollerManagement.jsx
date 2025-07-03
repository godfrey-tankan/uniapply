import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Users, UserPlus, Edit, Trash2, Lock, Unlock, Mail, ChevronDown, ChevronUp,
    Search, Filter, MoreVertical, Loader2, Check, X, ChevronRight, ChevronLeft
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';

const EnrollerManagement = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollers, setEnrollers] = useState([]);
    const [filteredEnrollers, setFilteredEnrollers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const enrollersPerPage = 10;

    // Form states
    const [newEnroller, setNewEnroller] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [editEnroller, setEditEnroller] = useState(null);
    const [resetPasswordEnroller, setResetPasswordEnroller] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const fetchEnrollers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get('/api/university-admin/list_enrollers/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setEnrollers(response.data);
            setFilteredEnrollers(response.data);
        } catch (err) {
            console.error('Error fetching enrollers:', err);
            setError(err.response?.data?.error || 'Failed to load enrollers');
            toast.error('Failed to load enrollers');
        } finally {
            setLoading(false);
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

    const updateEnroller = async () => {
        if (!editEnroller) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`/api/university-admin/enrollers/${editEnroller.id}/`, editEnroller, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Enroller updated successfully');
            setEditEnroller(null);
            fetchEnrollers();
        } catch (err) {
            console.error('Error updating enroller:', err);
            toast.error('Failed to update enroller');
        }
    };

    const toggleEnrollerStatus = async (enrollerId, isActive) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.patch(`/api/university-admin/enrollers/${enrollerId}/status/`,
                { is_active: !isActive },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            toast.success(`Enroller ${isActive ? 'deactivated' : 'activated'} successfully`);
            fetchEnrollers();
        } catch (err) {
            console.error('Error toggling enroller status:', err);
            toast.error('Failed to update enroller status');
        }
    };

    const resetPassword = async () => {
        if (!resetPasswordEnroller) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`/api/university-admin/enrollers/${resetPasswordEnroller.id}/reset_password/`,
                { new_password: newPassword },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            toast.success('Password reset successfully');
            setResetPasswordEnroller(null);
            setNewPassword('');
        } catch (err) {
            console.error('Error resetting password:', err);
            toast.error('Failed to reset password');
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term === '') {
            setFilteredEnrollers(enrollers);
        } else {
            const filtered = enrollers.filter(enroller =>
                enroller.name.toLowerCase().includes(term.toLowerCase()) ||
                enroller.email.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredEnrollers(filtered);
        }
    };

    // Pagination logic
    const indexOfLastEnroller = currentPage * enrollersPerPage;
    const indexOfFirstEnroller = indexOfLastEnroller - enrollersPerPage;
    const currentEnrollers = filteredEnrollers.slice(indexOfFirstEnroller, indexOfLastEnroller);
    const totalPages = Math.ceil(filteredEnrollers.length / enrollersPerPage);

    useEffect(() => {
        if (!user || !user.is_university_admin) {
            navigate('/dashboard');
            return;
        }

        fetchEnrollers();
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
                    <h3 className="text-lg font-medium mb-2">Error loading enrollers</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={fetchEnrollers}>Retry</Button>
                        <Button variant="outline" onClick={() => navigate('/university-admin-dashboard')}>Back to Dashboard</Button>
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
                            UniApply - <span className="text-teal-600">Enroller Management</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={fetchEnrollers}
                            disabled={loading}
                        >
                            <Loader2 className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
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
                <Sidebar
                    institutionName={user.assigned_institution?.name || 'University Admin'}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isUniversityAdmin={true}
                />

                <ScrollArea className="flex-1 overflow-y-auto">
                    <main className="container mx-auto py-8 px-6">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enroller Management</h2>
                            <p className="text-gray-600">Manage enrollers for your institution</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <CardTitle>Enrollers</CardTitle>
                                        <CardDescription>
                                            {filteredEnrollers.length} enroller(s) found
                                            {searchTerm && ` matching "${searchTerm}"`}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search enrollers..."
                                                className="pl-10"
                                                value={searchTerm}
                                                onChange={(e) => handleSearch(e.target.value)}
                                            />
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="gap-2">
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
                                                            placeholder="John Doe"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={newEnroller.email}
                                                            onChange={(e) => setNewEnroller({ ...newEnroller, email: e.target.value })}
                                                            placeholder="enroller@institution.edu"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">Password</Label>
                                                        <Input
                                                            id="password"
                                                            type="password"
                                                            value={newEnroller.password}
                                                            onChange={(e) => setNewEnroller({ ...newEnroller, password: e.target.value })}
                                                            placeholder="Set a strong password"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={createEnroller}>Create Enroller</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredEnrollers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No enrollers found</p>
                                        {searchTerm && (
                                            <Button
                                                variant="ghost"
                                                className="mt-4"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilteredEnrollers(enrollers);
                                                }}
                                            >
                                                Clear search
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Last Login</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentEnrollers.map((enroller) => (
                                                    <TableRow key={enroller.id}>
                                                        <TableCell className="font-medium">{enroller.name}</TableCell>
                                                        <TableCell>{enroller.email}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={enroller.is_active ? 'default' : 'destructive'}>
                                                                {enroller.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {enroller.last_login ? new Date(enroller.last_login).toLocaleString() : 'Never'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setEditEnroller(enroller)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => toggleEnrollerStatus(enroller.id, enroller.is_active)}
                                                                >
                                                                    {enroller.is_active ? (
                                                                        <Lock className="h-4 w-4 text-red-500" />
                                                                    ) : (
                                                                        <Unlock className="h-4 w-4 text-green-500" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setResetPasswordEnroller(enroller)}
                                                                >
                                                                    <Mail className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-gray-500">
                                                Showing {indexOfFirstEnroller + 1} to{' '}
                                                {Math.min(indexOfLastEnroller, filteredEnrollers.length)} of{' '}
                                                {filteredEnrollers.length} enrollers
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                </ScrollArea>
            </div>

            {/* Edit Enroller Dialog */}
            {editEnroller && (
                <Dialog open={!!editEnroller} onOpenChange={() => setEditEnroller(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Enroller</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editEnroller.name}
                                    onChange={(e) => setEditEnroller({ ...editEnroller, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editEnroller.email}
                                    onChange={(e) => setEditEnroller({ ...editEnroller, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditEnroller(null)}>
                                Cancel
                            </Button>
                            <Button onClick={updateEnroller}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Reset Password Dialog */}
            {resetPasswordEnroller && (
                <Dialog open={!!resetPasswordEnroller} onOpenChange={() => setResetPasswordEnroller(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Password for {resetPasswordEnroller.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setResetPasswordEnroller(null);
                                setNewPassword('');
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={resetPassword}>Reset Password</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default EnrollerManagement;