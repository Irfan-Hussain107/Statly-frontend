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
      console.error("Logout failed", error);
    } finally {
      updateAccessToken(null); 
      setToken(null);          
    }
  }, []);

  useEffect(() => {
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
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
