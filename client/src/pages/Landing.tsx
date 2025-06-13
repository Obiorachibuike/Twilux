import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, Users, MessageCircle, Heart, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Twitter className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to SocialConnect
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with friends, share your thoughts, and discover what's happening around the world. 
            Join millions of people sharing their stories on our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-4 text-lg" asChild>
              <a href="/api/login">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Follow friends and discover new people with similar interests
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Share</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Post your thoughts, images, and experiences with the world
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Engage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Like, comment, and interact with posts that matter to you
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Discover</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explore trending topics and discover what's happening globally
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to join the conversation?</CardTitle>
              <CardDescription className="text-lg">
                Sign in with your account to start connecting with people worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="px-8 py-4 text-lg" asChild>
                <a href="/api/login">Sign In Now</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
