import { LayoutDashboard, Users, Activity, LogOut, Bot, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SupportDialog } from "@/components/SupportDialog";
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
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 glass-subtle">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div 
          className="group mr-8 flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
          onClick={() => navigate("/")}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3">
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
                className={`relative flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all duration-200 hover:bg-primary/[0.06] ${
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
              <DropdownMenuItem asChild>
                <SupportDialog mobile />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block"><SupportDialog /></div>
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
