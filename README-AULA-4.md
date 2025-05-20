# ReactJs :: Aula 04 - Implementando Autenticação e Administração

**Prof. Ricardo Maroquio**

Bem-vindo à Aula 04 do nosso curso de ReactJS! Nas aulas anteriores, construímos uma aplicação de listagem de produtos conectada ao Supabase, implementando operações CRUD básicas e paginação.

Nesta aula, vamos transformar nossa aplicação em um e-commerce completo, adicionando:

1. **Sistema de Autenticação:** Implementar login, registro, gerenciamento de perfil de usuários etc.
2. **Controle de Acesso:** Criar rotas protegidas e níveis de permissão (usuário comum vs. administrador).
3. **Área Administrativa:** Desenvolver um painel administrativo para gerenciar produtos e usuários.
4. **Melhorias na UI/UX:** Aprimorar a interface e experiência do usuário com estilos personalizados e feedback visual.

Vamos continuar evoluindo nosso estudo de caso da loja de produtos, transformando-a em uma aplicação completa com autenticação e áreas restritas.

## Índice

1. [Preparação do Ambiente](#1-preparação-do-ambiente)
2. [Implementando o Sistema de Autenticação](#2-implementando-o-sistema-de-autenticação)
3. [Criando Rotas Protegidas](#3-criando-rotas-protegidas)
4. [Desenvolvendo o Painel Administrativo](#4-desenvolvendo-o-painel-administrativo)
5. [Melhorando a Interface do Usuário](#5-melhorando-a-interface-do-usuário)
6. [Gerenciamento de Usuários](#6-gerenciamento-de-usuários)
7. [Implementação do Perfil de Usuário](#7-implementação-do-perfil-de-usuário)
8. [Considerações Finais](#8-considerações-finais)

## 1. Preparação do Ambiente

Antes de começar, vamos organizar melhor nossa estrutura de diretórios e arquivos para facilitar o desenvolvimento de recursos mais complexos.

### 1.1. Reestruturação de Diretórios

Organizaremos nossos arquivos da seguinte forma:

```
src/
├── assets/
│   ├── css/
│   ├── img/
│   └── js/
├── components/
├── contexts/
├── pages/
│   ├── admin/
│   ├── auth/
│   └── App.jsx
└── services/
```

### 1.2. Atualização dos Alias de Importação

No arquivo `vite.config.js`, já temos os alias configurados. Certifique-se de utilizá-los em suas importações para melhorar a legibilidade do código:

```js
import CardsGrid from "@components/CardsGrid";
import { useAuth } from '@contexts/AuthContext';
```

### 1.3. Configuração do Supabase para Autenticação

No Supabase, precisamos:

1. Ativar a autenticação por email/senha
2. Configurar as URLs de redirecionamento para recuperação de senha
3. Criar uma tabela `profiles` para armazenar informações adicionais dos usuários
4. Criar um bucket para armazenar imagens de avatar

```sql
-- Criar tabela profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar função para exclusão de usuário
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Excluir o usuário da tabela auth.users
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 2. Implementando o Sistema de Autenticação

### 2.1. Serviço de Autenticação

Vamos criar um serviço para gerenciar a autenticação com o Supabase:

```jsx
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
```

### 2.2. Contexto de Autenticação

Agora, vamos aprimorar o contexto de autenticação para gerenciar o estado do usuário logado:

```jsx
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
```

### 2.3. Página de Login

Vamos criar a página de login:

```jsx
// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '@services/authService';

const LoginPage = () => {
    const nav = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (generalError) setGeneralError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!/.+@.+\..+/.test(form.email)) newErrors.email = 'E-mail inválido';
        if (!form.password) newErrors.password = 'A senha é obrigatória';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsLoading(true);
        const { error } = await authService.login(form);
        setIsLoading(false);
        
        if (error) return setGeneralError(error.message);
        nav('/'); // redireciona para a página inicial quando logou
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">Entrar</h2>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            {/* E-mail */}
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={form.email}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>
                            
                            {/* Senha */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                            </div>
                            
                            {generalError && (
                                <div className="alert alert-danger mb-3">{generalError}</div>
                            )}
                            
                            {/* Ações */}
                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Entrando...
                                        </>
                                    ) : (
                                        'Entrar'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => nav('/')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                        <div className="mt-3">
                            <Link to="/register">Criar conta</Link> |{' '}
                            <Link to="/forgot-password">Esqueci a senha</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
```

### 2.4. Página de Registro

Agora, vamos implementar a página de registro de novos usuários:

```jsx
// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import authService from '@services/authService';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm: '',
    });
    const [errors, setErrors] = useState({});
    
    const registerMutation = useMutation({
        mutationFn: authService.registerUser,
        onSuccess: () => {
            toast.success('Conta criada! Verifique seu e-mail.', {
                icon: '✅',
                duration: 3000
            });
            navigate('/login');
        },
        onError: err =>
            toast.error(`Erro ao registrar: ${err.message}`, {
                icon: '❌',
                duration: 5000
            }),
    });
    
    const handleChange = e => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
    
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    
    const validateForm = () => {
        const newErrors = {};
        if (!user.full_name.trim()) newErrors.full_name = 'O nome é obrigatório';
        if (!/.+@.+\..+/.test(user.email)) newErrors.email = 'E-mail inválido';
        if (!phoneRegex.test(user.phone))
            newErrors.phone = 'Telefone deve ter o formato (99) 99999-9999';
        if (user.password.length < 6)
            newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
        if (user.password !== user.confirm)
            newErrors.confirm = 'As senhas não coincidem';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = e => {
        e.preventDefault();
        if (validateForm()) {
            const { confirm: _confirm, ...payload } = user; // remove confirm
            registerMutation.mutate(payload);
        }
    };
    
    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">Criar Conta</h2>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Nome */}
                            <div className="mb-3">
                                <label htmlFor="full_name" className="form-label">
                                    Nome completo
                                </label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                                    value={user.full_name}
                                    onChange={handleChange} />
                                {errors.full_name && (
                                    <div className="invalid-feedback">{errors.full_name}</div>
                                )}
                            </div>
                            {/* E-mail */}
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={user.email}
                                    onChange={handleChange} />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>
                            {/* Telefone */}
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="(99) 99999-9999"
                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                    value={user.phone}
                                    onChange={e => {
                                        // Formatar o telefone manualmente
                                        const value = e.target.value.replace(/\D/g, '');
                                        let formattedValue = '';

                                        if (value.length <= 2) {
                                            formattedValue = value.length ? `(${value}` : '';
                                        } else if (value.length <= 7) {
                                            formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                                        } else {
                                            formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                                        }

                                        const { name } = e.target;
                                        setUser(prev => ({ ...prev, [name]: formattedValue }));
                                        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
                                    }}
                                />
                                {errors.phone && (
                                    <div className="invalid-feedback">{errors.phone}</div>
                                )}
                            </div>
                            {/* Senha */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    value={user.password}
                                    onChange={handleChange} />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                            </div>
                            {/* Confirmar */}
                            <div className="mb-3">
                                <label htmlFor="confirm" className="form-label">
                                    Confirmar senha
                                </label>
                                <input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
                                    value={user.confirm}
                                    onChange={handleChange} />
                                {errors.confirm && (
                                    <div className="invalid-feedback">{errors.confirm}</div>
                                )}
                            </div>
                            {/* Ações */}
                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={registerMutation.isPending}>
                                    {registerMutation.isPending ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Criando…
                                        </>
                                    ) : (
                                        'Criar'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/login')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                        <div className="mt-3">
                            <Link to="/login">Já tenho conta</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
```

### 2.5. Recuperação de Senha

Vamos implementar a página de recuperação de senha:

```jsx
// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import authService from '@services/authService';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    
    const resetMutation = useMutation({
        mutationFn: authService.forgotPassword,
        onSuccess: () => {
            toast.success('Enviamos um e-mail com as instruções de redefinição.', {
                icon: '📧',
                duration: 3000,
            });
            navigate('/login');
        },
        onError: err =>
            toast.error(`Erro: ${err.message}`, {
                icon: '❌',
                duration: 5000,
            }),
    });
    
    const emailRegex = /.+@.+\..+/;
    
    const validate = () => {
        if (!emailRegex.test(email)) {
            setError('E-mail inválido');
            return false;
        }
        setError('');
        return true;
    };
    
    const handleSubmit = e => {
        e.preventDefault();
        if (validate()) resetMutation.mutate(email);
    };
    
    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">Recuperar senha</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    Informe seu e-mail cadastrado
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={`form-control ${error ? 'is-invalid' : ''}`}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)} />
                                {error && <div className="invalid-feedback">{error}</div>}
                            </div>
                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={resetMutation.isPending}>
                                    {resetMutation.isPending ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Enviando…
                                        </>
                                    ) : (
                                        'Enviar link'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/login')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                        <div className="mt-3">
                            <Link to="/login">Lembrou a senha? Voltar ao login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
```

### 2.6. Atualização de Senha

E a página para atualizar a senha:

```jsx
// src/pages/auth/UpdatePasswordPage.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import supabase from '@services/supabase';
import { useAuth } from '@contexts/AuthContext';

const UpdatePasswordPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [form, setForm] = useState({
        password: '',
        confirm: '',
    });
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        if (user === null) navigate('/login', { replace: true });
    }, [user, navigate]);
    
    const updateMutation = useMutation({
        mutationFn: newPassword =>
            supabase.auth.updateUser({ password: newPassword }),
        onSuccess: () => {
            toast.success('Senha alterada com sucesso!', {
                icon: '🔒',
                duration: 3000,
            });
            navigate('/');
        },
        onError: err => {
            toast.error(`Erro: ${err.message}`, {
                icon: '❌',
                duration: 5000,
            });
        },
    });
    
    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
    
    const validate = () => {
        const newErrors = {};
        if (form.password.length < 6)
            newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
        if (form.password !== form.confirm)
            newErrors.confirm = 'As senhas não coincidem';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = e => {
        e.preventDefault();
        if (validate()) updateMutation.mutate(form.password);
    };
    
    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">Definir nova senha</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Nova senha */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Nova senha
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    value={form.password}
                                    onChange={handleChange} />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                            </div>
                            {/* Confirmar */}
                            <div className="mb-3">
                                <label htmlFor="confirm" className="form-label">
                                    Confirmar senha
                                </label>
                                <input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
                                    value={form.confirm}
                                    onChange={handleChange} />
                                {errors.confirm && (
                                    <div className="invalid-feedback">{errors.confirm}</div>
                                )}
                            </div>
                            {/* Ações */}
                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Salvando…
                                        </>
                                    ) : (
                                        'Salvar senha'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/login')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                        <div className="text-center mt-3">
                            <Link to="/login">Voltar ao login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
```

## 3. Criando Rotas Protegidas

Agora, vamos criar componentes para proteger rotas que devem ser acessadas apenas por usuários autenticados e, em alguns casos, apenas por administradores.

### 3.1. Rota Protegida para Usuários Autenticados

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Mostrar um indicador de carregamento enquanto verifica o perfil
    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

### 3.2. Rota Protegida para Administradores

```jsx
// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    
    // Mostrar um indicador de carregamento enquanto verifica o perfil
    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }
    
    if (!user) return <Navigate to="/login" replace />;
    return isAdmin ? children : <Navigate to="/" replace />;
};

export default AdminRoute;
```

### 3.3. Atualizando as Rotas na Aplicação

Agora, vamos atualizar o arquivo App.jsx para incluir as novas rotas protegidas:

```jsx
// src/pages/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Footer from "@components/Footer";
import Header from "@components/Header";
import HomePage from '@pages/HomePage';
import ProductsPage from '@pages/ProductsPage';
import AdminCreateProductPage from '@pages/admin/AdminCreateProductPage';
import AdminUsersPage from '@pages/admin/AdminUsersPage';
import AdminRoute from '@components/AdminRoute';
import ProtectedRoute from '@components/ProtectedRoute';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import ProfilePage from '@pages/auth/ProfilePage';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import UpdatePasswordPage from '@pages/auth/UpdatePasswordPage';
import AdminProductsPage from '@pages/admin/AdminProductsPage';

function App() {
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Função para adicionar ao carrinho
  const handleAddToCart = (product) => {
    setCartItemCount(prevCount => prevCount + 1);
    // Mostrar notificação
    toast.success(`${product.title} adicionado ao carrinho!`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header cartCount={cartItemCount} />
        <main className="container my-4 flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={<HomePage onAddToCart={handleAddToCart} />} />
            <Route
              path="/login"
              element={<LoginPage />} />
            <Route
              path="/register"
              element={<RegisterPage />} />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />} />
            <Route
              path="/update-password"
              element={<UpdatePasswordPage />} />
            <Route
              path="/products"
              element={<ProductsPage onAddToCart={handleAddToCart} />} />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProductsPage />
                </AdminRoute>
              } />
            <Route
              path="/admin/products/new"
              element={
                <AdminRoute>
                  <AdminCreateProductPage />
                </AdminRoute>
              } />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <AdminCreateProductPage />
                </AdminRoute>
              } />
            <Route            
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              } />
          </Routes>
        </main>
        <Footer />

        {/* Componente Toaster para mostrar notificações */}
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
```

## 4. Desenvolvendo o Painel Administrativo

Agora, vamos criar o painel administrativo para gerenciar produtos e usuários.

### 4.1. Página de Gerenciamento de Produtos

```jsx
// src/pages/admin/AdminProductsPage.jsx
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '@services/productService';
import { formatPrice } from '@assets/js/util.js';
import Pagination from '@components/Pagination';

const PRODUCTS_PER_PAGE = 8;

const AdminProductsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Lista de produtos
    const {
        data,
        isLoading: loadingProducts,
        isError,
        error,
    } = useQuery({
        queryKey: ['products', currentPage],
        queryFn: () => productService.getProductsByPage(currentPage, PRODUCTS_PER_PAGE),
        keepPreviousData: true,
    });    

    // Manipulador para mudança de página
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Rolar para o topo da página
        window.scrollTo(0, 0);
    };

    // Mutação para excluir produto
    const deleteMutation = useMutation({
        mutationFn: productService.deleteProduct,
        onSuccess: () => {
            toast.success('Produto excluído', { icon: '🗑️' });
            queryClient.invalidateQueries(['products']);
        },
        onError: (err) => toast.error(`Erro: ${err.message}`, { icon: '❌' }),
    });

    // Função para excluir produto
    const handleDelete = (id) => {
        if (window.confirm('Excluir produto? Esta ação é irreversível.')) {
            deleteMutation.mutate(id);
        }
    };

    // Função para editar produto
    const handleEdit = (product) => {
        navigate(`/admin/products/edit/${product.id}`, { state: { product } });
    };

    if (isError) {
        return (
            <div className="alert alert-danger mt-4">
                Erro ao carregar produtos: {error.message}
            </div>
        );
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12 mb-3">
                <div className="card">
                    <div className="card-header text-bg-light d-flex justify-content-between align-items-center py-3">
                        <h2 className="mb-0">Produtos</h2>
                        <button
                            className="btn btn-success"
                            onClick={() => navigate('/admin/products/new')}>
                            Adicionar Produto
                        </button>
                    </div>
                    <div className="card-body p-0">
                        {loadingProducts ? (
                            <div className="text-center my-5">
                                <div className="spinner-border" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="one-line-cell">Foto</th>
                                            <th>Nome</th>
                                            <th>Preço</th>
                                            <th className="text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.products?.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4">
                                                    Nenhum produto encontrado.
                                                </td>
                                            </tr>
                                        )}
                                        {data?.products && data.products.map((product) => (
                                            <tr key={product.id}>
                                                <td className="one-line-cell px-3">
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.title}
                                                        className="rounded"
                                                        style={{ width: 'auto', height: '60px', }} />
                                                </td>
                                                <td>{product.title}</td>
                                                <td className="one-line-cell">{formatPrice(product.price)}</td>
                                                <td className="text-center one-line-cell px-3">
                                                    <button
                                                        className="btn btn-sm btn-outline-warning me-2"
                                                        onClick={() => handleEdit(product)}>
                                                        Alterar
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(product.id)}>
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {data?.totalPages > 1 && (
                <>
                    <div className="d-flex justify-content-center mb-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data?.totalPages}
                            onPageChange={handlePageChange} />
                    </div>
                    <p className="small text-center m-0">
                        Mostrando página {currentPage} de {data?.totalPages}
                    </p>
                </>
            )}
        </div>
    );
};

export default AdminProductsPage;
```

### 4.2. Página de Criação/Edição de Produtos

```jsx
// src/pages/admin/AdminCreateProductPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productService from '@services/productService';

const AdminCreateProductPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const queryClient = useQueryClient();
    const productToEdit = state?.product;
    const fileRef = useRef(null);
    const [product, setProduct] = useState({
        title: '',
        description: '',
        price: '',
        image_file: null,
        image_preview: '',
        image_url: ''
    });

    const [errors, setErrors] = useState({});

    // Se for um produto para editar, inicializa o estado com os dados do produto
    useEffect(() => {
        if (productToEdit) {
            setProduct({
                title: productToEdit.title,
                description: productToEdit.description,
                price: productToEdit.price,
                image_url: productToEdit.image_url
            });
        }
    }, [productToEdit]);

    const createProductMutation = useMutation({
        mutationFn: productService.createProduct,
        onSuccess: () => {
            toast.success('Produto criado com sucesso!', { icon: '✅' });
            navigate('/admin/products');
        },
        onError: (error) => {
            toast.error(`Erro ao criar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, ...fields }) => productService.updateProduct(id, fields),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']).then(() => {
                toast.success('Produto atualizado com sucesso!', { icon: '✅' });
                navigate('/admin/products');
            }).catch((error) => {
                toast.error(`Erro ao atualizar lista de produtos: ${error.message}`, { icon: '❌' });
            });
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileSelect = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProduct(p => ({ ...p, image_file: file, image_preview: URL.createObjectURL(file), image_url: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!product.title.trim()) {
            newErrors.title = 'O título é obrigatório';
        }
        if (!product.description.trim()) {
            newErrors.description = 'A descrição é obrigatória';
        }
        if (!product.price) {
            newErrors.price = 'O preço é obrigatório';
        } else if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
            newErrors.price = 'O preço deve ser um número positivo';
        }
        if (!product.image_file && !product.image_url) {
            newErrors.image_file = 'Selecione uma foto';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            let path = product.image_url;
            if (product.image_file) {
                path = await productService.uploadImage(product.image_file);
            }

            const payload = { ...product, image_url: path, price: parseFloat(product.price) };
            delete payload.image_file;
            delete payload.image_preview;

            if (productToEdit) {
                await updateProductMutation.mutateAsync({ id: productToEdit.id, ...payload });
            } else {
                await createProductMutation.mutateAsync(payload);
            }
        } catch (err) {
            toast.error(`Erro ao salvar: ${err.message}`, { icon: '❌' });
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">{productToEdit ? 'Alterar Produto' : 'Novo Produto'}</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Título</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    id="title"
                                    name="title"
                                    value={product.title}
                                    onChange={handleChange} autoFocus />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Descrição</label>
                                <textarea
                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={product.description}
                                    onChange={handleChange}></textarea>
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="price" className="form-label">Preço (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                    id="price"
                                    name="price"
                                    value={product.price}
                                    onChange={handleChange} />
                                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Foto do produto</label><br />
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                                    Selecionar arquivo
                                </button>
                                <input type="file" accept="image/*" className="d-none" ref={fileRef} onChange={handleFileSelect} />
                            </div>

                            {product.image_preview || product.image_url ? (
                                <div className="mb-3 text-start">
                                    <img
                                        src={product.image_preview || product.image_url}
                                        alt="Pré-visualização"
                                        className="img-thumbnail"
                                        style={{ maxHeight: 200 }}/>
                                </div>
                            ) : null}

                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Salvando...
                                        </>
                                    ) : 'Salvar Produto'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/admin/products')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateProductPage;
```

## 5. Melhorando a Interface do Usuário

Agora, vamos melhorar a interface do usuário, começando pelo cabeçalho para mostrar informações do usuário logado.

### 5.1. Atualização do Componente Header

```jsx
// src/components/Header.jsx
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import authService from '@services/authService';
import profileService from '@services/profileService';

const Header = ({ cartCount = 0 }) => {
  const { user, isAdmin } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/40?text=A');  

  // Buscar o perfil do usuário para obter o avatar
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          // Limpar o avatar ao trocar de usuário
          setAvatarUrl('https://placehold.co/40?text=A');
          
          const profile = await profileService.getProfile();
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
        }
      };
      fetchProfile();
    } else {
      // Resetar o avatar quando não houver usuário
      setAvatarUrl('https://placehold.co/40?text=A');
    }
  }, [user?.id]); // Dependência no ID do usuário para garantir atualização quando mudar

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <NavLink className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi-shop me-2 fs-3"></i>
            Loja Virtual
          </NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menuPrincipal">
            <div className="navbar-nav">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
              <NavLink className="nav-link" to="/products" end>
                Produtos
              </NavLink>
              <a className="nav-link" href="/about">Quem Somos</a>
              <a className="nav-link" href="/contact">Contato</a>
            </div>
            <div className="d-flex gap-3 ms-auto text-end align-items-center">
              <span className="navbar-text position-relative">
                <i className="bi-cart fs-3"></i>
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-50">{cartCount}</span>
              </span>
              {user ? (
                <div className="dropdown text-end d-flex align-items-center">
                  <a className="text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="rounded-circle me-2 border border-1 border-secondary border-opacity-75 p-1"
                      style={{ width: 32, height: 32, objectFit: 'cover' }}
                    />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {isAdmin && (
                      <>
                        <li><Link className="dropdown-item" to="/admin/users">Usuários</Link></li>
                        <li><Link className="dropdown-item" to="/admin/products">Produtos</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    <li><Link className="dropdown-item" to="/user/profile">Perfil</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button onClick={() => authService.logout()} className="dropdown-item">Sair</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline-light ms-3">Entrar</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header;
```

### 5.2. Atualização do Componente de Paginação

```jsx
// src/components/Pagination.jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Função para renderizar um número limitado de botões de página
    const getPageNumbers = () => {
        const PAGE_DELTA = 3; // Quantas páginas mostrar antes e depois da atual
        const pages = [];
        // Calcular o intervalo de páginas a mostrar
        const rangeStart = Math.max(1, currentPage - PAGE_DELTA);
        const rangeEnd = Math.min(totalPages, currentPage + PAGE_DELTA);
        // Adicionar elipses antes do intervalo, se necessário
        if (rangeStart > 1) {
            pages.push('...');
        }
        // Adicionar páginas do intervalo
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }
        // Adicionar elipses depois do intervalo, se necessário
        if (rangeEnd < totalPages) {
            pages.push('...');
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <ul className="pagination pagination-dark m-0">
            {/* Botão para voltar à primeira página */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}>
                    <i className="bi-chevron-double-left"></i>
                </button>
            </li>
            {/* Botão Anterior */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}>
                    <i className="bi bi-chevron-left"></i>
                </button>
            </li>
            {/* Números de página */}
            {getPageNumbers().map((pageNum, index) => (
                <li
                    key={index}
                    className={`page-item ${pageNum === currentPage ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => pageNum !== '...' && onPageChange(pageNum)}
                        disabled={pageNum === '...'}>
                        {pageNum}
                    </button>
                </li>
            ))}
            {/* Botão Próximo */}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}>
                    <i className="bi bi-chevron-right"></i>
                </button>
            </li>
            {/* Botão para ir à última página */}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}>
                    <i className="bi-chevron-double-right"></i>
                </button>
            </li>
        </ul>
    );
};

export default Pagination;
```

### 5.3. Atualização da Página de Produtos

```jsx
// src/pages/ProductsPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CardsGrid from "@components/CardsGrid";
import productService from '@services/productService';

const PRODUCTS_PER_PAGE = 8;

const ProductsPage = ({ onAddToCart }) => {
  // Estado para controlar a página atual
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar produtos usando React Query
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['products', currentPage],
    queryFn: () => productService.getProductsByPage(currentPage, PRODUCTS_PER_PAGE),
    keepPreviousData: true,
  });

  // Manipulador para mudança de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Rolar para o topo da página
    window.scrollTo(0, 0);
  };

  // Renderização condicional para estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando produtos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        Erro ao carregar produtos: {error.message}
      </div>
    );
  }

  // Extrair dados da resposta
  const { products, totalPages } = data;

  return (
    <div>
      {/* Grid de produtos */}
      <CardsGrid
        title="Todos os Produtos"
        items={products}
        cols={4}
        onAddToCart={onAddToCart}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange} />
    </div>
  );
};

