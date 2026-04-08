import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Button, IconButton, Chip, Tooltip, Tabs, Tab, Avatar, useTheme
} from '@mui/material';
import { Delete, Edit, Security, Person, School, Groups, Badge } from '@mui/icons-material';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ManageUsers = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'staff' ? 1 : 0;

  const [tab, setTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [deleteUser, setDeleteUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/users/all-users')
      .then(res => setUsers(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { setTab(searchParams.get('tab') === 'staff' ? 1 : 0); }, [searchParams]);

  const handleTabChange = (_, v) => {
    setTab(v);
    setSearchParams(v === 1 ? { tab: 'staff' } : {});
  };

  const handleOpenEdit = (u) => { setEditUser(u); setEditRole(u.role); };
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/api/users/${editUser.id}/role`, { role: editRole });
      setEditUser(null);
      fetchUsers();
    } catch { }
    finally { setIsSaving(false); }
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/users/${deleteUser.id}`);
      setDeleteUser(null);
      fetchUsers();
    } catch { }
    finally { setIsDeleting(false); }
  };

  const students = users.filter(u => u.role === 'student');
  const staff = users.filter(u => u.role === 'staff' || u.role === 'admin');
  const displayed = tab === 0 ? students : staff;

  const ROLE_COLORS = {
    admin: { bg: isDark ? 'rgba(220,38,38,0.15)' : '#FEF2F2', color: isDark ? '#F87171' : '#DC2626' },
    staff: { bg: isDark ? 'rgba(5,150,105,0.15)' : '#ECFDF5', color: isDark ? '#34D399' : '#059669' },
    student: { bg: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF', color: isDark ? '#60A5FA' : '#2563EB' },
  };

  const avatarColor = (name = '') => {
    const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0891B2'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const UserTable = ({ rows }) => (
    loading ? (
      <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
    ) : rows.length === 0 ? (
      <Box display="flex" flexDirection="column" alignItems="center" py={10}>
        <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: isDark ? 'rgba(37,99,235,0.12)' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          {tab === 0 ? <School sx={{ fontSize: 30, color: 'primary.main' }} /> : <Badge sx={{ fontSize: 30, color: 'primary.main' }} />}
        </Box>
        <Typography variant="h6" fontWeight={700} color="text.primary">No {tab === 0 ? 'students' : 'staff'} found</Typography>
        <Typography variant="body2" color="text.secondary">Registered users will appear here.</Typography>
      </Box>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Org Details</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => {
              const rc = ROLE_COLORS[u.role] || { bg: 'transparent', color: 'text.secondary' };
              const initials = u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
              return (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 36, height: 36, fontSize: '0.78rem', fontWeight: 700, bgcolor: avatarColor(u.name), flexShrink: 0 }}>
                        {initials}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="text.primary">{u.name}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={u.role === 'admin' ? <Security sx={{ fontSize: '0.85rem !important' }} /> : u.role === 'student' ? <School sx={{ fontSize: '0.85rem !important' }} /> : <Person sx={{ fontSize: '0.85rem !important' }} />}
                      label={u.role}
                      size="small"
                      sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', borderRadius: '8px', border: 'none' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.primary">{u.department || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{u.register_number || '—'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Change Role">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(u)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton size="small" color="error" onClick={() => setDeleteUser(u)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  );

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>User Administration</Typography>
        <Typography variant="body1" color="text.secondary">Manage all system users, assign roles, and revoke platform access.</Typography>
      </Box>

      {/* Summary chips */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {[
          { label: 'Total Users', count: users.length, color: '#2563EB' },
          { label: 'Students', count: students.length, color: '#059669' },
          { label: 'Staff & Admin', count: staff.length, color: '#7C3AED' },
        ].map(item => (
          <Box key={item.label} sx={{ px: 2.5, py: 1.2, borderRadius: '12px', bgcolor: isDark ? `${item.color}18` : `${item.color}12`, border: `1px solid ${item.color}28`, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: item.color, lineHeight: 1 }}>{item.count}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Tabbed Table */}
      <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {/* Tabs header */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem', minHeight: 52 } }}>
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <School fontSize="small" />
                  Students
                  <Chip label={students.length} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: isDark ? 'rgba(37,99,235,0.2)' : '#EFF6FF', color: isDark ? '#60A5FA' : '#2563EB' }} />
                </Box>
              }
            />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Groups fontSize="small" />
                  Staff & Admin
                  <Chip label={staff.length} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: isDark ? 'rgba(124,58,237,0.2)' : '#F5F3FF', color: isDark ? '#A78BFA' : '#7C3AED' }} />
                </Box>
              }
            />
          </Tabs>
        </Box>

        <UserTable rows={displayed} />
      </Paper>

      {/* Edit Role Dialog */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Change User Role</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" mb={3}>Update system role for <b>{editUser?.name}</b>.</Typography>
          <TextField select fullWidth label="Role" value={editRole} onChange={(e) => setEditRole(e.target.value)} size="small">
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="admin">Administrator</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setEditUser(null)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disableElevation disabled={isSaving || editRole === editUser?.role} sx={{ borderRadius: '10px', fontWeight: 700 }}>
            {isSaving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteUser)} onClose={() => setDeleteUser(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to permanently delete <b>{deleteUser?.name}</b>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setDeleteUser(null)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disableElevation disabled={isDeleting} sx={{ borderRadius: '10px', fontWeight: 700 }}>
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
