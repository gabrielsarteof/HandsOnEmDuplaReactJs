import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import categoryService from '@services/categoryService';

const AdminCreateCategoryPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const categoryToEdit = state?.category;

  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
    }
  }, [categoryToEdit]);

  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      toast.success('Categoria criada com sucesso!', { icon: '✅' });
      navigate('/admin/categories');
    },
    onError: (err) => toast.error(`Erro ao criar categoria: ${err.message}`, { icon: '❌' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => categoryService.updateCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']).then(() => {
        toast.success('Categoria atualizada com sucesso!', { icon: '✅' });
        navigate('/admin/categories');
      });
    },
    onError: (err) => toast.error(`Erro ao atualizar categoria: ${err.message}`, { icon: '❌' }),
  });

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'O nome da categoria é obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (categoryToEdit) {
      updateMutation.mutate({ id: categoryToEdit.id, name: name.trim() });
    } else {
      createMutation.mutate({ name: name.trim() });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header text-bg-light">
            <h2 className="mb-0">
              {categoryToEdit ? 'Alterar Categoria' : 'Nova Categoria'}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  autoFocus
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-success me-2"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {(createMutation.isLoading || updateMutation.isLoading) ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Salvando...
                    </>
                  ) : categoryToEdit ? 'Salvar Alterações' : 'Salvar Categoria'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/categories')}
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

export default AdminCreateCategoryPage;