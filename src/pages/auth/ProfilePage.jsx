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