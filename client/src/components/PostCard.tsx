import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Repeat2, Bookmark, Share, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostWithUser, User as UserType, Comment } from "@shared/schema";

interface PostCardProps {
  post: PostWithUser;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const typedUser = user as UserType | undefined;

  // Fetch comments for this post
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments", post.id],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (post.isLiked) {
        await apiRequest(`/api/posts/${post.id}/like`, "DELETE");
      } else {
        await apiRequest(`/api/posts/${post.id}/like`, "POST");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (post.isBookmarked) {
        await apiRequest(`/api/posts/${post.id}/bookmark`, "DELETE");
      } else {
        await apiRequest(`/api/posts/${post.id}/bookmark`, "POST");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.user.firstName} ${post.user.lastName}`,
        text: post.content,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      });
    }
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.user.username || post.user.id}`}>
            <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-12 w-12 ring-2 ring-white/50 dark:ring-gray-800/50">
                <AvatarImage src={post.user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {post.user.firstName?.[0]}{post.user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {post.user.firstName} {post.user.lastName}
                </p>
                {post.user.username && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{post.user.username}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              {typedUser?.id === post.userId && (
                <DropdownMenuItem className="text-destructive">
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">
          {post.content}
        </p>

        {/* Engagement Metrics */}
        <div className="flex items-center justify-between py-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                post.isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{post.likesCount}</span>
            </Button>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{post.commentsCount}</span>
            </Button>

            {/* Repost Button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Repeat2 className="h-5 w-5" />
              <span className="text-sm font-medium">{post.repostsCount}</span>
            </Button>

            {/* Bookmark Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
              className={`flex items-center space-x-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors ${
                post.isBookmarked ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${post.isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
            {/* Add Comment */}
            {typedUser && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={typedUser.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                    {typedUser.firstName?.[0]}{typedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none bg-gray-50 dark:bg-gray-800 border-0"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleComment}
                      disabled={!commentText.trim() || commentMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {commentMutation.isPending ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment: Comment & { user: UserType }) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                      {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link href={`/profile/${comment.user.username || comment.user.id}`}>
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:underline">
                            {comment.user.firstName} {comment.user.lastName}
                          </span>
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}