import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API, { updateAccessToken } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const login = (accessToken) => {
    updateAccessToken(accessToken);
    setToken(accessToken);          
  };

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      updateAccessToken(null);
      setToken(null);          
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      login(tokenFromUrl);
      navigate(location.pathname, { replace: true });
      setIsLoading(false);
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const response = await API.post('/auth/refresh-token');
        if (response.data.accessToken) {
          login(response.data.accessToken);
        }
      } catch (error) {
        console.log("No active session");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [location, navigate]);

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);