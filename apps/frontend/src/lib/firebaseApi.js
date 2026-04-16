// Professional Firebase API Service for Next.js
// You can import this from '@/lib/firebaseApi' in your components

const API_URL = '/api';

export const AuthAPI = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Login failed');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  signup: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Signup failed');
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }
};

export const RequestAPI = {
  createRequest: async (requestData) => {
    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to create request');
      return data;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  },

  // Get requests (with filters like role, userId, status)
  getRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/requests?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to fetch requests');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  acceptRequest: async (id, helperData) => {
    try {
      const response = await fetch(`${API_URL}/requests/${id}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(helperData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to accept request');
      return data;
    } catch (error) {
      console.error(`Error accepting request ${id}:`, error);
      throw error;
    }
  },

  completeRequest: async (id) => {
    try {
      const response = await fetch(`${API_URL}/requests/${id}/complete`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to complete request');
      return data;
    } catch (error) {
      console.error(`Error completing request ${id}:`, error);
      throw error;
    }
  }
};

export const ProductAPI = {
  // Keeping this if you still need it for reference
  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  getProducts: async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};
