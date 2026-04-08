import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ThemeContext = createContext({ toggleColorMode: () => { } });
export const useThemeToggle = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(() => ({
        toggleColorMode: () => setMode((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            // Apply to html element for CSS variable system
            document.documentElement.classList.toggle('dark', next === 'dark');
            return next;
        }),
    }), []);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light' ? {
                primary: { main: '#3B82F6', light: '#EFF6FF', dark: '#2563EB', contrastText: '#fff' },
                secondary: { main: '#8B5CF6', light: '#F5F3FF', dark: '#7C3AED' },
                success: { main: '#10B981', light: '#ECFDF5', dark: '#059669' },
                warning: { main: '#F59E0B', light: '#FFFBEB', dark: '#D97706' },
                error: { main: '#EF4444', light: '#FEF2F2', dark: '#DC2626' },
                background: { default: '#F8FAFC', paper: '#FFFFFF' },
                text: { primary: '#1E293B', secondary: '#64748B' },
                divider: '#F1F5F9',
            } : {
                primary: { main: '#60A5FA', light: '#1E3A8A', dark: '#93C5FD', contrastText: '#0F172A' },
                secondary: { main: '#A78BFA', light: '#4C1D95', dark: '#C4B5FD' },
                success: { main: '#34D399', light: '#064E3B', dark: '#A7F3D0' },
                warning: { main: '#FBBF24', light: '#78350F', dark: '#FDE68A' },
                error: { main: '#F87171', light: '#7F1D1D', dark: '#FECACA' },
                background: { default: '#020617', paper: '#0F172A' },
                text: { primary: '#F8FAFC', secondary: '#94A3B8' },
                divider: '#1E293B',
            }),
        },
        typography: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            h1: { fontWeight: 800, letterSpacing: '-0.025em' },
            h2: { fontWeight: 700, letterSpacing: '-0.02em' },
            h3: { fontWeight: 700, letterSpacing: '-0.015em' },
            h4: { fontWeight: 700, letterSpacing: '-0.01em' },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600 },
            subtitle1: { fontWeight: 600 },
            subtitle2: { fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' },
            body1: { lineHeight: 1.7 },
            body2: { lineHeight: 1.6 },
            button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
            caption: { fontSize: '0.75rem', fontWeight: 500 },
        },
        shape: { borderRadius: 12 },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        boxShadow: 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
                        '&:active': { transform: 'translateY(0)' },
                    },
                    contained: {
                        background: mode === 'light'
                            ? 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'
                            : 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                        '&:hover': {
                            boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
                            background: mode === 'light'
                                ? 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)'
                                : 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none' },
                    elevation0: {
                        boxShadow: 'none',
                        border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
                    },
                    elevation1: {
                        boxShadow: mode === 'light'
                            ? '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                            : '0 1px 6px rgba(0,0,0,0.4)',
                        border: 'none',
                    },
                    elevation2: {
                        boxShadow: mode === 'light'
                            ? '0 4px 12px rgba(0,0,0,0.06)'
                            : '0 4px 16px rgba(0,0,0,0.5)',
                        border: 'none',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 10,
                            backgroundColor: mode === 'light' ? '#F8FAFC' : 'rgba(15,23,42,0.6)',
                            transition: 'all 0.2s',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: mode === 'light' ? '#E2E8F0' : '#334155',
                                transition: 'border-color 0.2s',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: mode === 'light' ? '#2563EB' : '#60A5FA',
                            },
                            '&.Mui-focused': {
                                backgroundColor: mode === 'light' ? '#fff' : '#1E293B',
                            },
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: { fontWeight: 600, borderRadius: 8, fontSize: '0.72rem' },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderColor: mode === 'light' ? '#F1F5F9' : '#334155',
                        padding: '14px 16px',
                    },
                    head: {
                        backgroundColor: mode === 'light' ? '#F8FAFC' : '#0F172A',
                        color: mode === 'light' ? '#64748B' : '#94A3B8',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '12px 16px',
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        transition: 'background-color 0.15s',
                        '&:hover': {
                            backgroundColor: mode === 'light' ? '#F8FAFC !important' : 'rgba(255,255,255,0.03) !important',
                        },
                        '&:last-child td': { border: 0 },
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(30,41,59,0.9)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        boxShadow: 'none',
                        borderBottom: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
                    },
                },
            },
            MuiAlert: {
                styleOverrides: { root: { borderRadius: 10, fontWeight: 500 } },
            },
            MuiDialog: {
                styleOverrides: { paper: { borderRadius: 16, backgroundImage: 'none' } },
            },
            MuiTab: {
                styleOverrides: { root: { fontWeight: 600, textTransform: 'none', minHeight: 48 } },
            },
            MuiTabs: {
                styleOverrides: {
                    indicator: {
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                        backgroundColor: mode === 'light' ? '#2563EB' : '#60A5FA',
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: { borderRadius: 10, transition: 'all 0.15s' },
                },
            },
            MuiDivider: {
                styleOverrides: {
                    root: { borderColor: mode === 'light' ? '#E2E8F0' : '#334155' },
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: { fontWeight: 700 },
                },
            },
        },
    }), [mode]);

    return (
        <ThemeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
