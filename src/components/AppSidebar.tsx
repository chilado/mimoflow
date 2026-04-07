import {
  LayoutDashboard, Calculator, ClipboardList, Package, Users,
  DollarSign, Settings, LogOut, ShoppingBag, CalendarDays, Crown,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Precificação', url: '/pricing', icon: Calculator },
  { title: 'Pedidos', url: '/orders', icon: ClipboardList },
  { title: 'Produtos', url: '/products', icon: ShoppingBag },
  { title: 'Estoque', url: '/inventory', icon: Package },
  { title: 'Clientes', url: '/clients', icon: Users },
  { title: 'Agenda', url: '/agenda', icon: CalendarDays },
  { title: 'Financeiro', url: '/finance', icon: DollarSign },
  { title: 'Meu Plano', url: '/plan', icon: Crown },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleNavClick = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold text-sidebar-foreground">MimoFlow</span>
              <span className="text-[11px] text-muted-foreground">Sua gestão no fluxo certo</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end className="hover:bg-sidebar-accent/60" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium" onClick={handleNavClick}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && user && (
          <p className="text-[11px] text-muted-foreground truncate mb-2 px-1">{user.email}</p>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> {!collapsed && 'Sair'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
