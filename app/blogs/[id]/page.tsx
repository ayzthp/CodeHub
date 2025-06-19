'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Calendar, 
  User, 
  Tag,
  Clock,
  Send,
  BookOpen,
  Share2,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  tags: string[];
  upvotes: number;
  comments: Comment[];
  isUpvoted?: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!params || !params.id) return;
      
      setIsLoading(true);
      try {
        const postRef = doc(db, 'blogs', params.id as string);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          const data = postSnap.data();
          const fetchedPost: BlogPost = {
            id: postSnap.id,
            title: data.title || '',
            content: data.content || '',
            authorId: data.authorId || '',
            authorName: data.authorName || 'Unknown Author',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            tags: data.tags || [],
            upvotes: data.upvotes || 0,
            comments: (data.comments || []).map((comment: { id: string; author: string; authorId: string; content: string; createdAt?: { toDate?: () => Date } }) => ({
              ...comment,
              createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date()
            })),
            isUpvoted: user ? data.upvoters?.includes(user.uid) : false,
          };
          setPost(fetchedPost);
        } else {
          toast.error('Blog post not found');
          router.push('/blogs');
        }
      } catch {
        toast.error('Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [params?.id, user, router]);



  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please login to upvote posts');
      return;
    }

    if (!post || isUpvoting) return;

    setIsUpvoting(true);
    try {
      const postRef = doc(db, 'blogs', post.id);
      const isCurrentlyUpvoted = post.isUpvoted;
      
      if (isCurrentlyUpvoted) {
        // Remove upvote
        await updateDoc(postRef, {
          upvotes: post.upvotes - 1,
          upvoters: arrayRemove(user.uid)
        });
      } else {
        // Add upvote
        await updateDoc(postRef, {
          upvotes: post.upvotes + 1,
          upvoters: arrayUnion(user.uid)
        });
      }

      // Update local state
      setPost(prev => prev ? {
        ...prev,
        upvotes: isCurrentlyUpvoted ? prev.upvotes - 1 : prev.upvotes + 1,
        isUpvoted: !isCurrentlyUpvoted
      } : null);

      toast.success(isCurrentlyUpvoted ? 'Upvote removed' : 'Post upvoted!');
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast.error('Failed to update upvote');
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentText.trim() || !post || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: user.displayName || user.email || 'Anonymous',
        authorId: user.uid,
        content: commentText.trim(),
        createdAt: new Date()
      };

      const postRef = doc(db, 'blogs', post.id);
      await updateDoc(postRef, {
        comments: arrayUnion({
          ...newComment,
          createdAt: new Date()
        })
      });

      // Update local state
      setPost(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment]
      } : null);

      setCommentText('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing or sharing failed
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed text-gray-700">
        {paragraph}
      </p>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full mb-6" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
                        <p className="text-gray-600 mb-6">The blog post you&apos;re looking for doesn&apos;t exist</p>
          <Button asChild>
            <Link href="/blogs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
                <span className="text-2xl font-bold text-gray-900 truncate max-w-md">
                  {post.title}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {user && user.uid === post.authorId && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blogs/${post.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Blog Post */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900 leading-tight">
              {post.title}
            </CardTitle>
            
            {/* Author and Date Info */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {post.authorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{post.authorName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.ceil(post.content.length / 200)} min read</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={post.isUpvoted ? "default" : "outline"}
                  size="sm"
                  onClick={handleUpvote}
                  disabled={isUpvoting}
                  className={post.isUpvoted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                  }
                >
                  <Heart className={`h-4 w-4 mr-2 ${post.isUpvoted ? 'fill-current' : ''}`} />
                  {post.upvotes}
                </Button>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments.length}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {/* Blog Content */}
            <div className="prose prose-lg max-w-none">
              {formatContent(post.content)}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Comments ({post.comments.length})</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* Add Comment Form */}
            {user ? (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  <Avatar className="mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {(user.displayName || user.email || 'A').split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share your thoughts about this post..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mb-3 min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {commentText.length} / 1000 characters
                      </span>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                        size="sm"
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-blue-800 mb-3">Please log in to join the discussion</p>
                <Button asChild size="sm">
                  <Link href="/login">Login to Comment</Link>
                </Button>
              </div>
            )}

            {/* Comments List */}
            {post.comments.length > 0 ? (
              <div className="space-y-6">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
                    <Avatar>
                      <AvatarFallback className="bg-green-100 text-green-600">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 