export default ProductsPage;
```

### 5.4. Atualização do Componente CardsGrid

```jsx
// src/components/CardsGrid.jsx
import Card from "@components/Card";
import Pagination from "@components/Pagination";

const CardsGrid = ({ title, items, cols = 4, onAddToCart, currentPage, totalPages, handlePageChange }) => {
  const colClass = `row-cols-1 row-cols-md-${Math.max(1, Math.ceil(cols / 2))} row-cols-lg-${cols}`;
  return (
    <section>
      <div className="row justify-content-between align-items-center mb-3">
        <div className="col-12 col-md">
          <h2 className="text-center text-md-start">{title}</h2>
        </div>
        {totalPages > 1 && (
          <div className="col-12 col-md d-flex justify-content-center justify-content-md-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange} />
          </div>
        )}
      </div>
      <hr />
      <div className={`row ${colClass} g-3 align-items-stretch mb-3`}>
        {items.map((item) => (
          <Card
            key={item.id}
            image={item.image_url}
            title={item.title}
            description={item.description}
            price={item.price}
            link={`/item/${item.id}`}
            onAddToCartClick={() => onAddToCart(item)} />
        ))}
      </div>
      {totalPages > 1 && (
        <>
          <div className="d-flex justify-content-center mb-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange} />
          </div>
          <p className="small text-center m-0">Mostrando página {currentPage} de {totalPages}</p>
        </>
      )}
    </section>
  );
};

