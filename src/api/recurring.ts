import { BASE_URL, getHeaders, handleResponse } from './client';

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: number;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryName: string;
  frequency: Frequency;
  startDate: string;
  nextDueDate?: string;
  active: boolean;
}

export interface CreateRecurringRequest {
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
  frequency: Frequency;
  startDate: string;
}

export interface UpdateRecurringRequest {
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
  frequency: Frequency;
  active: boolean;
}

export const recurringApi = {
  getAll: () =>
    fetch(`${BASE_URL}/api/recurring`, { headers: getHeaders() })
      .then((res) => handleResponse<RecurringTransaction[]>(res)),

  getById: (id: number) =>
    fetch(`${BASE_URL}/api/recurring/${id}`, { headers: getHeaders() })
      .then((res) => handleResponse<RecurringTransaction>(res)),

  create: (data: CreateRecurringRequest) =>
    fetch(`${BASE_URL}/api/recurring`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<RecurringTransaction>(res)),

  update: (id: number, data: UpdateRecurringRequest) =>
    fetch(`${BASE_URL}/api/recurring/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<RecurringTransaction>(res)),

  delete: (id: number) =>
    fetch(`${BASE_URL}/api/recurring/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then((res) => handleResponse<null>(res)),
};
