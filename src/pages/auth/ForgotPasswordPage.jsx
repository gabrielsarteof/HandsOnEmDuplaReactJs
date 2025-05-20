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