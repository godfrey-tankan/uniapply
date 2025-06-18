// src/pages/EnrollerSettingsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSettings, updateUserSettings, getProgramsForSettings } from '@/services/userService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loading from '@/components/Loading';
import { Save, Loader2, XCircle, AlertCircle, Settings, PlusCircle, Trash2 } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { languagesData } from '../services/dataService'; // Assuming this provides language options

// --- Helper Data for Criteria Builder ---
const CRITERIA_FIELDS = [
    { value: 'a_level_points', label: 'A-Level Points', type: 'number' },
    { value: 'o_level_subjects', label: 'O-Level Subjects', type: 'number' },
    { value: 'gpa', label: 'GPA', type: 'number' },
    { value: 'has_interview', label: 'Has Interview', type: 'boolean' },
    { value: 'requires_visa', label: 'Requires Visa', type: 'boolean' },
    // Add more fields as needed for your application
];

const CRITERIA_OPERATORS = [
    { value: 'eq', label: 'Equals (=)' },
    { value: 'gte', label: 'Greater than or equal to (>=)' },
    { value: 'lte', label: 'Less than or equal to (<=)' },
    { value: 'gt', label: 'Greater than (>)' },
    { value: 'lt', label: 'Less than (<)' },
];

// --- Criteria Rule Component ---
// This component will represent a single row in the criteria builder
const CriteriaRule = React.memo(({ rule, index, onUpdate, onDelete, allPrograms = [] }) => {
    const fieldOptions = CRITERIA_FIELDS.map(f => ({ value: f.value, label: f.label }));
    const operatorOptions = CRITERIA_OPERATORS.map(op => ({ value: op.value, label: op.label }));

    const selectedFieldType = CRITERIA_FIELDS.find(f => f.value === rule.field)?.type;

    return (
        <div className="flex items-center space-x-2 border p-2 rounded-md bg-gray-50">
            <div className="flex-1">
                <Label className="sr-only">Field</Label>
                <Select
                    value={rule.field || ''}
                    onValueChange={(value) => onUpdate(index, { ...rule, field: value, value: '' })} // Reset value on field change
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Field" />
                    </SelectTrigger>
                    <SelectContent>
                        {fieldOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1">
                <Label className="sr-only">Operator</Label>
                <Select
                    value={rule.operator || ''}
                    onValueChange={(value) => onUpdate(index, { ...rule, operator: value })}
                    disabled={!rule.field}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Operator" />
                    </SelectTrigger>
                    <SelectContent>
                        {operatorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1">
                <Label className="sr-only">Value</Label>
                {selectedFieldType === 'number' && (
                    <Input
                        type="number"
                        value={rule.value || ''}
                        onChange={(e) => onUpdate(index, { ...rule, value: e.target.value })}
                        placeholder="Value"
                        disabled={!rule.field}
                    />
                )}
                {selectedFieldType === 'boolean' && (
                    <Select
                        // Ensure the value is always a string 'true', 'false', or '' (empty string for initial)
                        value={rule.value === true ? 'true' : rule.value === false ? 'false' : ''}
                        onValueChange={(value) => onUpdate(index, { ...rule, value: value === 'true' })}
                        disabled={!rule.field}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Boolean" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                {!selectedFieldType && (
                    <Input
                        type="text"
                        value={rule.value || ''}
                        onChange={(e) => onUpdate(index, { ...rule, value: e.target.value })}
                        placeholder="Value"
                        disabled={!rule.field}
                    />
                )}
            </div>
            <Button variant="destructive" size="icon" onClick={() => onDelete(index)} className="shrink-0">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
});

// --- EnrollerSettingsPage Component ---
const EnrollerSettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(true);
    const [programsError, setProgramsError] = useState(null);

    // State for structured criteria
    const [autoReviewRules, setAutoReviewRules] = useState([]);
    const [autoRejectRules, setAutoRejectRules] = useState([]);

    useEffect(() => {
        if (!user || (!user.is_enroller && !user.is_system_admin)) {
            navigate('/dashboard');
            return;
        }

        const fetchAllSettingsData = async () => {
            setLoading(true);
            setError(null);
            setProgramsLoading(true);
            setProgramsError(null);

            try {
                const [userSettings, programsList] = await Promise.all([
                    getUserSettings(),
                    getProgramsForSettings()
                ]);

                // Initialize JSON fields as objects
                const initialSettings = {
                    ...userSettings,
                    notification_preferences: userSettings.notification_preferences || {},
                    advanced_preferences: userSettings.advanced_preferences || {},
                    auto_accept_programs_ids: userSettings.auto_accept_programs?.map(p => p.id) || [],
                };
                setSettings(initialSettings);
                setPrograms(programsList);

                // --- Deserialize JSON criteria into rules state ---
                setAutoReviewRules(deserializeCriteria(userSettings.auto_review_criteria));
                setAutoRejectRules(deserializeCriteria(userSettings.auto_reject_criteria));

            } catch (err) {
                console.error('Error fetching settings or programs:', err);
                setError('Failed to load settings or programs data.');
                toast.error('Failed to load settings.');
            } finally {
                setLoading(false);
                setProgramsLoading(false);
            }
        };

        fetchAllSettingsData();
    }, [user, navigate]);

    // --- Utility to deserialize JSON criteria into rule objects ---
    const deserializeCriteria = (jsonCriteria) => {
        if (!jsonCriteria || typeof jsonCriteria !== 'object' || Object.keys(jsonCriteria).length === 0) {
            return [];
        }
        // Assuming criteria are simple key-value pairs like { "field__operator": value }
        return Object.entries(jsonCriteria).map(([key, value]) => {
            const parts = key.split('__');
            let field = parts[0];
            let operator = parts.length > 1 ? parts[1] : 'eq'; // Default to 'eq' if no operator

            // Handle boolean values which might be stored as 'true'/'false' strings
            let parsedValue = value;
            const fieldType = CRITERIA_FIELDS.find(f => f.value === field)?.type;
            if (fieldType === 'boolean' && typeof value === 'string') {
                parsedValue = (value === 'true');
            }

            return { field, operator, value: parsedValue };
        });
    };

    // --- Utility to serialize rule objects into JSON criteria ---
    const serializeCriteria = (rules) => {
        const json = {};
        rules.forEach(rule => {
            if (rule.field && rule.operator && (rule.value !== undefined && rule.value !== null && rule.value !== '')) {
                let key = rule.field;
                if (rule.operator !== 'eq') { // Only append operator if not 'equals'
                    key += `__${rule.operator}`;
                }
                // Ensure value is correctly typed for backend (e.g., boolean as boolean, number as number)
                let value = rule.value;
                const fieldType = CRITERIA_FIELDS.find(f => f.value === rule.field)?.type;
                if (fieldType === 'number') {
                    value = Number(value);
                } else if (fieldType === 'boolean') {
                    value = Boolean(value);
                }
                json[key] = value;
            }
        });
        return json;
    };


    const handleInputChange = useCallback((e) => {
        const { id, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    }, []);

    // Removed the handleCheckboxChange useCallback as it's no longer used directly.
    // The state update for checkboxes is now inline.

    const handleNotificationPreferencesChange = useCallback((selected) => {
        const allPrefs = ['email', 'sms', 'push', 'in_app'];
        const newPrefs = {};
        allPrefs.forEach(pref => {
            newPrefs[pref] = selected.includes(pref);
        });
        setSettings(prev => ({
            ...prev,
            notification_preferences: newPrefs
        }));
    }, []);

    const handleProgramSelection = useCallback((selectedProgramIds) => {
        setSettings(prev => ({
            ...prev,
            auto_accept_programs_ids: selectedProgramIds
        }));
    }, []);

    // --- Handlers for Criteria Rules ---
    const addRule = useCallback((type) => {
        const newRule = { id: Date.now(), field: '', operator: '', value: '' }; // Add a unique ID for key prop
        if (type === 'review') {
            setAutoReviewRules(prev => [...prev, newRule]);
        } else {
            setAutoRejectRules(prev => [...prev, newRule]);
        }
    }, []);

    const updateRule = useCallback((type, index, updatedRule) => {
        if (type === 'review') {
            setAutoReviewRules(prev => prev.map((rule, i) => i === index ? updatedRule : rule));
        } else {
            setAutoRejectRules(prev => prev.map((rule, i) => i === index ? updatedRule : rule));
        }
    }, []);

    const deleteRule = useCallback((type, index) => {
        if (type === 'review') {
            setAutoReviewRules(prev => prev.filter((_, i) => i !== index));
        } else {
            setAutoRejectRules(prev => prev.filter((_, i) => i !== index));
        }
    }, []);

    // --- Form Submission ---
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const dataToSend = {
            ...settings,
            auto_review_criteria: serializeCriteria(autoReviewRules),
            auto_reject_criteria: serializeCriteria(autoRejectRules),
            // advanced_preferences is still a JSON textarea for now
            advanced_preferences: typeof settings.advanced_preferences === 'string'
                ? (() => { try { return JSON.parse(settings.advanced_preferences); } catch (e) { return {}; } })()
                : settings.advanced_preferences,
            notification_preferences: typeof settings.notification_preferences === 'string'
                ? (() => { try { return JSON.parse(settings.notification_preferences); } catch (e) { return {}; } })()
                : settings.notification_preferences,
            auto_accept_programs: settings.auto_accept_programs_ids || [],
        };
        delete dataToSend.auto_accept_programs_ids;

        try {
            const updatedSettings = await updateUserSettings(dataToSend);
            const processedUpdatedSettings = {
                ...updatedSettings,
                notification_preferences: updatedSettings.notification_preferences || {},
                advanced_preferences: updatedSettings.advanced_preferences || {},
                auto_accept_programs_ids: updatedSettings.auto_accept_programs?.map(p => p.id) || [],
            };
            setSettings(processedUpdatedSettings);
            // Re-deserialize updated criteria to reflect any backend changes or normalization
            setAutoReviewRules(deserializeCriteria(updatedSettings.auto_review_criteria));
            setAutoRejectRules(deserializeCriteria(updatedSettings.auto_reject_criteria));

            toast.success('Settings saved successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to save settings.';
            setError(errorMessage);
            toast.error(`Error saving settings: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    }, [settings, autoReviewRules, autoRejectRules]); // Add new rule states as dependencies

    // Derived state for selected programs (array of IDs)
    const selectedPrograms = useMemo(() => {
        if (!settings) return [];
        return settings.auto_accept_programs_ids || [];
    }, [settings]);

    // Derived state for display names of selected programs
    const selectedProgramsDisplay = useMemo(() => {
        if (!settings || !programs.length) return [];
        return selectedPrograms.map(id => programs.find(p => p.id === id)?.name).filter(Boolean);
    }, [selectedPrograms, programs]);


    // Initial check for authorization
    if (!user || (!user.is_enroller && !user.is_system_admin)) {
        return null;
    }

    // Loading and Error states
    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error loading settings</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Settings not available</h3>
                    <p className="text-gray-600 mb-4">It looks like your settings couldn't be loaded.</p>
                    <Button onClick={() => window.location.reload()}>Reload Page</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="bg-white shadow-sm mb-10 pb-5"></div>
            <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-6 w-6" /> Enroller Preferences
                        </CardTitle>
                        <CardDescription>Configure your enrollment automation and advanced settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800">General Settings</h3>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="receive_newsletters"
                                    checked={settings.receive_newsletters}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, receive_newsletters: checked }))}
                                />
                                <Label htmlFor="receive_newsletters">Receive Newsletters</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="dark_mode"
                                    checked={settings.dark_mode}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dark_mode: checked }))}
                                />
                                <Label htmlFor="dark_mode">Dark Mode</Label>
                            </div>
                            <div>
                                <Label htmlFor="language">Language</Label>
                                <SelectField
                                    id="language"
                                    onChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                                    value={settings.language || 'en'}
                                    options={languagesData.map(lang => ({ value: lang.code, label: lang.name }))}
                                    placeholder="Select Language"
                                />
                            </div>
                            <div>
                                <Label htmlFor="notification_preferences">Notification Preferences</Label>
                                <Select
                                    multiple
                                    value={Object.entries(settings.notification_preferences || {})
                                        .filter(([_, v]) => v)
                                        .map(([k]) => k)}
                                    onValueChange={handleNotificationPreferencesChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select notification methods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="sms">SMS</SelectItem>
                                        <SelectItem value="push">Push Notification</SelectItem>
                                        <SelectItem value="in_app">In-App</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">Choose one or more notification methods.</p>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t mt-6">Auto-Action Settings</h3>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enable_auto_accept"
                                    checked={settings.enable_auto_accept}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_auto_accept: checked }))}
                                />
                                <Label htmlFor="enable_auto_accept">Enable Auto-Accept</Label>
                            </div>
                            {settings.enable_auto_accept && (
                                <>
                                    <div>
                                        <Label htmlFor="auto_accept_min_points">Auto-Accept Minimum A-Level Points</Label>
                                        <Input
                                            id="auto_accept_min_points"
                                            type="number"
                                            value={settings.auto_accept_min_points || 0}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 10"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="auto_accept_programs">Auto-Accept Programs</Label>
                                        {programsLoading ? (
                                            <div className="flex items-center text-gray-500">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading programs...
                                            </div>
                                        ) : programsError ? (
                                            <p className="text-red-500 text-sm">{programsError}</p>
                                        ) : (
                                            <Select
                                                multiple
                                                value={selectedPrograms}
                                                onValueChange={handleProgramSelection}
                                                disabled={!programs || programs.length === 0}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select programs" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {programs.map(program => (
                                                        <SelectItem key={program.id} value={program.id}>
                                                            {program.name} ({program.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {selectedProgramsDisplay.length > 0 && (
                                            <p className="text-xs text-gray-600 mt-1">Currently selected: {selectedProgramsDisplay.join(', ')}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Select programs for auto-acceptance based on points criteria.</p>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enable_auto_review"
                                    checked={settings.enable_auto_review}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_auto_review: checked }))}
                                />
                                <Label htmlFor="enable_auto_review">Enable Auto-Review</Label>
                            </div>
                            {settings.enable_auto_review && (
                                <div>
                                    <Label htmlFor="auto_review_criteria">Auto-Review Criteria</Label>
                                    <div className="space-y-3">
                                        {autoReviewRules.map((rule, index) => (
                                            <CriteriaRule
                                                key={rule.id} // Use the unique ID for key
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
                                        className="mt-3 w-full"
                                        onClick={() => addRule('review')}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" /> Add Review Rule
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-1">Define conditions for applications requiring review.</p>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="auto_reject_criteria">Auto-Reject Criteria</Label>
                                <div className="space-y-3">
                                    {autoRejectRules.map((rule, index) => (
                                        <CriteriaRule
                                            key={rule.id} // Use the unique ID for key
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
                                    className="mt-3 w-full"
                                    onClick={() => addRule('reject')}
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" /> Add Reject Rule
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">Define conditions for applications to be automatically rejected.</p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto_assign_reviewer"
                                    checked={settings.auto_assign_reviewer}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_assign_reviewer: checked }))}
                                />
                                <Label htmlFor="auto_assign_reviewer">Enable Auto-Assign Reviewer</Label>
                            </div>
                            {settings.auto_assign_reviewer && (
                                <div>
                                    <Label htmlFor="default_reviewer_id">Default Reviewer ID</Label>
                                    <Input
                                        id="default_reviewer_id"
                                        value={settings.default_reviewer_id || ''}
                                        onChange={handleInputChange}
                                        placeholder="UUID of reviewer"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter the UUID of the reviewer to automatically assign applications to.</p>
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t mt-6">Advanced Preferences</h3>
                            <div>
                                <Label htmlFor="advanced_preferences">Advanced Preferences (JSON)</Label>
                                <Textarea
                                    id="advanced_preferences"
                                    value={JSON.stringify(settings.advanced_preferences || {}, null, 2)}
                                    onChange={(e) => setSettings(prev => ({ ...prev, advanced_preferences: e.target.value }))} // Keep as string for now
                                    className="font-mono text-xs"
                                    rows={6}
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter any other custom preferences in JSON format. This will be automatically parsed on save.</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving} className="bg-teal-600 hover:bg-teal-400 text-white">
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </>
    );
};

export default EnrollerSettingsPage;