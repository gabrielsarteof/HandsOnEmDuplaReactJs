// src/pages/admin/AdminCreateProductPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productService from '@services/productService';
import categoryService from '@services/categoryService';

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
    category_id: '',
    image_file: null,
    image_preview: '',
    image_url: ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  // Carrega categorias para o dropdown
  useEffect(() => {
    categoryService.getAllCategories()
      .then(setCategories)
      .catch(err => console.error('Erro ao buscar categorias:', err));
  }, []);

  // Se for editar, pré-preenche campos (inclusive category_id)
  useEffect(() => {
    if (productToEdit) {
      setProduct({
        title: productToEdit.title,
        description: productToEdit.description,
        price: productToEdit.price,
        category_id: productToEdit.category_id || '',
        image_url: productToEdit.image_url,
        image_file: null,
        image_preview: ''
      });
    }
  }, [productToEdit]);

  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      toast.success('Produto criado com sucesso!', { icon: '✅' });
      navigate('/admin/products');
    },
    onError: (err) => {
      toast.error(`Erro ao criar produto: ${err.message}`, { icon: '❌' });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...fields }) => productService.updateProduct(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
        .then(() => {
          toast.success('Produto atualizado com sucesso!', { icon: '✅' });
          navigate('/admin/products');
        })
        .catch(err => {
          toast.error(`Erro ao atualizar lista de produtos: ${err.message}`, { icon: '❌' });
        });
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar produto: ${err.message}`, { icon: '❌' });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProduct(p => ({
      ...p,
      image_file: file,
      image_preview: URL.createObjectURL(file),
      image_url: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!product.title.trim()) newErrors.title = 'O título é obrigatório';
    if (!product.description.trim()) newErrors.description = 'A descrição é obrigatória';
    if (!product.price || Number(product.price) <= 0) {
      newErrors.price = 'O preço deve ser um número positivo';
    }
    if (!product.category_id) newErrors.category_id = 'Selecione uma categoria';
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

      const payload = {
        title: product.title.trim(),
        description: product.description.trim(),
        price: parseFloat(product.price),
        category_id: product.category_id,
        image_url: path
      };

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
            <h2 className="mb-0">
              {productToEdit ? 'Alterar Produto' : 'Novo Produto'}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Título */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Título</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  value={product.title}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Descrição */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  value={product.description}
                  onChange={handleChange}
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              {/* Preço */}
              <div className="mb-3">
                <label htmlFor="price" className="form-label">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  value={product.price}
                  onChange={handleChange}
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>

              {/* Categoria */}
              <div className="mb-3">
                <label htmlFor="category_id" className="form-label">Categoria</label>
                <select
                  id="category_id"
                  name="category_id"
                  className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                  value={product.category_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
              </div>

              {/* Foto */}
              <div className="mb-3">
                <label className="form-label">Foto do produto</label><br />
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => fileRef.current?.click()}
                >
                  Selecionar arquivo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileSelect}
                />
                {errors.image_file && <div className="invalid-feedback d-block">{errors.image_file}</div>}
              </div>

              {/* Preview */}
              {(product.image_preview || product.image_url) && (
                <div className="mb-3 text-start">
                  <img
                    src={product.image_preview || product.image_url}
                    alt="Pré-visualização"
                    className="img-thumbnail"
                    style={{ maxHeight: 200 }}
                  />
                </div>
              )}

              {/* Ações */}
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-success me-2"
                  disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                >
                  {(createProductMutation.isLoading || updateProductMutation.isLoading)
                    ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Salvando...
                      </>
                    )
                    : (productToEdit ? 'Salvar Alterações' : 'Salvar Produto')
                  }
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/products')}
                >
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
