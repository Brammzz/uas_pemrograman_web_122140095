import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as apiAdminLogin } from '../api/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      // In a real implementation, you would validate the token with the backend
      // For now, we'll just check if it exists and try to parse the admin data
      const adminDataStr = localStorage.getItem('adminData');
      
      if (adminDataStr) {
        try {
          const adminData = JSON.parse(adminDataStr);
          setAdminToken(token);
          setAdminUser(adminData);
          setIsAdminLoggedIn(true);
          
          // TODO: Add a backend endpoint to verify admin token and get fresh admin data
          // This would be similar to the getProfile function in UserContext
        } catch (error) {
          console.error('Error parsing admin data:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      }
    }
  }, []);

  const loginAdmin = async (credentials) => {
    try {
      console.log('AdminContext: attempting login with:', credentials);
      const response = await apiAdminLogin(credentials);
      console.log('AdminContext: login response:', response);
      
      if (response.success) {
        // Backend response includes admin data and token
        // User bisa ada di response.data.user atau langsung di response.user
        const adminData = response.user || (response.data && response.data.user);
        const token = response.token || (response.data && response.data.token);
        
        if (!adminData) {
          console.error('AdminContext: login response missing admin data');
          return false;
        }
        
        if (!token) {
          console.error('AdminContext: login response missing token');
          return false;
        }
        
        console.log('AdminContext: login successful, admin data:', adminData);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        setAdminToken(token);
        setAdminUser(adminData);
        setIsAdminLoggedIn(true);
        
        return true;
      } else {
        console.warn('AdminContext: login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdminUser(null);
    setAdminToken(null);
    setIsAdminLoggedIn(false);
  };
  
  const isAuthenticated = () => {
    return isAdminLoggedIn && adminUser && adminToken;
  };
  
  const isAdmin = () => {
    return isAuthenticated() && adminUser.is_admin === true;
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminLoggedIn,
        adminUser,
        adminToken,
        loading,
        loginAdmin,
        logoutAdmin,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
