'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import BlogForm from '@/components/BlogForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewBlogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to create a blog post</p>
          <div className="space-x-4">
            <Button asChild variant="outline">
              <Link href="/blogs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Link>
            </Button>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: { title: string; content: string; tags: string[] }) => {
    setIsSubmitting(true);
    
    try {
      // Create the blog post in Firestore
      const blogData = {
        title: data.title,
        content: data.content,
        tags: data.tags,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        upvoters: [],
        comments: [],
        isPublished: true,
      };

      const docRef = await addDoc(collection(db, 'blogs'), blogData);
      
      toast.success('Blog post published successfully!');
      router.push(`/blogs/${docRef.id}`);
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to publish blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/blogs" className="text-purple-600 hover:text-purple-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">Create New Post</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user.displayName || user.email}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <BlogForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Publish Post"
          title="Create New Blog Post"
          description="Share your thoughts, experiences, and insights with the coding community"
        />
      </main>
    </div>
  );
} 