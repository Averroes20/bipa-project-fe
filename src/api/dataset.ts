import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getDatasets = async (page = 1, size = 10, search = '', gender = '') => {
  const response = await api.get('/dataset', { params: { page, size, search, gender } });
  return response.data;
};

export const getDatasetDetail = async (id: string) => {
  const response = await api.get(`/dataset/${id}`);
  return response.data;
};

export const uploadDataset = async (file: File, gender: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('gender', gender);
  const response = await api.post('/dataset/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteDataset = async (id: string) => {
  const response = await api.delete(`/dataset/${id}`);
  return response.data;
};

export const getDatasetStatistics = async () => {
  const response = await api.get('/dataset/statistics');
  return response.data;
};

export const getRebuildStatus = async () => {
  const response = await api.get('/dataset/rebuild/status');
  return response.data;
};

export const startRebuild = async () => {
  const response = await api.post('/dataset/rebuild');
  return response.data;
};
