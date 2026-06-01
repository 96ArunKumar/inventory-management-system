import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCustomer, useUpdateCustomer, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerFormModal({ 
  isOpen, 
  onClose, 
  customer 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  customer: any | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        form.reset({
          name: customer.name,
          email: customer.email,
          phone: customer.phone || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          phone: "",
        });
      }
    }
  }, [isOpen, customer, form]);

  const onSubmit = (values: FormValues) => {
    if (customer) {
      updateCustomer.mutate({ id: customer.id, data: values }, {
        onSuccess: () => {
          toast({ title: "Customer updated" });
          queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          onClose();
        },
        onError: (err) => {
          toast({ title: "Error", description: err.error, variant: "destructive" });
        }
      });
    } else {
      createCustomer.mutate({ data: values }, {
        onSuccess: () => {
          toast({ title: "Customer created" });
          queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          onClose();
        },
        onError: (err) => {
          toast({ title: "Error", description: err.error, variant: "destructive" });
        }
      });
    }
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g. contact@acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. +1 555-0123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}