// src/services/authService.js
import supabase from '@services/supabase';

const authService = {
    async login(form) {
        return await supabase.auth.signInWithPassword(form);
    },

    async logout() {
        // Limpar o cache do React Query antes de fazer logout
        if (window.queryClient) {
            window.queryClient.clear();
        }
        return supabase.auth.signOut();
    },

    async forgotPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        return true;
    },

    async registerUser(userData) {
        const { email, password, ...metadata } = userData;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        
        if (error) throw error;
        
        // Se o registro for bem-sucedido, criar um perfil para o usuário
        if (data.user) {
            try {
                await supabase
                    .from('profiles')
                    .insert([{
                        id: data.user.id,
                        full_name: metadata.full_name || '',
                        phone: metadata.phone || '',
                        created_at: new Date(),
                        updated_at: new Date()
                    }]);
            } catch (profileError) {
                console.error("Erro ao criar perfil:", profileError);
                // Não interrompe o fluxo se falhar a criação do perfil
            }
        }
        
        return { data, error };
    }
}

export default authService;