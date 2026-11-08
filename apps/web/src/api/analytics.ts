import { BASE_URL, getHeaders, handleResponse, buildQueryString } from './client';

export interface MonthTrend {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  incomeChangePercent: number | null;
  expenseChangePercent: number | null;
}

export interface CategoryTrendMonth {
  month: number;
  year: number;
  total: number;
}

export interface CategoryTrend {
  categoryName: string;
  total: number;
  data: CategoryTrendMonth[];
}

export interface CategoryForecast {
  categoryName: string;
  projectedAmount: number;
}

export interface ForecastData {
  forecastMonth: number;
  forecastYear: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  basedOnMonths: number;
  categoryForecasts: CategoryForecast[];
}

export const analyticsApi = {
  trends: (months?: number) =>
    fetch(`${BASE_URL}/api/analytics/trends${buildQueryString({ months })}`, {
      headers: getHeaders(),
    }).then((res) => handleResponse<MonthTrend[]>(res)),

  categoryTrends: (months?: number) =>
    fetch(`${BASE_URL}/api/analytics/category-trends${buildQueryString({ months })}`, {
      headers: getHeaders(),
    }).then((res) => handleResponse<CategoryTrend[]>(res)),

  forecast: (months?: number) =>
    fetch(`${BASE_URL}/api/analytics/forecast${buildQueryString({ months })}`, {
      headers: getHeaders(),
    }).then((res) => handleResponse<ForecastData>(res)),
};
