import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosAgent } from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Define constants for maximum file size and accepted file types
const MAX_UPLOAD_SIZE = 1024 * 1024 * 10; // 10MB
const ACCEPTED_FILE_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Define a schema using Zod for form validation
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length == 1, "File is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_UPLOAD_SIZE,
      "Max image size is 10MB."
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .csv, .xls, .xlsx format is supported."
    ),
});

// Define the UploadForm component
export function UploadForm() {
  const { toast } = useToast(); // Hook for displaying toast notifications
  const navigate = useNavigate(); // Hook for navigation
  const [loading, setLoading] = useState(false); // State to manage loading status

  // Initialize the form with React Hook Form and Zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  // Register file input field
  const fileRef = form.register("file");

  // Define a submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true); // Set loading state to true
    // Create form-data post request to send details of the dataframe to the backend
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("file", values.file[0]);
    axiosAgent
      .post("dataframe/", formData)
      .then((res: any) => {
        toast({
          title: "File submitted",
          description: "Congrats!",
        });
        setLoading(false); // Set loading state to false
        navigate(`/${res.data?.id}`); // Navigate to the new page
      })
      .catch((error) => {
        // Error handling for bad requests caused by wrong or missing information
        if (error?.response?.status == 400) {
          toast({
            title: "File submission failed",
            description: "Bad Request",
          });
        } else {
          // Handle unknown errors
          toast({
            title: "File submission failed",
            description: "Unknown error happened",
          });
        }
        setLoading(false); // Set loading state to false
      });
  }

  return (
    <Form {...form}>
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-4xl font-bold">Regex Pattern Matching</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          View All
        </Button>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dataframe Title</FormLabel>
              <FormControl>
                <Input placeholder="Expense sheet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({}) => (
            <FormItem>
              <FormLabel>Spreadsheet File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept={ACCEPTED_FILE_TYPES.join(",")}
                  {...fileRef}
                />
              </FormControl>
              <FormDescription>
                Only .csv, .xls, .xlsx format is supported.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="disabled:bg-gray-700"
          disabled={loading}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
