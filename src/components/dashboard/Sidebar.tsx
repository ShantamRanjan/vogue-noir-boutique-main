
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  BarChart3, 
  Package, 
  Users, 
  Settings,
  TrendingUp,
  DollarSign
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Products", icon: Package, href: "/products" },
  { name: "Orders", icon: ShoppingCart, href: "/orders" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Customers", icon: Users, href: "/customers" },
  { name: "Inventory", icon: ShoppingBag, href: "/inventory" },
  { name: "Revenue", icon: DollarSign, href: "/revenue" },
  { name: "Growth", icon: TrendingUp, href: "/growth" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Link to="/">
          <h1 className="text-xl font-bold text-foreground">SellerPro</h1>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
