import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Home, Search, User, Settings, Moon, Sun, Plus, MessageSquare, Bell, Bookmark } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { User as UserType } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const typedUser = user as UserType | undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { icon: Home, label: "Feed", path: "/" },
    { icon: Search, label: "Discover", path: "/explore" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Bookmark, label: "Saved", path: "/bookmarks" },
    { icon: User, label: "Profile", path: `/profile/${typedUser?.username || typedUser?.id}` },
  ];

  if (typedUser?.isAdmin) {
    navItems.push({ icon: Settings, label: "Admin", path: "/admin" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Modern Sidebar Navigation for Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-white/80 lg:dark:bg-gray-900/80 lg:backdrop-blur-xl lg:border-r lg:border-gray-200 lg:dark:border-gray-800">
        <div className="px-6 pt-6 pb-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ConnectSpace
            </span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location === item.path 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
        
        {/* User Profile Section in Sidebar */}
        {isAuthenticated && typedUser && (
          <div className="absolute bottom-4 left-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={typedUser.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {typedUser.firstName?.[0]}{typedUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{typedUser.firstName} {typedUser.lastName}</p>
                      {typedUser.username && (
                        <p className="text-xs text-muted-foreground">@{typedUser.username}</p>
                      )}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${typedUser.username || typedUser.id}`}>View Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark Mode
                    </>
                  )}
                </DropdownMenuItem>
                {typedUser.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="text-destructive">Logout</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* Mobile Top Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ConnectSpace
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 sm:w-64 pl-10 bg-gray-100 dark:bg-gray-800 border-0 rounded-full"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </form>
            
            {/* User Menu */}
            {isAuthenticated && typedUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={typedUser.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {typedUser.firstName?.[0]}{typedUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${typedUser.username || typedUser.id}`}>View Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenuItem>
                  {typedUser.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="text-destructive">Logout</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                location === item.path 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-24 lg:bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        onClick={() => setLocation("/")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}