// Mock auth service — no real API calls
export const authService = {
  login: async (email, password) => {
    await new Promise(r => setTimeout(r, 1000));
    if (!email || !password) throw new Error('Email and password are required');
    return { success: true, token: 'mock-jwt-token-12345', userId: 'current' };
  },
  register: async (data) => {
    await new Promise(r => setTimeout(r, 1500));
    return { success: true, userId: 'current' };
  },
  logout: async () => { await new Promise(r => setTimeout(r, 300)); return { success: true }; },
  resetPassword: async (email) => {
    await new Promise(r => setTimeout(r, 800));
    return { success: true, message: `Password reset link sent to ${email}` };
  },
};

export default authService;
