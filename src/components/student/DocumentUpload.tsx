
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadDocument } from "@/services/documentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  documentType: z.string({
    required_error: "Please select a document type",
  }),
  file: z.instanceof(File, {
    message: "Please upload a file",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const DocumentUpload = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user?.id) {
      toast.error("User information is missing");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDocument(data.file, data.documentType, user.id);
      if (result) {
        form.reset();
        onUploadSuccess();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Transcript">Transcript</SelectItem>
                    <SelectItem value="ID">ID</SelectItem>
                    <SelectItem value="Recommendation Letter">Recommendation Letter</SelectItem>
                    <SelectItem value="others">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...field}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onChange(e.target.files[0]);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default DocumentUpload;
