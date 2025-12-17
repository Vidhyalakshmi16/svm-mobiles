import React, { createContext, useContext, useEffect, useState } from "react";
import { getMeApi, loginApi, registerApi } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = localStorage.getItem("svm_token");
  if (!token) {
    setLoading(false);
    return;
  }
  (async () => {
    try {
      const { data } = await getMeApi(); // e.g. { _id, name, email, role }
      setUser(data);
    } catch (err) {
      console.error("GetMe failed:", err);
      localStorage.removeItem("svm_token");
    } finally {
      setLoading(false);
    }
  })();
}, []);


  const login = async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem("svm_token", data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
  };

  const register = async ({ name, email, password }) => {
    const { data } = await registerApi({ name, email, password });
    localStorage.setItem("svm_token", data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
  };

  const logout = () => {
    localStorage.removeItem("svm_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
