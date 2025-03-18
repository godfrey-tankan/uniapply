
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getUniversities, 
  getPrograms, 
  submitApplication,
  University,
  Program
} from "@/services/applicationService";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  universityId: z.string({
    required_error: "Please select a university",
  }),
  programId: z.string({
    required_error: "Please select a program",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ApplyForm = ({ onApplicationSuccess }: { onApplicationSuccess: () => void }) => {
  const { user } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      universityId: "",
      programId: "",
    },
  });

  const watchUniversityId = form.watch("universityId");

  const fetchUniversities = async () => {
    setIsLoadingData(true);
    const data = await getUniversities();
    setUniversities(data);
    setIsLoadingData(false);
  };

  const fetchPrograms = async (universityId: number) => {
    if (!universityId) return;
    
    setIsLoadingData(true);
    const data = await getPrograms(universityId);
    setPrograms(data);
    setIsLoadingData(false);
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (watchUniversityId) {
      fetchPrograms(parseInt(watchUniversityId));
      form.setValue("programId", "");
    }
  }, [watchUniversityId]);

  const onSubmit = async (data: FormValues) => {
    if (!user?.id) {
      toast.error("User information is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedUniversity = universities.find(u => u.id === parseInt(data.universityId));
      const selectedProgram = programs.find(p => p.id === parseInt(data.programId));
      
      if (!selectedUniversity || !selectedProgram) {
        toast.error("Selected university or program not found");
        return;
      }

      const result = await submitApplication(
        selectedUniversity.name,
        selectedProgram.name,
        user.id
      );
      
      if (result) {
        form.reset();
        onApplicationSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData && universities.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Apply to a Program</h2>
        <div className="flex justify-center">
          <div className="animate-pulse">Loading universities and programs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Apply to a Program</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="universityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a university" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem 
                        key={university.id} 
                        value={university.id.toString()}
                      >
                        {university.name} ({university.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="programId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!watchUniversityId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={watchUniversityId ? "Select a program" : "Select a university first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem 
                        key={program.id} 
                        value={program.id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ApplyForm;
