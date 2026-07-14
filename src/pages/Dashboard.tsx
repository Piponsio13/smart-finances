import { useEffect, useState } from 'react';
import {
  Box,
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
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
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
                fontSize: 22,
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
              border: `2px solid ${concrete.void}`,
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

  useEffect(() => {
    async function fetchData() {
      const [dashboardResult, txResult] = await Promise.allSettled([
        dashboardApi.get(),
        transactionsApi.getAll(),
      ]);
      // Settled independently — one failing shouldn't wipe out the other.
      setData(dashboardResult.status === 'fulfilled' ? dashboardResult.value : null);
      setRecent(txResult.status === 'fulfilled' ? txResult.value.slice(0, 5) : []);
      setLoading(false);
    }
    fetchData();
  }, []);

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
      <Card>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No data to display yet. Add a transaction to see your dashboard.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: 24 }}>Dashboard</Typography>
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
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Transactions
              </Typography>

              {recent.length === 0 ? (
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
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
