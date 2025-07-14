import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OnboardingPageProps {
  user: any;
  onComplete: () => void;
}

export default function OnboardingPage({ user, onComplete }: OnboardingPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.displayName || "",
      vehicleType: "E-Rickshaw",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      console.log("Creating user with data:", { ...data, email: user.email });
      const response = await apiRequest("POST", "/api/user", {
        ...data,
        email: user.email,
      });
      const result = await response.json();
      console.log("User creation response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Created",
        description: "Your profile has been set up successfully!",
      });
      onComplete();
    },
    onError: (error: any) => {
      console.error("User creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingData) => {
    createUserMutation.mutate(data);
  };

  return (
    <div className="p-6 min-h-screen pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">Tell us about your vehicle to get started</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select your vehicle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="E-Rickshaw">E-Rickshaw</SelectItem>
                    <SelectItem value="EV Bike">EV Bike</SelectItem>
                    <SelectItem value="EV Car">EV Car</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RC Book (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-primary transition-colors">
              <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
              <p className="text-gray-600">Upload RC Book Image</p>
              <input type="file" accept="image/*" className="hidden" />
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={createUserMutation.isPending}
            className="w-full bg-green-primary hover:bg-green-dark text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            {createUserMutation.isPending ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