export default CardsGrid;
```

## 6. Gerenciamento de Usuários

Agora, vamos criar um serviço para gerenciar usuários e implementar a página de administração de usuários.

### 6.1. Serviço de Administração

```jsx
// src/services/adminService.js
import supabase from '@services/supabase';

const adminService = {
    async getUsersByPage(page = 1, limit = 12) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, error, count } = await supabase
            .from('profiles')
            .select('id, full_name, phone, is_admin, avatar_url', { count: 'exact' })
            .range(from, to)
            .order('full_name', { ascending: true });
        if (error) {
            console.error('Erro ao listar usuários:', error);
            throw error;
        }
        // Atualiza a URL do avatar diretamente com a URL pública
        for (const user of data) {
            if (user.avatar_url) {
                // Obtém a URL pública do avatar diretamente sem precisar de uma URL assinada
                user.avatar_url = supabase.storage.from('avatars').getPublicUrl(user.avatar_url).data.publicUrl;
            } else {
                user.avatar_url = 'https://placehold.co/40?text=A';  // Caso não tenha avatar, usa um placeholder
            }
        }
        return {
            profiles: data,
            total: count,
            totalPages: Math.ceil(count / limit)
        };
    },

    async setAdmin(id, makeAdmin) {
        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: makeAdmin })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar privilégio admin:', error);
            throw error;
        }
        return true;
    },

    async deleteUser(id) {
        const { error } = await supabase.rpc('delete_user', {
            user_id: id,
        });

        if (error) {
            console.error('Erro ao excluir usuário:', error);
            throw error;
        }
        return true;
    },
};

