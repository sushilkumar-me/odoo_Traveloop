"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Globe, Lock, Plane, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          phone: data.phone,
          city: data.city,
          country: data.country,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      router.push("/login");
    } catch (err) {
      setError("Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
      <CardContent className="p-6 sm:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 mb-3 shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.05 }}
          >
            <Plane className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-1">Create Account</h1>
          <p className="text-gray-500 text-sm">Start your journey with Traveloop</p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Name Row - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="John"
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">Last Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Doe"
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* City & Country Row - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">City</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="New York"
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">Country</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="United States"
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 pr-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 pr-10 h-10 rounded-lg focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>

        {/* Sign in link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center"
        >
          <span className="text-gray-500 text-sm">Already have an account? </span>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline text-sm"
          >
            Sign in
          </Link>
        </motion.div>
      </CardContent>
    </Card>
  );
}