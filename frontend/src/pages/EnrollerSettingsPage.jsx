// src/pages/EnrollerSettingsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSettings, updateUserSettings, getProgramsForSettings, getReviewersList } from '@/services/userService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Loading from '@/components/Loading';
import { Save, Loader2, XCircle, AlertCircle, Settings, PlusCircle, Trash2, Minus, Plus } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { languagesData } from '../services/dataService';

// --- Helper Data for Criteria Builder ---
const CRITERIA_FIELDS = [
    { value: 'a_level_points', label: 'A-Level Points', type: 'number' },
    { value: 'o_level_subjects', label: 'O-Level Subjects', type: 'number' },
    { value: 'gpa', label: 'GPA', type: 'number' },
    { value: 'has_interview', label: 'Has Interview', type: 'boolean' },
    { value: 'requires_visa', label: 'Requires Visa', type: 'boolean' },
];

const CRITERIA_OPERATORS = [
    { value: 'eq', label: 'Equals (=)' },
    { value: 'gte', label: 'Greater than or equal to (>=)' },
    { value: 'lte', label: 'Less than or equal to (<=)' },
    { value: 'gt', label: 'Greater than (>)' },
    { value: 'lt', label: 'Less than (<)' },
];

const NOTIFICATION_TYPES = [
    { id: 'email', label: 'Email' },
    { id: 'sms', label: 'SMS' },
    { id: 'push', label: 'Push Notification' },
    { id: 'in_app', label: 'In-App' }
];

