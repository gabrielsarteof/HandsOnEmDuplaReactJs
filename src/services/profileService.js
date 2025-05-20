// src/services/profileService.js
import supabase from '@services/supabase';

const profileService = {
    async getProfile() {
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        // Buscar o perfil do usuário atual
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (error) {
            // Se o perfil não existir, retornar um perfil vazio
            if (error.code === 'PGRST116') {
                return {
                    id: user.id,
                    full_name: user.user_metadata?.full_name || '',
                    phone: '',
                    avatar_url: 'https://placehold.co/40?text=A'
                };
            }
            throw error;
        }
        if (data.avatar_url) {
            // Obtém a URL pública do avatar diretamente
            data.avatar_url = supabase.storage.from('avatars').getPublicUrl(data.avatar_url).data.publicUrl;
        } else {
            // Caso o usuário não tenha avatar, atribui o placeholder
            data.avatar_url = 'https://placehold.co/40?text=A';
        }
        return data;
    },

    async updateProfile({ full_name, phone, file }) {
        let avatar_url;
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const { error: upErr } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);
            if (upErr) throw upErr;
            avatar_url = fileName;
        }

        // Obter o usuário atual usando o método correto
        const { data: { user } } = await supabase.auth.getUser();

        // Atualizar os metadados do usuário para incluir o nome completo
        // Isso garante que user.user_metadata.full_name esteja disponível no Header
        const { error: userUpdateError } = await supabase.auth.updateUser({
            data: { full_name }
        });

        if (userUpdateError) {
            console.error('User metadata update error:', userUpdateError);
            throw userUpdateError;
        }

        // Verificar se o perfil existe
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const updates = { full_name, phone, avatar_url, updated_at: new Date() };

        let result;

        if (!existingProfile) {
            // Se o perfil não existir, criar um novo
            result = await supabase
                .from('profiles')
                .insert([{
                    id: user.id,
                    full_name: full_name || '',
                    phone: phone || '',
                    avatar_url: avatar_url || null,
                    created_at: new Date(),
                    updated_at: new Date()
                }])
                .select()
                .single();
        } else {
            // Se o perfil existir, atualizá-lo
            result = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();
        }

        const { data, error } = result;
        if (error) {
            console.error('Update error details:', error);
            throw error;
        }
        return data;
    },

    getAvatarUrl(avatar) {
        return avatar
            ? supabase.storage.from('avatars').getPublicUrl(avatar).data.publicUrl
            : 'https://placehold.co/40?text=A';
    },
};

export default profileService;