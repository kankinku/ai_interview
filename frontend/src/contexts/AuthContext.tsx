import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 타입 정의
interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    signUp: (email: string, password: string, name: string) => Promise<any>;
    login: (email: string, password: string) => Promise<any>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const signUp = async (email: string, password: string, name: string) => {
        const res = await fetch("http://localhost:3000/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "회원가입 실패");
        return data;
    };

    const login = async (email: string, password: string) => {
        const res = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "로그인 실패");

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setUser(data.user);

        return data;
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
    };

    const value = { user, signUp, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ 반드시 export 해줘야 Signup.tsx, Login.tsx에서 사용할 수 있음
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
    }
    return context;
};
