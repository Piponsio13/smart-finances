import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import SegmentedControl from '../components/SegmentedControl';
import { concrete, moss, oxide } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import {
  analyticsApi,
  type MonthTrend,
  type CategoryTrend,
  type ForecastData,
} from '../api/analytics';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(value: number, maxFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: maxFractionDigits }).format(value);
}

function formatPct(value: number | null): string {
  if (value === null) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function pctColor(value: number | null, higherIsBetter: boolean): string {
  if (value === null || value === 0) return concrete.aggregate;
  const positive = value > 0;
  return positive === higherIsBetter ? moss.main : oxide.main;
}

function BarChart({ trends }: { trends: MonthTrend[] }) {
  const max = Math.max(...trends.flatMap((t) => [t.totalIncome, t.totalExpenses]), 1);
  const chartHeight = 140;

  return (
    <View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: moss.main }]} />
          <Text style={styles.legendLabel}>INCOME</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: oxide.main }]} />
          <Text style={styles.legendLabel}>EXPENSES</Text>
        </View>
      </View>

      <View style={[styles.chartArea, { height: chartHeight }]}>
        {trends.map((t) => {
          const incomeH = Math.round((t.totalIncome / max) * chartHeight);
          const expenseH = Math.round((t.totalExpenses / max) * chartHeight);
          return (
            <View key={`${t.year}-${t.month}`} style={styles.chartBarGroup}>
              <View style={[styles.chartBar, { height: incomeH, backgroundColor: moss.main }]} />
              <View style={[styles.chartBar, { height: expenseH, backgroundColor: oxide.main }]} />
            </View>
          );
        })}
      </View>

      <View style={styles.chartLabels}>
        {trends.map((t) => (
          <Text key={`${t.year}-${t.month}`} style={styles.chartLabel}>
            {MONTH_ABBR[t.month - 1]}
          </Text>
        ))}
      </View>
    </View>
  );
}

function TrendCard({ trend }: { trend: MonthTrend }) {
  return (
    <View style={styles.trendCard}>
      <Text style={styles.trendMonth}>{MONTH_ABBR[trend.month - 1]} {trend.year}</Text>
      <View style={styles.trendRow}>
        <Text style={styles.trendLabel}>Income</Text>
        <Text style={[styles.trendValue, { color: moss.main }]}>{formatCurrency(trend.totalIncome)}</Text>
      </View>
      <View style={styles.trendRow}>
        <Text style={styles.trendLabel}>Expenses</Text>
        <Text style={[styles.trendValue, { color: oxide.main }]}>{formatCurrency(trend.totalExpenses)}</Text>
      </View>
      <View style={styles.trendRow}>
        <Text style={styles.trendLabel}>Balance</Text>
        <Text style={[styles.trendValue, { color: trend.balance >= 0 ? moss.main : oxide.main }]}>
          {formatCurrency(trend.balance)}
        </Text>
      </View>
      {(trend.incomeChangePercent !== null || trend.expenseChangePercent !== null) && (
        <View style={styles.trendChangeRow}>
          <Text style={[styles.trendChange, { color: pctColor(trend.incomeChangePercent, true) }]}>
            Inc {formatPct(trend.incomeChangePercent)}
          </Text>
          <Text style={[styles.trendChange, { color: pctColor(trend.expenseChangePercent, false) }]}>
            Exp {formatPct(trend.expenseChangePercent)}
          </Text>
        </View>
      )}
    </View>
  );
}

