// src/pages/EnrollerSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSettings, updateUserSettings, getProgramsForSettings } from '@/services/userService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For program selection
import Loading from '@/components/Loading';
import { Save, Loader2, XCircle, AlertCircle, Settings } from 'lucide-react';

const EnrollerSettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [programs, setPrograms] = useState([]); // State to hold programs for selection
    const [programsLoading, setProgramsLoading] = useState(true);
    const [programsError, setProgramsError] = useState(null);

    useEffect(() => {
        if (!user || (!user.is_enroller && !user.is_system_admin)) {
            navigate('/dashboard'); // Redirect if not authorized
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
                setSettings(userSettings);
                setPrograms(programsList);
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

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleJsonChange = (id, value) => {
        try {
            setSettings(prev => ({
                ...prev,
                [id]: JSON.parse(value) // Parse JSON string to object
            }));
        } catch (e) {
            // console.error(`Invalid JSON for ${id}:`, e);
            // Optionally provide user feedback for invalid JSON
            setSettings(prev => ({
                ...prev,
                [id]: value // Keep as string if invalid, validation will handle on save
            }));
        }
    };

    const handleProgramSelection = (selectedProgramIds) => {
        setSettings(prev => ({
            ...prev,
            auto_accept_programs_ids: selectedProgramIds.map(id => programs.find(p => p.id === id).id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        // Prepare data for sending - ensuring JSON fields are objects
        const dataToSend = {
            ...settings,
            auto_review_criteria: typeof settings.auto_review_criteria === 'string'
                ? (() => { try { return JSON.parse(settings.auto_review_criteria); } catch (e) { return {}; } })()
                : settings.auto_review_criteria,
            auto_reject_criteria: typeof settings.auto_reject_criteria === 'string'
                ? (() => { try { return JSON.parse(settings.auto_reject_criteria); } catch (e) { return {}; } })()
                : settings.auto_reject_criteria,
            advanced_preferences: typeof settings.advanced_preferences === 'string'
                ? (() => { try { return JSON.parse(settings.advanced_preferences); } catch (e) { return {}; } })()
                : settings.advanced_preferences,
            // Ensure auto_accept_programs_ids is sent, not auto_accept_programs object
            auto_accept_programs: settings.auto_accept_programs_ids || [],
        };
        // Remove auto_accept_programs if it's the full object and the backend expects IDs
        delete dataToSend.auto_accept_programs_ids;


        try {
            const updatedSettings = await updateUserSettings(dataToSend);
            setSettings(updatedSettings); // Update local state with fresh data from backend
            toast.success('Settings saved successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to save settings.';
            setError(errorMessage);
            toast.error(`Error saving settings: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user || (!user.is_enroller && !user.is_system_admin)) {
        return null; // Redirect handled by useEffect
    }

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

    const selectedPrograms = settings.auto_accept_programs_ids || settings.auto_accept_programs?.map(p => p.id) || [];

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
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
                            <Input
                                id="language"
                                value={settings.language || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="notification_preferences">Notification Preferences (JSON)</Label>
                            <Textarea
                                id="notification_preferences"
                                value={JSON.stringify(settings.notification_preferences || {}, null, 2)}
                                onChange={(e) => handleJsonChange('notification_preferences', e.target.value)}
                                className="font-mono text-xs"
                                rows={4}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter valid JSON (e.g., {"{ \"email\": true, \"sms\": false }"}).</p>
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
                                    {selectedPrograms.length > 0 && (
                                        <p className="text-xs text-gray-600 mt-1">Currently selected: {settings.auto_accept_programs?.map(p => p.name).join(', ')}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Select programs for auto-acceptance based on points criteria.</p>
                                    {/* IMPORTANT: For a proper multi-select, you'd use a different component library or build a custom one */}
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
                                <Label htmlFor="auto_review_criteria">Auto-Review Criteria (JSON)</Label>
                                <Textarea
                                    id="auto_review_criteria"
                                    value={JSON.stringify(settings.auto_review_criteria || {}, null, 2)}
                                    onChange={(e) => handleJsonChange('auto_review_criteria', e.target.value)}
                                    className="font-mono text-xs"
                                    rows={4}
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter JSON criteria (e.g., {"{ \"o_level_subjects__gte\": 5 }"}).</p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="auto_reject_criteria">Auto-Reject Criteria (JSON)</Label>
                            <Textarea
                                id="auto_reject_criteria"
                                value={JSON.stringify(settings.auto_reject_criteria || {}, null, 2)}
                                onChange={(e) => handleJsonChange('auto_reject_criteria', e.target.value)}
                                className="font-mono text-xs"
                                rows={4}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter JSON criteria (e.g., {"{ \"a_level_points__lt\": 5 }"}).</p>
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
                                onChange={(e) => handleJsonChange('advanced_preferences', e.target.value)}
                                className="font-mono text-xs"
                                rows={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter any other custom preferences in JSON format.</p>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="h-4 w-4 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EnrollerSettingsPage;