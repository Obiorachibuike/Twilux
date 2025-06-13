import { useQuery } from "@tanstack/react-query";
import { PostWithUser } from "@shared/schema";
import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts/feed"],
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Create Post */}
      <CreatePost />

      {/* Posts Feed */}
      <div className="space-y-0">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-b border-border">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex space-x-6 mt-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : posts?.length === 0 ? (
          <Card className="border-b border-border">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Welcome to SocialConnect!</h3>
              <p className="text-muted-foreground mb-4">
                Your feed is empty. Start following people to see their posts here.
              </p>
              <p className="text-sm text-muted-foreground">
                You can also check out the{" "}
                <a href="/explore" className="text-primary hover:underline">
                  Explore page
                </a>{" "}
                to discover new content.
              </p>
            </CardContent>
          </Card>
        ) : (
          posts?.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
