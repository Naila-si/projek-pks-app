// src/hooks/useAddendum.js
import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useAddendum() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Save a new Addendum. Handles file upload.
   */
  const addAddendum = useCallback(async (addendumData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('id_pks', addendumData.id_pks);
      formData.append('judul_addendum', addendumData.judul_addendum);
      formData.append('tanggal_mulai', addendumData.tanggal_mulai);
      formData.append('tanggal_berakhir', addendumData.tanggal_berakhir);
      
      if (addendumData.nomor_addendum) {
        formData.append('nomor_addendum', addendumData.nomor_addendum);
      }
      
      if (addendumData.dokumen_addendum) {
        formData.append('dokumen_addendum', addendumData.dokumen_addendum); // File object
      }

      const response = await api.post('/addendum', formData);
      return response;
    } catch (err) {
      console.error('Create addendum failed:', err);
      setError(err.message || 'Gagal menyimpan addendum baru.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing Addendum. Handles file replacement.
   */
  const editAddendum = useCallback(async (id, addendumData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('id_pks', addendumData.id_pks);
      formData.append('nomor_addendum', addendumData.nomor_addendum);
      formData.append('judul_addendum', addendumData.judul_addendum);
      formData.append('tanggal_mulai', addendumData.tanggal_mulai);
      formData.append('tanggal_berakhir', addendumData.tanggal_berakhir);

      if (addendumData.dokumen_addendum instanceof File) {
        formData.append('dokumen_addendum', addendumData.dokumen_addendum);
      }

      const response = await api.post(`/addendum/${id}`, formData);
      return response;
    } catch (err) {
      console.error('Update addendum failed:', err);
      setError(err.message || 'Gagal memperbarui addendum.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an Addendum.
   */
  const deleteAddendum = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/addendum/${id}`);
      return response;
    } catch (err) {
      console.error('Delete addendum failed:', err);
      setError(err.message || 'Gagal menghapus addendum.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get single Addendum details.
   */
  const getAddendumById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/addendum/${id}`);
      return response.data;
    } catch (err) {
      console.error('Fetch addendum failed:', err);
      setError(err.message || 'Gagal mengambil detail addendum.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addAddendum,
    editAddendum,
    deleteAddendum,
    getAddendumById
  };
}
