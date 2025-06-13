import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Smile, MapPin, Calendar } from "lucide-react";
import { User as UserType } from "@shared/schema";

export function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const typedUser = user as UserType | undefined;

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content: postContent }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Your post has been published!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (content.trim()) {
      createPostMutation.mutate(content.trim());
    }
  };

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;

  if (!typedUser) return null;

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12 ring-2 ring-white/50 dark:ring-gray-800/50">
            <AvatarImage src={typedUser.profileImageUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {typedUser.firstName?.[0]}{typedUser.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 bg-transparent text-lg placeholder:text-gray-400 focus:ring-0 p-0"
              maxLength={maxCharacters + 50} // Allow typing over limit to show warning
            />
            
            {/* Character Count and Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-4">
                {/* Media Upload Options */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full p-2"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full p-2"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full p-2"
                >
                  <MapPin className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full p-2"
                >
                  <Calendar className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Character Counter */}
                <div className="flex items-center space-x-2">
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth="3"
                        fill="none"
                        stroke="currentColor"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={isOverLimit ? "text-red-500" : "text-blue-500"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${Math.min((characterCount / maxCharacters) * 100, 100)}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-medium ${
                        isOverLimit ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {characterCount > maxCharacters - 20 ? maxCharacters - characterCount : ""}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Post Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isOverLimit || createPostMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full px-6 font-semibold"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}