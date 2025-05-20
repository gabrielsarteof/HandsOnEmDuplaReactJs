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