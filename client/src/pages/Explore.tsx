import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithUser, UserWithCounts } from "@shared/schema";
import { PostCard } from "@/components/PostCard";
import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Hash } from "lucide-react";

export default function Explore() {
  const [activeTab, setActiveTab] = useState("trending");

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts/explore"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<UserWithCounts[]>({
    queryKey: ["/api/users/search/"],
  });

  // Mock trending topics (in a real app, this would come from an API)
  const trendingTopics = [
    { tag: "#WebDevelopment", posts: 42100 },
    { tag: "#React2024", posts: 18500 },
    { tag: "#UIDesign", posts: 31200 },
    { tag: "#JavaScript", posts: 54300 },
    { tag: "#TechNews", posts: 22800 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-4 border-b border-border bg-background/80 backdrop-blur">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trending</span>
            </TabsTrigger>
            <TabsTrigger value="latest" className="flex items-center space-x-2">
              <Hash className="h-4 w-4" />
              <span>Latest</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>People</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trending Topics */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={topic.tag}
                        className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">
                            Trending in Technology
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">{topic.tag}</h3>
                        <p className="text-sm text-muted-foreground">
                          {topic.posts.toLocaleString()} Posts
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Who to Follow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Who to follow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {usersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-16 rounded-full" />
                        </div>
                      ))
                    ) : (
                      users?.slice(0, 3).map((user) => (
                        <UserCard key={user.id} user={user} showFollowButton />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Trending Posts */}
              <div className="lg:col-span-2 space-y-0">
                {postsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="border-b border-border">
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
                ) : (
                  posts?.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="latest" className="mt-6">
            <div className="space-y-0">
              {postsLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Card key={i} className="border-b border-border">
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
              ) : (
                posts?.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="people" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-16 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                users?.map((user) => (
                  <UserCard key={user.id} user={user} showBio showFollowButton />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
