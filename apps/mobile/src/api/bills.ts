import { BASE_URL, getHeaders, handleResponse } from './client';

export type BillStatus = 'UPCOMING' | 'DUE_SOON' | 'DUE_TODAY' | 'OVERDUE';

export interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDay: number;
  categoryId?: number;
  categoryName?: string;
  active: boolean;
  status: BillStatus;
}

export interface CreateBillRequest {
  name: string;
  amount: number;
  dueDay: number;
  categoryId?: number;
  active?: boolean;
}

export interface UpdateBillRequest {
  name: string;
  amount: number;
  dueDay: number;
  active: boolean;
}

export const billsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/api/bills`, { headers: getHeaders() })
      .then((res) => handleResponse<Bill[]>(res)),

  create: (data: CreateBillRequest) =>
    fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Bill>(res)),

  update: (id: number, data: UpdateBillRequest) =>
    fetch(`${BASE_URL}/api/bills/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Bill>(res)),

  delete: (id: number) =>
    fetch(`${BASE_URL}/api/bills/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then((res) => handleResponse<null>(res)),
};
