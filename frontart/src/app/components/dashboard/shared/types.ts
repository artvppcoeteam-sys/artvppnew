import { LucideIcon } from 'lucide-react';

export interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path?: string;
}

export interface MenuSection {
    title?: string;
    items: MenuItem[];
}

export interface DashboardSidebarProps {
    menuItems: MenuSection[];
    activeSection: string;
    onNavigate: (id: string, path?: string) => void;
    className?: string;
}
