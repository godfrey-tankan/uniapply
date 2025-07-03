import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // If still loading user data, don't render the route yet
    if (loading) {
        return <Loading />; // Or a loader component here
    }
    console.log('allowedRoles:', allowedRoles);

    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);

    // If the user is not authenticated, redirect to login
    if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to /auth');
        return <Navigate to="/auth" replace />;
    }

    // Map allowedRoles to user properties
    const roleMap: { [key: string]: string } = {
        is_student: 'student',
        is_system_admin: 'admin',
        is_university_admin: 'university_admin',
        is_enroller: 'enroller', // Assuming you have an enroller role
    };
    console.log('roleMap:', allowedRoles.map(role => roleMap[role]));
    // Check if user has one of the allowed roles
    if (allowedRoles.length) {
        const userRoles = {
            student: user?.is_student,
            admin: user?.is_system_admin,
            university_admin: user?.is_university_admin,
            enroller: user?.is_enroller,
        };


        // Check if the user has any role that matches allowedRoles
        const hasAccess = allowedRoles.some(role => {
            console.log('Checking role:', role);
            const mappedRole = roleMap[role];  // Get the mapped property name
            console.log('mappedRole:', mappedRole);
            return userRoles[mappedRole];  // Check if the user has that role (boolean)
        });

        if (!hasAccess) {
            console.log('Access denied. Redirecting to /');
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
