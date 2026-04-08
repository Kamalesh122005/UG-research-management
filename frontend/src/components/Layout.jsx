import React, { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
    ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, useTheme,
    useMediaQuery, Menu, MenuItem, Tooltip, Badge, Popover, Chip
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, Assignment, PlaylistAddCheck,
    Group, Person, Logout, PostAdd, FolderCopy, Notifications,
    Settings, KeyboardArrowRight
} from '@mui/icons-material';
import { LightMode, DarkMode } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeToggle } from '../context/ThemeContext';

const drawerWidth = 264;

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { toggleColorMode } = useThemeToggle();
    const isDark = theme.palette.mode === 'dark';

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchor, setNotifAnchor] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Notif fetch error:", err);
        }
    };

    useState(() => { if (user) fetchNotifications(); }, [user]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const roleColors = {
        student: { bg: isDark ? '#1E3A5F' : '#EFF6FF', color: isDark ? '#60A5FA' : '#2563EB' },
        staff: { bg: isDark ? '#022C22' : '#ECFDF5', color: isDark ? '#34D399' : '#059669' },
        admin: { bg: isDark ? '#2E1B5E' : '#F5F3FF', color: isDark ? '#A78BFA' : '#7C3AED' },
    };

    const getNavItems = () => {
        const items = [{ text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' }];

        if (user?.role === 'student') {
            items.push({ text: 'My Research', icon: <FolderCopy />, path: '/my-activities' });
            items.push({ text: 'Submit Activity', icon: <PostAdd />, path: '/submit' });
            items.push({ text: 'All Activities', icon: <PlaylistAddCheck />, path: '/all' });
        }

        if (user?.role === 'staff') {
            items.push({ text: 'Workflow Management', icon: <Assignment />, path: '/mentor-dashboard' });
            items.push({ text: 'All Research', icon: <PlaylistAddCheck />, path: '/all' });
            items.push({ divider: true });
            items.push({ text: 'Student Directory', icon: <Group />, path: '/students' });
        }

        if (user?.role === 'admin') {
            items.push({ text: 'All Research', icon: <PlaylistAddCheck />, path: '/all' });
            items.push({ text: 'User Management', icon: <Person />, path: '/manage-users' });
            items.push({ text: 'Student Directory', icon: <Group />, path: '/students' });
        }

        return items;
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            {/* Logo */}
            <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                }}>
                    <Typography variant="h6" color="white" fontWeight="800" sx={{ lineHeight: 1 }}>R</Typography>
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="800" color="text.primary" sx={{ lineHeight: 1.2 }}>ResearchHub</Typography>
                    <Typography variant="caption" color="text.secondary">Academic Portal</Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2 }} />

            {/* Navigation */}
            <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
                {getNavItems().map((item, idx) => {
                    if (item.divider) return (
                        <Box key={`div-${idx}`} sx={{ px: 1, my: 1 }}>
                            <Divider />
                        </Box>
                    );
                    const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                                sx={{
                                    borderRadius: '10px',
                                    py: 1.2,
                                    px: 1.5,
                                    bgcolor: active
                                        ? (isDark ? 'rgba(96,165,250,0.15)' : 'rgba(37,99,235,0.08)')
                                        : 'transparent',
                                    color: active ? 'primary.main' : 'text.secondary',
                                    fontWeight: active ? 700 : 500,
                                    borderLeft: active ? '4px solid' : '4px solid transparent',
                                    borderColor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: active
                                            ? (isDark ? 'rgba(96,165,250,0.2)' : 'rgba(37,99,235,0.12)')
                                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                                        color: active ? 'primary.main' : 'text.primary',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: 'inherit',
                                    minWidth: 38,
                                    transform: active ? 'scale(1.1)' : 'none',
                                    transition: 'transform 0.2s'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 800 : 500,
                                        fontSize: '0.875rem',
                                        letterSpacing: active ? '0.01em' : 'normal'
                                    }}
                                />
                                {active && (
                                    <Box sx={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        bgcolor: 'primary.main', flexShrink: 0,
                                        boxShadow: '0 0 10px rgba(37,99,235,0.5)'
                                    }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* User card at bottom */}
            <Box sx={{ p: 1.5 }}>
                <Box sx={{
                    p: 1.5, borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                }}
                    onClick={() => navigate('/profile')}
                >
                    <Avatar sx={{
                        width: 36, height: 36,
                        background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                        fontSize: '0.875rem', fontWeight: 800
                    }}>
                        {user?.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap color="text.primary">
                            {user?.name}
                        </Typography>
                        <Chip
                            label={user?.role}
                            size="small"
                            sx={{
                                height: 18, fontSize: '0.65rem', fontWeight: 700,
                                textTransform: 'capitalize',
                                bgcolor: roleColors[user?.role]?.bg || '#F8FAFC',
                                color: roleColors[user?.role]?.color || '#64748B',
                                border: 'none',
                            }}
                        />
                    </Box>
                    <KeyboardArrowRight sx={{ color: 'text.secondary', fontSize: 16, flexShrink: 0 }} />
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    color: 'text.primary',
                }}
            >
                <Toolbar sx={{ minHeight: '60px !important', gap: 1 }}>
                    <IconButton
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ display: { md: 'none' }, color: 'text.secondary' }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Theme toggle */}
                    <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
                        <IconButton
                            onClick={toggleColorMode}
                            sx={{
                                color: 'text.secondary',
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                                borderRadius: '10px', width: 38, height: 38,
                                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
                            }}
                        >
                            {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton
                            onClick={(e) => { setNotifAnchor(e.currentTarget); fetchNotifications(); }}
                            sx={{
                                color: 'text.secondary',
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                                borderRadius: '10px', width: 38, height: 38,
                                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
                            }}
                        >
                            <Badge badgeContent={unreadCount} color="error" variant="dot" invisible={unreadCount === 0}>
                                <Notifications fontSize="small" />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Popover
                        open={Boolean(notifAnchor)}
                        anchorEl={notifAnchor}
                        onClose={() => setNotifAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{
                            elevation: 2,
                            sx: { width: 340, maxHeight: 420, mt: 1.5, borderRadius: '14px', overflow: 'hidden' }
                        }}
                    >
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                            {unreadCount > 0 && (
                                <Typography
                                    variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 700 }}
                                    onClick={async () => { await axios.post('/api/notifications/read-all'); fetchNotifications(); }}
                                >
                                    Mark all read
                                </Typography>
                            )}
                        </Box>
                        <List sx={{ p: 0, overflowY: 'auto', maxHeight: 360 }}>
                            {notifications.length === 0 ? (
                                <Box sx={{ py: 6, textAlign: 'center' }}>
                                    <Notifications sx={{ color: 'text.secondary', fontSize: 36, opacity: 0.3, mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">All caught up!</Typography>
                                </Box>
                            ) : notifications.map(n => (
                                <ListItem
                                    key={n.id}
                                    sx={{
                                        py: 1.5, px: 2, cursor: 'pointer',
                                        borderBottom: '1px solid', borderColor: 'divider',
                                        bgcolor: n.is_read ? 'transparent' : (isDark ? 'rgba(96,165,250,0.06)' : 'rgba(37,99,235,0.04)'),
                                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
                                        '&:last-child': { borderBottom: 'none' },
                                    }}
                                    onClick={async () => {
                                        if (!n.is_read) { await axios.put(`/api/notifications/${n.id}/read`); fetchNotifications(); }
                                    }}
                                >
                                    <ListItemText
                                        primary={n.message}
                                        secondary={new Date(n.created_at).toLocaleString()}
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: n.is_read ? 400 : 600, fontSize: '0.82rem' }}
                                        secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.5 } }}
                                    />
                                    {!n.is_read && (
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', ml: 1, flexShrink: 0, mt: 0.5 }} />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Popover>

                    {/* Avatar */}
                    <Tooltip title="Account settings">
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                            <Avatar sx={{
                                width: 34, height: 34, fontSize: '0.875rem', fontWeight: 800,
                                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                            }}>
                                {user?.name?.charAt(0)}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 2,
                            sx: { mt: 1, minWidth: 180, borderRadius: '12px', py: 0.5 }
                        }}
                    >
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                            <Typography variant="body2" fontWeight={600}>Profile</Typography>
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={() => { setAnchorEl(null); logout(); }} sx={{ color: 'error.main' }}>
                            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                            <Typography variant="body2" fontWeight={600}>Sign out</Typography>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none' },
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    pt: { xs: '68px', md: '68px' },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
