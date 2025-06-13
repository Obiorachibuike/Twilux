import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Smile, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string }) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
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
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({ content: trimmedContent });
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="border-b border-border">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] text-xl border-none resize-none focus-visible:ring-0 placeholder:text-muted-foreground"
                maxLength={280}
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-4">
                  <Button type="button" variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    {content.length}/280
                  </span>
                  <Button
                    type="submit"
                    disabled={createPostMutation.isPending || !content.trim()}
                    className="rounded-full px-6"
                  >
                    {createPostMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
