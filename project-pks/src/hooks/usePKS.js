// src/hooks/usePKS.js
import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export function usePKS() {
  const [pksList, setPksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch PKS list from Laravel backend API with optional search and filters.
   */
  const refreshPKS = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.status && filters.status !== 'Semua') {
        queryParams.append('status', filters.status);
      }
      
      if (filters.jenis_pks && filters.jenis_pks !== 'Semua') {
        queryParams.append('jenis_pks', filters.jenis_pks);
      }
      
      if (filters.jenis_objek && filters.jenis_objek !== 'Semua') {
        queryParams.append('jenis_objek', filters.jenis_objek);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/pks?${queryString}` : '/pks';
      
      const response = await api.get(endpoint);
      if (response.success) {
        setPksList(response.data);
      }
    } catch (err) {
      console.error('Fetch PKS list failed:', err);
      setError(err.message || 'Gagal memuat data PKS.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save a new PKS. Handles file upload and on-the-fly company creation.
   */
  const addPKS = useCallback(async (pksData, companyData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // PKS attributes
      formData.append('nomor_pks', pksData.nomor_pks);
      formData.append('judul_pks', pksData.judul_pks);
      formData.append('jenis_pks', pksData.jenis_pks);
      formData.append('jenis_objek', pksData.jenis_objek);
      formData.append('tanggal_mulai', pksData.tanggal_mulai);
      formData.append('tanggal_berakhir', pksData.tanggal_berakhir);
      
      if (pksData.tanggal_addendum) {
        formData.append('tanggal_addendum', pksData.tanggal_addendum);
      }
      
      if (pksData.dokumen_pks) {
        formData.append('dokumen_pks', pksData.dokumen_pks); // File object from file input
      }

      // Company attributes
      if (pksData.id_perusahaan) {
        formData.append('id_perusahaan', pksData.id_perusahaan);
      } else if (companyData) {
        // Create new company simultaneously
        formData.append('nama_perusahaan', companyData.nama_perusahaan);
        formData.append('nama_pengelola', companyData.nama_pengelola);
        formData.append('alamat', companyData.alamat);
        
        if (companyData.email) {
          formData.append('email', companyData.email);
        }
        
        // Map frontend "telepon" attribute to backend validation "nomor_telepon"
        formData.append('nomor_telepon', companyData.telepon || companyData.nomor_telepon);
      }

      const response = await api.post('/pks', formData);
      await refreshPKS();
      return response;
    } catch (err) {
      console.error('Create PKS failed:', err);
      setError(err.message || 'Gagal menyimpan PKS baru.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshPKS]);

  /**
   * Update an existing PKS. Handles PDF document replacement with method spoofing.
   */
  const editPKS = useCallback(async (id, pksData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Inject PUT method spoofing since standard PHP cannot parse multipart/form-data via PUT directly
      formData.append('_method', 'PUT');
      
      formData.append('nomor_pks', pksData.nomor_pks);
      formData.append('judul_pks', pksData.judul_pks);
      formData.append('jenis_pks', pksData.jenis_pks);
      formData.append('jenis_objek', pksData.jenis_objek);
      formData.append('tanggal_mulai', pksData.tanggal_mulai);
      formData.append('tanggal_berakhir', pksData.tanggal_berakhir);
      formData.append('id_perusahaan', pksData.id_perusahaan || pksData.perusahaan_id);

      if (pksData.tanggal_addendum) {
        formData.append('tanggal_addendum', pksData.tanggal_addendum);
      } else {
        formData.append('tanggal_addendum', '');
      }

      // Check if new file was selected (it will be a File instance)
      if (pksData.dokumen_pks instanceof File) {
        formData.append('dokumen_pks', pksData.dokumen_pks);
      }

      const response = await api.post(`/pks/${id}`, formData);
      await refreshPKS();
      return response;
    } catch (err) {
      console.error('Update PKS failed:', err);
      setError(err.message || 'Gagal memperbarui data PKS.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshPKS]);

  /**
   * Get single PKS detail
   */
  const getPKSById = useCallback(async (id) => {
    try {
      const response = await api.get(`/pks/${id}`);
      return response.data;
    } catch (err) {
      console.error('Fetch PKS details failed:', err);
      throw err;
    }
  }, []);

  // Fetch initial PKS list on component load
  useEffect(() => {
    Promise.resolve().then(() => {
      refreshPKS();
    });
  }, [refreshPKS]);

  return {
    pksList,
    loading,
    error,
    refreshPKS,
    addPKS,
    editPKS,
    getPKSById
  };
}
