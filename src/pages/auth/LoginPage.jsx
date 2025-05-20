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