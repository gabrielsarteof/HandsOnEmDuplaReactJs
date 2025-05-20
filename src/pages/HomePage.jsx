import { useQuery } from '@tanstack/react-query';
import CardsGrid from "@components/CardsGrid";
import productService from '@services/productService';

const HomePage = ({ onAddToCart }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getProductsByPage(1, 3),
  });

  return (
    <div>
      <h1>Bem-vindo à Nossa Loja!</h1>
      <p>Confira nossos produtos em destaque:</p>
      
      {isLoading ? (
        <p>Carregando destaques...</p>
      ) : isError ? (
        <p>Erro ao carregar destaques.</p>
      ) : (
        <CardsGrid
          title="Destaques"
          items={data.products}
          cols={3}
          onAddToCart={onAddToCart}
        />
      )}
      <div className="mt-4 text-center">
        <a href="/produtos" className="btn btn-primary">Ver todos os produtos</a>
      </div>
    </div>
  );
};

export default HomePage;