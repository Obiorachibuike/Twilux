import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PostWithUser, UserWithCounts } from "@shared/schema";
import { PostCard } from "@/components/PostCard";
import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const userId = params.id;

  const { data: user, isLoading: userLoading } = useQuery<UserWithCounts>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: [`/api/posts/user/${userId}`],
    enabled: !!userId,
  });

  if (userLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Profile Header Skeleton */}
        <Card>
          <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20" />
          <CardContent className="p-4">
            <div className="flex justify-between items-start -mt-16 mb-4">
              <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
              <Skeleton className="h-10 w-32 rounded-full mt-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-muted-foreground">
              The user you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card>
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20" />
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            {/* Profile Picture */}
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            {isOwnProfile ? (
              <Button variant="outline" className="mt-16 rounded-full">
                Edit Profile
              </Button>
            ) : (
              <div className="mt-16">
                <UserCard user={user} showFollowButton />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            {user.username && (
              <p className="text-muted-foreground">@{user.username}</p>
            )}
            {user.bio && (
              <p className="mt-2 text-foreground">{user.bio}</p>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-muted-foreground text-sm">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
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
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>
              </div>
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
        </CardContent>
        
        {/* Profile Navigation */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-t">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            <div className="space-y-0">
              {postsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-b border-border rounded-none">
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : posts?.length === 0 ? (
                <Card className="border-b border-border rounded-none">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "You haven't posted anything yet. Share your first thought!"
                        : `${user.firstName} hasn't posted anything yet.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts?.map((post) => (
                  <div key={post.id} className="border-b border-border last:border-b-0">
                    <PostCard post={post} />
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="replies" className="mt-0">
            <Card className="border-b border-border rounded-none">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Replies</h3>
                <p className="text-muted-foreground">
                  Replies feature coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media" className="mt-0">
            <Card className="border-b border-border rounded-none">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Media</h3>
                <p className="text-muted-foreground">
                  Media posts will be shown here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="likes" className="mt-0">
            <Card className="border-b border-border rounded-none">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Liked Posts</h3>
                <p className="text-muted-foreground">
                  Posts you've liked will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
