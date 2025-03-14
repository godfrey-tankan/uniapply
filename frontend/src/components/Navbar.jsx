import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl font-bold">University Platform</Link>
                <div className="space-x-4">
                    <Link to="/register" className="text-white hover:text-gray-300">Register</Link>
                    <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
                    <Link to="/profile" className="text-white hover:text-gray-300">Profile</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;