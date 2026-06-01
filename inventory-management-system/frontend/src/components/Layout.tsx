import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Users, ShoppingCart, Settings, LogOut, Package2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealthCheck } from "@workspace/api-client-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-full text-sidebar-foreground">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Package2 className="w-6 h-6 text-sidebar-primary mr-3" />
          <span className="font-bold text-lg tracking-tight">OpsControl</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md cursor-not-allowed">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center mr-3 text-sidebar-foreground relative">
              AD
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-sidebar rounded-full",
                health?.status === "ok" ? "bg-emerald-500" : "bg-destructive"
              )} />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">admin@opscontrol.local</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        <header className="h-16 flex-shrink-0 border-b bg-card flex items-center px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-foreground capitalize tracking-tight">
            {location === "/" ? "Dashboard" : location.substring(1)}
          </h1>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}