// Custom Select Component to avoid recursion issues
const CustomSelect = ({ options, value, onChange, placeholder, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className="relative w-full">
            <div
                className={`flex items-center justify-between w-full p-2 border rounded-md cursor-pointer ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span>{selectedLabel}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`p-2 hover:bg-gray-100 cursor-pointer ${value === option.value ? 'bg-teal-50' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Criteria Rule Component ---
const CriteriaRule = ({ rule, index, onUpdate, onDelete }) => {
    const fieldOptions = CRITERIA_FIELDS.map(f => ({ value: f.value, label: f.label }));
    const operatorOptions = CRITERIA_OPERATORS.map(op => ({ value: op.value, label: op.label }));
    const selectedFieldType = CRITERIA_FIELDS.find(f => f.value === rule.field)?.type;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-2 border p-2 rounded-md bg-gray-50">
            <div className="flex-1 w-full">
                <Label className="sr-only">Field</Label>
                <CustomSelect
                    options={fieldOptions}
                    value={rule.field || ''}
                    onChange={(value) => onUpdate(index, { ...rule, field: value, value: '' })}
                    placeholder="Select Field"
                />
            </div>

            <div className="flex-1 w-full">
                <Label className="sr-only">Operator</Label>
                <CustomSelect
                    options={operatorOptions}
                    value={rule.operator || ''}
                    onChange={(value) => onUpdate(index, { ...rule, operator: value })}
                    placeholder="Select Operator"
                    disabled={!rule.field}
                />
            </div>

            <div className="flex-1 w-full">
                <Label className="sr-only">Value</Label>
                {selectedFieldType === 'number' && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                const newValue = Math.max(0, (parseInt(rule.value) || 0) - 1);
                                onUpdate(index, { ...rule, value: newValue });
                            }}
                            disabled={!rule.field}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <div className="border rounded-md px-4 py-2 w-full text-center bg-white">
                            {rule.value || 0}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                const newValue = (parseInt(rule.value) || 0) + 1;
                                onUpdate(index, { ...rule, value: newValue });
                            }}
                            disabled={!rule.field}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {selectedFieldType === 'boolean' && (
                    <div className="flex space-x-2">
                        <Button
                            variant={rule.value === true ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => onUpdate(index, { ...rule, value: true })}
                            disabled={!rule.field}
                        >
                            Yes
                        </Button>
                        <Button
                            variant={rule.value === false ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => onUpdate(index, { ...rule, value: false })}
                            disabled={!rule.field}
                        >
                            No
                        </Button>
                    </div>
                )}

                {!selectedFieldType && (
                    <div className="border rounded-md px-4 py-2 w-full text-center bg-gray-100 text-gray-500">
                        Select a field first
                    </div>
                )}
            </div>

            <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(index)}
                className="shrink-0"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

// --- EnrollerSettingsPage Component ---
const EnrollerSettingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(true);
    const [reviewers, setReviewers] = useState([]);
    const [reviewersLoading, setReviewersLoading] = useState(false);

    // State for structured criteria
    const [autoReviewRules, setAutoReviewRules] = useState([]);
    const [autoRejectRules, setAutoRejectRules] = useState([]);

    // Handle checkbox changes
    const handleCheckboxChange = (field) => (checked) => {
        setSettings(prev => ({ ...prev, [field]: checked }));
    };

    // Handle notification preference changes
    const handleNotificationChange = (id) => (checked) => {
        setSettings(prev => ({
            ...prev,
            notification_preferences: {
                ...prev.notification_preferences,
                [id]: checked
            }
        }));
    };

    // Handle program selection
    const handleProgramSelection = (programId) => (checked) => {
        setSettings(prev => {
            const newIds = checked
                ? [...(prev.auto_accept_programs_ids || []), programId]
                : (prev.auto_accept_programs_ids || []).filter(id => id !== programId);

            return { ...prev, auto_accept_programs_ids: newIds };
        });
    };

    useEffect(() => {
        if (!user || (!user.is_enroller && !user.is_system_admin)) {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setProgramsLoading(true);
            setReviewersLoading(true);

            try {
                const [userSettings, programsList, reviewersData] = await Promise.all([
                    getUserSettings(),
                    getProgramsForSettings(),
                    getReviewersList()
                ]);

                // Initialize settings
                const initialSettings = {
                    ...userSettings,
                    notification_preferences: userSettings.notification_preferences || {},
                    auto_accept_programs_ids: userSettings.auto_accept_programs?.map(p => p.id) || [],
                };
                setSettings(initialSettings);
                setPrograms(programsList);
                setReviewers(reviewersData);

                // Deserialize criteria
                setAutoReviewRules(deserializeCriteria(userSettings.auto_review_criteria));
                setAutoRejectRules(deserializeCriteria(userSettings.auto_reject_criteria));

            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load settings data');
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
                setProgramsLoading(false);
                setReviewersLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    // --- Utility to deserialize JSON criteria ---
    const deserializeCriteria = (jsonCriteria) => {
        if (!jsonCriteria || typeof jsonCriteria !== 'object') return [];

        return Object.entries(jsonCriteria).map(([key, value]) => {
            const [field, operator] = key.split('__');
            const fieldType = CRITERIA_FIELDS.find(f => f.value === field)?.type;

            let parsedValue = value;
            if (fieldType === 'boolean' && typeof value === 'string') {
                parsedValue = value === 'true';
            }

            return {
                id: `${field}-${operator}-${Date.now()}`,
                field,
                operator: operator || 'eq',
                value: parsedValue
            };
        });
    };

    // --- Utility to serialize rule objects into JSON criteria ---
    const serializeCriteria = (rules) => {
        const json = {};
        rules.forEach(rule => {
            if (!rule.field || !rule.operator || rule.value == null) return;

            const key = rule.operator === 'eq'
                ? rule.field
                : `${rule.field}__${rule.operator}`;

            json[key] = rule.value;
        });
        return json;
    };

    // --- Handlers for Criteria Rules ---
    const addRule = (type) => {
        const newRule = {
            id: `rule-${Date.now()}`,
            field: '',
            operator: '',
            value: ''
        };

        if (type === 'review') {
            setAutoReviewRules(prev => [...prev, newRule]);
        } else {
            setAutoRejectRules(prev => [...prev, newRule]);
        }
    };

    const updateRule = (type, index, updatedRule) => {
        if (type === 'review') {
            setAutoReviewRules(prev => prev.map((rule, i) => i === index ? updatedRule : rule));
        } else {
            setAutoRejectRules(prev => prev.map((rule, i) => i === index ? updatedRule : rule));
        }
    };

    const deleteRule = (type, index) => {
        if (type === 'review') {
            setAutoReviewRules(prev => prev.filter((_, i) => i !== index));
        } else {
            setAutoRejectRules(prev => prev.filter((_, i) => i !== index));
        }
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const dataToSend = {
            ...settings,
            auto_review_criteria: serializeCriteria(autoReviewRules),
            auto_reject_criteria: serializeCriteria(autoRejectRules),
            notification_preferences: settings.notification_preferences,
            auto_accept_programs: settings.auto_accept_programs_ids || [],
        };
        delete dataToSend.auto_accept_programs_ids;

        try {
            await updateUserSettings(dataToSend);
            toast.success('Settings saved successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(err.response?.data?.detail || 'Failed to save settings');
            toast.error('Error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Initial check for authorization
    if (!user || (!user.is_enroller && !user.is_system_admin)) {
        return null;
    }

    // Loading and Error states
    if (loading) {
        return <Loading />;
    }

    if (error || !settings) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                        {error || 'Settings not available'}
                    </h3>
                    <Button onClick={() => window.location.reload()}>
                        Reload Page
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="bg-white shadow-sm mb-10 pb-5"></div>
            <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-12">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-teal-700">
                            <Settings className="h-6 w-6" /> Enroller Preferences
                        </CardTitle>
                        <CardDescription>Configure your enrollment automation settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">General Settings</h3>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="receive_newsletters"
                                    checked={settings.receive_newsletters}
                                    onCheckedChange={handleCheckboxChange('receive_newsletters')}
                                />
                                <Label htmlFor="receive_newsletters" className="text-gray-700">
                                    Receive Newsletters
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="dark_mode"
                                    checked={settings.dark_mode}
                                    onCheckedChange={handleCheckboxChange('dark_mode')}
                                />
                                <Label htmlFor="dark_mode" className="text-gray-700">
                                    Dark Mode
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="language" className="text-gray-700 mb-1 block">
                                    Language
                                </Label>
                                <div className="w-full max-w-xs">
                                    <CustomSelect
                                        options={languagesData.map(lang => ({
                                            value: lang.code,
                                            label: lang.name
                                        }))}
                                        value={settings.language || 'en'}
                                        onChange={value => setSettings(prev => ({ ...prev, language: value }))}
                                        placeholder="Select Language"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-700 mb-2 block">Notification Preferences</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {NOTIFICATION_TYPES.map(notif => (
                                        <div key={notif.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={notif.id}
                                                checked={settings.notification_preferences?.[notif.id] || false}
                                                onCheckedChange={handleNotificationChange(notif.id)}
                                            />
                                            <Label htmlFor={notif.id} className="text-gray-700">
                                                {notif.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t mt-6 border-b pb-2">
                                Auto-Action Settings
                            </h3>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enable_auto_accept"
                                    checked={settings.enable_auto_accept}
                                    onCheckedChange={handleCheckboxChange('enable_auto_accept')}
                                />
                                <Label htmlFor="enable_auto_accept" className="text-gray-700">
                                    Enable Auto-Accept
                                </Label>
                            </div>

                            {settings.enable_auto_accept && (
                                <>
                                    <div>
                                        <Label className="text-gray-700 mb-1 block">
                                            Auto-Accept Minimum A-Level Points
                                        </Label>
                                        <div className="flex items-center space-x-2 max-w-xs">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setSettings(prev => ({
                                                    ...prev,
                                                    auto_accept_min_points: Math.max(0, (prev.auto_accept_min_points || 0) - 1)
                                                }))}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <div className="border rounded-md px-4 py-2 bg-gray-50 w-20 text-center text-gray-800 font-medium">
                                                {settings.auto_accept_min_points || 0}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setSettings(prev => ({
                                                    ...prev,
                                                    auto_accept_min_points: (prev.auto_accept_min_points || 0) + 1
                                                }))}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-gray-700 mb-2 block">
                                            Auto-Accept Programs
                                        </Label>
                                        {programsLoading ? (
                                            <div className="flex items-center text-gray-500">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading programs...
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                                                {programs.map(program => (
                                                    <div key={program.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`program-${program.id}`}
                                                            checked={settings.auto_accept_programs_ids?.includes(program.id) || false}
                                                            onCheckedChange={handleProgramSelection(program.id)}
                                                        />
                                                        <Label htmlFor={`program-${program.id}`} className="text-gray-700">
                                                            {program.name} ({program.code})
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enable_auto_review"
                                    checked={settings.enable_auto_review}
                                    onCheckedChange={handleCheckboxChange('enable_auto_review')}
                                />
                                <Label htmlFor="enable_auto_review" className="text-gray-700">
                                    Enable Auto-Review
                                </Label>
                            </div>

                            {settings.enable_auto_review && (
                                <div>
                                    <Label className="text-gray-700 mb-2 block">
                                        Auto-Review Criteria
                                    </Label>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Applications meeting these criteria will be flagged for review
                                    </p>
                                    <div className="space-y-3">
                                        {autoReviewRules.map((rule, index) => (
                                            <CriteriaRule
                                                key={rule.id}
                                                rule={rule}
                                                index={index}
                                                onUpdate={(idx, updatedRule) => updateRule('review', idx, updatedRule)}
                                                onDelete={(idx) => deleteRule('review', idx)}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-3 w-full bg-teal-50 hover:bg-teal-100 text-teal-700"
                                        onClick={() => addRule('review')}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" /> Add Review Rule
                                    </Button>
                                </div>
                            )}

                            <div>
                                <Label className="text-gray-700 mb-2 block">
                                    Auto-Reject Criteria
                                </Label>
                                <p className="text-sm text-gray-600 mb-3">
                                    Applications meeting these criteria will be automatically rejected
                                </p>
                                <div className="space-y-3">
                                    {autoRejectRules.map((rule, index) => (
                                        <CriteriaRule
                                            key={rule.id}
                                            rule={rule}
                                            index={index}
                                            onUpdate={(idx, updatedRule) => updateRule('reject', idx, updatedRule)}
                                            onDelete={(idx) => deleteRule('reject', idx)}
                                        />
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-3 w-full bg-red-50 text-red-700"
                                    onClick={() => addRule('reject')}
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" /> Add Reject Rule
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto_assign_reviewer"
                                    checked={settings.auto_assign_reviewer}
                                    onCheckedChange={handleCheckboxChange('auto_assign_reviewer')}
                                />
                                <Label htmlFor="auto_assign_reviewer" className="text-gray-700">
                                    Enable Auto-Assign Reviewer
                                </Label>
                            </div>

                            {settings.auto_assign_reviewer && (
                                <div>
                                    <Label className="text-gray-700 mb-1 block">
                                        Default Reviewer
                                    </Label>
                                    {reviewersLoading ? (
                                        <div className="flex items-center text-gray-500">
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading reviewers...
                                        </div>
                                    ) : reviewers.length === 0 ? (
                                        <p className="text-sm text-gray-500">No reviewers available</p>
                                    ) : (
                                        <div className="w-full max-w-md">
                                            <CustomSelect
                                                options={reviewers.map(r => ({
                                                    value: r.id,
                                                    label: `${r.name} (${r.email})`
                                                }))}
                                                value={settings.default_reviewer_id || ''}
                                                onChange={value => setSettings(prev => ({ ...prev, default_reviewer_id: value }))}
                                                placeholder="Select reviewer"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="border-gray-300 text-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-teal-600 hover:bg-teal-500 text-white"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                                    <XCircle className="h-5 w-5 mr-2" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </>
    );
};

export default EnrollerSettingsPage;