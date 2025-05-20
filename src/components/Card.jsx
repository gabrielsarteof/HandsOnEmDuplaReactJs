const Card = ({ image, title, description, price, onAddToCartClick }) => {
  // Função para formatar o preço em formato de moeda brasileira
  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="col">
      <div className="card h-100">
        {/* Área da imagem com altura fixa */}
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <img 
            src={image} 
            className="card-img-top" 
            alt={title}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/300x200?text=Imagem+Indisponível';
              //TODO: resolver para mostrar imagem local
              //e.target.src = require('@assets/img/NoImage300x200.svg').default;
            }}
          />
        </div>
        
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{title}</h5>
          <p className="card-text flex-grow-1">{description}</p>
          <div className="mt-auto">
            <p className="card-text fw-bold text-primary fs-5 mb-2">
              {formatPrice(price)}
            </p>
          </div>
        </div>
        
        <div className="card-footer">
          <button 
            onClick={onAddToCartClick} 
            className="btn btn-success w-100"
          >
            <i className="bi-cart-plus me-2"></i>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;