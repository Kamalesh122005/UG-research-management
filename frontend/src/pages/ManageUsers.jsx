import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Button, IconButton, Chip, Tooltip
} from '@mui/material';
import { Delete, Edit, Security, Person, School } from '@mui/icons-material';
import axios from 'axios';

const ROLE_COLORS = {
  admin: { bg: '#ffebee', color: '#c62828' },
  staff: { bg: '#e8f5e9', color: '#2e7d32' },
  student: { bg: '#e3f2fd', color: '#1565c0' }
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  // Delete State
  const [deleteUser, setDeleteUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenEdit = (u) => {
    setEditUser(u);
    setEditRole(u.role);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/api/users/${editUser.id}/role`, { role: editRole });
      setEditUser(null);
      fetchUsers();
    } catch {
      // error
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/users/${deleteUser.id}`);
      setDeleteUser(null);
      fetchUsers();
    } catch {
      // error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" gutterBottom>User Administration</Typography>
        <Typography variant="body1" color="textSecondary">Manage all system users, assign roles, and revoke platform access.</Typography>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
        <Box p={2.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">Active System Accounts</Typography>
          <Chip label={`${users.length} Users`} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>ACCOUNT NAME</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>EMAIL ADDRESS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>ROLE / PRIVILEGES</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>ORG DETAILS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => {
                  const rColor = ROLE_COLORS[u.role] || { bg: '#eee', color: '#555' };
                  return (
                    <TableRow key={u.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                      <TableCell>
                        <Typography fontWeight="bold" variant="body2" display="flex" alignItems="center" gap={1}>
                          <Person fontSize="small" color="disabled" /> {u.name}
                        </Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="textSecondary">{u.email}</Typography></TableCell>
                      <TableCell>
                        <Chip
                          icon={u.role === 'admin' ? <Security /> : u.role === 'student' ? <School /> : <Person />}
                          label={u.role} size="small"
                          sx={{ bgcolor: rColor.bg, color: rColor.color, fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{u.department || '—'}</Typography>
                        <Typography variant="caption" color="textSecondary">{u.register_number || '—'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Modify Role">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEdit(u)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Revoke Access (Delete)">
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
        )}
      </Paper>

      {/* Edit Role Dialog */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Modify Access Rights</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" mb={3}>Select a new access tier for {editUser?.name}.</Typography>
          <TextField select fullWidth label="System Role" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="admin">Administrator</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setEditUser(null)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disableElevation disabled={isSaving || editRole === editUser?.role} sx={{ borderRadius: 2 }}>
            {isSaving ? <CircularProgress size={20} color="inherit" /> : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteUser)} onClose={() => setDeleteUser(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Revoke Access</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Are you sure you want to permanently delete user <b>{deleteUser?.name}</b>? This action cannot be undone and will strip all activity associations.</Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setDeleteUser(null)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disableElevation disabled={isDeleting} sx={{ borderRadius: 2 }}>
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
