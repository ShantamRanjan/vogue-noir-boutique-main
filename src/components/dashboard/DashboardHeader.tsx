
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, orders..."
            className="pl-10 w-64"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
