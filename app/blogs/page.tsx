'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import BlogCard, { BlogPost } from '@/components/BlogCard';
import { 
  BookOpen, 
  PenTool, 
  Search, 
  Filter, 
  Tag,
  ArrowLeft,
  Plus,
  TrendingUp,
  Clock,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [isUpvoting, setIsUpvoting] = useState<string | null>(null);

  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags || [])));

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        if (!db) {
          throw new Error('Firebase is not initialized');
        }
        
        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const blogsData: BlogPost[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            content: data.content || '',
            authorId: data.authorId || '',
            authorName: data.authorName || 'Unknown Author',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
            tags: data.tags || [],
            upvotes: data.upvotes || 0,
            comments: data.comments || [],
            isUpvoted: false,
          };
        });
        
        setBlogs(blogsData);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        toast.error('Failed to load blogs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = [...blogs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(blog => blog.tags.includes(selectedTag));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - a.upvotes;
        case 'trending':
          // Simple trending algorithm: upvotes / days since creation
          const aDays = Math.max(1, (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          const bDays = Math.max(1, (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return (b.upvotes / bDays) - (a.upvotes / aDays);
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, selectedTag, sortBy]);

  const handleUpvote = async (blogId: string) => {
    if (!user || !db) {
      toast.error('Please login to upvote posts');
      return;
    }

    if (isUpvoting) return;

    setIsUpvoting(blogId);
    try {
      const blogRef = doc(db, 'blogs', blogId);
      const blog = blogs.find(b => b.id === blogId);
      
      if (!blog) return;

      const isCurrentlyUpvoted = blog.isUpvoted;
      
      if (isCurrentlyUpvoted) {
        // Remove upvote
        await updateDoc(blogRef, {
          upvotes: blog.upvotes - 1,
          upvoters: arrayRemove(user.uid)
        });
      } else {
        // Add upvote
        await updateDoc(blogRef, {
          upvotes: blog.upvotes + 1,
          upvoters: arrayUnion(user.uid)
        });
      }

      // Update local state
      setBlogs(prev => prev.map(b => 
        b.id === blogId 
          ? { 
              ...b, 
              upvotes: isCurrentlyUpvoted ? b.upvotes - 1 : b.upvotes + 1,
              isUpvoted: !isCurrentlyUpvoted 
            }
          : b
      ));

      toast.success(isCurrentlyUpvoted ? 'Upvote removed' : 'Post upvoted!');
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast.error('Failed to update upvote');
    } finally {
      setIsUpvoting(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-purple-600 hover:text-purple-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">Community Blogs</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <Button asChild>
                  <Link href="/blogs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Post
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blogs.length}</div>
              <p className="text-xs text-muted-foreground">Published articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {blogs.reduce((sum, blog) => sum + blog.upvotes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Community appreciation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tags</CardTitle>
              <Tag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTags.length}</div>
              <p className="text-xs text-muted-foreground">Different topics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <PenTool className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {blogs.reduce((sum, blog) => sum + blog.comments.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Community discussions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tag Filter */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'trending')}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="newest">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Newest First
                </option>
                <option value="popular">
                  <Heart className="inline h-4 w-4 mr-1" />
                  Most Popular
                </option>
                <option value="trending">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  Trending
                </option>
              </select>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedTag || sortBy !== 'newest') && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary">
                    Search: &quot;{searchTerm}&quot;
                  </Badge>
                )}
                {selectedTag && (
                  <Badge variant="secondary">
                    Tag: {selectedTag}
                  </Badge>
                )}
                {sortBy !== 'newest' && (
                  <Badge variant="secondary">
                    Sort: {sortBy}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blog Posts */}
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="space-y-6">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                post={blog}
                onUpvote={handleUpvote}
                isUpvoting={isUpvoting === blog.id}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm || selectedTag ? 'No posts found' : 'No blog posts yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedTag 
                  ? 'Try adjusting your search criteria or filters'
                  : 'Be the first to share your thoughts with the community!'
                }
              </p>
              {user && (
                <Button asChild>
                  <Link href="/blogs/new">
                    <PenTool className="h-4 w-4 mr-2" />
                    Write First Post
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
} 