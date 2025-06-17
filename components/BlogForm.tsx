'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  PenTool, 
  Tag, 
  X, 
  Plus, 
  Save, 
  Eye,
  Loader2
} from 'lucide-react';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  content: z.string().min(50, 'Content must be at least 50 characters').max(5000, 'Content too long'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  onSubmit: (data: BlogFormData) => Promise<void>;
  initialData?: Partial<BlogFormData>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  title?: string;
  description?: string;
}

export default function BlogForm({ 
  onSubmit, 
  initialData, 
  isSubmitting = false,
  submitButtonText = 'Publish Post',
  title = 'Create New Blog Post',
  description = 'Share your thoughts, experiences, and insights with the coding community'
}: BlogFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      tags: initialData?.tags || [],
    },
  });

  const watchedValues = form.watch();

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('tags');
    const newTag = tagInput.trim().toLowerCase();
    
    if (currentTags.includes(newTag)) {
      setTagInput('');
      return;
    }
    
    if (currentTags.length >= 10) {
      form.setError('tags', { message: 'Maximum 10 tags allowed' });
      return;
    }
    
    form.setValue('tags', [...currentTags, newTag]);
    setTagInput('');
    form.clearErrors('tags');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (data: BlogFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting blog:', error);
    }
  };

  const formatPreviewContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <PenTool className="h-6 w-6 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isPreview ? (
          /* Preview Mode */
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {watchedValues.title || 'Your Blog Title'}
              </h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {watchedValues.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="prose prose-lg max-w-none">
              {watchedValues.content ? (
                formatPreviewContent(watchedValues.content)
              ) : (
                <p className="text-gray-500 italic">Your blog content will appear here...</p>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter an engaging title for your blog post..."
                        {...field}
                        className="text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags Field */}
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add tags (press Enter to add)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Display Tags */}
                  {watchedValues.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedValues.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center space-x-1 cursor-pointer hover:bg-red-100"
                          onClick={() => removeTag(tag)}
                        >
                          <Tag className="h-3 w-3" />
                          <span>{tag}</span>
                          <X className="h-3 w-3 hover:text-red-600" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {form.formState.errors.tags && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.tags.message}
                  </p>
                )}
              </FormItem>

              {/* Content Field */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your blog content here... Share your experiences, insights, tutorials, or thoughts about coding and technology."
                        className="min-h-[300px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{field.value?.length || 0} / 5000 characters</span>
                      <span>~{Math.ceil((field.value?.length || 0) / 200)} min read</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? 'Publishing...' : submitButtonText}</span>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
} 