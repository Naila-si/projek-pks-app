// src/utils/toast.js

class ToastManager {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (typeof document === 'undefined') return;
    
    let container = document.getElementById('global-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global-toast-container';
      container.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 340px;
        max-width: calc(100vw - 48px);
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    this.container = container;
  }

  show({ type = 'info', title = '', message = '', duration = 4000 }) {
    if (typeof document === 'undefined') return;
    this.initContainer();

    const toast = document.createElement('div');
    
    // Konfigurasi Warna & SVG berdasarkan tipe
    let bgColor, borderColor, iconColor, progressColor, iconSvg;
    
    if (type === 'success') {
      bgColor = 'rgba(240, 253, 244, 0.95)';
      borderColor = '#10b981';
      iconColor = '#059669';
      progressColor = '#10b981';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      bgColor = 'rgba(254, 242, 242, 0.95)';
      borderColor = '#ef4444';
      iconColor = '#dc2626';
      progressColor = '#ef4444';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      bgColor = 'rgba(255, 251, 235, 0.95)';
      borderColor = '#f59e0b';
      iconColor = '#d97706';
      progressColor = '#f59e0b';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      bgColor = 'rgba(240, 249, 255, 0.95)';
      borderColor = '#003b87';
      iconColor = '#003b87';
      progressColor = '#003b87';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.style.cssText = `
      background: ${bgColor};
      border-left: 5px solid ${borderColor};
      border-top: 1px solid rgba(255,255,255,0.7);
      border-right: 1px solid rgba(226,232,240,0.8);
      border-bottom: 1px solid rgba(226,232,240,0.8);
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 14px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
      transform: translateX(120%);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
    `;

    toast.innerHTML = `
      <div style="flex-shrink: 0; margin-top: 2px;">
        ${iconSvg}
      </div>
      <div style="flex-grow: 1; font-family: system-ui, -apple-system, sans-serif;">
        ${title ? `<div style="font-weight: 800; font-size: 13px; color: #1e293b; margin-bottom: 3px; letter-spacing: -0.2px;">${title}</div>` : ''}
        <div style="font-size: 11.5px; font-weight: 600; color: #475569; line-height: 1.45;">${message}</div>
      </div>
      <button class="toast-close-btn" style="
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
        margin-top: -2px;
        margin-right: -4px;
        flex-shrink: 0;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="toast-progress-bar" style="
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background-color: ${progressColor};
        width: 100%;
        transition: width ${duration}ms linear;
      "></div>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(0,0,0,0.05)';
      closeBtn.style.color = '#475569';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
      closeBtn.style.color = '#94a3b8';
    });

    this.container.appendChild(toast);

    // Animasi masuk (slide in)
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Animasi indikator waktu bar
    setTimeout(() => {
      const progressBar = toast.querySelector('.toast-progress-bar');
      if (progressBar) progressBar.style.width = '0%';
    }, 50);

    const removeToast = () => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 400);
    };

    closeBtn.addEventListener('click', removeToast);

    // Dismiss otomatis
    const timeoutId = setTimeout(removeToast, duration);
    
    // Hapus dismiss otomatis jika diklik silang secara manual
    closeBtn.addEventListener('click', () => clearTimeout(timeoutId));
  }

  success(message, title = 'Berhasil') {
    this.show({ type: 'success', title, message });
  }

  error(message, title = 'Gagal') {
    this.show({ type: 'error', title, message });
  }

  warning(message, title = 'Peringatan') {
    this.show({ type: 'warning', title, message });
  }

  info(message, title = 'Informasi') {
    this.show({ type: 'info', title, message });
  }
}

export const toast = new ToastManager();
