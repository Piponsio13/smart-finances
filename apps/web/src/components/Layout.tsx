import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useAuth } from '../context/authState';
import Brand from './Brand';
import './Layout.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: DashboardOutlinedIcon, path: '/', group: 'Overview' },
  { label: 'Analytics', icon: BarChartOutlinedIcon, path: '/analytics' },
  { label: 'Transactions', icon: ReceiptLongOutlinedIcon, path: '/transactions', group: 'Your money' },
  { label: 'Categories', icon: CategoryOutlinedIcon, path: '/categories' },
  { label: 'Recurring', icon: AutorenewOutlinedIcon, path: '/recurring' },
  { label: 'Budgets', icon: AccountBalanceOutlinedIcon, path: '/budgets', group: 'Plan ahead' },
  { label: 'Savings', icon: SavingsOutlinedIcon, path: '/savings' },
  { label: 'Bills', icon: NotificationsNoneOutlinedIcon, path: '/bills' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const current = NAV_ITEMS.find(item => item.path === location.pathname)?.label ?? 'Dashboard';
  const navigation = <>
    <div className="workspace-brand"><Brand light /><IconButton aria-label="Close navigation" onClick={() => setMenuOpen(false)} sx={{ display: { md: 'none' }, color: '#C5D1C7' }}><CloseRoundedIcon /></IconButton></div>
    <div className="workspace-label"><span className="workspace-dot" />Personal workspace</div>
    <nav className="workspace-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ label, icon: Icon, path, group }) => <div key={path}>
        {group && <p className="workspace-nav-group">{group}</p>}
        <Link to={path} className={`workspace-nav-link${location.pathname === path ? ' is-active' : ''}`} aria-current={location.pathname === path ? 'page' : undefined} onClick={() => setMenuOpen(false)}><Icon fontSize="small" /><span>{label}</span></Link>
      </div>)}
    </nav>
    <div className="workspace-sidebar-footer"><p>A little more intentional.<br /><span>Make room for what matters.</span></p><button type="button" onClick={logout}><LogoutOutlinedIcon fontSize="small" />Sign out</button></div>
  </>;
  return <Box className="workspace-shell" sx={{ display: 'flex', minHeight: '100svh', bgcolor: 'background.default' }}>
    <Box component="aside" className="workspace-sidebar" sx={{ display: { xs: 'none', md: 'flex' } }}>{navigation}</Box>
    <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: 260, backgroundColor: 'var(--sf-forest)', color: '#F6F4E9' } }}><div className="workspace-sidebar-mobile">{navigation}</div></Drawer>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <header className="workspace-topbar">
        <div><IconButton aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} sx={{ display: { md: 'none' } }}><MenuIcon /></IconButton><span className="workspace-breadcrumb">Your workspace <span>/</span></span><Typography component="span" fontSize={12} fontWeight={600}>{current}</Typography></div>
        <span className="workspace-date"><CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date())}</span>
      </header>
      <Box component="main" className="app-main" sx={{ p: { xs: 2.5, sm: 4, lg: 5 }, maxWidth: 1440, mx: 'auto' }}>{children}</Box>
    </Box>
  </Box>;
}
