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
import { memo, useCallback } from 'react';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, ariaLabel: 'Ir para Dashboard' },
  { title: 'Precificação', url: '/pricing', icon: Calculator, ariaLabel: 'Ir para Precificação' },
  { title: 'Pedidos', url: '/orders', icon: ClipboardList, ariaLabel: 'Ir para Pedidos' },
  { title: 'Produtos', url: '/products', icon: ShoppingBag, ariaLabel: 'Ir para Produtos' },
  { title: 'Estoque', url: '/inventory', icon: Package, ariaLabel: 'Ir para Estoque' },
  { title: 'Clientes', url: '/clients', icon: Users, ariaLabel: 'Ir para Clientes' },
  { title: 'Agenda', url: '/agenda', icon: CalendarDays, ariaLabel: 'Ir para Agenda' },
  { title: 'Financeiro', url: '/finance', icon: DollarSign, ariaLabel: 'Ir para Financeiro' },
  { title: 'Meu Plano', url: '/plan', icon: Crown, ariaLabel: 'Ir para Meu Plano' },
  { title: 'Configurações', url: '/settings', icon: Settings, ariaLabel: 'Ir para Configurações' },
] as const;

export const AppSidebar = memo(() => {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleNavClick = useCallback(() => setOpenMobile(false), [setOpenMobile]);

  return (
    <Sidebar collapsible="icon" role="navigation" aria-label="Menu principal">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary" aria-hidden="true">
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
                      <NavLink 
                        to={item.url} 
                        end 
                        className="hover:bg-sidebar-accent/60" 
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium" 
                        onClick={handleNavClick}
                        aria-label={item.ariaLabel}
                        aria-current={active ? 'page' : undefined}
                      >
                        <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
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
        {!collapsed && user?.email && (
          <p className="text-[11px] text-muted-foreground truncate mb-2 px-1" aria-label={`Usuário: ${user.email}`}>
            {user.email}
          </p>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-xs" 
          onClick={signOut}
          aria-label="Sair da conta"
        >
          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" /> 
          {!collapsed && 'Sair'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
});
AppSidebar.displayName = 'AppSidebar';
