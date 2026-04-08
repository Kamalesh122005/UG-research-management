import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, CircularProgress, Button,
    Divider, List, ListItem, ListItemText, ListItemIcon,
    ListItemSecondaryAction, Tooltip, IconButton, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    ArrowBack, InsertDriveFile, Delete, CloudUpload, CheckCircle, Cancel, HourglassEmpty
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
    Submitted: { icon: <HourglassEmpty fontSize="small" />, bg: '#e3f2fd', color: '#1565c0', label: 'SUBMITTED' },
    'In Progress': { icon: <HourglassEmpty fontSize="small" />, bg: '#fff3e0', color: '#e65100', label: 'IN PROGRESS' },
    Completed: { icon: <CheckCircle fontSize="small" />, bg: '#e8f5e9', color: '#2e7d32', label: 'COMPLETED' },
};

const InfoRow = ({ label, value }) => (
    <Box mb={2}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body1" mt={0.5}>{value || '—'}</Typography>
    </Box>
);

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleteDocId, setDeleteDocId] = useState(null);
    const [actionMsg, setActionMsg] = useState({ text: '', type: '' });

    const fetchProject = () => {
        axios.get(`/api/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/my-projects'));
    };
    const fetchDocs = () => {
        axios.get(`/api/projects/${id}/documents`).then(r => setDocuments(r.data)).catch(() => { });
    };

    useEffect(() => {
        Promise.all([
            axios.get(`/api/projects/${id}`),
            axios.get(`/api/projects/${id}/documents`)
        ]).then(([pr, dr]) => {
            setProject(pr.data);
            setDocuments(dr.data);
        }).catch(() => navigate(-1))
            .finally(() => setLoading(false));
    }, [id]);

    const handleUpload = async e => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            await axios.post(`/api/projects/${id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setActionMsg({ text: 'Document uploaded.', type: 'success' });
            fetchDocs();
        } catch (err) {
            setActionMsg({ text: err.response?.data?.error || 'Upload failed.', type: 'error' });
        } finally { setUploading(false); e.target.value = ''; }
    };

    const handleDeleteDoc = async () => {
        try {
            await axios.delete(`/api/projects/${id}/documents/${deleteDocId}`);
            setDeleteDocId(null);
            fetchDocs();
            setActionMsg({ text: 'Document deleted.', type: 'info' });
        } catch (err) {
            setActionMsg({ text: err.response?.data?.error || 'Delete failed.', type: 'error' });
            setDeleteDocId(null);
        }
    };

    const handleStatus = async status => {
        try {
            await axios.patch(`/api/projects/${id}/status`, { status });
            fetchProject();
            setActionMsg({ text: `Project ${status}.`, type: status === 'approved' ? 'success' : 'warning' });
        } catch (err) {
            setActionMsg({ text: err.response?.data?.error || 'Action failed.', type: 'error' });
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={16}><CircularProgress /></Box>;
    if (!project) return null;

    const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
    const canUpload = user?.role === 'admin' ||
        (user?.role === 'student' && project.status !== 'Submitted') ||
        (user?.role === 'staff'); // Mentors can always manage docs

    return (
        <Box maxWidth="900px" mx="auto">
            {/* Header */}
            <Box mb={4} display="flex" alignItems="flex-start" gap={2}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ borderRadius: 2, mt: 0.5 }}>Back</Button>
                <Box flex={1}>
                    <Typography variant="h4" fontWeight="800" gutterBottom>{project.title}</Typography>
                    <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
                        <Chip
                            icon={st.icon}
                            label={st.label}
                            size="small"
                            sx={{ fontWeight: 'bold', bgcolor: st.bg, color: st.color, borderRadius: 1.5, '& .MuiChip-icon': { color: st.color } }}
                        />
                        <Chip label={project.domain} size="small" sx={{ fontWeight: 600, bgcolor: '#e8f4fd', color: '#1565c0', borderRadius: 1 }} />
                    </Box>
                </Box>
                {/* Approve/Reject for mentor/admin */}
                {(user?.role === 'staff' || user?.role === 'admin') && project.status === 'pending' && (
                    <Box display="flex" gap={1}>
                        <Button variant="contained" color="success" disableElevation startIcon={<CheckCircle />} onClick={() => handleStatus('approved')} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                            Approve
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => handleStatus('rejected')} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                            Reject
                        </Button>
                    </Box>
                )}
            </Box>

            {actionMsg.text && <Alert severity={actionMsg.type} sx={{ mb: 3, borderRadius: 2 }}>{actionMsg.text}</Alert>}

            <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
                {/* Left: Details */}
                <Box flex={2}>
                    <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mb: 3, border: '1px solid', borderColor: 'grey.200' }}>
                        <Typography variant="h6" fontWeight="800" mb={2}>Project Details</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <InfoRow label="Description" value={project.description} />
                        <InfoRow label="Keywords" value={project.keywords} />
                        <InfoRow label="Submitted On" value={new Date(project.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />
                    </Paper>

                    {/* Documents */}
                    <Paper elevation={1} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="800">Documents</Typography>
                            {canUpload && (
                                <Button
                                    variant="outlined" component="label" size="small"
                                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
                                    disabled={uploading} sx={{ borderRadius: 2 }}
                                >
                                    Upload File
                                    <input type="file" hidden accept="image/*,.pdf,.doc,.docx" onChange={handleUpload} />
                                </Button>
                            )}
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {user?.role === 'student' && project.status === 'Submitted' && (
                            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                Documents are locked after submission. Contact your mentor for changes.
                            </Alert>
                        )}
                        {documents.length === 0 ? (
                            <Box py={4} textAlign="center">
                                <InsertDriveFile sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                                <Typography color="textSecondary" variant="body2">No documents uploaded yet.</Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {documents.map(doc => (
                                    <ListItem key={doc.id} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <InsertDriveFile color="primary" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={600}>{doc.file_path.split('/').pop()}</Typography>}
                                            secondary={<Typography variant="caption" color="text.secondary">By {doc.uploader_name} · {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}</Typography>}
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="View">
                                                <IconButton size="small" color="primary" href={`http://localhost:4000${doc.file_path}`} target="_blank">
                                                    <InsertDriveFile fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {/* Hide delete for students after submission */}
                                            {!(user?.role === 'student' && project.status === 'Submitted') && (
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => setDeleteDocId(doc.id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Box>

                {/* Right: Sidebar */}
                <Box flex={1} display="flex" flexDirection="column" gap={3}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                        <Typography variant="h6" fontWeight="800" mb={2}>Mentor</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1" fontWeight={600}>{project.mentor_display_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{project.mentor_display_email}</Typography>
                    </Paper>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                        <Typography variant="h6" fontWeight="800" mb={2}>Team Members</Typography>
                        <Divider sx={{ mb: 2 }} />
                        {project.team_names
                            ? project.team_names.split(', ').map((n, i) => (
                                <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="caption" color="primary.main" fontWeight={700}>{n.charAt(0)}</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>{n}</Typography>
                                </Box>
                            ))
                            : <Typography variant="body2" color="text.secondary">No members listed.</Typography>
                        }
                    </Paper>
                </Box>
            </Box>

            {/* Delete doc confirm dialog */}
            <Dialog open={Boolean(deleteDocId)} onClose={() => setDeleteDocId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Document?</DialogTitle>
                <DialogContent><Typography color="text.secondary">This will permanently remove the document.</Typography></DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setDeleteDocId(null)} color="inherit">Cancel</Button>
                    <Button onClick={handleDeleteDoc} color="error" variant="contained" disableElevation sx={{ borderRadius: 2 }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectDetail;
