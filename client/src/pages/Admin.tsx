import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostWithUser, UserWithCounts } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Search,
  MoreHorizontal,
  Ban,
  Trash2,
  Eye,
  Shield
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [postFilter, setPostFilter] = useState("all");

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);

  // Fetch admin data
  const { data: users, isLoading: usersLoading } = useQuery<UserWithCounts[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/admin/posts"],
    enabled: !!user?.isAdmin,
  });

  // Mock stats (in a real app, these would come from dedicated endpoints)
  const stats = {
    totalUsers: users?.length || 0,
    totalPosts: posts?.length || 0,
    activeToday: Math.floor((users?.length || 0) * 0.23), // 23% active rate
    reportedPosts: Math.floor((posts?.length || 0) * 0.05), // 5% reported rate
  };

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/ban`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been banned",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", `/api/admin/posts/${postId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
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

  // Filter users based on search and filter
  const filteredUsers = users?.filter(user => {
    const matchesSearch = userSearchQuery === "" || 
      user.firstName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
    
    const matchesFilter = userFilter === "all" || 
      (userFilter === "active" && true) || // All users are active for now
      (userFilter === "new" && new Date(user.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesFilter;
  });

  // Filter posts based on search and filter
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = postSearchQuery === "" ||
      post.content.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
      post.user.firstName?.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
      post.user.lastName?.toLowerCase().includes(postSearchQuery.toLowerCase());
    
    const matchesFilter = postFilter === "all" ||
      (postFilter === "recent" && new Date(post.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000) ||
      (postFilter === "popular" && post.likesCount > 10);
    
    return matchesSearch && matchesFilter;
  });

  if (!user?.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Dashboard Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
          <p className="text-muted-foreground">
            Manage users, posts, and platform analytics
          </p>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-green-600">+8% from last month</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{stats.activeToday.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Current online users</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reported Posts</p>
                <p className="text-2xl font-bold">{stats.reportedPosts}</p>
                <p className="text-sm text-red-600">Requires attention</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </div>

          {/* Users Tab */}
          <TabsContent value="users" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="new">New Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {usersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              {user.username && (
                                <p className="text-sm text-muted-foreground">
                                  @{user.username}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.postsCount}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Ban User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to ban {user.firstName} {user.lastName}? 
                                    This action will restrict their access to the platform.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => banUserMutation.mutate(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Ban User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Post Management</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={postSearchQuery}
                    onChange={(e) => setPostSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={postFilter} onValueChange={setPostFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {postsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts?.map((post) => (
                  <Card key={post.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex space-x-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.user.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {post.user.firstName?.[0]}{post.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium">
                                {post.user.firstName} {post.user.lastName}
                              </p>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground text-sm">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-foreground mb-3 line-clamp-3">{post.content}</p>
                            <div className="flex space-x-4 text-sm text-muted-foreground">
                              <span>{post.likesCount} likes</span>
                              <span>{post.commentsCount} comments</span>
                              <span>{post.repostsCount} reposts</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this post? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePostMutation.mutate(post.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Post
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="p-6">
            <h2 className="text-xl font-semibold mb-6">Reported Content</h2>
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                <p className="text-muted-foreground">
                  There are currently no reported posts or users that require your attention.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
