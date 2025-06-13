import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { User, Camera, Save, Mail, MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import { User as UserType } from "@shared/schema";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const typedUser = user as UserType | undefined;

  const [formData, setFormData] = useState({
    firstName: typedUser?.firstName || "",
    lastName: typedUser?.lastName || "",
    username: typedUser?.username || "",
    email: typedUser?.email || "",
    bio: typedUser?.bio || "",
    location: typedUser?.location || "",
    website: typedUser?.website || "",
    profileImageUrl: typedUser?.profileImageUrl || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      await apiRequest(`/api/users/${typedUser?.id}`, {
        method: "PATCH",
        body: JSON.stringify(profileData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!typedUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to access settings.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile information and preferences
          </p>
        </div>

        {/* Profile Picture Section */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Profile Picture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24 ring-4 ring-white/50 dark:ring-gray-800/50">
                <AvatarImage src={formData.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                <Input
                  id="profileImageUrl"
                  placeholder="https://example.com/your-image.jpg"
                  value={formData.profileImageUrl}
                  onChange={(e) => handleInputChange("profileImageUrl", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-0"
                />
                <p className="text-xs text-muted-foreground">
                  Paste a URL to your profile image
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">@</span>
                  <Input
                    id="username"
                    className="pl-8 bg-gray-50 dark:bg-gray-800 border-0"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="your-username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-0"
                />
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell people about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="min-h-[100px] bg-gray-50 dark:bg-gray-800 border-0"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.bio.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4" />
                    <span>Website</span>
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({
                    firstName: typedUser?.firstName || "",
                    lastName: typedUser?.lastName || "",
                    username: typedUser?.username || "",
                    email: typedUser?.email || "",
                    bio: typedUser?.bio || "",
                    location: typedUser?.location || "",
                    website: typedUser?.website || "",
                    profileImageUrl: typedUser?.profileImageUrl || "",
                  })}
                >
                  Reset Changes
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}