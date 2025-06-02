import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../api/api';

const UserContext = createContext(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile from backend using token
      const fetchProfile = async () => {
        try {
          const userData = await getProfile();
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error fetching profile:', error);
          // If token is invalid, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsLoggedIn(false);
        }
      };
      fetchProfile();
    }
  }, []);

  const login = async (credentials) => {
    try {
      console.log('UserContext: attempting login with:', credentials);
      const response = await loginUser(credentials.email, credentials.password);
      console.log('UserContext: login response:', response);
      
      if (response.success) {
        // Backend response includes user data and token
        // User bisa ada di response.data.user atau langsung di response.user
        const userData = response.user || (response.data && response.data.user);
        const token = response.token || (response.data && response.data.token);
        
        if (!userData) {
          console.error('UserContext: login response missing user data');
          return false;
        }
        
        if (!token) {
          console.error('UserContext: login response missing token');
          return false;
        }
        
        console.log('UserContext: login successful, user data:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token); // Memastikan token disimpan
        setUser(userData);
        setIsLoggedIn(true);
        return true;
      }
      
      console.warn('UserContext: login failed:', response.message);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      console.log('UserContext: registering user with data:', userData);
      // Memanggil registerUser dengan semua data yang diperlukan
      const response = await registerUser(userData);
      console.log('UserContext: register response:', response);
      
      if (response.success) {
        // After successful registration, log the user in
        console.log('UserContext: registration successful, attempting login');
        const loginResponse = await loginUser(userData.email, userData.password);
        console.log('UserContext: login after registration response:', loginResponse);
        
        if (loginResponse.success) {
          // Memeriksa format respons login yang benar
          // User bisa ada di loginResponse.data.user atau langsung di loginResponse.user
          const newUser = loginResponse.user || (loginResponse.data && loginResponse.data.user);
          
          if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            setIsLoggedIn(true);
            return true;
          } else {
            console.error('User data not found in login response:', loginResponse);
            return false;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};
