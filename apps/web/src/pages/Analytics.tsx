import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import { analyticsApi, type MonthTrend, type CategoryTrend, type ForecastData } from '../api/analytics';
import { concrete, moss, oxide, ochre } from '../theme/palette';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatPct(value: number | null): string {
  if (value === null) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function pctColor(value: number | null, higherIsBetter: boolean): string {
  if (value === null) return concrete.aggregate;
  if (value === 0) return concrete.aggregate;
  const positive = value > 0;
  return positive === higherIsBetter ? moss.main : oxide.main;
}

function BarChart({ trends }: { trends: MonthTrend[] }) {
  const max = Math.max(...trends.flatMap((t) => [t.totalIncome, t.totalExpenses]), 1);
  const chartHeight = 180;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: moss.main, border: `2px solid ${concrete.void}` }} />
          <Typography variant="caption" sx={{ fontFamily: '"Space Mono", monospace', fontSize: 10 }}>INCOME</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: oxide.main, border: `2px solid ${concrete.void}` }} />
          <Typography variant="caption" sx={{ fontFamily: '"Space Mono", monospace', fontSize: 10 }}>EXPENSES</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0.5,
          height: chartHeight,
          borderBottom: `2px solid ${concrete.void}`,
          borderLeft: `2px solid ${concrete.void}`,
          px: 1,
          pb: 0,
          overflow: 'hidden',
        }}
      >
        {trends.map((t) => {
          const incomeH = Math.round((t.totalIncome / max) * chartHeight);
          const expenseH = Math.round((t.totalExpenses / max) * chartHeight);
          return (
            <Box
              key={`${t.year}-${t.month}`}
              sx={{ flex: 1, display: 'flex', gap: '2px', alignItems: 'flex-end', minWidth: 0 }}
            >
              <Box
                title={`Income: ${formatCurrency(t.totalIncome)}`}
                sx={{ flex: 1, height: incomeH, bgcolor: moss.main, minWidth: 0 }}
              />
              <Box
                title={`Expenses: ${formatCurrency(t.totalExpenses)}`}
                sx={{ flex: 1, height: expenseH, bgcolor: oxide.main, minWidth: 0 }}
              />
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, px: 1 }}>
        {trends.map((t) => (
          <Box
            key={`${t.year}-${t.month}`}
            sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}
          >
            <Typography
              sx={{
                fontSize: 9,
                fontFamily: '"Space Mono", monospace',
                color: concrete.aggregate,
                textTransform: 'uppercase',
                mt: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {MONTH_ABBR[t.month - 1]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TrendRow({ trend }: { trend: MonthTrend }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 1fr 80px 80px',
        gap: 1,
        alignItems: 'center',
        py: 1,
        borderBottom: `1px solid ${concrete.stone}`,
        '&:last-child': { border: 'none' },
      }}
    >
      <Typography sx={{ fontSize: 11, fontFamily: '"Space Mono", monospace', color: concrete.aggregate }}>
        {MONTH_ABBR[trend.month - 1]} {trend.year}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: moss.main }}>
        {formatCurrency(trend.totalIncome)}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: oxide.main }}>
        {formatCurrency(trend.totalExpenses)}
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: trend.balance >= 0 ? moss.main : oxide.main,
        }}
      >
        {formatCurrency(trend.balance)}
      </Typography>
      <Typography
        sx={{
          fontSize: 11,
          fontFamily: '"Space Mono", monospace',
          color: pctColor(trend.incomeChangePercent, true),
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
        }}
      >
        {trend.incomeChangePercent !== null && trend.incomeChangePercent > 0 && (
          <TrendingUpOutlinedIcon sx={{ fontSize: 12 }} />
        )}
        {trend.incomeChangePercent !== null && trend.incomeChangePercent < 0 && (
          <TrendingDownOutlinedIcon sx={{ fontSize: 12 }} />
        )}
        {formatPct(trend.incomeChangePercent)}
      </Typography>
      <Typography
        sx={{
          fontSize: 11,
          fontFamily: '"Space Mono", monospace',
          color: pctColor(trend.expenseChangePercent, false),
        }}
      >
        {formatPct(trend.expenseChangePercent)}
      </Typography>
    </Box>
  );
}

