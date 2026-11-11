import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../context/authState';
import { concrete, oxide } from '../theme/palette';

const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" />, path: '/' },
  { label: 'Transactions', icon: <ReceiptLongOutlinedIcon fontSize="small" />, path: '/transactions' },
  { label: 'Categories', icon: <CategoryOutlinedIcon fontSize="small" />, path: '/categories' },
  { label: 'Budgets', icon: <AccountBalanceOutlinedIcon fontSize="small" />, path: '/budgets' },
  { label: 'Analytics', icon: <BarChartOutlinedIcon fontSize="small" />, path: '/analytics' },
  { label: 'Recurring', icon: <AutorenewOutlinedIcon fontSize="small" />, path: '/recurring' },
  { label: 'Savings', icon: <SavingsOutlinedIcon fontSize="small" />, path: '/savings' },
  { label: 'Bills', icon: <NotificationsNoneOutlinedIcon fontSize="small" />, path: '/bills' },
] as const;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = (
    <>
      <Box sx={{ px: 2.5, py: 3, borderBottom: `2px solid ${concrete.void}` }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: concrete.stone,
            letterSpacing: 2,
            fontSize: 13,
            lineHeight: 1.3,
          }}
        >
          SMART
          <br />
          FINANCES
        </Typography>
      </Box>

      <List component="nav" aria-label="Main navigation" sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map(({ label, icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              component={Link}
              to={path}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1.25,
                color: isActive ? concrete.void : '#C7C2B4',
                bgcolor: isActive ? concrete.stone : 'transparent',
                '&.Mui-focusVisible': { outline: '2px solid white', outlineOffset: -2 },
                '&:hover': {
                  bgcolor: isActive ? concrete.stone : '#3A3936',
                  color: isActive ? concrete.void : '#FFFFFF',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                  minWidth: 32,
                },
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ borderTop: `2px solid ${concrete.void}` }}>
        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: 0,
            px: 2.5,
            py: 1.5,
            color: '#C7C2B4',
            '&:hover': { color: '#F0EDE5', bgcolor: oxide.main },
            '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 32 },
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="LOGOUT"
            primaryTypographyProps={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              fontFamily: '"Space Mono", "Courier New", monospace',
            }}
          />
        </ListItemButton>
      </Box>
    </>
  );

  const drawerPaper = {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    bgcolor: concrete.charcoal,
    display: 'flex',
    flexDirection: 'column',
  } as const;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer variant="permanent" sx={{
        display: { xs: 'none', md: 'block' },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': drawerPaper,
      }}>
        {navigation}
      </Drawer>
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} sx={{
        display: { md: 'none' },
        '& .MuiDrawer-paper': drawerPaper,
      }}>
        {navigation}
      </Drawer>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box component="header" sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          gap: 1,
          p: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <IconButton aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography fontWeight={700}>Smart Finances</Typography>
        </Box>
        <Box component="main" sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1440, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
