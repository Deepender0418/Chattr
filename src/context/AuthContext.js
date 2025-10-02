import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const checkLoggedIn = async () => {
    try {
      console.log('Checking login status...');
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!userData);
      
      if (token && userData) {
        // Token is automatically added to requests via interceptor
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('Signing up...');
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
      });

      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const signin = async (email, password) => {
    try {
      console.log('Signing in...');
      const response = await api.post('/auth/signin', {
        email,
        password,
      });

      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Signin failed',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    signup,
    signin,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};