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

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3;
const ACCEPTED_FILE_TYPES = ["text/csv"];

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length == 1, "File is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_UPLOAD_SIZE,
      "Max image size is 3MB."
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .csv format is supported."
    ),
});

export function UploadForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  // Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Creating form-data post request to send details of the dataframe to the backend
    const form = new FormData();
    form.append("title", values.title);
    form.append("file", values.file[0]);
    axiosAgent
      .post("dataframe/", form)
      .then(() => {
        toast({
          title: "File submitted",
          description: "Congrats!",
        });
      })
      .catch((error) => {
        console.log(error);
        let errMessage = "";

        // Error handling when bad request happened caused by wrong or missing information
        if (error?.response?.status == 400) {
          for (const [key, errs] of Object.entries(error?.response?.data)) {
            errMessage +=
              key +
              ": " +
              errs.reduce((last: string, curr: string) => {
                return last + curr;
              }, errMessage) +
              " ";
          }
          toast({
            title: "File submission failed",
            description: errMessage,
          });
        } else {
          // Throwing unknown error when the error cannot be predictable
          toast({
            title: "File submission failed",
            description: "Unknown error happened",
          });
        }
      });
  }

  return (
    <Form {...form}>
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-4xl font-bold">Data type analyser</h1>
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Speadsheet File</FormLabel>
              <FormControl>
                <Input type="file" {...fileRef} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
