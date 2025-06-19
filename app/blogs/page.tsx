'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, arrayUnion, arrayRemove, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BlogCard, { BlogPost } from '@/components/BlogCard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Plus, FileText, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';

export default function BlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvotingId, setUpvotingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedBlogs: BlogPost[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || '',
            content: data.content || '',
            authorId: data.authorId || '',
            authorName: data.authorName || 'Unknown Author',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            tags: data.tags || [],
            upvotes: data.upvotes || 0,
            comments: (data.comments || []).map((comment: any) => ({
              ...comment,
              createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(),
            })),
            isUpvoted: user ? (data.upvoters || []).includes(user.uid) : false,
          };
        });
        setBlogs(fetchedBlogs);
      } catch (err) {
        setError('Failed to load blogs.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [user]);

  const handleUpvote = async (postId: string) => {
    if (!user) return;
    setUpvotingId(postId);
    try {
      const blog = blogs.find((b) => b.id === postId);
      if (!blog) return;
      const blogRef = doc(db, 'blogs', postId);
      if (blog.isUpvoted) {
        await updateDoc(blogRef, {
          upvotes: blog.upvotes - 1,
          upvoters: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(blogRef, {
          upvotes: blog.upvotes + 1,
          upvoters: arrayUnion(user.uid),
        });
      }
      // Optimistically update UI
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === postId
            ? {
                ...b,
                upvotes: blog.isUpvoted ? b.upvotes - 1 : b.upvotes + 1,
                isUpvoted: !b.isUpvoted,
              }
            : b
        )
      );
    } catch (err) {
      setError('Failed to update upvote.');
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 pb-24">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Blogs</span>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 hidden md:inline-flex">
            <Link href="/blogs/new">
              <Plus className="h-4 w-4 mr-2" /> Create Post
            </Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Blog Feed Section */}
        <section className="md:col-span-8 flex flex-col gap-8">
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-purple-800 flex items-center gap-2">
              <FileText className="h-7 w-7 text-purple-400" /> Campus Blog Feed
            </h1>
            <p className="text-gray-600 mt-1 ml-1">Read and share coding stories, tutorials, and experiences from your campus community.</p>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-purple-400" />
              <span className="text-lg">Loading blogs...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
              <AlertTriangle className="h-10 w-10 mb-4" />
              <span className="text-lg">{error}</span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Lightbulb className="h-14 w-14 mb-4 text-yellow-400" />
              <h2 className="text-xl font-semibold mb-2">No blog posts yet</h2>
              <p className="mb-4">Be the first to share your coding journey or tips with the community!</p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/blogs/new">
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Post
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-fade-in">
              {blogs.map((blog, i) => (
                <div key={blog.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in-up">
                  <BlogCard
                    post={blog}
                    onUpvote={handleUpvote}
                    isUpvoting={upvotingId === blog.id}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Right Sidebar for Desktop */}
        <aside className="hidden md:block md:col-span-4 space-y-8">
          <div className="bg-white rounded-2xl shadow-md border p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" /> Tips for Great Blog Posts
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>Share your coding journey, not just solutions.</li>
              <li>Use code snippets and visuals for clarity.</li>
              <li>Ask questions to engage readers.</li>
              <li>Tag your post for discoverability.</li>
              <li>Be kind and constructive in comments.</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow border p-6">
            <h2 className="text-lg font-semibold mb-2">🚀 Why Blog?</h2>
            <p className="text-gray-700 text-sm mb-2">Blogging helps you reflect, build your portfolio, and connect with other coders. Start sharing today!</p>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 mt-2">
              <Link href="/blogs/new">
                <Plus className="h-4 w-4 mr-2" /> Write a Post
              </Link>
            </Button>
          </div>
        </aside>
        {/* Floating Create Button for Mobile */}
        <Button asChild className="fixed bottom-6 right-6 z-20 rounded-full p-0 h-14 w-14 shadow-lg bg-purple-600 hover:bg-purple-700 md:hidden flex items-center justify-center">
          <Link href="/blogs/new">
            <Plus className="h-7 w-7" />
            <span className="sr-only">Create Post</span>
          </Link>
        </Button>
      </main>
      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
} 