// src/components/Pagination.jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Função para renderizar um número limitado de botões de página
    const getPageNumbers = () => {
        const PAGE_DELTA = 3; // Quantas páginas mostrar antes e depois da atual
        const pages = [];
        // Calcular o intervalo de páginas a mostrar
        const rangeStart = Math.max(1, currentPage - PAGE_DELTA);
        const rangeEnd = Math.min(totalPages, currentPage + PAGE_DELTA);
        // Adicionar elipses antes do intervalo, se necessário
        if (rangeStart > 1) {
            pages.push('...');
        }
        // Adicionar páginas do intervalo
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }
        // Adicionar elipses depois do intervalo, se necessário
        if (rangeEnd < totalPages) {
            pages.push('...');
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <ul className="pagination pagination-dark m-0">
            {/* Botão para voltar à primeira página */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}>
                    <i className="bi-chevron-double-left"></i>
                </button>
            </li>
            {/* Botão Anterior */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}>
                    <i className="bi bi-chevron-left"></i>
                </button>
            </li>
            {/* Números de página */}
            {getPageNumbers().map((pageNum, index) => (
                <li
                    key={index}
                    className={`page-item ${pageNum === currentPage ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => pageNum !== '...' && onPageChange(pageNum)}
                        disabled={pageNum === '...'}>
                        {pageNum}
                    </button>
                </li>
            ))}
            {/* Botão Próximo */}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}>
                    <i className="bi bi-chevron-right"></i>
                </button>
            </li>
            {/* Botão para ir à última página */}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}>
                    <i className="bi-chevron-double-right"></i>
                </button>
            </li>
        </ul>
    );
};

export default Pagination;