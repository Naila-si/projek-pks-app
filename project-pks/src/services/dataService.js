// src/services/dataService.js
import initialCompanies from '../data/perusahaan.json';
import initialPKS from '../data/pks.json';
import initialNotifications from '../data/notifikasi.json';
import { getPKSStatus } from '../utils/statusHelper';

const STORAGE_KEYS = {
  COMPANIES: 'pks_companies',
  PKS: 'pks_data',
  NOTIFICATIONS: 'pks_notifications'
};

// Inisialisasi data ke localStorage jika belum ada
function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(initialCompanies));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PKS)) {
    localStorage.setItem(STORAGE_KEYS.PKS, JSON.stringify(initialPKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }
  
  // Sinkronisasi notifikasi otomatis setelah inisialisasi awal
  syncNotifications();
}

// Menghasilkan notifikasi otomatis berdasarkan status PKS
function syncNotifications() {
  const pksList = JSON.parse(localStorage.getItem(STORAGE_KEYS.PKS) || '[]');
  const notifList = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  
  let updated = false;
  
  pksList.forEach(pks => {
    const status = getPKSStatus(pks.tanggal_berakhir);
    
    // Hanya pantau PKS yang Segera Berakhir atau Berakhir
    if (status === 'Segera Berakhir' || status === 'Berakhir') {
      // Cari apakah sudah ada notifikasi untuk PKS ini dengan jenis status yang sama
      const exists = notifList.find(n => n.pks_id === pks.id);
      
      if (!exists) {
        // Tambahkan notifikasi baru
        const newNotif = {
          id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          pks_id: pks.id,
          dibaca: false,
          tanggal_dibuat: new Date().toISOString()
        };
        notifList.unshift(newNotif); // Taruh di paling atas
        updated = true;
      }
    }
  });
  
  if (updated) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifList));
  }
}

// Jalankan inisialisasi segera
initializeData();

export const dataService = {
  // === PERUSAHAAN SERVICE ===
  getCompanies() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPANIES) || '[]');
  },

  getCompanyById(id) {
    const companies = this.getCompanies();
    return companies.find(c => c.id === id) || null;
  },

  updateCompany(updatedCompany) {
    const companies = this.getCompanies();
    const index = companies.findIndex(c => c.id === updatedCompany.id);
    if (index !== -1) {
      companies[index] = {
        ...companies[index],
        ...updatedCompany,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
      return true;
    }
    return false;
  },

  // === PKS SERVICE ===
  getPKS() {
    // Sinkronkan notifikasi berkala agar up-to-date
    syncNotifications();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PKS) || '[]');
  },

  getPKSById(id) {
    const pksList = this.getPKS();
    return pksList.find(p => p.id === id) || null;
  },

  // Menyimpan PKS baru dan Perusahaan baru (jika belum ada)
  createPKS(pksData, companyData) {
    const companies = this.getCompanies();
    const pksList = this.getPKS();
    
    let companyId;
    
    // Periksa apakah perusahaan sudah terdaftar berdasarkan nama
    const existingCompany = companies.find(
      c => c.nama_perusahaan.toLowerCase().trim() === companyData.nama_perusahaan.toLowerCase().trim()
    );
    
    if (existingCompany) {
      companyId = existingCompany.id;
      // Perbarui kontak jika berubah
      this.updateCompany({
        ...existingCompany,
        nama_pengelola: companyData.nama_pengelola || existingCompany.nama_pengelola,
        alamat: companyData.alamat || existingCompany.alamat,
        email: companyData.email || existingCompany.email,
        telepon: companyData.telepon || existingCompany.telepon
      });
    } else {
      // Buat perusahaan baru
      companyId = `COMP-${Date.now()}`;
      const newCompany = {
        id: companyId,
        nama_perusahaan: companyData.nama_perusahaan,
        nama_pengelola: companyData.nama_pengelola,
        alamat: companyData.alamat,
        email: companyData.email,
        telepon: companyData.telepon,
        created_at: new Date().toISOString()
      };
      companies.push(newCompany);
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
    }
    
    // Buat PKS Baru
    const newPKS = {
      id: `PKS-${Date.now()}`,
      nomor_pks: pksData.nomor_pks,
      judul_pks: pksData.judul_pks,
      perusahaan_id: companyId,
      bidang: pksData.bidang,
      tanggal_mulai: pksData.tanggal_mulai,
      tanggal_berakhir: pksData.tanggal_berakhir,
      tanggal_addendum: pksData.tanggal_addendum || null,
      dokumen_url: pksData.dokumen_url || 'dokumen_pks_baru.pdf',
      created_at: new Date().toISOString()
    };
    
    pksList.push(newPKS);
    localStorage.setItem(STORAGE_KEYS.PKS, JSON.stringify(pksList));
    
    // Sinkronkan notifikasi
    syncNotifications();
    
    return { pks: newPKS, companyId };
  },

  updatePKS(updatedPKS) {
    const pksList = this.getPKS();
    const index = pksList.findIndex(p => p.id === updatedPKS.id);
    if (index !== -1) {
      pksList[index] = {
        ...pksList[index],
        ...updatedPKS,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.PKS, JSON.stringify(pksList));
      
      // Sinkronkan notifikasi setelah edit
      syncNotifications();
      return true;
    }
    return false;
  },

  // === NOTIFIKASI SERVICE ===
  getNotifications() {
    syncNotifications();
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const pksList = this.getPKS();
    const companies = this.getCompanies();
    
    // Gabungkan notifikasi dengan detail PKS dan Perusahaan
    return notifications.map(notif => {
      const pks = pksList.find(p => p.id === notif.pks_id) || {};
      const company = companies.find(c => c.id === pks.perusahaan_id) || {};
      const status = getPKSStatus(pks.tanggal_berakhir);
      
      return {
        ...notif,
        nama_perusahaan: company.nama_perusahaan || 'Perusahaan Tidak Dikenal',
        nomor_pks: pks.nomor_pks || '-',
        status_pks: status,
        tanggal_berakhir: pks.tanggal_berakhir,
        perusahaan_id: company.id,
        pks_id: pks.id
      };
    });
  },

  markNotificationAsRead(id) {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].dibaca = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      return true;
    }
    return false;
  },

  // === DASHBOARD STATISTIK ===
  getDashboardStats() {
    const pksList = this.getPKS();
    const companies = this.getCompanies();
    
    let totalPKS = pksList.length;
    let totalCompanies = companies.length;
    let totalSegeraBerakhir = 0;
    let totalBerakhir = 0;
    let totalAktif = 0;
    
    pksList.forEach(pks => {
      const status = getPKSStatus(pks.tanggal_berakhir);
      if (status === 'Segera Berakhir') totalSegeraBerakhir++;
      else if (status === 'Berakhir') totalBerakhir++;
      else if (status === 'Aktif') totalAktif++;
    });
    
    // Hitung PKS berdasarkan bidang untuk chart
    let chartData = {
      IW: pksList.filter(p => p.bidang === 'IW').length,
      SW: pksList.filter(p => p.bidang === 'SW').length,
      pelayanan: pksList.filter(p => p.bidang === 'pelayanan').length,
      umum: pksList.filter(p => p.bidang === 'umum').length,
      HC: pksList.filter(p => p.bidang === 'HC').length,
      keuangan: pksList.filter(p => p.bidang === 'keuangan').length,
      tjsl: pksList.filter(p => p.bidang === 'tjsl').length
    };
    
    return {
      totalPKS,
      totalCompanies,
      totalSegeraBerakhir,
      totalBerakhir,
      totalAktif,
      chartData
    };
  }
};
