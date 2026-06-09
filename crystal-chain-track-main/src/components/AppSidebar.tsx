import {
  LayoutDashboard,
  Package,
  Factory,
  Truck,
  Store,
  ScanLine,
  Settings,
  Shield,
  LogOut,
  PackageCheck,
  MapPin,
  Plus,
  ShoppingBag,
  Edit,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "All Products", url: "/dashboard/products", icon: Package },
  { title: "Track", url: "/dashboard/track", icon: ScanLine },
];

const manufacturerItems = [
  { title: "My Dashboard", url: "/dashboard/manufacturer", icon: Factory },
  { title: "Create Batch", url: "/dashboard/create-product", icon: Plus },
  { title: "My Products", url: "/dashboard/my-products", icon: Package },
];

const distributorItems = [
  { title: "My Dashboard", url: "/dashboard/distributor", icon: Truck },
  { title: "Received Products", url: "/dashboard/received-products", icon: PackageCheck },
  { title: "Transport Updates", url: "/dashboard/transport-updates", icon: MapPin },
];

const retailerItems = [
  { title: "My Dashboard", url: "/dashboard/retailer", icon: Store },
  { title: "Buy Products", url: "/dashboard/buy-products", icon: ShoppingBag },
  { title: "Received Products", url: "/dashboard/retailer-received", icon: PackageCheck },
  { title: "Retail Details", url: "/dashboard/retail-details", icon: Edit },
];

const adminItems = [
  { title: "All Products", url: "/dashboard/products", icon: Package },
  { title: "Manufacturers", url: "/dashboard/manufacturers", icon: Factory },
  { title: "Distributors", url: "/dashboard/distributors", icon: Truck },
  { title: "Retailers", url: "/dashboard/retailers", icon: Store },
];

const chainItems = [
  { title: "Manufacturers", url: "/dashboard/manufacturers", icon: Factory },
  { title: "Distributors", url: "/dashboard/distributors", icon: Truck },
  { title: "Retailers", url: "/dashboard/retailers", icon: Store },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-hero-gradient flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              Crypsia
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* User info */}
        {!collapsed && profile && (
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.name || profile.email}</p>
            {role && (
              <Badge variant="secondary" className="mt-1 text-xs capitalize">
                {role}
              </Badge>
            )}
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "manufacturer" && (
          <SidebarGroup>
            <SidebarGroupLabel>Manufacturer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {manufacturerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === "distributor" && (
          <SidebarGroup>
            <SidebarGroupLabel>Distributor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {distributorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === "retailer" && (
          <SidebarGroup>
            <SidebarGroupLabel>Retailer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {retailerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role !== "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Supply Chain</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
              <NavLink to="/dashboard/settings" end>
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
