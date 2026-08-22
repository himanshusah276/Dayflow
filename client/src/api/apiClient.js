// API Client wrapper for Dayflow REST API

const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dayflow_token');
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // If receiving file/blob download
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.blob();
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || `HTTP ${response.status}: Request failed`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  verifyEmail: (verificationData) => request('/auth/verify-email', { method: 'POST', body: verificationData }),
  resendCode: (identifier) => request('/auth/resend-code', { method: 'POST', body: { identifier } }),
  quickLogin: (role) => request(`/auth/quick-login?role=${role}`),
  getMe: () => request('/auth/me'),

  // Employees
  getEmployees: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/employees${query ? `?${query}` : ''}`);
  },
  getEmployeeById: (id) => request(`/employees/${id}`),
  updateProfile: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: data }),
  createEmployee: (data) => request('/employees', { method: 'POST', body: data }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  uploadAvatar: (id, formData) => request(`/employees/${id}/avatar`, { method: 'POST', body: formData }),
  uploadDocument: (id, formData) => request(`/employees/${id}/documents`, { method: 'POST', body: formData }),
  deleteDocument: (empId, docId) => request(`/employees/${empId}/documents/${docId}`, { method: 'DELETE' }),

  // Attendance
  getTodayAttendance: () => request('/attendance/today'),
  checkIn: (data) => request('/attendance/check-in', { method: 'POST', body: data }),
  checkOut: () => request('/attendance/check-out', { method: 'POST' }),
  getMyAttendanceHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance/my-history${query ? `?${query}` : ''}`);
  },
  getCompanyAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance/company-history${query ? `?${query}` : ''}`);
  },
  regularizeAttendance: (data) => request('/attendance/regularize', { method: 'POST', body: data }),

  // Leaves
  getLeaveBalances: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/leaves/balances${query ? `?${query}` : ''}`);
  },
  applyLeave: (data) => request('/leaves/apply', { method: 'POST', body: data }),
  getMyLeaveRequests: () => request('/leaves/my-requests'),
  getAllLeaveRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/leaves/all-requests${query ? `?${query}` : ''}`);
  },
  reviewLeaveRequest: (id, data) => request(`/leaves/${id}/review`, { method: 'PUT', body: data }),

  // Payroll
  getMySalaryStructure: () => request('/payroll/my-structure'),
  getMyPayslips: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payroll/my-slips${query ? `?${query}` : ''}`);
  },
  getPayslipById: (id) => request(`/payroll/slip/${id}`),
  getAllSalaryStructures: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payroll/structures${query ? `?${query}` : ''}`);
  },
  updateSalaryStructure: (userId, data) => request(`/payroll/structures/${userId}`, { method: 'PUT', body: data }),
  getAllPayslips: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payroll/all-slips${query ? `?${query}` : ''}`);
  },
  generateMonthlyPayroll: (data) => request('/payroll/generate', { method: 'POST', body: data }),

  // Notifications & Announcements
  getNotifications: () => request('/notifications'),
  markNotificationAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsAsRead: () => request('/notifications/read-all', { method: 'POST' }),
  getAnnouncements: () => request('/notifications/announcements'),
  createAnnouncement: (data) => request('/notifications/announcements', { method: 'POST', body: data }),

  // Reports
  getDashboardStats: () => request('/reports/dashboard-stats'),
  downloadAttendanceReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const blob = await request(`/reports/attendance-export${query ? `?${query}` : ''}`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dayflow_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  downloadPayrollReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const blob = await request(`/reports/payroll-export${query ? `?${query}` : ''}`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dayflow_Payroll_Register_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
