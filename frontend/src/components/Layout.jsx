import React, { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
    ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, useTheme, useMediaQuery, Menu, MenuItem, Tooltip, Paper
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, Assignment, PlaylistAddCheck,
    Group, Person, Logout, PostAdd, FolderCopy
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    // Define Navigation based on role
    const getNavItems = () => {
        const items = [{ text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' }];

        if (user?.role === 'student') {
            items.push({ text: 'My Activities', icon: <FolderCopy />, path: '/my-activities' });
            items.push({ text: 'Add Activity', icon: <PostAdd />, path: '/add-activity' });
            items.push({ text: 'View All Projects', icon: <PlaylistAddCheck />, path: '/all-activities' });
        }

        if (user?.role === 'staff' || user?.role === 'admin') {
            items.push({ text: 'All Activities', icon: <FolderCopy />, path: '/all-activities' });
            items.push({ text: 'Students', icon: <Group />, path: '/students' });
        }

        if (user?.role === 'admin') {
            items.push({ text: 'Manage Users', icon: <Person />, path: '/manage-users' });
        }

        return items;
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color="white" fontWeight="bold">A</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">Portal</Typography>
            </Toolbar>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ px: 2, flex: 1 }}>
                {getNavItems().map((item) => {
                    const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: '10px',
                                    bgcolor: active ? 'primary.light' : 'transparent',
                                    color: active ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: active ? 'primary.light' : 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 600 : 500, fontSize: '0.9rem' }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Box sx={{ p: 2, mt: 'auto' }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 'bold' }}>{user?.name?.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>{user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }} noWrap>{user?.role}</Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: 'calc(100% - ' + drawerWidth + 'px)' },
                    ml: { md: drawerWidth + 'px' },
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                }}
            >
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}>
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    <Tooltip title="Profile Settings">
                        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 'bold' }}>
                                {user?.name?.charAt(0)}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{ sx: { mt: 1, minWidth: 150, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }}
                    >
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                            Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }} // Better open performance on mobile.
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.05)' },
                    }}
                >
                    {drawerContent}
                </Drawer>
                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'grey.200' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{
                flexGrow: 1, p: { xs: 2, sm: 4, md: 6 }, width: { md: 'calc(100% - ' + drawerWidth + 'px)' }, pt: { xs: 10, sm: 12, md: 12 }
            }}>
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