function CategoryBar({ cat, max }: { cat: CategoryTrend; max: number }) {
  const pct = max > 0 ? (cat.total / max) * 100 : 0;
  return (
    <View style={styles.catBarWrap}>
      <View style={styles.catBarHeader}>
        <Text style={styles.catBarName}>{cat.categoryName}</Text>
        <Text style={styles.catBarValue}>{formatCurrency(cat.total)}</Text>
      </View>
      <View style={styles.catBarTrack}>
        <View style={[styles.catBarFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

export default function Analytics() {
  const [months, setMonths] = useState('6');
  const [trends, setTrends] = useState<MonthTrend[]>([]);
  const [catTrends, setCatTrends] = useState<CategoryTrend[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.allSettled([
        analyticsApi.trends(Number(months)),
        analyticsApi.categoryTrends(Number(months)),
        analyticsApi.forecast(Number(months)),
      ]).then(([trendsResult, catResult, forecastResult]) => {
        if (cancelled) return;
        setTrends(trendsResult.status === 'fulfilled' ? trendsResult.value : []);
        setCatTrends(catResult.status === 'fulfilled' ? catResult.value : []);
        setForecast(forecastResult.status === 'fulfilled' ? forecastResult.value : null);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [months])
  );

  const catMax = catTrends.length > 0 ? catTrends[0].total : 1;
  const totalIncome = trends.reduce((s, t) => s + t.totalIncome, 0);
  const totalExpenses = trends.reduce((s, t) => s + t.totalExpenses, 0);
  const activeMonths = trends.filter((t) => t.transactionCount > 0);
  const avgBalance = activeMonths.length > 0 ? activeMonths.reduce((s, t) => s + t.balance, 0) / activeMonths.length : 0;
  const changeMonths = trends.filter((t) => t.incomeChangePercent !== null || t.expenseChangePercent !== null);

  return (
    <Screen>
      <ScreenHeader title="Analytics" subtitle="Spending trends and patterns" />

      <SegmentedControl
        options={[
          { value: '3', label: '3M' },
          { value: '6', label: '6M' },
          { value: '12', label: '12M' },
        ]}
        value={months}
        onChange={setMonths}
      />

      {loading ? (
        <EmptyState message="Loading…" />
      ) : (
        <>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>INCOME ({months}M)</Text>
              <Text style={[styles.statValue, { color: moss.main }]}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>EXPENSES ({months}M)</Text>
              <Text style={[styles.statValue, { color: oxide.main }]}>{formatCurrency(totalExpenses)}</Text>
            </View>
          </View>
          <View style={styles.statBoxFull}>
            <Text style={styles.statLabel}>AVG MONTHLY BALANCE</Text>
            <Text style={[styles.statValue, { color: avgBalance >= 0 ? moss.main : oxide.main }]}>{formatCurrency(avgBalance)}</Text>
            <Text style={styles.muted}>Across {activeMonths.length} active month{activeMonths.length === 1 ? '' : 's'}</Text>
          </View>

          <Card>
            <Text style={styles.cardTitle}>Income vs Expenses</Text>
            {trends.length === 0 ? <Text style={styles.muted}>No data for this period.</Text> : <BarChart trends={trends} />}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Monthly Breakdown</Text>
            {trends.length === 0 ? (
              <Text style={styles.muted}>No data for this period.</Text>
            ) : (
              <View style={styles.trendList}>
                {trends.map((t) => (
                  <TrendCard key={`${t.year}-${t.month}`} trend={t} />
                ))}
              </View>
            )}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Top Spending Categories</Text>
            {catTrends.length === 0 ? (
              <Text style={styles.muted}>No spending data for this period.</Text>
            ) : (
              <>
                <Text style={styles.mutedCaps}>TOTAL OVER {months} MONTHS</Text>
                <View style={{ marginTop: 10 }}>
                  {catTrends.map((cat) => (
                    <CategoryBar key={cat.categoryName} cat={cat} max={catMax} />
                  ))}
                </View>
              </>
            )}
          </Card>

          {forecast ? (
            <Card>
              <Text style={styles.cardTitle}>Next Month Forecast</Text>
              <Text style={styles.mutedCaps}>
                {MONTH_ABBR[forecast.forecastMonth - 1]} {forecast.forecastYear} — based on last {forecast.basedOnMonths} months
              </Text>

              <View style={styles.forecastRow}>
                <View style={styles.forecastItem}>
                  <Text style={styles.mutedCaps}>PROJECTED INCOME</Text>
                  <Text style={[styles.forecastValue, { color: moss.main }]}>{formatCurrency(forecast.projectedIncome)}</Text>
                </View>
                <View style={styles.forecastItem}>
                  <Text style={styles.mutedCaps}>PROJECTED EXPENSES</Text>
                  <Text style={[styles.forecastValue, { color: oxide.main }]}>{formatCurrency(forecast.projectedExpenses)}</Text>
                </View>
                <View style={styles.forecastItem}>
                  <Text style={styles.mutedCaps}>PROJECTED BALANCE</Text>
                  <Text style={[styles.forecastValue, { color: forecast.projectedBalance >= 0 ? moss.main : oxide.main }]}>
                    {formatCurrency(forecast.projectedBalance)}
                  </Text>
                </View>
              </View>

              {forecast.categoryForecasts.length > 0 ? (
                <View style={styles.forecastCategories}>
                  <Text style={styles.mutedCaps}>CATEGORY FORECASTS</Text>
                  {forecast.categoryForecasts.map((cf) => (
                    <View key={cf.categoryName} style={styles.forecastCatRow}>
                      <Text style={styles.trendLabel}>{cf.categoryName}</Text>
                      <Text style={[styles.trendValue, { color: oxide.main }]}>{formatCurrency(cf.projectedAmount)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          ) : null}

          {changeMonths.length > 0 ? (
            <Card>
              <Text style={styles.cardTitle}>Month-over-Month Changes</Text>
              <View style={styles.changeGrid}>
                {changeMonths.map((t) => (
                  <View key={`${t.year}-${t.month}`} style={styles.changeCard}>
                    <Text style={styles.mutedCaps}>{MONTH_ABBR[t.month - 1]} {t.year}</Text>
                    <View style={styles.changeCardRow}>
                      <Text style={styles.trendLabel}>Inc</Text>
                      <Text style={[styles.changeValue, { color: pctColor(t.incomeChangePercent, true) }]}>
                        {formatPct(t.incomeChangePercent)}
                      </Text>
                    </View>
                    <View style={styles.changeCardRow}>
                      <Text style={styles.trendLabel}>Exp</Text>
                      <Text style={[styles.changeValue, { color: pctColor(t.expenseChangePercent, false) }]}>
                        {formatPct(t.expenseChangePercent)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontFamily: monoBold, fontSize: 14, color: concrete.void, marginBottom: 12 },
  muted: { fontFamily: mono, fontSize: 12, color: concrete.aggregate },
  mutedCaps: { fontFamily: monoBold, fontSize: 9, color: concrete.aggregate, letterSpacing: 1 },

  statRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, borderWidth: 2, borderColor: concrete.void, padding: 12, backgroundColor: concrete.paper },
  statBoxFull: { borderWidth: 2, borderColor: concrete.void, padding: 12, backgroundColor: concrete.paper, gap: 4 },
  statLabel: { fontFamily: monoBold, fontSize: 9, color: concrete.aggregate, letterSpacing: 1 },
  statValue: { fontFamily: monoBold, fontSize: 18, marginTop: 4 },

  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderWidth: 1, borderColor: concrete.void },
  legendLabel: { fontFamily: monoBold, fontSize: 9, color: concrete.aggregate, letterSpacing: 1 },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: concrete.void,
    paddingHorizontal: 6,
  },
  chartBarGroup: { flex: 1, flexDirection: 'row', gap: 2, alignItems: 'flex-end', minWidth: 0 },
  chartBar: { flex: 1, minWidth: 0 },
  chartLabels: { flexDirection: 'row', gap: 4, paddingHorizontal: 6, marginTop: 4 },
  chartLabel: { flex: 1, fontFamily: mono, fontSize: 8, color: concrete.aggregate, textAlign: 'center' },

  trendList: { gap: 12 },
  trendCard: { borderWidth: 1.5, borderColor: concrete.stone, padding: 10, gap: 4 },
  trendMonth: { fontFamily: monoBold, fontSize: 11, color: concrete.void, marginBottom: 2, letterSpacing: 1 },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trendLabel: { fontFamily: mono, fontSize: 12, color: concrete.aggregate },
  trendValue: { fontFamily: monoBold, fontSize: 12 },
  trendChangeRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  trendChange: { fontFamily: mono, fontSize: 10 },

  catBarWrap: { marginBottom: 14 },
  catBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catBarName: { fontFamily: mono, fontSize: 13, color: concrete.void },
  catBarValue: { fontFamily: monoBold, fontSize: 13, color: concrete.void },
  catBarTrack: { height: 8, backgroundColor: concrete.stone },
  catBarFill: { height: '100%', backgroundColor: oxide.main },

  forecastRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12, marginBottom: 12 },
  forecastItem: { minWidth: '40%', gap: 4 },
  forecastValue: { fontFamily: monoBold, fontSize: 17 },
  forecastCategories: { gap: 8, borderTopWidth: 1.5, borderTopColor: concrete.stone, paddingTop: 10 },
  forecastCatRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },

  changeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  changeCard: { borderWidth: 2, borderColor: concrete.void, padding: 10, minWidth: '46%', gap: 6 },
  changeCardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  changeValue: { fontFamily: monoBold, fontSize: 11 },
});
