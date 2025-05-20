import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import productService from '@services/productService';
import { toast } from 'react-hot-toast';

const CreateProductPage = () => {
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''
    });

    const [errors, setErrors] = useState({});

    const createProductMutation = useMutation({
        mutationFn: productService.createProduct,
        onSuccess: () => {
            toast.success('Produto criado com sucesso!', {
                duration: 2000,
                icon: '✅',
            });
            navigate('/produtos');
        },
        onError: (error) => {
            toast.error(`Erro ao criar produto: ${error.message}`, {
                duration: 3000,
                icon: '❌',
            });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
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
        if (!product.image_url.trim()) {
            newErrors.image_url = 'A URL da imagem é obrigatória';
        } else if (!product.image_url.match(/^https?:\/\/.+/i)) {
            newErrors.image_url = 'URL da imagem inválida';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const productToSave = {
                ...product,
                price: parseFloat(product.price)
            };
            createProductMutation.mutate(productToSave);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header text-bg-dark">
                        <h2 className="mb-0">Cadastrar Novo Produto</h2>
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
                                    onChange={handleChange}
                                />
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
                                    onChange={handleChange}
                                ></textarea>
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
                                    onChange={handleChange}
                                />
                                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="image" className="form-label">URL da Imagem</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.image_url ? 'is-invalid' : ''}`}
                                    id="image_url"
                                    name="image_url"
                                    value={product.image_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                                {errors.image_url && <div className="invalid-feedback">{errors.image_url}</div>}
                            </div>
                            {product.image_url && (
                                <div className="mb-3 text-center">
                                    <p>Previsualização:</p>
                                    <img
                                        src={product.image_url}
                                        alt="Previsualização"
                                        className="img-thumbnail"
                                        style={{ maxHeight: '200px' }}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Inválida';
                                        }}
                                    />
                                </div>
                            )}
                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={createProductMutation.isLoading}>
                                    {createProductMutation.isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Salvando...
                                        </>
                                    ) : 'Cadastrar Produto'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/produtos')}>
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

export default CreateProductPage;