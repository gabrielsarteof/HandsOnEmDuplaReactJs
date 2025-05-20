// src/components/CardsGrid.jsx
import Card from "@components/Card";
import Pagination from "@components/Pagination";

const CardsGrid = ({ title, items, cols = 4, onAddToCart, currentPage, totalPages, handlePageChange }) => {
  const colClass = `row-cols-1 row-cols-md-${Math.max(1, Math.ceil(cols / 2))} row-cols-lg-${cols}`;
  return (
    <section>
      <div className="row justify-content-between align-items-center mb-3">
        <div className="col-12 col-md">
          <h2 className="text-center text-md-start">{title}</h2>
        </div>
        {totalPages > 1 && (
          <div className="col-12 col-md d-flex justify-content-center justify-content-md-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange} />
          </div>
        )}
      </div>
      <hr />
      <div className={`row ${colClass} g-3 align-items-stretch mb-3`}>
        {items.map((item) => (
          <Card
            key={item.id}
            image={item.image_url}
            title={item.title}
            description={item.description}
            price={item.price}
            link={`/item/${item.id}`}
            onAddToCartClick={() => onAddToCart(item)} />
        ))}
      </div>
      {totalPages > 1 && (
        <>
          <div className="d-flex justify-content-center mb-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange} />
          </div>
          <p className="small text-center m-0">Mostrando página {currentPage} de {totalPages}</p>
        </>
      )}
    </section>
  );
};

export default CardsGrid;