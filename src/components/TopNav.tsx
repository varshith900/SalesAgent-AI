import { LayoutDashboard, Users, Activity, LogOut, Bot, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Activity Log", url: "/activity", icon: Activity },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="container flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div 
          className="flex items-center gap-2 mr-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-gradient text-lg tracking-tight hidden sm:inline-block">
            SalesAgent AI
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {items.map((item) => {
            const isActive = item.url === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.url);
            
            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/"}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/[0.06] flex items-center gap-2 ${
                  isActive
                    ? "text-primary bg-primary/[0.08]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                activeClassName="text-primary bg-primary/[0.08]"
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className="flex md:hidden flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {items.map((item) => (
                <DropdownMenuItem key={item.title} onClick={() => navigate(item.url)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/[0.06] hidden sm:flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-muted-foreground hover:text-destructive sm:hidden"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
