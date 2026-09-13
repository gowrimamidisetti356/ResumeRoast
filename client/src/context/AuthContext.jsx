import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ name: 'Guest', email: 'guest@example.com' });
    const [loading, setLoading] = useState(false);

    // No-op functions to prevent crashes if called
    const login = async () => true;
    const signup = async () => true;
    const logout = () => { };

    const [resumeData, setResumeData] = useState(null);

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, resumeData, setResumeData }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
