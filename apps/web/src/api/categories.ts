import { BASE_URL, getHeaders, handleResponse } from './client';

export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface CreateCategoryRequest {
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
}

export const categoriesApi = {
  getAll: () =>
    fetch(`${BASE_URL}/api/category/all`, { headers: getHeaders() })
      .then((res) => handleResponse<Category[]>(res)),

  create: (data: CreateCategoryRequest) =>
    fetch(`${BASE_URL}/api/category`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<string>(res)),

  delete: (id: number) =>
    fetch(`${BASE_URL}/api/category/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then((res) => handleResponse<null>(res)),
};
