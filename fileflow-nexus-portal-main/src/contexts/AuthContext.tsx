import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qmjwnkvajxdbozvdmyjs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtandua3ZhanhkYm96dmRteWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTM0MzgsImV4cCI6MjA2NDc4OTQzOH0.y968JiseuwLr55JtHh-Iata8t8Dkam6FsaJH1a6kDX8";
const supabase = createClient(supabaseUrl, supabaseKey);

type UserType = "client" | "staff";

interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  companyId?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular verificação de autenticação
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Opcional: verificar sessão do Supabase (ex: supabase.auth.getSession())
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Integração com Supabase: chama a autenticação (signInWithPassword) e, se sucesso, obtém o usuário (ou dados do usuário) e armazena em localStorage.
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Erro de login (Supabase):", error);
        throw new Error(error.message);
      }
      // Exemplo: se a resposta do Supabase retornar um usuário (ou dados do usuário) com um campo "type" (ou "role"), use-o para montar o objeto "User" (ou use um mapeamento).
      // Aqui, para fins de exemplo, se o email contiver "cliente" ou "staff", atribuímos um tipo (client ou staff) e um nome fictício.
      let tipo: UserType = email.includes("cliente") ? "client" : "staff";
      let nome = tipo === "client" ? "Cliente Teste" : "Colaborador Teste";
      let mockUser: User = { id: (data?.user?.id || "c1"), name: nome, email, type: tipo, companyId: tipo === "client" ? "emp1" : undefined, companyName: tipo === "client" ? "Empresa Teste" : undefined };
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    // Opcional: chamar supabase.auth.signOut() para encerrar a sessão no Supabase.
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
