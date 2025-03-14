import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login'); // Redirect to the login page
    };

    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
                <div className="container mx-auto text-center text-white px-4">
                    <h1 className="text-5xl font-bold mb-6">Welcome to the University Application Platform</h1>
                    <p className="text-xl mb-8">
                        Streamline your university application process with our centralized platform.
                        Apply to multiple universities, track your applications, and get smart recommendations—all in one place.
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
                    >
                        Get Started
                    </button>
                </div>
            </div>

            {/* Active Applicants */}
            <div className="container mx-auto py-16 px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Active Applicants</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h3 className="text-2xl font-bold text-blue-600">10,000+</h3>
                        <p className="text-gray-600">Students Applied</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h3 className="text-2xl font-bold text-blue-600">500+</h3>
                        <p className="text-gray-600">Universities Registered</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h3 className="text-2xl font-bold text-blue-600">95%</h3>
                        <p className="text-gray-600">Satisfaction Rate</p>
                    </div>
                </div>
            </div>

            {/* Most Applied Programs */}
            <div className="bg-gray-100 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Most Applied Programs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-2">Computer Science</h3>
                            <p className="text-gray-600">Top choice for tech enthusiasts.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-2">Business Administration</h3>
                            <p className="text-gray-600">Ideal for future entrepreneurs.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-2">Medicine</h3>
                            <p className="text-gray-600">For aspiring healthcare professionals.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Programs */}
            <div className="container mx-auto py-16 px-4">
                <h2 className="text-3xl font-bold text-center mb-8">New Programs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Artificial Intelligence</h3>
                        <p className="text-gray-600">Explore the future of technology.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Environmental Science</h3>
                        <p className="text-gray-600">Make a difference in the world.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Data Science</h3>
                        <p className="text-gray-600">Unlock the power of data.</p>
                    </div>
                </div>
            </div>

            {/* Memo & Vision */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16">
                <div className="container mx-auto px-4 text-white">
                    <h2 className="text-3xl font-bold text-center mb-8">Our Vision</h2>
                    <p className="text-xl text-center mb-8">
                        To revolutionize the university application process by providing a centralized, efficient, and transparent platform for students and institutions alike.
                    </p>
                    <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
                    <p className="text-xl text-center">
                        To empower students with equal access to higher education opportunities and reduce the administrative burden on universities.
                    </p>
                </div>
            </div>

            {/* Testimonials */}
            <div className="container mx-auto py-16 px-4">
                <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-600 mb-4">
                            "This platform made applying to universities so much easier. Highly recommended!"
                        </p>
                        <p className="font-bold">— John Doe</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-600 mb-4">
                            "The smart recommendations helped me find the perfect program for my career goals."
                        </p>
                        <p className="font-bold">— Jane Smith</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-600 mb-4">
                            "As a university admin, this platform has significantly reduced our workload."
                        </p>
                        <p className="font-bold">— University Admin</p>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gray-100 py-16">
                <div className="container mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
                    <button
                        onClick={handleGetStarted}
                        className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Landing;