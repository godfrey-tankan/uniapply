
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ApplyForm = ({ onApplicationSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState('');
  const [startDate, setStartDate] = useState('');
  const [motivation, setMotivation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!program || !startDate || !motivation) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate submission delay
    setTimeout(() => {
      // For demonstration, just show a success message
      toast({
        title: "Success!",
        description: "Application submitted successfully",
      });
      
      setLoading(false);
      setProgram('');
      setStartDate('');
      setMotivation('');
      
      if (onApplicationSuccess) {
        onApplicationSuccess();
      }
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">New Application</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="program">Program</Label>
          <Select value={program} onValueChange={setProgram} required>
            <SelectTrigger id="program">
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs">Computer Science</SelectItem>
              <SelectItem value="business">Business Administration</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="medicine">Medical Sciences</SelectItem>
              <SelectItem value="arts">Liberal Arts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="motivation">Motivation Statement</Label>
          <Textarea
            id="motivation"
            placeholder="Why do you want to join this program?"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={4}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
};

export default ApplyForm;
