// components/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Inbox, BarChart3, CalendarDays, Bell, BookOpen, Settings,
    CheckCircle, Clock, XCircle, AlertCircle, Mail, PlusCircle,
    Edit, FilePlus, Loader2, ChevronDown, ChevronUp, Send, MessageSquare,
    FolderPlus, Home,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Sidebar = ({ institutionName, sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();

    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-50 text-black transition-all duration-300 ease-in-out flex flex-col h-full`}>
            <div className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md hover:bg-teal-600 hover:text-white"
                    >
                        {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                    </button>
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            <h2 className="text-xl font-bold">{institutionName}</h2>
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-2">
                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/enroller-dashboard')}
                    >
                        <Home className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Dashboard"}
                    </Button>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/institution-applications')}
                    >
                        <Users className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Applications"}
                    </Button>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/enroller-messages')}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Messages"}
                    </Button>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/programs')}
                    >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Programs"}
                    </Button>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/departments')}
                    >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Departments"}
                    </Button>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/faculties')}
                    >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Faculties"}
                    </Button>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/deadlines')}
                    >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Deadlines"}
                    </Button>
                </nav>

                <div className="mt-auto pt-4 border-t border-teal-600">
                    <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-teal-600 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
                        onClick={() => navigate('/enroller-settings')}
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        {sidebarOpen && "Settings"}
                    </Button>
                </div>
            </div>
        </div>
    );
};