export default adminService;
```

### 6.2. Página de Administração de Usuários

```jsx
// src/pages/admin/AdminUsersPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import adminService from '@services/adminService';
import { useAuth } from '@contexts/AuthContext';
import Pagination from '@components/Pagination';

const USERS_PER_PAGE = 12;

const AdminUsersPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth(); // evita excluir/promover a si mesmo
    // lista de usuários
    const {
        data,
        isLoading: loadingUsers,
        isError,
        error,
    } = useQuery({
        queryKey: ['profiles', currentPage],
        queryFn: () => adminService.getUsersByPage(currentPage, USERS_PER_PAGE),
    });
    
    // mutação para promover/despromover usuários
    const promoteMutation = useMutation({
        mutationFn: ({ id, makeAdmin }) =>
            adminService.setAdmin(id, makeAdmin),
        onSuccess: (_, { makeAdmin }) => {
            toast.success(
                makeAdmin ? 'Usuário promovido a administrador.' : 'Usuário despromovido.',
                { icon: '✅' }
            );
            queryClient.invalidateQueries(['profiles']);
        },
        onError: err => toast.error(`Erro: ${err.message}`, { icon: '❌' }),
    });

    // Manipulador para mudança de página
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Rolar para o topo da página
        window.scrollTo(0, 0);
    };

    // mutação para excluir usuários
    const deleteMutation = useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => {
            toast.success('Usuário excluído', { icon: '🗑️' });
            queryClient.invalidateQueries(['profiles']);
        },
        onError: err => toast.error(`Erro: ${err.message}`, { icon: '❌' }),
    });
    // busca local
    const [search, setSearch] = useState('');
    // Verificar se data existe antes de filtrar
    const filteredUsers = data?.profiles ? data.profiles.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase())
    ) : [];
    // user interface
    if (isError) {
        return (
            <div className="alert alert-danger mt-4">
                Erro ao carregar usuários: {error.message}
            </div>
        );
    }
    // se deu tudo certo, renderiza a tabela de usuários
    return (
        <div className="row justify-content-center">
            <div className="col-12">
                <div className="card">
                    <div className="card-header text-bg-light d-flex justify-content-between align-items-center py-3">
                        <h2 className="mb-0">Usuários</h2>
                        <input
                            type="search"
                            className="form-control w-auto"
                            placeholder="Pesquisar…"
                            value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>

                    <div className="card-body p-0">
                        {loadingUsers ? (
                            <div className="text-center my-5">
                                <div className="spinner-border" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="one-line-cell px-3">Avatar</th>
                                            <th>Nome</th>
                                            <th className="text-center">Telefone</th>
                                            <th className="text-center">Perfil</th>
                                            <th className="text-center" style={{ width: 220 }}>
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4">
                                                    Nenhum usuário encontrado.
                                                </td>
                                            </tr>
                                        )}

                                        {filteredUsers.map(u => {
                                            const isSelf = u.id === currentUser?.id;
                                            const busyRow =
                                                (promoteMutation.isPending &&
                                                    promoteMutation.variables?.id === u.id) ||
                                                (deleteMutation.isPending && deleteMutation.variables === u.id);

                                            return (
                                                <tr key={u.id}>
                                                    <td className="one-line-cell px-3">
                                                        <img
                                                            src={u.avatar_url}
                                                            alt="avatar"
                                                            className="rounded-circle"
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                objectFit: 'cover',
                                                            }} />
                                                    </td>
                                                    <td>{u.full_name}</td>
                                                    <td className="one-line-cell px-3">{u.phone || '—'}</td>
                                                    <td className="one-line-cell px-3">
                                                        <span
                                                            className={`badge ${u.is_admin
                                                                ? 'text-bg-primary'
                                                                : 'text-bg-secondary'
                                                                }`}>
                                                            {u.is_admin ? 'Admin' : 'Usuário'}
                                                        </span>
                                                    </td>
                                                    <td className="one-line-cell px-3">
                                                        {busyRow ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"></span>
                                                        ) : (
                                                            <>
                                                                {!isSelf && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-warning me-2"
                                                                        onClick={() =>
                                                                            promoteMutation.mutate({
                                                                                id: u.id,
                                                                                makeAdmin: !u.is_admin,
                                                                            })
                                                                        }>
                                                                        {u.is_admin
                                                                            ? 'Remover admin'
                                                                            : 'Tornar admin'}
                                                                    </button>
                                                                )}
                                                                {!isSelf && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => {
                                                                            if (
                                                                                window.confirm(
                                                                                    'Excluir usuário? Esta ação é irreversível.'
                                                                                )
                                                                            ) {
                                                                                deleteMutation.mutate(u.id);
                                                                            }
                                                                        }}>
                                                                        Excluir
                                                                    </button>
                                                                )}
                                                                {isSelf && (
                                                                    <span className="text-muted">(você)</span>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {data?.totalPages > 1 && (
                <>
                    <div className="d-flex justify-content-center mb-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data?.totalPages}
                            onPageChange={handlePageChange} />
                    </div>
                    <p className="small text-center m-0">
                        Mostrando página {currentPage} de {data?.totalPages}
                    </p>
                </>
            )}
        </div>
    );
};

export default AdminUsersPage;
```

## 7. Implementação do Perfil de Usuário

Vamos implementar o serviço e a página de perfil do usuário.

### 7.1. Serviço de Perfil

```jsx
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
```

### 7.2. Página de Perfil do Usuário

```jsx
// src/pages/auth/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import profileService from '@services/profileService';
import { useAuth } from '@contexts/AuthContext';

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

const ProfilePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileRef = useRef(null);
    const { user } = useAuth();
    // obtém dados do perfil do usuário logado
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: profileService.getProfile,
        // Não executar a consulta se não houver usuário logado
        enabled: !!user,
        // Não usar cache entre sessões de usuários diferentes
        staleTime: 0
    });
    // estado inicial do formulário
    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        avatar_file: null, // File | null
        avatar_preview: 'https://placehold.co/40?text=Avatar', // data URL | bucket path
    });
    const [errors, setErrors] = useState({});
    // sincroniza os dados do perfil com o estado do formulário
    useEffect(() => {
        if (!profile) return;
        setForm(f => ({
            ...f,
            full_name: profile.full_name ?? '',
            phone: profile.phone ?? '',
            avatar_preview: profile.avatar_url || 'https://placehold.co/150?text=Avatar',    // já vem string
        }));
    }, [profile]);
    // mutation para atualizar o perfil do usuário
    const updateMutation = useMutation({
        mutationFn: profileService.updateProfile,
        onSuccess: () => {
            toast.success('Perfil atualizado!', { icon: '✅' });
            queryClient.invalidateQueries(['profile']);
        },
        onError: err =>
            toast.error(`Erro: ${err.message}`, { icon: '❌' }),
    });
    // helpers
    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
    // função para lidar com a seleção de arquivos
    const handleFileSelect = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setForm(prev => ({ ...prev, avatar_file: file }));
        // preview
        const reader = new FileReader();
        reader.onload = ev =>
            setForm(prev => ({ ...prev, avatar_preview: ev.target.result }));
        reader.readAsDataURL(file);
    };
    // validação básica do formulário
    const validate = () => {
        const newErrors = {};
        if (!form.full_name.trim())
            newErrors.full_name = 'O nome é obrigatório';
        if (form.phone && !phoneRegex.test(form.phone))
            newErrors.phone = 'Telefone inválido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // submit
    const handleSubmit = e => {
        e.preventDefault();
        if (!validate()) return;
        updateMutation.mutate({
            full_name: form.full_name.trim(),
            phone: form.phone,
            file: form.avatar_file,
        });
    };
    // user interface
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border" role="status"></div>
            </div>
        );
    }
    // se usuário não estiver logado, retorna vazio
    if (!user) {
        return null; // já existe redireção em nível de rota protegida
    }
    // se estiver tudo certo, retorna o formulário
    return (
        <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
                <div className="card">
                    <div className="card-header text-bg-light py-3">
                        <h2 className="mb-0">Meu perfil</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            {/* avatar */}
                            <div className="mb-4 text-center">
                                <img
                                    src={
                                        form.avatar_preview ||
                                        'https://placehold.co/150?text=Avatar&font=roboto'
                                    }
                                    alt="Avatar"
                                    className="rounded-circle mb-3"
                                    style={{ width: 120, height: 120, objectFit: 'cover' }} />
                                <br />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => fileRef.current?.click()}>
                                    Alterar foto
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="d-none"
                                    ref={fileRef}
                                    onChange={handleFileSelect} />
                            </div>
                            {/* nome completo */}
                            <div className="mb-3">
                                <label htmlFor="full_name" className="form-label">
                                    Nome completo
                                </label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    className={`form-control ${errors.full_name ? 'is-invalid' : ''
                                        }`}
                                    value={form.full_name}
                                    onChange={handleChange} />
                                {errors.full_name && (
                                    <div className="invalid-feedback">{errors.full_name}</div>
                                )}
                            </div>
                            {/* telefone */}
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="(99) 99999-9999"
                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                    value={form.phone}
                                    onChange={e => {
                                        // Formatar o telefone manualmente
                                        const value = e.target.value.replace(/\D/g, '');
                                        let formattedValue = '';

                                        if (value.length <= 2) {
                                            formattedValue = value.length ? `(${value}` : '';
                                        } else if (value.length <= 7) {
                                            formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                                        } else {
                                            formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                                        }

                                        setForm(prev => ({ ...prev, phone: formattedValue }));
                                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                                    }}
                                />
                                {errors.phone && (
                                    <div className="invalid-feedback">{errors.phone}</div>
                                )}
                            </div>
                            {/* ações */}
                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Salvando…
                                        </>
                                    ) : (
                                        'Salvar alterações'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate(-1)}>
                                    Voltar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
