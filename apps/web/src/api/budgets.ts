import { BASE_URL, apiFetch, getHeaders, handleResponse } from './client';

export interface Budget {
  id: number;
  categoryName: string;
  monthlyLimit: number;
  actualSpending: number;
  remaining: number;
  exceeded: boolean;
  month: number;
  year: number;
}

export interface CreateBudgetRequest {
  categoryId: number;
  monthlyLimit: number;
  month: number;
  year: number;
}

export interface UpdateBudgetRequest {
  monthlyLimit: number;
}

export const budgetsApi = {
  getAll: () =>
    apiFetch(`${BASE_URL}/api/budgets`, { headers: getHeaders() })
      .then((res) => handleResponse<Budget[]>(res)),

  create: (data: CreateBudgetRequest) =>
    apiFetch(`${BASE_URL}/api/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<null>(res)),

  update: (id: number, data: UpdateBudgetRequest) =>
    apiFetch(`${BASE_URL}/api/budgets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Budget>(res)),

  delete: (id: number) =>
    apiFetch(`${BASE_URL}/api/budgets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then((res) => handleResponse<null>(res)),
};
