// src/components/SuccessPopup.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessPopup = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4 shadow-xl animate-fade-in">
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-6">
                        <CheckCircle className="w-full h-full text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
                    <p className="text-gray-600 mb-6">
                        Your application has been successfully submitted. We'll review it and get back to you soon.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessPopup;