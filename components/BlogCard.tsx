'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  User, 
  Tag,
  ArrowRight,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  tags: string[];
  upvotes: number;
  comments: {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
  }[];
  isUpvoted?: boolean;
}

interface BlogCardProps {
  post: BlogPost;
  onUpvote: (postId: string) => void;
  isUpvoting?: boolean;
}

export default function BlogCard({ post, onUpvote, isUpvoting = false }: BlogCardProps) {
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [localIsUpvoted, setLocalIsUpvoted] = useState(post.isUpvoted || false);

  const handleUpvote = async () => {
    if (isUpvoting) return;
    
    // Optimistic update
    setLocalIsUpvoted(!localIsUpvoted);
    setLocalUpvotes(prev => localIsUpvoted ? prev - 1 : prev + 1);
    
    try {
      await onUpvote(post.id);
    } catch {
      // Revert on error
      setLocalIsUpvoted(localIsUpvoted);
      setLocalUpvotes(post.upvotes);
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 hover:text-blue-600 transition-colors">
              <Link href={`/blogs/${post.id}`}>
                {post.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{post.authorName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
              </div>
            </CardDescription>
          </div>
          <Avatar className="ml-4">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {post.authorName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {truncateContent(post.content)}
          </p>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Upvote Button */}
            <Button
              variant={localIsUpvoted ? "default" : "outline"}
              size="sm"
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`flex items-center space-x-2 ${
                localIsUpvoted 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
              }`}
            >
              <Heart className={`h-4 w-4 ${localIsUpvoted ? 'fill-current' : ''}`} />
              <span>{localUpvotes}</span>
            </Button>

            {/* Comments Count */}
            <div className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments.length} comments</span>
            </div>

            {/* Reading Time Estimate */}
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{Math.ceil(post.content.length / 200)} min read</span>
            </div>
          </div>

          {/* Read More Button */}
          <Button asChild variant="ghost" size="sm">
            <Link href={`/blogs/${post.id}`} className="flex items-center space-x-2">
              <span>Read More</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 