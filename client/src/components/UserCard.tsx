import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserWithCounts } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface UserCardProps {
  user: UserWithCounts;
  showBio?: boolean;
  showFollowButton?: boolean;
}

export function UserCard({ user, showBio = false, showFollowButton = true }: UserCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await apiRequest("DELETE", `/api/users/${user.id}/follow`);
      } else {
        await apiRequest("POST", `/api/users/${user.id}/follow`);
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: `You are now ${isFollowing ? "not following" : "following"} ${user.firstName} ${user.lastName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const handleFollow = () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }
    followMutation.mutate();
  };

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              {user.username && (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              )}
            </div>
          </div>
          
          {showFollowButton && !isOwnProfile && currentUser && (
            <Button
              onClick={handleFollow}
              disabled={followMutation.isPending}
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className="rounded-full"
            >
              {followMutation.isPending
                ? "..."
                : isFollowing
                ? "Following"
                : "Follow"}
            </Button>
          )}
        </div>
        
        {showBio && (
          <div className="mt-3 space-y-2">
            {user.bio && (
              <p className="text-sm text-foreground">{user.bio}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-3 w-3" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <span>
                <strong>{user.followingCount}</strong>{" "}
                <span className="text-muted-foreground">Following</span>
              </span>
              <span>
                <strong>{user.followersCount}</strong>{" "}
                <span className="text-muted-foreground">Followers</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
