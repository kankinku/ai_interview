import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 타입 정의
interface User {
    id: number;
    name: string;
    email: string;
    targetCompanyId?: number;
}

interface AuthContextType {
    user: User | null;
    signUp: (email: string, password: string, name: string) => Promise<any>;
    login: (email: string, password:string) => Promise<any>;
    logout: () => void;
    updateUser: (newUser: User) => void; // updateUser 함수 추가
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

    // 백엔드 주소: localhost 대신 현재 서버의 실제 IP 사용
    // const BASE_URL = "http://192.168.0.44:3000";
    const BASE_URL = "http://localhost:3000";

    const signUp = async (email: string, password: string, name: string) => {
        const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "회원가입 실패");
        return data;
    };

    const login = async (email: string, password: string) => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
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

    const updateUser = (newUser: User) => {
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
    };

    const value = { user, signUp, login, logout, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
    }
    return context;
};
