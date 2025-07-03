import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjusted path for contexts
import { Button } from '../components/ui/button'; // Adjusted path for ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'; // Adjusted path for ui components
import { FilePlus2, Inbox, Clock, FileText, Bell, BookOpen, CheckCircle, Clock as ClockIcon, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApplicationPage from './Application'; // Assuming Application.jsx is in the same directory (e.g., src/pages/)
import Footer from '../components/Footer'; // Adjusted path for components
import axios from 'axios';
import Loading from '../components/Loading'; // Adjusted path for components
import Chatbot from '../components/Chatbot'; // Adjusted path for components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'; // Adjusted path for ui components
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area'; // Adjusted path for ui components

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Notification Modal Component
const NotificationModal = ({ notifications, onMarkAsRead, onMarkAllAsRead, onNotificationClick, onClose }) => {
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </DialogTitle>
          <DialogDescription>
            Your latest updates and alerts from the university.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {unreadNotifications.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Unread ({unreadNotifications.length})</h3>
                  <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                    Mark all as read
                  </Button>
                </div>
                {unreadNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="bg-blue-50 border border-blue-200 rounded-md p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => onNotificationClick(notification)}
                  >
                    <h4 className="font-medium text-blue-800">{notification.title}</h4>
                    <p className="text-sm text-blue-700 truncate">{notification.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                  </div>
                ))}
              </>
            )}
            {readNotifications.length > 0 && (
              <>
                <h3 className="font-semibold text-lg mt-6">Read</h3>
                {readNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="bg-gray-50 border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onNotificationClick(notification)}
                  >
                    <h4 className="font-medium text-gray-800">{notification.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{notification.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                  </div>
                ))}
              </>
            )}
            {notifications.length === 0 && (
              <p className="text-center text-gray-500 py-8">No notifications to display.</p>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button onClick={onClose}
            className='bg-teal-500 hover:bg-teal-600 text-white'
          >Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Read Notification Detail Modal Component
const ReadNotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
          <DialogDescription>
            <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-700 whitespace-pre-wrap">{notification.content}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showApplicationPage, setShowApplicationPage] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'messages', 'notifications', 'deadlines', 'profile'
  const [profileCompletion, setProfileCompletion] = useState({
    completion_percentage: 0,
    education_history_count: 0,
    documents_count: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const token = localStorage.getItem('authToken');

  // Fetch Profile Completion
  const fetchProfileCompletion = useCallback(async () => {
    try {
      const response = await axios.get('/auth/profile-completion/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfileCompletion(response.data);
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    }
  }, [token]);

  // Fetch Applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/applications/my_applications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setApplications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`/api/notifications/my_notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [token]);

  // Mark a single notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/mark_as_read/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [token]);

  // Mark all unread notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await axios.post(`/api/notifications/mark_all_as_read/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [token]);

  // Fetch Messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`/api/messages/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [token]);

  // Fetch Deadlines
  const fetchDeadlines = useCallback(async () => {
    try {
      const response = await axios.get(`/api/deadlines/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeadlines(response.data);
    } catch (err) {
      console.error('Error fetching deadlines:', err);
    }
  }, [token]);


  useEffect(() => {
    if (user && user.is_student) {
      fetchApplications();
      fetchProfileCompletion();
      // Fetch all data on initial load
      fetchNotifications();
      fetchMessages();
      fetchDeadlines();
    } else if (!user) {
      navigate('/dashboard'); // Redirect if user is not logged in
    }
  }, [user, navigate, fetchApplications, fetchProfileCompletion, fetchNotifications, fetchMessages, fetchDeadlines]);


  if (!user || !user.is_student) {
    return <Loading />; // Show loading or redirect immediately if not student
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

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      markNotificationAsRead(notification.id);
    }
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
    <div>
      <div className="min-h-screen bg-slate-50">
        {/* Dashboard Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-teal" />
              <h1 className="text-xl font-bold text-navy">Student Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setShowNotificationsModal(true)}>
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
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

          {/* Quick Actions - Modified to show active tab with bg-teal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Button
              onClick={() => {
                setActiveTab('applications');
                setShowApplicationPage(false);
              }}
              className={`h-auto py-4 flex gap-3 items-center justify-center ${activeTab === 'applications'
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FilePlus2 className="h-5 w-5" />
              <span>New Application</span>
            </Button>

            <Button
              onClick={() => setActiveTab('messages')}
              className={`h-auto py-4 flex gap-3 items-center justify-center ${activeTab === 'messages'
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Inbox className="h-5 w-5" />
              <span>View Messages</span>
            </Button>

            <Button
              onClick={() => setActiveTab('deadlines')}
              className={`h-auto py-4 flex gap-3 items-center justify-center ${activeTab === 'deadlines'
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Clock className="h-5 w-5" />
              <span>Application Deadlines</span>
            </Button>
          </div>

          {/* Tab Navigation - Keep this if you want both the buttons and tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'applications'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => {
                setActiveTab('applications');
                setShowApplicationPage(false);
              }}
            >
              My Applications
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'messages'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'deadlines'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('deadlines')}
            >
              Deadlines
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'applications' && (
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
                      <div>
                        <div className="custom-scrollbar max-h-[550px] overflow-y-auto space-y-4 border p-4 rounded-lg bg-white shadow-md">
                          {applications.map((app) => (
                            <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{app.program?.name || 'N/A'}</h3>
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
                        </div>
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
              </div>

              {/* Profile Completion & Resources Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Completion</CardTitle>
                    <CardDescription>Complete your profile to improve your applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-teal h-2.5 rounded-full"
                        style={{ width: `${profileCompletion.completion_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {profileCompletion.completion_percentage}% complete
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        {profileCompletion.education_history_count > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0"></span>
                        )}
                        <span>Add education history</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        {profileCompletion.documents_count > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0"></span>
                        )}
                        <span>Upload documents</span>
                      </li>
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate('/profile/complete')}
                    >
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
          )}

          {activeTab === 'messages' && (
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communications from universities and system alerts.</CardDescription>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages to display.</p>
                ) : (
                  <ScrollArea className="max-h-[550px] overflow-y-auto space-y-4 pr-4">
                    {messages.map(message => (
                      <div key={message.id} className={`flex items-start gap-4 pb-4 border-b border-gray-100 ${!message.is_read ? 'font-semibold' : ''}`}>
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-medium">{message.sender.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{message.subject}</h3>
                          <p className="text-sm text-gray-500">{message.sender}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(message.created_at)}</p>
                          <p className="text-sm mt-2">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'deadlines' && (
            <Card>
              <CardHeader>
                <CardTitle>Application Deadlines</CardTitle>
                <CardDescription>Important dates for your applications and programs.</CardDescription>
              </CardHeader>
              <CardContent>
                {deadlines.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No upcoming deadlines.</p>
                ) : (
                  <ScrollArea className="max-h-[550px] overflow-y-auto space-y-4 pr-4">
                    {deadlines.map(deadline => (
                      <div key={deadline.id} className="flex justify-between items-center pb-4 border-b border-teal-100">
                        <div>
                          <h3 className="font-medium text-teal-700 ">{deadline.title}</h3>
                          <p className="text-sm text-gray-500">{deadline.description}</p>
                          {deadline.program_name && <p className="text-xs text-gray-500">Program: {deadline.program_name}</p>}
                        </div>
                        <span className="font-medium text-teal-600">{formatDate(deadline.date)}</span>
                      </div>
                    ))}
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {showNotificationsModal && (
        <NotificationModal
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllNotificationsAsRead}
          onNotificationClick={handleNotificationClick}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}

      {selectedNotification && (
        <ReadNotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

      <Chatbot />
      <Footer />
    </div>
  );
};

export default StudentDashboard;
