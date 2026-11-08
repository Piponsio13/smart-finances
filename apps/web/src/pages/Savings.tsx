import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { savingsApi, type SavingsGoal } from '../api/savings';
import SavingsModal from '../components/SavingsModal';
import ContributionModal from '../components/ContributionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ApiError } from '../api/client';
import { concrete, moss, ochre } from '../theme/palette';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
}: {
  goal: SavingsGoal;
  onEdit: () => void;
  onDelete: () => void;
  onContribute: () => void;
}) {
  const progress = Math.min(goal.progressPercent, 100);
  const progressColor = goal.completed ? moss.main : progress > 75 ? ochre.main : concrete.void;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                {goal.name}
              </Typography>
              {goal.completed && (
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16, color: moss.main, flexShrink: 0 }} />
              )}
            </Box>
            <Box sx={{ minHeight: 20 }}>
              {goal.targetDate && (
                <Typography variant="caption" color="text.secondary">
                  Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {goal.daysRemaining !== undefined && !goal.completed && (
                    <> · {goal.daysRemaining} days left</>
                  )}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {goal.completed && (
              <Chip label="COMPLETE" size="small" sx={{ bgcolor: moss.light, color: moss.main, fontSize: 10, fontWeight: 700 }} />
            )}
            <Tooltip title="Add contribution">
              <IconButton size="small" onClick={onContribute} sx={{ color: moss.main }}>
                <AddCircleOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit goal">
              <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary' }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete goal">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary' }}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Saved: <strong style={{ color: concrete.void }}>{formatCurrency(goal.savedAmount)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Target: <strong style={{ color: concrete.void }}>{formatCurrency(goal.targetAmount)}</strong>
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mb: 1,
            '& .MuiLinearProgress-bar': { bgcolor: progressColor },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontWeight: 500, color: progressColor }}>
            {progress.toFixed(0)}% saved
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {goal.completed
              ? 'Goal reached!'
              : `${formatCurrency(goal.remaining)} to go`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Savings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [contributing, setContributing] = useState<SavingsGoal | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchGoals() {
    try {
      const data = await savingsApi.getAll();
      setGoals(data);
    } catch {
      setGoals([]);
    }
  }

  useEffect(() => {
    savingsApi.getAll()
      .then(setGoals)
      .catch(() => setGoals([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await savingsApi.delete(deletingId);
      setDeletingId(null);
      await fetchGoals();
    } catch (err) {
      setError((err as ApiError).message ?? 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  const completedCount = goals.filter((g) => g.completed).length;
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 24 }}>Savings Goals</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 12, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}>
            Track your savings progress
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          New Goal
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {!loading && goals.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ p: 2, border: `2px solid ${concrete.void}` }}>
            <Typography sx={{ fontSize: 10, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Saved
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: moss.main, fontFamily: '"Space Mono", monospace' }}>
              {formatCurrency(totalSaved)}
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: `2px solid ${concrete.void}` }}>
            <Typography sx={{ fontSize: 10, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}>
              Goals Completed
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: concrete.void, fontFamily: '"Space Mono", monospace' }}>
              {completedCount} / {goals.length}
            </Typography>
          </Box>
        </Box>
      )}

      {loading ? (
        <Grid container spacing={2.5}>
          {[...Array(3)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={180} />
            </Grid>
          ))}
        </Grid>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No savings goals yet. Create one to start tracking your progress.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {goals.map((goal) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={() => setEditing(goal)}
                onDelete={() => setDeletingId(goal.id)}
                onContribute={() => setContributing(goal)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <SavingsModal
        open={modalOpen || editing !== null}
        goal={editing}
        onCreate={async (data) => { await savingsApi.create(data); await fetchGoals(); }}
        onUpdate={async (data) => { if (editing) { await savingsApi.update(editing.id, data); await fetchGoals(); } }}
        onClose={() => { setModalOpen(false); setEditing(null); }}
      />

      <ContributionModal
        open={contributing !== null}
        goal={contributing}
        onAdd={async (data) => { if (contributing) { await savingsApi.addContribution(contributing.id, data); await fetchGoals(); } }}
        onClose={() => setContributing(null)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Savings Goal"
        message="This savings goal and all its contributions will be permanently deleted."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