function CategoryBar({ cat, max }: { cat: CategoryTrend; max: number }) {
  const pct = max > 0 ? (cat.total / max) * 100 : 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{cat.categoryName}</Typography>
        <Typography
          variant="body2"
          sx={{ fontFamily: '"Space Mono", monospace', fontWeight: 700 }}
        >
          {formatCurrency(cat.total)}
        </Typography>
      </Box>
      <Box sx={{ height: 8, bgcolor: concrete.stone, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${pct}%`,
            bgcolor: oxide.main,
          }}
        />
      </Box>
    </Box>
  );
}

export default function Analytics() {
  const [months, setMonths] = useState(6);
  const [trends, setTrends] = useState<MonthTrend[]>([]);
  const [catTrends, setCatTrends] = useState<CategoryTrend[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      analyticsApi.trends(months),
      analyticsApi.categoryTrends(months),
      analyticsApi.forecast(months),
    ]).then(([trendsResult, catResult, forecastResult]) => {
      setTrends(trendsResult.status === 'fulfilled' ? trendsResult.value : []);
      setCatTrends(catResult.status === 'fulfilled' ? catResult.value : []);
      setForecast(forecastResult.status === 'fulfilled' ? forecastResult.value : null);
      setLoading(false);
    });
  }, [months]);

  const catMax = catTrends.length > 0 ? catTrends[0].total : 1;

  const totalIncome = trends.reduce((s, t) => s + t.totalIncome, 0);
  const totalExpenses = trends.reduce((s, t) => s + t.totalExpenses, 0);
  const activeMonths = trends.filter((t) => t.transactionCount > 0);
  const avgBalance = activeMonths.length > 0
    ? activeMonths.reduce((s, t) => s + t.balance, 0) / activeMonths.length
    : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 24 }}>Analytics</Typography>
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
            Spending trends and patterns
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={months}
          exclusive
          onChange={(_, v) => { if (v !== null) setMonths(v); }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              fontFamily: '"Space Mono", monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              px: 1.5,
              border: `2px solid ${concrete.void}`,
              '&.Mui-selected': {
                bgcolor: concrete.void,
                color: concrete.paper,
                '&:hover': { bgcolor: concrete.void },
              },
            },
          }}
        >
          <ToggleButton value={3}>3M</ToggleButton>
          <ToggleButton value={6}>6M</ToggleButton>
          <ToggleButton value={12}>12M</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}><Skeleton variant="rounded" height={80} /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><Skeleton variant="rounded" height={80} /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><Skeleton variant="rounded" height={80} /></Grid>
          <Grid size={{ xs: 12 }}><Skeleton variant="rounded" height={280} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={320} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={320} /></Grid>
        </Grid>
      ) : (
        <>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: concrete.aggregate,
                      fontFamily: '"Space Mono", monospace',
                      mb: 0.5,
                    }}
                  >
                    Total Income ({months}M)
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: moss.main,
                      fontFamily: '"Space Mono", monospace',
                    }}
                  >
                    {formatCurrency(totalIncome)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: concrete.aggregate,
                      fontFamily: '"Space Mono", monospace',
                      mb: 0.5,
                    }}
                  >
                    Total Expenses ({months}M)
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: oxide.main,
                      fontFamily: '"Space Mono", monospace',
                    }}
                  >
                    {formatCurrency(totalExpenses)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: concrete.aggregate,
                      fontFamily: '"Space Mono", monospace',
                      mb: 0.5,
                    }}
                  >
                    Avg Monthly Balance
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: avgBalance >= 0 ? moss.main : oxide.main,
                      fontFamily: '"Space Mono", monospace',
                    }}
                  >
                    {formatCurrency(avgBalance)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: concrete.aggregate,
                      fontFamily: '"Space Mono", monospace',
                      mt: 0.5,
                    }}
                  >
                    Across {activeMonths.length} active month{activeMonths.length === 1 ? '' : 's'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5 }}>
                Income vs Expenses
              </Typography>
              {trends.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No data for this period.</Typography>
              ) : (
                <BarChart trends={trends} />
              )}
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2.5 }}>
                    Monthly Breakdown
                  </Typography>
                  {trends.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No data for this period.</Typography>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '80px 1fr 1fr 1fr 80px 80px',
                          gap: 1,
                          pb: 1,
                          mb: 0.5,
                          borderBottom: `2px solid ${concrete.void}`,
                        }}
                      >
                        {['Month', 'Income', 'Expenses', 'Balance', 'Inc %', 'Exp %'].map((h) => (
                          <Typography
                            key={h}
                            sx={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                              fontFamily: '"Space Mono", monospace',
                              color: concrete.aggregate,
                            }}
                          >
                            {h}
                          </Typography>
                        ))}
                      </Box>
                      {trends.map((t) => (
                        <TrendRow key={`${t.year}-${t.month}`} trend={t} />
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2.5 }}>
                    Top Spending Categories
                  </Typography>
                  {catTrends.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No spending data for this period.</Typography>
                  ) : (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: concrete.aggregate, fontFamily: '"Space Mono", monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Total over {months} months
                        </Typography>
                      </Box>
                      {catTrends.map((cat) => (
                        <CategoryBar key={cat.categoryName} cat={cat} max={catMax} />
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {forecast && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Next Month Forecast
                </Typography>
                <Typography variant="caption" sx={{ color: concrete.aggregate, fontFamily: '"Space Mono", monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {MONTH_ABBR[forecast.forecastMonth - 1]} {forecast.forecastYear} — based on last {forecast.basedOnMonths} months (weighted avg)
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2, mb: 2.5 }}>
                  {[
                    { label: 'Projected Income', value: forecast.projectedIncome, color: moss.main },
                    { label: 'Projected Expenses', value: forecast.projectedExpenses, color: oxide.main },
                    { label: 'Projected Balance', value: forecast.projectedBalance, color: forecast.projectedBalance >= 0 ? moss.main : oxide.main },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Typography sx={{ fontSize: 10, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1, mb: 0.25 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: '"Space Mono", monospace' }}>
                        {formatCurrency(item.value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {forecast.categoryForecasts.length > 0 && (
                  <>
                    <Typography sx={{ fontSize: 10, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                      Category Forecasts
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {forecast.categoryForecasts.map((cf) => (
                        <Box key={cf.categoryName} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{cf.categoryName}</Typography>
                          <Typography variant="body2" sx={{ fontFamily: '"Space Mono", monospace', fontWeight: 600, color: oxide.main }}>
                            {formatCurrency(cf.projectedAmount)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {trends.some((t) => t.incomeChangePercent !== null) && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Month-over-Month Changes</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {trends.filter((t) => t.incomeChangePercent !== null || t.expenseChangePercent !== null).map((t) => (
                    <Box
                      key={`${t.year}-${t.month}`}
                      sx={{
                        p: 2,
                        border: `2px solid ${concrete.void}`,
                        minWidth: 140,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontFamily: '"Space Mono", monospace',
                          color: concrete.aggregate,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          mb: 1,
                        }}
                      >
                        {MONTH_ABBR[t.month - 1]} {t.year}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">Inc</Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, color: pctColor(t.incomeChangePercent, true) }}
                          >
                            {formatPct(t.incomeChangePercent)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">Exp</Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, color: pctColor(t.expenseChangePercent, false) }}
                          >
                            {formatPct(t.expenseChangePercent)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
