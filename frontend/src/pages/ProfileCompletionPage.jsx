import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, ChevronLeft, Upload, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProfileCompletionPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm();
    const [loading, setLoading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [missingFields, setMissingFields] = useState([]);
    const [educationHistories, setEducationHistories] = useState([{ id: 0 }]);

    useEffect(() => {
        if (user) {
            const fieldsToCheck = [
                'a_level_points',
                'o_level_subjects',
                'gender',
                'phone_number',
                'province',
                'country',
                'education_history',
                'documents'
            ];

            const missing = fieldsToCheck.filter(field => {
                if (field === 'education_history') return !user.education_history || user.education_history.length === 0;
                if (field === 'documents') return !user.documents || user.documents.length === 0;
                return !user[field] || (field === 'gender' && user[field] === 'Not Specified');
            });

            setMissingFields(missing);

            // Set all user values
            setValue('a_level_points', user.a_level_points || '');
            setValue('o_level_subjects', user.o_level_subjects || '');
            setValue('gender', user.gender || 'Not Specified');
            setValue('phone_number', user.phone_number || '');
            setValue('province', user.province || '');
            setValue('country', user.country || '');

            // Initialize education histories
            if (user.education_history?.length > 0) {
                setEducationHistories(user.education_history.map((edu, index) => ({
                    ...edu,
                    id: index,
                    start_date: edu.start_date ? new Date(edu.start_date).toISOString().split('T')[0] : '',
                    end_date: edu.end_date ? new Date(edu.end_date).toISOString().split('T')[0] : ''
                })));
            } else {
                setEducationHistories([{ id: 0 }]);
            }
        }
    }, [user, setValue]);

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg', 'image/png'];

        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('File size must be less than 10MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', fieldName); // Make sure this matches your backend enum

        try {
            setFileUploading(true);
            setUploadProgress(0);

            const token = localStorage.getItem('authToken');
            const response = await axios.post('/auth/documents/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            });

            updateUser({
                documents: [...(user.documents || []), response.data]
            });
            toast.success('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error.response?.data || error.message);
            toast.error(error.response?.data?.error || 'Failed to upload document');
        } finally {
            setFileUploading(false);
            setUploadProgress(0);
            e.target.value = ''; // Reset input
        }
    };

    const addEducationHistory = () => {
        setEducationHistories([...educationHistories, { id: educationHistories.length }]);
    };

    const removeEducationHistory = (id) => {
        if (educationHistories.length > 1) {
            setEducationHistories(educationHistories.filter(edu => edu.id !== id));
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            // First save education histories separately
            const educationData = educationHistories.map(edu => ({
                institution: data[`education_institution_${edu.id}`],
                qualification: data[`education_qualification_${edu.id}`],
                start_date: data[`education_start_date_${edu.id}`],
                end_date: data[`education_end_date_${edu.id}`] || null,
                description: data[`education_description_${edu.id}`] || '',
                is_current: !data[`education_end_date_${edu.id}`] // If no end date, mark as current
            }));

            // Save education histories
            await axios.post('/auth/education-history/', educationData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Then update user profile
            const payload = {
                a_level_points: data.a_level_points,
                o_level_subjects: data.o_level_subjects,
                gender: data.gender,
                phone_number: data.phone_number,
                province: data.province,
                country: data.country
            };

            await axios.patch('/auth/users/me/', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Refresh user data
            updateUser({
                ...user,
                ...payload,
                education_history: educationData
            });

            toast.success('Profile updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <Navbar />
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                                <CardDescription>
                                    Fill in the missing information to improve your application chances
                                </CardDescription>
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                {missingFields.length === 0 ? (
                                    <span className="text-green-600">✓ Profile Complete</span>
                                ) : (
                                    <span className="text-orange-600">
                                        {missingFields.length} section(s) remaining
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-lg">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* A-Level Points */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            A-Level Points
                                            {missingFields.includes('a_level_points') && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        <Input
                                            placeholder="Enter A-Level points"
                                            type="number"
                                            {...register('a_level_points', { required: 'A-Level points are required' })}
                                            error={errors.a_level_points?.message}
                                            disabled={!missingFields.includes('a_level_points')}
                                            className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                        />
                                        {!missingFields.includes('a_level_points') && (
                                            <p className="text-xs text-green-600">✓ Completed</p>
                                        )}
                                    </div>

                                    {/* O-Level Subjects */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            O-Level Subjects Passed
                                            {missingFields.includes('o_level_subjects') && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        <Input
                                            placeholder="Enter O-Level subjects passed"
                                            type="number"
                                            {...register('o_level_subjects', { required: 'O-Level subjects are required' })}
                                            error={errors.o_level_subjects?.message}
                                            disabled={!missingFields.includes('o_level_subjects')}
                                            className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                        />
                                        {!missingFields.includes('o_level_subjects') && (
                                            <p className="text-xs text-green-600">✓ Completed</p>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Gender
                                            {missingFields.includes('gender') && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        <SelectField
                                            placeholder="Select gender"
                                            options={[
                                                { value: 'Male', label: 'Male' },
                                                { value: 'Female', label: 'Female' },
                                                { value: 'Other', label: 'Other' },
                                                { value: 'Not Specified', label: 'Prefer not to say' },
                                            ]}
                                            onValueChange={(value) => setValue('gender', value)}
                                            defaultValue={user?.gender || 'Not Specified'}
                                            disabled={!missingFields.includes('gender')}
                                        />
                                        {!missingFields.includes('gender') && user?.gender !== 'Not Specified' && (
                                            <p className="text-xs text-green-600">✓ Completed</p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                            {missingFields.includes('phone_number') && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        <Input
                                            placeholder="Enter phone number"
                                            type="tel"
                                            {...register('phone_number')}
                                            error={errors.phone_number?.message}
                                            disabled={!missingFields.includes('phone_number')}
                                            className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                        />
                                        {!missingFields.includes('phone_number') && (
                                            <p className="text-xs text-green-600">✓ Completed</p>
                                        )}
                                    </div>

                                    {/* Province */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Province
                                            {missingFields.includes('province') && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        <Input
                                            placeholder="Enter province"
                                            {...register('province')}
                                            error={errors.province?.message}
                                            disabled={!missingFields.includes('province')}
                                            className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                        />
                                        {!missingFields.includes('province') && (
                                            <p className="text-xs text-green-600">✓ Completed</p>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Country
                                            {missingFields.includes('country') && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        <Input
                                            placeholder="Enter country"
                                            {...register('country')}
                                            error={errors.country?.message}
                                            disabled={!missingFields.includes('country')}
                                            className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                        />
                                        {!missingFields.includes('country') && (
                                            <p className="text-xs text-green-600">✓ Completed</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Education History - Only show if missing */}
                            {missingFields.includes('education_history') && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-lg">Education History</h3>
                                        {educationHistories.some(edu => edu.institution) && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Partially Completed
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {educationHistories.map((edu, index) => (
                                            <div key={edu.id} className="space-y-4 border-b pb-4 relative">
                                                <h4 className="font-medium text-gray-700">
                                                    Education History #{index + 1}
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEducationHistory(edu.id)}
                                                            className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        placeholder="Institution Name"
                                                        defaultValue={edu.institution || ''}
                                                        {...register(`education_institution_${edu.id}`, {
                                                            required: index === 0 && "Institution name is required"
                                                        })}
                                                        error={errors[`education_institution_${edu.id}`]?.message}
                                                    />
                                                    <Input
                                                        placeholder="Qualification"
                                                        defaultValue={edu.qualification || ''}
                                                        {...register(`education_qualification_${edu.id}`, {
                                                            required: index === 0 && "Qualification is required"
                                                        })}
                                                        error={errors[`education_qualification_${edu.id}`]?.message}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        placeholder="Start Date"
                                                        type="date"
                                                        defaultValue={edu.start_date || ''}
                                                        {...register(`education_start_date_${edu.id}`, {
                                                            required: index === 0 && "Start date is required"
                                                        })}
                                                        error={errors[`education_start_date_${edu.id}`]?.message}
                                                    />
                                                    <Input
                                                        placeholder="End Date (or expected)"
                                                        type="date"
                                                        defaultValue={edu.end_date || ''}
                                                        {...register(`education_end_date_${edu.id}`)}
                                                    />
                                                </div>
                                                <Textarea
                                                    placeholder="Description (optional)"
                                                    defaultValue={edu.description || ''}
                                                    {...register(`education_description_${edu.id}`)}
                                                    rows={3}
                                                />
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={addEducationHistory}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Another Education History
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Documents - Only show if missing */}
                            {missingFields.includes('documents') && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-lg">Required Documents</h3>
                                        {user?.documents?.length > 0 && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                {user.documents.length} document(s) uploaded
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Upload your academic transcripts
                                            </p>
                                            <input
                                                type="file"
                                                id="transcript-upload"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'TRANSCRIPT')}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            />
                                            <label
                                                htmlFor="transcript-upload"
                                                className={cn(
                                                    "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal",
                                                    fileUploading && "opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                {fileUploading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Uploading... {uploadProgress}%
                                                    </>
                                                ) : 'Select File'}
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">
                                                PDF, DOC, DOCX, JPG, or PNG up to 10MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-teal hover:bg-teal-dark"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>


            < Footer />
        </div>
    );
};

export default ProfileCompletionPage;