import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Skeleton,
  Grid,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { dashboardApi, type DashboardData } from '../api/dashboard';
import { transactionsApi, type Transaction } from '../api/transactions';
import { concrete, moss, oxide } from '../theme/palette';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                mb: 1,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: concrete.aggregate,
                fontFamily: '"Space Mono", monospace',
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                color,
                fontSize: { xs: 20, sm: 22 },
                overflowWrap: 'anywhere',
                fontFamily: '"Space Mono", monospace',
                letterSpacing: -0.5,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: bgColor,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [recentFailed, setRecentFailed] = useState(false);
  const [request, setRequest] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      const [dashboardResult, txResult] = await Promise.allSettled([
        dashboardApi.get(),
        transactionsApi.getAll(),
      ]);
      if (cancelled) return;
      setData(dashboardResult.status === 'fulfilled' ? dashboardResult.value : null);
      setRecent(txResult.status === 'fulfilled'
        ? [...txResult.value].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id).slice(0, 5)
        : []);
      setRecentFailed(txResult.status === 'rejected');
      setLoading(false);
    }
    void fetchData();
    return () => { cancelled = true; };
  }, [request]);

  function retry() {
    setLoading(true);
    setRequest((previous) => previous + 1);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Grid container spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={96} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>Dashboard</Typography>
        <Alert severity="error" action={<Button onClick={retry}>Retry</Button>}>
          We couldn’t load your dashboard. Try again in a moment.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h1">Dashboard</Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: 12,
            fontFamily: '"Space Mono", monospace',
            color: concrete.aggregate,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {MONTH_NAMES[data.month - 1]} {data.year}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Income"
            value={formatCurrency(data.totalIncome)}
            icon={<TrendingUpOutlinedIcon fontSize="small" />}
            color={moss.main}
            bgColor={moss.light}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Expenses"
            value={formatCurrency(data.totalExpenses)}
            icon={<TrendingDownOutlinedIcon fontSize="small" />}
            color={oxide.main}
            bgColor={oxide.light}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Balance"
            value={formatCurrency(data.balance)}
            icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
            color={data.balance >= 0 ? moss.main : oxide.main}
            bgColor={data.balance >= 0 ? moss.light : oxide.light}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Transactions"
            value={String(data.transactionCount)}
            icon={<ReceiptLongOutlinedIcon fontSize="small" />}
            color={concrete.void}
            bgColor={concrete.stone}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Spending by Category
              </Typography>

              {data.spendingByCategory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No spending recorded this month.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.spendingByCategory.map((cat) => (
                    <Box key={cat.categoryName}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {cat.categoryName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {cat.percentage.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 72, textAlign: 'right' }}>
                            {formatCurrency(cat.total)}
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        aria-label={`${cat.categoryName} share of spending`}
                        value={Math.min(cat.percentage, 100)}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Typography variant="h6" component="h2">Recent transactions</Typography>
                <Button component={Link} to="/transactions" size="small">View all</Button>
              </Box>

              {recentFailed ? (
                <Alert severity="warning" action={<Button onClick={retry}>Retry</Button>}>
                  Couldn’t load transactions.
                </Alert>
              ) : recent.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transactions yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recent.map((tx) => (
                    <Box
                      key={tx.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { border: 'none' },
                      }}
                    >
                      <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {tx.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tx.categoryName} · {formatDate(tx.date)}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: '"Space Mono", monospace',
                          fontWeight: 700,
                          fontSize: 13,
                          color: tx.type === 'INCOME' ? moss.main : oxide.main,
                          flexShrink: 0,
                          ml: 2,
                        }}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
