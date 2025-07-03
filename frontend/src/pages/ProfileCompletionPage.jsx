import React, { useState, useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import Footer from '@/components/Footer';
import { zimProvincesData, qualificationTypes, countriesData } from '../services/dataService';

const ProfileCompletionPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, watch, control, setError } = useForm();
    const [loading, setLoading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [missingFields, setMissingFields] = useState([]);
    const [educationHistories, setEducationHistories] = useState([{ id: 0 }]);

    // Derive this state based on the current educationHistories length
    const hasEnoughEducationHistory = educationHistories.length >= 2;

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
                // Updated check for gender, province, country to consider empty strings or 'Not Specified' as missing
                return !user[field] || (field === 'gender' && user[field] === 'Not Specified') || (['province', 'country'].includes(field) && user[field] === '');
            });

            setMissingFields(missing);

            // Set all user values using setValue for initial form state
            setValue('a_level_points', user.a_level_points || '');
            setValue('o_level_subjects', user.o_level_subjects || '');
            setValue('phone_number', user.phone_number || '');

            // Set initial values for Controller-managed SelectFields
            setValue('gender', user.gender || 'Not Specified');
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
        // Validation check for at least two education histories if it's a missing field
        if (missingFields.includes('education_history') && educationHistories.length < 2) {
            toast.error('Please add at least two education histories (e.g., Ordinary Level and A-Level/Other equivalent).');
            return; // Stop submission
        }

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
                is_current: !data[`education_end_date_${edu.id}`]
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
            console.log("Payload being sent:", payload);
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

            if (error.response && error.response.status === 400) {
                const backendErrors = error.response.data;

                if (Array.isArray(backendErrors)) {
                    // This handles validation errors for the education-history array
                    backendErrors.forEach((itemErrors, index) => {
                        const currentEduId = educationHistories[index]?.id;
                        if (currentEduId !== undefined) {
                            for (const fieldName in itemErrors) {
                                const formFieldName = `education_${fieldName}_${currentEduId}`;
                                const messages = itemErrors[fieldName].join(', ');
                                setError(formFieldName, { type: 'backend', message: messages });
                            }
                        }
                    });
                    toast.error("Please correct the errors in your education history section.");
                } else if (typeof backendErrors === 'object') {
                    // This handles validation errors for top-level user profile fields
                    for (const fieldName in backendErrors) {
                        const messages = backendErrors[fieldName].join(', ');
                        setError(fieldName, { type: 'backend', message: messages });
                    }
                    toast.error("Please correct the errors in your profile information.");
                } else {
                    toast.error(error.response?.data?.message || 'Failed to update profile due to validation issues.');
                }
            } else {
                toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // Outermost container for full page background and layout
        <div className="min-h-screen flex flex-col font-inter">
            <Navbar />

            {/* Main content area: takes available vertical space, centered horizontally */}
            <main className="flex-grow flex justify-center items-start py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
                {/* Inner container for max-width and centering of the actual form card */}
                <div className="w-full max-w-4xl">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 flex items-center gap-2 text-white hover:bg-teal-600"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>

                    <Card className="rounded-xl shadow-lg">
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
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
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
                                                // Added required rule for this field
                                                {...register('a_level_points', {
                                                    required: missingFields.includes('a_level_points') ? 'A-Level points are required' : false,
                                                    min: { value: 0, message: 'Points cannot be negative' } // Example: add min value validation
                                                })}
                                                error={errors.a_level_points?.message}
                                                disabled={!missingFields.includes('a_level_points')}
                                                className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                            />
                                            {errors.a_level_points && <p className="text-red-500 text-sm mt-1">{errors.a_level_points.message}</p>}
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
                                                // Added required rule for this field
                                                {...register('o_level_subjects', {
                                                    required: missingFields.includes('o_level_subjects') ? 'O-Level subjects are required' : false,
                                                    min: { value: 0, message: 'Subjects cannot be negative' }
                                                })}
                                                error={errors.o_level_subjects?.message}
                                                disabled={!missingFields.includes('o_level_subjects')}
                                                className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                            />
                                            {errors.o_level_subjects && <p className="text-red-500 text-sm mt-1">{errors.o_level_subjects.message}</p>}
                                            {!missingFields.includes('o_level_subjects') && (
                                                <p className="text-xs text-green-600">✓ Completed</p>
                                            )}
                                        </div>

                                        {/* Gender - With Controller for validation and correct value capture */}
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Gender
                                                {missingFields.includes('gender') && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </label>
                                            <Controller
                                                name="gender"
                                                control={control}
                                                defaultValue={user?.gender || 'Not Specified'}
                                                rules={{
                                                    validate: value => {
                                                        if (missingFields.includes('gender') && (value === '' || value === 'Not Specified')) {
                                                            return "Gender is required";
                                                        }
                                                        return true;
                                                    }
                                                }}
                                                render={({ field }) => (
                                                    <SelectField
                                                        placeholder="Select gender"
                                                        options={[
                                                            { value: 'Male', label: 'Male' },
                                                            { value: 'Female', label: 'Female' },
                                                            { value: 'Other', label: 'Other' },
                                                            { value: 'Not Specified', label: 'Prefer not to say' },
                                                        ]}
                                                        onValueChange={field.onChange}
                                                        value={field.value} // Bind value to react-hook-form state
                                                        disabled={!missingFields.includes('gender')}
                                                        error={errors.gender?.message}
                                                    />
                                                )}
                                            />
                                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
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
                                                // Added required rule and pattern for basic phone number format
                                                {...register('phone_number', {
                                                    required: missingFields.includes('phone_number') ? "Phone number is required" : false,
                                                    pattern: {
                                                        value: /^[0-9+() -]{7,20}$/, // Basic pattern: numbers, +, (), space, hyphen
                                                        message: 'Invalid phone number format'
                                                    }
                                                })}
                                                error={errors.phone_number?.message}
                                                disabled={!missingFields.includes('phone_number')}
                                                className="disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200"
                                            />
                                            {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>}
                                            {!missingFields.includes('phone_number') && (
                                                <p className="text-xs text-green-600">✓ Completed</p>
                                            )}
                                        </div>

                                        {/* Province - With Controller for validation and correct value capture */}
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Province
                                                {missingFields.includes('province') && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </label>
                                            <Controller
                                                name="province"
                                                control={control}
                                                defaultValue={user?.province || ''}
                                                rules={{ required: missingFields.includes('province') ? "Province is required" : false }}
                                                render={({ field }) => (
                                                    <SelectField
                                                        placeholder="Select province"
                                                        options={Array.isArray(zimProvincesData) ? zimProvincesData.map(province => ({
                                                            value: province.name,
                                                            label: province.name
                                                        })) : []}
                                                        onValueChange={field.onChange}
                                                        value={field.value} // Bind value to react-hook-form state
                                                        disabled={!missingFields.includes('province')}
                                                        error={errors.province?.message}
                                                    />
                                                )}
                                            />
                                            {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>}
                                            {!missingFields.includes('province') && (
                                                <p className="text-xs text-green-600">✓ Completed</p>
                                            )}
                                        </div>
                                        {/* Country - With Controller for validation and correct value capture */}
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Country
                                                {missingFields.includes('country') && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </label>
                                            <Controller
                                                name="country"
                                                control={control}
                                                defaultValue={user?.country || ''}
                                                rules={{ required: missingFields.includes('country') ? "Country is required" : false }}
                                                render={({ field }) => (
                                                    <SelectField
                                                        placeholder="Select country"
                                                        options={Array.isArray(countriesData) ? countriesData.map(country => ({
                                                            value: country.name,
                                                            label: country.name
                                                        })) : []}
                                                        onValueChange={field.onChange}
                                                        value={field.value} // Bind value to react-hook-form state
                                                        disabled={!missingFields.includes('country')}
                                                        error={errors.country?.message}
                                                    />
                                                )}
                                            />
                                            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                                            {!missingFields.includes('country') && (
                                                <p className="text-xs text-green-600">✓ Completed</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Education History - Only show if missing, or if it has some data */}
                                {(missingFields.includes('education_history') || educationHistories.length > 0) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-lg">Education History
                                                {missingFields.includes('education_history') && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </h3>
                                            {educationHistories.length > 0 && (
                                                <span className={cn(
                                                    "text-xs px-2 py-1 rounded-full",
                                                    hasEnoughEducationHistory ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                                                )}>
                                                    {hasEnoughEducationHistory ? "Completed" : `${educationHistories.length} entry(s) added`}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            {educationHistories.map((edu, index) => (
                                                <div key={edu.id} className="space-y-4 border-b pb-4 relative last:border-b-0">
                                                    <h4 className="font-medium text-gray-700 mb-2">
                                                        Education History #{index + 1}
                                                        {educationHistories.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducationHistory(edu.id)}
                                                                className="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                                aria-label="Remove education history"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <label
                                                                htmlFor={`education_institution_${edu.id}`}
                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                            >
                                                                Institution Name
                                                            </label>
                                                            <Input
                                                                id={`education_institution_${edu.id}`}
                                                                placeholder="Institution Name"
                                                                defaultValue={edu.institution || ''}
                                                                // Added required rule for this field
                                                                {...register(`education_institution_${edu.id}`, {
                                                                    required: missingFields.includes('education_history') ? "Institution name is required" : false
                                                                })}
                                                                error={errors[`education_institution_${edu.id}`]?.message}
                                                            />
                                                            {errors[`education_institution_${edu.id}`] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[`education_institution_${edu.id}`]?.message}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label
                                                                htmlFor={`education_qualification_${edu.id}`}
                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                            >
                                                                Qualification Type
                                                            </label>
                                                            <Controller
                                                                name={`education_qualification_${edu.id}`}
                                                                control={control}
                                                                defaultValue={edu.qualification || ''}
                                                                rules={{
                                                                    required: missingFields.includes('education_history') ? "Qualification type is required" : false
                                                                }}
                                                                render={({ field }) => (
                                                                    <SelectField
                                                                        id={`education_qualification_${edu.id}`}
                                                                        placeholder="Qualification Type"
                                                                        options={qualificationTypes.map(q => ({
                                                                            value: q.name,
                                                                            label: q.code
                                                                        }))}
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                        error={errors[`education_qualification_${edu.id}`]?.message}
                                                                    />
                                                                )}
                                                            />
                                                            {errors[`education_qualification_${edu.id}`] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[`education_qualification_${edu.id}`]?.message}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <label
                                                                htmlFor={`education_start_date_${edu.id}`}
                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                            >
                                                                Start Date
                                                            </label>
                                                            <Input
                                                                id={`education_start_date_${edu.id}`}
                                                                placeholder="Start Date"
                                                                type="date"
                                                                defaultValue={edu.start_date || ''}
                                                                // Added required rule for this field
                                                                {...register(`education_start_date_${edu.id}`, {
                                                                    required: missingFields.includes('education_history') ? "Start date is required" : false,
                                                                    validate: value => value !== '' || "Start date is required" // Ensure date is not empty string
                                                                })}
                                                                error={errors[`education_start_date_${edu.id}`]?.message}
                                                            />
                                                            {errors[`education_start_date_${edu.id}`] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[`education_start_date_${edu.id}`]?.message}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label
                                                                htmlFor={`education_end_date_${edu.id}`}
                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                            >
                                                                End Date
                                                            </label>
                                                            <Input
                                                                id={`education_end_date_${edu.id}`}
                                                                placeholder="End Date (or expected)"
                                                                type="date"
                                                                defaultValue={edu.end_date || ''}
                                                                {...register(`education_end_date_${edu.id}`)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label
                                                            htmlFor={`education_description_${edu.id}`}
                                                            className="mb-1 text-sm font-medium text-gray-700"
                                                        >
                                                            Description <span className="text-gray-400">(optional)</span>
                                                        </label>
                                                        <Textarea
                                                            id={`education_description_${edu.id}`}
                                                            placeholder="Description (optional)"
                                                            defaultValue={edu.description || ''}
                                                            {...register(`education_description_${edu.id}`)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full border-teal-500 text-teal-500 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                                onClick={addEducationHistory}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Another Education History
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {/* Document Upload Section */}
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
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
                                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                            <p className="text-sm text-gray-600">
                                                Upload your CV, Academic Transcripts, Certificates, etc. (Max 10MB per file)
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {['CV', 'TRANSCRIPT', 'CERTIFICATE', 'PASSPORT', 'ID', 'OTHER'].map(docType => (
                                                    <div key={docType} className="flex flex-col items-center">
                                                        <label htmlFor={`file-upload-${docType}`} className="cursor-pointer w-full">
                                                            <Button
                                                                asChild
                                                                type="button"
                                                                variant="outline"
                                                                className="flex items-center justify-center gap-2 w-full border-teal-500 text-teal-500 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                                                disabled={fileUploading}
                                                            >
                                                                <span className="flex items-center">
                                                                    <Upload className="h-4 w-4 mr-2" />
                                                                    Upload {docType === 'CV' ? 'CV' : docType.replace('_', ' ')}
                                                                </span>
                                                            </Button>
                                                            <Input
                                                                id={`file-upload-${docType}`}
                                                                type="file"
                                                                className="sr-only"
                                                                onChange={(e) => handleFileUpload(e, docType)}
                                                                disabled={fileUploading}
                                                            />
                                                        </label>
                                                        {fileUploading && uploadProgress > 0 && (
                                                            <p className="text-sm text-gray-500 mt-2">Uploading: {uploadProgress}%</p>
                                                        )}
                                                        {user?.documents?.some(doc => doc.document_type === docType) && (
                                                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                {docType.replace('_', ' ')} Uploaded
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-teal-500 hover:bg-teal-700 text-black "
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            </main>

            <Footer />
        </div>
    );
};

export default ProfileCompletionPage;
