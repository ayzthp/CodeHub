'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { auth, db } from '@/lib/firebase';
import { fetchLeetCodeStats, fetchCodeforcesStats, fetchAtCoderStats, fetchGitHubStats } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Code, Loader2 } from 'lucide-react';
import Link from 'next/link';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().min(2, 'College name must be at least 2 characters'),
  year: z.string().min(1, 'Year is required'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  leetcodeHandle: z.string().min(1, 'LeetCode handle is required'),
  codeforcesHandle: z.string().min(1, 'Codeforces handle is required'),
  atcoderHandle: z.string().min(1, 'AtCoder handle is required'),
  githubUsername: z.string().min(1, 'GitHub username is required'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      college: '',
      year: '',
      department: '',
      email: '',
      password: '',
      leetcodeHandle: '',
      codeforcesHandle: '',
      atcoderHandle: '',
      githubUsername: '',
    },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    if (!auth || !db) {
      toast.error("Internal error: Firebase not initialized.");
      setIsLoading(false);
      return;
    }
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      toast.success('Account created! Fetching your coding stats...');

      // Fetch stats from all platforms
      const [leetcodeStats, codeforcesStats, atcoderStats, githubStats] = await Promise.all([
        fetchLeetCodeStats(data.leetcodeHandle),
        fetchCodeforcesStats(data.codeforcesHandle),
        fetchAtCoderStats(data.atcoderHandle),
        fetchGitHubStats(data.githubUsername),
      ]);

      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        college: data.college,
        year: data.year,
        department: data.department,
        email: data.email,
        handles: {
          leetcode: data.leetcodeHandle,
          codeforces: data.codeforcesHandle,
          atcoder: data.atcoderHandle,
          github: data.githubUsername,
        },
        stats: {
          leetcode: leetcodeStats,
          codeforces: codeforcesStats,
          atcoder: atcoderStats,
          github: githubStats,
        },
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      toast.success('Welcome to CodeHub! Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Code className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CodeHub</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join CodeHub</h1>
          <p className="text-gray-600">Connect your coding profiles and showcase your skills</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Fill in your details and coding platform handles to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="college"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College</FormLabel>
                        <FormControl>
                          <Input placeholder="MIT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="3rd Year" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Account Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Coding Platform Handles */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Coding Platform Handles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leetcodeHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LeetCode Handle</FormLabel>
                          <FormControl>
                            <Input placeholder="your_leetcode_handle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="codeforcesHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Codeforces Handle</FormLabel>
                          <FormControl>
                            <Input placeholder="your_cf_handle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="atcoderHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AtCoder Handle</FormLabel>
                          <FormControl>
                            <Input placeholder="your_atcoder_handle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="githubUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your_github_username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 