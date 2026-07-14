import { BASE_URL, getHeaders, handleResponse } from './client';

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  targetDate?: string;
  savedAmount: number;
  remaining: number;
  progressPercent: number;
  daysRemaining?: number;
  completed: boolean;
}

export interface CreateSavingsGoalRequest {
  name: string;
  targetAmount: number;
  targetDate?: string;
}

export interface UpdateSavingsGoalRequest {
  name: string;
  targetAmount: number;
  targetDate?: string;
}

export interface Contribution {
  id: number;
  amount: number;
  date: string;
  note?: string;
}

export interface AddContributionRequest {
  amount: number;
  date: string;
  note?: string;
}

export const savingsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/api/savings`, { headers: getHeaders() })
      .then((res) => handleResponse<SavingsGoal[]>(res)),

  getById: (id: number) =>
    fetch(`${BASE_URL}/api/savings/${id}`, { headers: getHeaders() })
      .then((res) => handleResponse<SavingsGoal>(res)),

  create: (data: CreateSavingsGoalRequest) =>
    fetch(`${BASE_URL}/api/savings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<SavingsGoal>(res)),

  update: (id: number, data: UpdateSavingsGoalRequest) =>
    fetch(`${BASE_URL}/api/savings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<SavingsGoal>(res)),

  delete: (id: number) =>
    fetch(`${BASE_URL}/api/savings/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then((res) => handleResponse<null>(res)),

  getContributions: (id: number) =>
    fetch(`${BASE_URL}/api/savings/${id}/contributions`, { headers: getHeaders() })
      .then((res) => handleResponse<Contribution[]>(res)),

  addContribution: (id: number, data: AddContributionRequest) =>
    fetch(`${BASE_URL}/api/savings/${id}/contributions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Contribution>(res)),
};
