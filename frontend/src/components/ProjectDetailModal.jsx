import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Chip, Grid, Paper, Divider, IconButton,
    Tooltip, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Close, Edit, Delete, School, Assignment, Group,
    Link, Download, OpenInNew, Info, Description as DescriptionIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TYPE_COLORS = {
    'Internally Funded Project': { bg: '#e3f2fd', color: '#1565c0' },
    'Conference': { bg: '#e8f5e9', color: '#2e7d32' },
    'Hackathon': { bg: '#fff3e0', color: '#e65100' },
    'Publication': { bg: '#f3e5f5', color: '#6a1b9a' },
    'Achievement': { bg: '#ffebee', color: '#c62828' },
};

const STATUS_COLORS = {
    Submitted: { bg: '#e3f2fd', color: '#1565c0' },
    Approved: { bg: '#e8f5e9', color: '#2e7d32' },
    Rejected: { bg: '#ffebee', color: '#c62828' },
};

const ProjectDetailModal = ({ open, onClose, project, onDelete }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!project) return null;

    const isOwner = user?.id === project.student_id;
    const canEdit = isOwner && project.status === 'Submitted';
    const canDelete = (isOwner && project.status === 'Submitted') ||
        user?.role === 'admin' ||
        (user?.role === 'staff' && user?.id === project.mentor_id);

    const sectionTitleSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'text.primary', fontWeight: 'bold' };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ mb: 1, pr: 4 }}>{project.title}</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                            label={project.activity_type}
                            size="small"
                            sx={{
                                bgcolor: TYPE_COLORS[project.activity_type]?.bg || '#f5f5f5',
                                color: TYPE_COLORS[project.activity_type]?.color || '#757575',
                                fontWeight: 'bold', borderRadius: 1.5
                            }}
                        />
                        <Chip
                            label={project.status}
                            size="small"
                            sx={{
                                bgcolor: STATUS_COLORS[project.status]?.bg || '#f5f5f5',
                                color: STATUS_COLORS[project.status]?.color || '#757575',
                                fontWeight: 'bold', borderRadius: 1.5, textTransform: 'uppercase', fontSize: '0.7rem'
                            }}
                        />
                        <Chip label={project.domain} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 'medium' }} />
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 4, py: 3 }}>
                <Grid container spacing={4}>
                    {/* LEFT COLUMN: Main Info */}
                    <Grid item xs={12} md={7}>
                        {/* Section 1: Description */}
                        <Box mb={4}>
                            <Typography variant="subtitle2" sx={sectionTitleSx}>
                                <DescriptionIcon fontSize="small" color="primary" />
                                RESEARCH HIGHLIGHTS & DESCRIPTION
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                    {project.description || project.problem_statement || "No detailed information provided for this activity."}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Section 2: Abstract (if Publication or Project) */}
                        {(project.abstract || (project.activity_type === 'Publication' && project.abstract)) && (
                            <Box mb={4}>
                                <Typography variant="subtitle2" sx={sectionTitleSx}>
                                    <Info fontSize="small" color="primary" />
                                    ABSTRACT
                                </Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', pl: 1, borderLeft: '3px solid', borderColor: 'primary.light' }}>
                                    {project.abstract}
                                </Typography>
                            </Box>
                        )}

                        {/* Section 3: Extra Meta Fields */}
                        <Grid container spacing={2}>
                            {project.venue && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">VENUE/HOST</Typography>
                                    <Typography variant="body2">{project.venue}</Typography>
                                </Grid>
                            )}
                            {project.journal_name && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">JOURNAL</Typography>
                                    <Typography variant="body2">{project.journal_name}</Typography>
                                </Grid>
                            )}
                            {project.publisher && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">PUBLISHER</Typography>
                                    <Typography variant="body2">{project.publisher}</Typography>
                                </Grid>
                            )}
                            {project.issued_by && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">ISSUED BY</Typography>
                                    <Typography variant="body2">{project.issued_by}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>

                    {/* RIGHT COLUMN: Details & Assets */}
                    <Grid item xs={12} md={5}>
                        {/* Section 4: Supervision */}
                        <Box mb={4}>
                            <Typography variant="subtitle2" sx={sectionTitleSx}>
                                <School fontSize="small" color="primary" />
                                SUPERVISION
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f0f4f8', border: '1px solid', borderColor: 'primary.light' }}>
                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                    {project.mentor_display_name} {project.mentor_type === 'external' ? '(External)' : ''}
                                </Typography>
                                {project.mentor_display_email && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {project.mentor_display_email}
                                    </Typography>
                                )}
                            </Paper>
                        </Box>

                        {/* Section 5: Team */}
                        <Box mb={4}>
                            <Typography variant="subtitle2" sx={sectionTitleSx}>
                                <Group fontSize="small" color="primary" />
                                RESEARCH TEAM
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {project.team_members ? (
                                    project.team_members.split(',').map((name, i) => (
                                        <Chip key={i} label={name.trim()} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                    ))
                                ) : (
                                    <Typography variant="caption" color="text.secondary">Solo Contributor</Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Section 6: Keywords */}
                        <Box mb={4}>
                            <Typography variant="subtitle2" sx={sectionTitleSx}>
                                <Assignment fontSize="small" color="primary" />
                                TAGS & KEYWORDS
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {project.keywords ? (
                                    project.keywords.split(',').map((kw, i) => (
                                        <Chip key={i} label={kw.trim()} size="small" sx={{ fontSize: '0.65rem', height: 22 }} />
                                    ))
                                ) : (
                                    <Typography variant="caption" color="text.secondary">No keywords provided</Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Section 7: Documents */}
                        <Box>
                            <Typography variant="subtitle2" sx={sectionTitleSx}>
                                <Link fontSize="small" color="primary" />
                                ATTACHMENTS
                            </Typography>
                            {project.certificate_path ? (
                                <Button
                                    fullWidth variant="contained" color="primary" disableElevation
                                    startIcon={<Download />} component="a" href={`http://localhost:5050${project.certificate_path}`} target="_blank"
                                    sx={{ borderRadius: 2, py: 1, fontWeight: 'bold' }}
                                >
                                    View Documentation
                                </Button>
                            ) : (
                                <Typography variant="caption" color="text.secondary">No files attached.</Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'grey.100', gap: 1.5 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }}>Close</Button>
                <Box sx={{ flexGrow: 1 }} />
                {canDelete && (
                    <Button
                        variant="outlined" color="error" startIcon={<Delete />}
                        onClick={() => { onDelete(project.id); onClose(); }}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 'bold', border: '1.5px solid' }}
                    >
                        Delete
                    </Button>
                )}
                {canEdit && (
                    <Button
                        variant="contained" color="primary" startIcon={<Edit />}
                        onClick={() => navigate(`/edit-activity/${project.id}`)}
                        disableElevation
                        sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                    >
                        Modify Entry
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ProjectDetailModal;
