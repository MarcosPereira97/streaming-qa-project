import api from "./api";

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.error("Logout error:", error);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post("/auth/change-password", passwordData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post("/auth/verify-email", { token });
    return response.data;
  },

  // Enable 2FA
  enable2FA: async () => {
    const response = await api.post("/auth/2fa/enable");
    return response.data;
  },

  // Verify 2FA
  verify2FA: async (code) => {
    const response = await api.post("/auth/2fa/verify", { code });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (code) => {
    const response = await api.post("/auth/2fa/disable", { code });
    return response.data;
  },

  // Get user sessions
  getSessions: async () => {
    const response = await api.get("/auth/sessions");
    return response.data;
  },

  // Remove session
  removeSession: async (sessionId) => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};

export default authService;
