import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Credenciais do Supabase não configuradas. Verifique o arquivo .env');
}
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        detectSessionInUrl: true,
    },
});

export default supabase;