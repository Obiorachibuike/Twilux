import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostWithUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: PostWithUser;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`);
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/bookmark`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/bookmark`);
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Bookmark removed" : "Post bookmarked",
        description: isBookmarked ? "Post removed from bookmarks" : "Post saved to bookmarks",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.user.profileImageUrl || undefined} />
            <AvatarFallback>
              {post.user.firstName?.[0]}{post.user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">
                  {post.user.firstName} {post.user.lastName}
                </h3>
                {post.user.username && (
                  <span className="text-muted-foreground">@{post.user.username}</span>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {(user?.id === post.userId || user?.isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <p className="mt-2 text-foreground whitespace-pre-wrap">{post.content}</p>
            
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post image"
                className="mt-3 rounded-2xl w-full max-h-96 object-cover"
              />
            )}
            
            <div className="flex items-center justify-between mt-4 max-w-md">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>{post.commentsCount}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                <Repeat2 className="h-4 w-4 mr-2" />
                <span>{post.repostsCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`text-muted-foreground hover:text-red-500 ${
                  isLiked ? "text-red-500" : ""
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                <span>{likesCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className={`text-muted-foreground hover:text-primary ${
                  isBookmarked ? "text-primary" : ""
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
