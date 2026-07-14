import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: `3px solid ${concrete.void}`,
            bgcolor: concrete.charcoal,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
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

        <List sx={{ px: 0, py: 2, flex: 1 }}>
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <ListItemButton
                key={path}
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: 0,
                  mb: 0,
                  px: 2.5,
                  py: 1.5,
                  color: isActive ? concrete.void : '#9A9587',
                  bgcolor: isActive ? concrete.stone : 'transparent',
                  borderLeft: isActive ? `4px solid ${concrete.stone}` : '4px solid transparent',
                  borderBottom: `1px solid ${concrete.void}`,
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
                  primary={label.toUpperCase()}
                  primaryTypographyProps={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    fontFamily: '"Space Mono", "Courier New", monospace',
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
              color: '#9A9587',
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
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 4, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}
