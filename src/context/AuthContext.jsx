import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API, { updateAccessToken } from '../services/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (accessToken) => {
    updateAccessToken(accessToken); 
    setToken(accessToken);
  };

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error("Logout API call failed, but logging out on the client.", error);
    } finally {
      updateAccessToken(null); 
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await API.post('/auth/refresh-token');
        
        if (response.data && response.data.accessToken) {
          login(response.data.accessToken);
        } else {
          logout();
        }
      } catch (error) {
        console.log("No active session or refresh token is invalid.");
        updateAccessToken(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [logout]); 

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
