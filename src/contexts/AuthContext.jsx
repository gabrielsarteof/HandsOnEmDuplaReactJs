// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@services/supabase';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(supabase.auth.getSession()?.data?.session || null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = session?.user || null;
    const isAdmin = profile?.is_admin || false;

    // Buscar o perfil do usuário quando o usuário estiver autenticado
    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    if (error) {
                        console.error('Erro ao buscar perfil:', error);
                        setProfile(null);
                    } else {
                        setProfile(data);
                    }
                } catch (error) {
                    console.error('Erro ao buscar perfil:', error);
                    setProfile(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
            // Quando o evento for SIGNED_OUT, limpar o perfil e a sessão
            if (event === 'SIGNED_OUT') {
                setProfile(null);
                setSession(null);
            } else {
                setSession(sess);
                setLoading(true); // Reiniciar o loading quando o estado de autenticação mudar
            }
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    const value = { session, user, isAdmin, loading, profile };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export { AuthProvider };