// src/hooks/useCompany.js
import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export function useCompany() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch company directory from Laravel API with search and sorting parameters.
   */
  const refreshCompanies = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.sort) {
        queryParams.append('sort', filters.sort); // 'latest' or 'oldest'
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/perusahaan?${queryString}` : '/perusahaan';
      
      const response = await api.get(endpoint);
      if (response.success) {
        setCompanies(response.data);
      }
    } catch (err) {
      console.error('Fetch companies list failed:', err);
      setError(err.message || 'Gagal memuat data perusahaan.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing company profile.
   */
  const editCompany = useCallback(async (id, companyData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        nama_perusahaan: companyData.nama_perusahaan,
        nama_pengelola: companyData.nama_pengelola,
        alamat: companyData.alamat,
        email: companyData.email || null,
        // Map frontend "telepon" to backend "nomor_telepon"
        nomor_telepon: companyData.telepon || companyData.nomor_telepon
      };

      const response = await api.put(`/perusahaan/${id}`, payload);
      await refreshCompanies();
      return response;
    } catch (err) {
      console.error('Update company details failed:', err);
      setError(err.message || 'Gagal memperbarui data perusahaan.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCompanies]);

  /**
   * Get single company details with dynamic historical PKS records list.
   */
  const getCompanyById = useCallback(async (id) => {
    try {
      const response = await api.get(`/perusahaan/${id}`);
      return response.data;
    } catch (err) {
      console.error('Fetch company details by ID failed:', err);
      throw err;
    }
  }, []);

  // Fetch initial company list on load
  useEffect(() => {
    Promise.resolve().then(() => {
      refreshCompanies();
    });
  }, [refreshCompanies]);

  return {
    companies,
    loading,
    error,
    refreshCompanies,
    editCompany,
    getCompanyById
  };
}
