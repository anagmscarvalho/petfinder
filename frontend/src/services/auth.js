import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const AuthContext = createContext(null);

const TOKEN_KEY = '@petfinder_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega token salvo ao iniciar
  useEffect(() => {
    async function loadToken() {
      try {
        const saved = await AsyncStorage.getItem(TOKEN_KEY);
        if (saved) {
          setToken(saved);
          const profile = await api.getProfile(saved);
          setUser(profile);
        }
      } catch {
        // Token expirado ou inválido
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, []);

  async function signIn(email, senha) {
    const data = await api.login(email, senha);
    const jwt = data.access_token;
    await AsyncStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    const profile = await api.getProfile(jwt);
    setUser(profile);
    return profile;
  }

  async function signUp(dados) {
    // Registra e já faz login
    await api.register(dados);
    return signIn(dados.email, dados.senha);
  }

  async function signInWithGoogle(idToken) {
    const data = await api.loginWithGoogle(idToken);
    const jwt = data.access_token;
    await AsyncStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    const profile = await api.getProfile(jwt);
    setUser(profile);
    return profile;
  }

  async function signInWithApple(idToken) {
    const data = await api.loginWithApple(idToken);
    const jwt = data.access_token;
    await AsyncStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    const profile = await api.getProfile(jwt);
    setUser(profile);
    return profile;
  }

  async function signOut() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function refreshProfile() {
    if (!token) return;
    const profile = await api.getProfile(token);
    setUser(profile);
  }

  async function deleteUserAccount() {
    if (!token) return;
    await api.deleteAccount(token);
    await signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        signed: !!token,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signOut,
        refreshProfile,
        deleteAccount: deleteUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
