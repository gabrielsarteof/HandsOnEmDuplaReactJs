import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import carrierService from '@services/carrierService';

const AdminCreateCarrierPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const carrierToEdit = state?.carrier;

  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (carrierToEdit) {
      setName(carrierToEdit.name || '');
    }
  }, [carrierToEdit]);

  const createMutation = useMutation({
    mutationFn: carrierService.createCarrier,
    onSuccess: () => {
      toast.success('Fornecedor criado com sucesso!', { icon: '✅' });
      navigate('/admin/carriers');
    },
    onError: (err) => toast.error(`Erro ao criar fornecedor: ${err.message}`, { icon: '❌' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => carrierService.updateCarrier(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['carriers']).then(() => {
        toast.success('Fornecedor atualizada com sucesso!', { icon: '✅' });
        navigate('/admin/carriers');
      });
    },
    onError: (err) => toast.error(`Erro ao atualizar fornecedor: ${err.message}`, { icon: '❌' }),
  });

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'O nome do fornecedor é obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (carrierToEdit) {
      updateMutation.mutate({ id: carrierToEdit.id, name: name.trim() });
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
              {carrierToEdit ? 'Alterar Fornecedor' : 'Novo Fornecedor'}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nome da Fornecedor
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
                  ) : carrierToEdit ? 'Salvar Alterações' : 'Salvar Fornecedor'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/carriers')}
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

export default AdminCreateCarrierPage;