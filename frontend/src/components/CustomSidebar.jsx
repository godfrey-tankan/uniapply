import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
    Users, Inbox, BarChart3, CalendarDays, Bell, BookOpen, Settings,
    CheckCircle, Clock, XCircle, AlertCircle, Mail, PlusCircle,
    Edit, FilePlus, Loader2, ChevronDown, ChevronUp, Send, MessageSquare,
    FolderPlus, Home,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sidebar.jsx (update)
export const CustomSidebar = ({ institutionName, sidebarOpen, setSidebarOpen, isUniversityAdmin }) => {
    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md transition-all duration-300`}>
            <div className="p-4 flex items-center justify-between border-b">
                {sidebarOpen ? (
                    <h2 className="text-lg font-semibold text-teal-600">{institutionName}</h2>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                        {institutionName.charAt(0)}
                    </div>
                )}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 rounded-md hover:bg-gray-100"
                >
                    {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
            </div>
            <nav className="p-2">
                <ul className="space-y-1">
                    <li>
                        <NavLink
                            to="/university-admin-dashboard"
                            className="flex items-center p-2 rounded-md hover:bg-teal-50 text-gray-700 hover:text-teal-600"
                            activeClassName="bg-teal-50 text-teal-600"
                        >
                            <Home className="h-5 w-5" />
                            {sidebarOpen && <span className="ml-3">Dashboard</span>}
                        </NavLink>
                    </li>

                    {isUniversityAdmin && (
                        <>
                            <li>
                                <NavLink
                                    to="/university-admin/enrollers"
                                    className="flex items-center p-2 rounded-md hover:bg-teal-50 text-gray-700 hover:text-teal-600"
                                    activeClassName="bg-teal-50 text-teal-600"
                                >
                                    <Users className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Enrollers</span>}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/university-admin/faculties"
                                    className="flex items-center p-2 rounded-md hover:bg-teal-50 text-gray-700 hover:text-teal-600"
                                    activeClassName="bg-teal-50 text-teal-600"
                                >
                                    <BookOpen className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Faculties</span>}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/university-admin/departments"
                                    className="flex items-center p-2 rounded-md hover:bg-teal-50 text-gray-700 hover:text-teal-600"
                                    activeClassName="bg-teal-50 text-teal-600"
                                >
                                    <FolderPlus className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Departments</span>}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/university-admin/programs"
                                    className="flex items-center p-2 rounded-md hover:bg-teal-50 text-gray-700 hover:text-teal-600"
                                    activeClassName="bg-teal-50 text-teal-600"
                                >
                                    <FilePlus className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Programs</span>}
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
};