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