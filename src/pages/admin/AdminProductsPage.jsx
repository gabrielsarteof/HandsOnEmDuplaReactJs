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

    // Consulta de produtos com paginação e relação de categoria
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

    // Navegação de página
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    // Mutação para exclusão de produto
    const deleteMutation = useMutation({
        mutationFn: productService.deleteProduct,
        onSuccess: () => {
            toast.success('Produto excluído', { icon: '🗑️' });
            queryClient.invalidateQueries(['products']);
        },
        onError: (err) => toast.error(`Erro: ${err.message}`, { icon: '❌' }),
    });

    const handleDelete = (id) => {
        if (window.confirm('Excluir produto? Esta ação é irreversível.')) {
            deleteMutation.mutate(id);
        }
    };

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
                            onClick={() => navigate('/admin/products/new')}
                        >
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
                                            <th>Categoria</th>
                                            <th className="text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.products?.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4">
                                                    Nenhum produto encontrado.
                                                </td>
                                            </tr>
                                        )}
                                        {data?.products?.map((product) => (
                                            <tr key={product.id}>
                                                <td className="one-line-cell px-3">
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.title}
                                                        className="rounded"
                                                        style={{ width: 'auto', height: '60px' }}
                                                    />
                                                </td>
                                                <td>{product.title}</td>
                                                <td className="one-line-cell">{formatPrice(product.price)}</td>
                                                <td>{product.category?.name || '—'}</td>
                                                <td className="text-center one-line-cell px-3">
                                                    <button
                                                        className="btn btn-sm btn-outline-warning me-2"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        Alterar
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
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
                            totalPages={data.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                    <p className="small text-center m-0">
                        Mostrando página {currentPage} de {data.totalPages}
                    </p>
                </>
            )}
        </div>
    );
};

export default AdminProductsPage;
