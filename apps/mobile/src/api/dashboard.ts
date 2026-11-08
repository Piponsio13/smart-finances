import { BASE_URL, getHeaders, handleResponse } from './client';

export interface SpendingByCategory {
  categoryName: string;
  total: number;
  percentage: number;
}

export interface DashboardData {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  spendingByCategory: SpendingByCategory[];
}

export const dashboardApi = {
  get: () =>
    fetch(`${BASE_URL}/api/dashboard`, { headers: getHeaders() })
      .then((res) => handleResponse<DashboardData>(res)),
};
