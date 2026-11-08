import { BASE_URL, getHeaders, handleResponse, buildQueryString } from './client';

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryName: string;
  date: string;
  currency?: string;
}

export interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface CreateTransactionRequest {
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
  date: string;
  currency?: string;
}

export interface CategorySuggestion {
  categoryId: number | null;
  categoryName: string | null;
  confidence: number;
}

export const transactionsApi = {
  getAll: (filters?: TransactionFilters) =>
    fetch(`${BASE_URL}/api/transactions${buildQueryString(filters ?? {})}`, {
      headers: getHeaders(),
    }).then((res) => handleResponse<Transaction[]>(res)),

  getById: (id: number) =>
    fetch(`${BASE_URL}/api/transactions/${id}`, { headers: getHeaders() })
      .then((res) => handleResponse<Transaction>(res)),

  create: (data: CreateTransactionRequest) =>
    fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<null>(res)),

  update: (id: number, data: CreateTransactionRequest) =>
    fetch(`${BASE_URL}/api/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<null>(res)),

  delete: (id: number) =>
    fetch(`${BASE_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then((res) => handleResponse<null>(res)),

  summary: (month?: number, year?: number) =>
    fetch(`${BASE_URL}/api/transactions/summary${buildQueryString({ month, year })}`, {
      headers: getHeaders(),
    }).then((res) => handleResponse<TransactionSummary>(res)),

  exportCsvUrl: (filters?: TransactionFilters) =>
    `${BASE_URL}/api/transactions/export${buildQueryString(filters ?? {})}`,

  exportPdfUrl: (filters?: TransactionFilters) =>
    `${BASE_URL}/api/transactions/export/pdf${buildQueryString(filters ?? {})}`,

  suggestCategory: (description: string, type: 'INCOME' | 'EXPENSE') =>
    fetch(`${BASE_URL}/api/transactions/suggest-category${buildQueryString({ description, type })}`, {
      headers: getHeaders(),
    }).then((res) => handleResponse<CategorySuggestion>(res)),
};
