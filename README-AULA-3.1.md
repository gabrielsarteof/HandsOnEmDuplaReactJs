# Passo a Passo para Atualizar Artefatos da Aula 3

Este guia contém instruções para atualizar os artefatos apresentados no arquivo `codebase-aula-3.md` para os artefatos atuais do projeto. Siga as etapas abaixo para realizar as atualizações necessárias.

## 1. Atualizando o .gitignore

O arquivo `.gitignore` atual é muito similar ao apresentado no codebase-aula-3.md, mas inclui uma linha adicional para ignorar o arquivo `codebase.md`.

```diff
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local
+ codebase.md

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## 2. Atualizando o eslint.config.js

O arquivo `eslint.config.js` não precisa de alterações, pois é idêntico ao apresentado no codebase-aula-3.md.

## 3. Atualizando o index.html

O arquivo `index.html` precisa ser atualizado com diversos elementos adicionais:

```diff
<!doctype html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8" />    
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
+   <link rel="stylesheet" href="/src/assets/css/styles.css" />
+   <link rel="stylesheet" href="/src/assets/css/pagination.css" />
+   <link rel="shortcut icon" href="/src/assets/img/favicon.svg" type="image/x-icon">
-   <title>Usando React</title>
+   <title>Loja Virtual</title>
</head>

<body>
    <div id="root" class="d-flex flex-column min-vh-100"></div>
    <script type="module" src="/src/main.jsx"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
```

## 4. Atualizando o package.json

O arquivo `package.json` precisa ser atualizado com uma dependência adicional:

```diff
{
  "name": "react01",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.4",
    "@tanstack/react-query": "^5.74.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hot-toast": "^2.5.2",
+   "react-input-mask": "^2.0.4",
    "react-router-dom": "^7.4.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react-swc": "^3.8.0",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "vite": "^6.2.0"
  }
}
```

## 5. Atualizando o main.jsx

O arquivo `src/main.jsx` precisa de alterações significativas para incluir o AuthProvider e disponibilizar o queryClient globalmente:

```diff
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
- import App from './pages/App';
+ import App from '@pages/App';
+ import { AuthProvider } from '@contexts/AuthContext';

// Criação do cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

+ // Disponibilizar o queryClient globalmente para que o authService possa acessá-lo
+ window.queryClient = queryClient;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
+     <AuthProvider>
        <App />
+     </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
```

## 6. Configuração para Aliases de Importação

Para que o import com `@pages/App` funcione, é necessário configurar aliases no arquivo `vite.config.js`:

```diff
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
+ import path from 'path'
+ import { fileURLToPath } from 'url'

+ const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
+ resolve: {
+   alias: {
+     '@': path.resolve(__dirname, './src'),
+     '@components': path.resolve(__dirname, './src/components'),
+     '@pages': path.resolve(__dirname, './src/pages'),
+     '@contexts': path.resolve(__dirname, './src/contexts'),
+     '@services': path.resolve(__dirname, './src/services'),
+     '@assets': path.resolve(__dirname, './src/assets')
+   }
+ }
})
```

## 7. Criação de Arquivos de Estilo

Criar os arquivos de estilo mencionados no index.html:

1. Crie a estrutura de diretórios:
```
mkdir -p src/assets/css
mkdir -p src/assets/img
```

2. Crie o arquivo `src/assets/css/styles.css` com seu conteúdo desejado.

3. Crie o arquivo `src/assets/css/pagination.css` com seu conteúdo desejado.

4. Adicione um favicon em `src/assets/img/favicon.svg`.

## 8. Implementando o AuthContext

Crie o arquivo `src/contexts/AuthContext.jsx` para implementar a autenticação no sistema:

1. Crie a estrutura de diretórios:
```
mkdir -p src/contexts
```

2. Implemente o contexto de autenticação necessário para a aplicação.

## Considerações Finais

Após realizar todas essas atualizações, a aplicação estará configurada com:

1. Autenticação de usuários (via AuthContext)
2. Estilos personalizados
3. Configuração de aliases para importações mais organizadas
4. Favicon personalizado
5. Integração com mascaramento de inputs

Estas atualizações preparam o projeto para as funcionalidades mais avançadas que serão trabalhadas no restante do curso.

## 9. Atualizando o arquivo supabase.js

O arquivo `src/services/supabase.js` precisa ser atualizado com uma configuração adicional para autenticação:

```diff
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
- const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
+ const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Credenciais do Supabase não configuradas. Verifique o arquivo .env');
}
- const supabase = createClient(supabaseUrl, supabaseKey);
+ const supabase = createClient(supabaseUrl, supabaseKey, {
+     auth: {
+         persistSession: true,
+         detectSessionInUrl: true,
+     },
+ });

export default supabase;
```

## 10. Implementando o AuthContext

O arquivo `src/contexts/AuthContext.jsx` é uma adição importante que implementa a autenticação no sistema:

```jsx
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
```

Este componente gerencia:
- A sessão do usuário e perfil
- Estado de carregamento para operações assíncronas
- Verificação de permissões de administrador
- Atualização automática do estado quando ocorrem eventos de autenticação

## 11. Configurando Variáveis de Ambiente

Para que a configuração do Supabase funcione corretamente, atualize ou crie o arquivo `.env` com as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_API_KEY=sua_chave_api_do_supabase
```

Observe que a variável de ambiente para a chave do Supabase mudou de `VITE_SUPABASE_ANON_KEY` para `VITE_SUPABASE_API_KEY`.

## Conclusão

Após realizar todas estas atualizações, o projeto estará configurado com:

1. Sistema de autenticação completo (via AuthContext e Supabase)
2. Estilos personalizados e melhorias de UI
3. Configuração de aliases para importações mais organizadas
4. Estrutura de projeto adaptada para funcionalidades avançadas

Estas mudanças permitem a evolução da aplicação de um simples catálogo de produtos para uma aplicação completa com autenticação, perfis de usuário e funcionalidades administrativas.