```

## 8. Considerações Finais

Nesta aula, transformamos nossa aplicação simples de listagem de produtos em um e-commerce completo com sistema de autenticação, controle de acesso, área administrativa e gerenciamento de usuários. 

Conseguimos implementar:

1. ✅ **Sistema de Autenticação:** Login, registro, recuperação de senha, etc.
2. ✅ **Controle de Acesso:** Rotas protegidas para diferentes níveis de usuário.
3. ✅ **Área Administrativa:** CRUD de produtos e gerenciamento de usuários.
4. ✅ **Perfil de Usuário:** Upload de avatar, edição de informações pessoais.
5. ✅ **Melhorias na UI/UX:** Interface responsiva e feedback visual.

### Próximos passos

Para continuar evoluindo a aplicação, você pode implementar:

- Carrinho de compras funcional com persistência.
- Histórico de pedidos.
- Sistema de favoritos.
- Avaliações de produtos.
- Filtros e busca avançada.
- Checkout e integração com meios de pagamento.

### Dicas para o desenvolvimento

1. **Organizacional:** Mantenha uma estrutura clara de diretórios e componentes.
2. **Reutilização:** Crie componentes genéricos e reutilizáveis.
3. **Segurança:** Implemente validações tanto no frontend quanto no backend.
4. **Performance:** Use corretamente o React Query para otimizar chamadas à API.
5. **UI/UX:** Priorize a experiência do usuário com feedbacks visuais e usabilidade.

Com isso, concluímos nossa aula sobre implementação de autenticação e administração em nossa aplicação React. Continue praticando e melhorando o projeto!