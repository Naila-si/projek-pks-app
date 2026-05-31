// src/utils/statusHelper.js

export function getPKSStatus(endDateString) {
  if (!endDateString) return 'Berakhir';
  
  try {
    const today = new Date();
    // Set hours to 0 to compare purely dates
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateString);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Berakhir';
    } else if (diffDays <= 30) {
      return 'Segera Berakhir';
    } else {
      return 'Aktif';
    }
  } catch {
    return 'Berakhir';
  }
}

export function getRemainingDays(endDateString) {
  if (!endDateString) return 0;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateString);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
