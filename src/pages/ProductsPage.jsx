// src/pages/ProductsPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CardsGrid from "@components/CardsGrid";
import productService from '@services/productService';

const PRODUCTS_PER_PAGE = 8;

const ProductsPage = ({ onAddToCart }) => {
  // Estado para controlar a página atual
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar produtos usando React Query
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['products', currentPage],
    queryFn: () => productService.getProductsByPage(currentPage, PRODUCTS_PER_PAGE),
    keepPreviousData: true,
  });

  // Manipulador para mudança de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Rolar para o topo da página
    window.scrollTo(0, 0);
  };

  // Renderização condicional para estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando produtos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        Erro ao carregar produtos: {error.message}
      </div>
    );
  }

  // Extrair dados da resposta
  const { products, totalPages } = data;

  return (
    <div>
      {/* Grid de produtos */}
      <CardsGrid
        title="Todos os Produtos"
        items={products}
        cols={4}
        onAddToCart={onAddToCart}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange} />
    </div>
  );
};

export default ProductsPage;