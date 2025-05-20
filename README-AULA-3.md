# ReactJs :: Aula 03

**Prof. Ricardo Maroquio**

Bem-vindo à Aula 03 do nosso curso de ReactJS! Nas aulas anteriores, construímos uma aplicação de listagem de produtos, aprendendo sobre componentes funcionais, props, estado, eventos e roteamento com React Router.

Nesta aula, vamos elevar nossa aplicação para um novo patamar, conectando-a com um banco de dados real usando o Supabase como backend. Focaremos em:

1. **Integração com Supabase:** Configurar e conectar nossa aplicação React a um banco de dados PostgreSQL hospedado no Supabase.

2. **Operações CRUD:** Implementar Create, Read, Update, Delete de produtos através de uma API RESTful.

3. **Paginação:** Configurar o backend e a interface para exibir produtos de forma paginada.

4. **Formulário de Cadastro:** Criar uma página dedicada ao cadastro de novos produtos.

Vamos continuar evoluindo nosso estudo de caso da loja de produtos, transformando-a de uma aplicação com dados estáticos para uma aplicação completa conectada a um banco de dados.

## 1. Configurando o Supabase

O Supabase é uma alternativa open source ao Firebase, fornecendo um conjunto de ferramentas para construir aplicações com PostgreSQL. Ele oferece autenticação, armazenamento, e uma API RESTful automática para interagir com seu banco de dados.

**Configuração da Conta e Projeto:**

1. **Crie uma conta no Supabase:**
   
   Acesse [supabase.com](https://supabase.com/) e clique em "Start your project" para criar uma conta gratuita.

2. **Crie um novo projeto:**
   
   Depois de fazer login, clique em "New Project", preencha os detalhes necessários:
   - Nome do projeto: `react-shop`
   - Defina uma senha forte para o banco de dados
   - Escolha a região mais próxima a você
   - Clique em "Create new project"

3. **Obtenha as credenciais de API:**
   
   Após a criação do projeto, vá para Configurações > API. Você precisará de:
   - URL: `https://[seu-id-projeto].supabase.co`
   - Chave anônima (public): começa com `eyJh...`

**Configuração da Tabela de Produtos:**

1. **Crie a tabela:**
   
   No painel do Supabase, vá para "Table Editor" e clique em "New Table":
   
   - Nome da tabela: `products`
   - Colunas:
     - `id`: integer (configurado como Primary Key, Identity)
     - `title`: text (NOT NULL)
     - `description`: text
     - `price`: numeric (NOT NULL)
     - `image`: text (URL da imagem)
     - `created_at`: timestamp with time zone (Default: `now()`)

2. **Habilite o Row Level Security (RLS):**
   
   Por padrão, o Supabase restringe o acesso às tabelas. Para nossa aplicação de demonstração, vamos criar políticas que permitam operações públicas:
   
   - Vá para "Authentication" > "Policies"
   - Selecione a tabela `products`
   - Clique em "New Policy" e selecione a template "Enable read access to everyone"
   - Repita para criar políticas para Insert, Update e Delete, permitindo acesso anônimo para todas as operações

## 2. Populando o Banco de Dados

Para ter dados suficientes para testar nossa paginação, vamos adicionar 24 produtos fictícios ao banco de dados. Podemos fazer isso de duas maneiras:

### Opção 1: Usando o SQL Editor do Supabase

1. No painel do Supabase, vá para "SQL Editor" e clique em "New Query"

2. Cole o seguinte SQL e execute:

```sql
INSERT INTO products (title, description, price, image)
VALUES
  ('Smartphone XS Pro', 'Smartphone de última geração com câmera de 108MP e tela AMOLED de 6.7".', 2499.90, 'https://picsum.photos/300/200?random=1'),
  ('Notebook UltraSlim', 'Notebook leve e potente com processador de última geração e 16GB de RAM.', 4299.90, 'https://picsum.photos/300/200?random=2'),
  ('Smart TV 55"', 'Smart TV 4K com HDR e sistema operacional Android TV.', 2799.90, 'https://picsum.photos/300/200?random=3'),
  ('Fone de Ouvido Bluetooth', 'Fone de ouvido sem fio com cancelamento de ruído e 30h de bateria.', 499.90, 'https://picsum.photos/300/200?random=4'),
  ('Câmera DSLR Profissional', 'Câmera profissional com sensor full frame e gravação em 4K.', 5999.90, 'https://picsum.photos/300/200?random=5'),
  ('Relógio Smartwatch', 'Smartwatch com monitor cardíaco, GPS e resistência à água.', 899.90, 'https://picsum.photos/300/200?random=6'),
  ('Console de Videogame', 'Console de última geração com suporte a 4K e 1TB de armazenamento.', 3999.90, 'https://picsum.photos/300/200?random=7'),
  ('Tablet Premium', 'Tablet com tela retina de 11", chip avançado e compatível com caneta digital.', 3499.90, 'https://picsum.photos/300/200?random=8'),
  ('Impressora Multifuncional', 'Impressora laser com scanner e conectividade Wi-Fi.', 999.90, 'https://picsum.photos/300/200?random=9'),
  ('Caixa de Som Bluetooth', 'Caixa de som portátil à prova d\'água com 20h de bateria.', 399.90, 'https://picsum.photos/300/200?random=10'),
  ('Teclado Mecânico Gamer', 'Teclado mecânico RGB com switches Cherry MX e apoio de pulso.', 599.90, 'https://picsum.photos/300/200?random=11'),
  ('Mouse Gamer', 'Mouse gamer com 8 botões programáveis e sensor de alta precisão.', 299.90, 'https://picsum.photos/300/200?random=12'),
  ('Monitor Ultrawide', 'Monitor curvo ultrawide de 34" com resolução 4K e tempo de resposta de 1ms.', 2899.90, 'https://picsum.photos/300/200?random=13'),
  ('Cadeira Gamer', 'Cadeira ergonômica com apoio lombar ajustável e reclinação de até 180°.', 1499.90, 'https://picsum.photos/300/200?random=14'),
  ('Webcam HD', 'Webcam com resolução Full HD e microfone com redução de ruído.', 249.90, 'https://picsum.photos/300/200?random=15'),
  ('Roteador Wi-Fi 6', 'Roteador dual-band com tecnologia Wi-Fi 6 e cobertura para grandes ambientes.', 699.90, 'https://picsum.photos/300/200?random=16'),
  ('SSD 1TB', 'SSD com velocidade de leitura de até 3500MB/s e interface NVMe.', 799.90, 'https://picsum.photos/300/200?random=17'),
  ('Memória RAM 16GB', 'Kit de memória RAM DDR4 com frequência de 3200MHz.', 449.90, 'https://picsum.photos/300/200?random=18'),
  ('Placa de Vídeo RTX', 'Placa de vídeo com 8GB de memória GDDR6 e Ray Tracing.', 3299.90, 'https://picsum.photos/300/200?random=19'),
  ('Cooler para Processador', 'Cooler com design de torre, 4 heatpipes e iluminação RGB.', 279.90, 'https://picsum.photos/300/200?random=20'),
  ('Gabinete Gamer', 'Gabinete mid-tower com painel lateral em vidro temperado e 4 fans RGB.', 499.90, 'https://picsum.photos/300/200?random=21'),
  ('Fonte de Alimentação 750W', 'Fonte de alimentação modular com certificação 80 Plus Gold.', 599.90, 'https://picsum.photos/300/200?random=22'),
  ('Placa-Mãe Z590', 'Placa-mãe com socket LGA 1200, suporte a PCIe 4.0 e Wi-Fi integrado.', 1699.90, 'https://picsum.photos/300/200?random=23'),
  ('Processador de Alto Desempenho', 'Processador octa-core com frequência de até 5.0GHz.', 2499.90, 'https://picsum.photos/300/200?random=24');
```

### Opção 2: Usando a API do Supabase em uma Aplicação Separada

Alternativamente, podemos criar um script JavaScript para inserir os produtos usando a API do Supabase:

1. Crie um novo arquivo `populate-db.js`:

```javascript
// Salve como populate-db.js e execute com Node.js
import { createClient } from '@supabase/supabase-js';

// Substitua com suas credenciais do Supabase
const supabaseUrl = 'https://SEU_ID_PROJETO.supabase.co';
const supabaseKey = 'SUA_CHAVE_PUBLICA';
const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    title: 'Smartphone XS Pro',
    description: 'Smartphone de última geração com câmera de 108MP e tela AMOLED de 6.7".',
    price: 2499.90,
    image: 'https://picsum.photos/300/200?random=1'
  },
  // ... adicione os outros 23 produtos aqui
];

async function insertProducts() {
  for (const product of products) {
    const { data, error } = await supabase
      .from('products')
      .insert([product]);
    
    if (error) {
      console.error('Erro ao inserir produto:', product.title, error);
    } else {
      console.log('Produto inserido com sucesso:', product.title);
    }
  }
}

insertProducts()
  .then(() => console.log('Todos os produtos foram inseridos!'))
  .catch(err => console.error('Erro:', err));
```

2. Execute o script com Node.js:

```bash
node populate-db.js
```

## 3. Integrando o Supabase à Nossa Aplicação React

Agora que temos o Supabase configurado e populado com dados, vamos integrar nossa aplicação React para consumir a API.

### Instalação do Cliente Supabase

1. Instale o pacote oficial do Supabase:

```bash
npm install @supabase/supabase-js
```

2. Crie um arquivo para configuração do cliente Supabase em `src/services/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

// Substitua com suas credenciais do Supabase
const supabaseUrl = 'https://SEU_ID_PROJETO.supabase.co';
const supabaseKey = 'SUA_CHAVE_PUBLICA';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

### Criação de um Serviço para Produtos

Vamos criar um serviço para encapsular as operações relacionadas aos produtos:

1. Crie um arquivo `src/services/productService.js`:

```javascript
import supabase from './supabase';

const productService = {
  // Obter produtos com paginação
  async getProducts(page = 1, limit = 8) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Buscar produtos com paginação
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    
    return { 
      products: data, 
      total: count,
      totalPages: Math.ceil(count / limit)
    };
  },
  
  // Obter um produto pelo ID
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
    
    return data;
  },
  
  // Criar um novo produto
  async createProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    
    if (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
    
    return data[0];
  },
  
  // Atualizar um produto existente
  async updateProduct(id, product) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
    
    return data[0];
  },
  
  // Deletar um produto
  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
    
    return true;
  }
};

export default productService;
```

## 4. Atualizando a Página de Produtos com Paginação

Vamos modificar a página de produtos para buscar dados do Supabase e implementar a paginação:

1. Primeiro, vamos instalar o pacote `react-query` para gerenciar estados de carregamento, cache e erros de maneira elegante:

```bash
npm install @tanstack/react-query
```

2. Configure o React Query no arquivo `src/main.jsx`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './pages/App';

// Criação do cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

3. Agora, vamos atualizar a página de produtos em `src/pages/ProductsPage.jsx`:

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CardsGrid from "../components/CardsGrid";
import productService from '../services/productService';

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
    queryFn: () => productService.getProducts(currentPage, 8),
    keepPreviousData: true,
  });

  // Renderização condicional para estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
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
  const { products, total, totalPages } = data;

  return (
    <div>
      <h1>Todos os Produtos</h1>
      <p>Mostrando {products.length} de {total} produtos</p>

      {/* Grid de produtos */}
      <CardsGrid
        items={products}
        cols={4}
        onAddToCart={onAddToCart}
      />

      {/* Componente de paginação */}
      <nav aria-label="Navegação de páginas">
        <ul className="pagination justify-content-center mt-4">
          {/* Botão Anterior */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
          </li>
          
          {/* Números de página */}
          {[...Array(totalPages).keys()].map(number => (
            <li 
              key={number + 1} 
              className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(number + 1)}
              >
                {number + 1}
              </button>
            </li>
          ))}
          
          {/* Botão Próximo */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProductsPage;
```

4. Atualização no `App.jsx` para remover os produtos estáticos:

```jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePage from './HomePage';
import ProductsPage from './ProductsPage';
import CreateProductPage from './CreateProductPage'; // Novo componente

function App() {
  // Estado para o carrinho
  const [cartItemCount, setCartItemCount] = useState(0);

  // Função para adicionar ao carrinho
  const handleAddToCart = (product) => {
    setCartItemCount(prevCount => prevCount + 1);
    console.log("Adicionado ao carrinho:", product.title);
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header cartCount={cartItemCount} />
        <main className="container my-4 flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={<HomePage onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/produtos"
              element={<ProductsPage onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/produtos/novo"
              element={<CreateProductPage />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
```

5. Também precisamos atualizar a `HomePage.jsx` para buscar os produtos em destaque do Supabase:

```jsx
import { useQuery } from '@tanstack/react-query';
import CardsGrid from "../components/CardsGrid";
import productService from '../services/productService';

const HomePage = ({ onAddToCart }) => {
  // Buscar os primeiros 3 produtos para destacar
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getProducts(1, 3),
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
```

## 5. Criando a Página de Cadastro de Produtos

Agora, vamos criar uma página para adicionar novos produtos ao catálogo:

1. Crie o arquivo `src/pages/CreateProductPage.jsx`:

```jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

const CreateProductPage = () => {
  const navigate = useNavigate();
  
  // Estado do formulário
  const [product, setProduct] = useState({
    title: '',
    description: '',
    price: '',
    image: ''
  });
  
  // Estado para validação
  const [errors, setErrors] = useState({});

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      alert('Produto criado com sucesso!');
      navigate('/produtos');
    },
    onError: (error) => {
      alert(`Erro ao criar produto: ${error.message}`);
    }
  });

  // Manipuladores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começa a digitar
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
    
    if (!product.image.trim()) {
      newErrors.image = 'A URL da imagem é obrigatória';
    } else if (!product.image.match(/^https?:\/\/.+/i)) {
      newErrors.image = 'URL da imagem inválida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Converter preço para número antes de enviar
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
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0">Cadastrar Novo Produto</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Campo Título */}
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
              
              {/* Campo Descrição */}
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
              
              {/* Campo Preço */}
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
              
              {/* Campo URL da Imagem */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label">URL da Imagem</label>
                <input
                  type="text"
                  className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                  id="image"
                  name="image"
                  value={product.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                {errors.image && <div className="invalid-feedback">{errors.image}</div>}
              </div>
              
              {/* Previsualização da Imagem */}
              {product.image && (
                <div className="mb-3 text-center">
                  <p>Previsualização:</p>
                  <img 
                    src={product.image} 
                    alt="Previsualização" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '200px' }} 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Inválida';
                    }}
                  />
                </div>
              )}
              
              {/* Botões de Ação */}
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/produtos')}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createProductMutation.isLoading}
                >
                  {createProductMutation.isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Salvando...
                    </>
                  ) : 'Cadastrar Produto'}
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
```

2. Atualize o `Header.jsx` para adicionar um link para a página de cadastro:

```jsx
import { NavLink } from 'react-router-dom';

const Header = ({ cartCount = 0 }) => {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <NavLink className="navbar-brand" to="/">React Shop</NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menuPrincipal">
            <div className="navbar-nav">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
              <NavLink className="nav-link" to="/produtos">
                Produtos
              </NavLink>
              <NavLink className="nav-link" to="/produtos/novo">
                Novo Produto
              </NavLink>
              <a className="nav-link" href="/sobre">Quem Somos</a>
              <a className="nav-link" href="/contato">Contato</a>
            </div>
            <span className="navbar-text ms-auto">
              Carrinho:
              <span className="badge bg-primary rounded-pill ms-2">{cartCount}</span>
            </span>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header;
```

3. Adicione um botão na página de produtos para facilitar a navegação para o cadastro:

```jsx
// Dentro do componente ProductsPage, adicione acima do CardsGrid
<div className="d-flex justify-content-between align-items-center mb-3">
  <h1>Todos os Produtos</h1>
  <NavLink to="/produtos/novo" className="btn btn-success">
    <i className="bi bi-plus-circle me-2"></i>
    Adicionar Produto
  </NavLink>
</div>
```

## 6. Melhorando o Card de Produto

Para exibir corretamente os produtos do Supabase, vamos atualizar o componente `Card.jsx` para incluir o preço e melhorar a exibição:

```jsx
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
              e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
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
            <i className="bi bi-cart-plus me-2"></i>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
```

## 7. Atualizando o CardsGrid para Compatibilidade

Também precisamos atualizar o `CardsGrid.jsx` para passar o novo prop `price` para os cards:

```jsx
import Card from "./Card";

const CardsGrid = ({ title, items, cols = 4, onAddToCart }) => {
  const colClass = `row-cols-1 row-cols-md-${Math.max(1, Math.floor(cols / 2))} row-cols-lg-${cols}`;
  
  // Verifica se há itens para exibir
  if (!items || items.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        Nenhum produto encontrado.
      </div>
    );
  }

  return (
    <section className="mb-4">
      {title && (
        <>
          <h2>{title}</h2>
          <hr />
        </>
      )}
      <div className={`row ${colClass} g-3`}>
        {items.map((item) => (
          <Card
            key={item.id}
            image={item.image}
            title={item.title}
            description={item.description}
            price={item.price}
            onAddToCartClick={() => onAddToCart(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default CardsGrid;
```

## 8. Instalando Ícones do Bootstrap

Para melhorar a interface do usuário, vamos adicionar ícones do Bootstrap:

```bash
npm install bootstrap-icons
```

Adicione a importação do CSS no `index.html`:

```html
<head>
    <!-- ... outras tags ... -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <title>React Shop</title>
</head>
```

## 9. Criando um Componente de Paginação Reutilizável

Para melhor organização, vamos extrair a lógica de paginação em um componente separado:

1. Crie um novo arquivo `src/components/Pagination.jsx`:

```jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Função para renderizar um número limitado de botões de página
  const getPageNumbers = () => {
    const delta = 2; // Quantas páginas mostrar antes e depois da atual
    const pages = [];
    
    // Sempre mostrar a primeira página
    pages.push(1);
    
    // Calcular o intervalo de páginas a mostrar
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    // Adicionar elipses antes do intervalo, se necessário
    if (rangeStart > 2) {
      pages.push('...');
    }
    
    // Adicionar páginas do intervalo
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Adicionar elipses depois do intervalo, se necessário
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }
    
    // Sempre mostrar a última página, se for maior que 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Navegação de páginas">
      <ul className="pagination justify-content-center mt-4">
        {/* Botão Anterior */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="bi bi-chevron-left me-1"></i>
            Anterior
          </button>
        </li>
        
        {/* Números de página */}
        {getPageNumbers().map((pageNum, index) => (
          <li 
            key={index} 
            className={`page-item ${pageNum === currentPage ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => pageNum !== '...' && onPageChange(pageNum)}
              disabled={pageNum === '...'}
            >
              {pageNum}
            </button>
          </li>
        ))}
        
        {/* Botão Próximo */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próximo
            <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
```

2. Agora, atualize a `ProductsPage.jsx` para usar o novo componente:

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import CardsGrid from "../components/CardsGrid";
import Pagination from "../components/Pagination";
import productService from '../services/productService';

const ProductsPage = ({ onAddToCart }) => {
  // Estado para controlar a página atual
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  // Buscar produtos usando React Query
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['products', currentPage],
    queryFn: () => productService.getProducts(currentPage, PRODUCTS_PER_PAGE),
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando produtos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Erro ao carregar produtos: {error.message}
      </div>
    );
  }

  // Extrair dados da resposta
  const { products, total, totalPages } = data;

  return (
    <div>
      {/* Cabeçalho com título e botão para adicionar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Produtos</h1>
        <NavLink to="/produtos/novo" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i>
          Adicionar Produto
        </NavLink>
      </div>
      
      {/* Informações de paginação */}
      <p>
        <i className="bi bi-info-circle me-2"></i>
        Mostrando {products.length} de {total} produtos - Página {currentPage} de {totalPages}
      </p>

      {/* Grid de produtos */}
      <CardsGrid
        items={products}
        cols={4}
        onAddToCart={onAddToCart}
      />

      {/* Componente de paginação */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductsPage;
```

## 10. Adicionando Variáveis de Ambiente

Para evitar expor as credenciais do Supabase diretamente no código, vamos usar variáveis de ambiente:

1. Na raiz do projeto, crie um arquivo `.env`:

```
VITE_SUPABASE_URL=https://SEU_ID_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

2. Adicione `.env` ao `.gitignore` para não expor suas credenciais:

```
# .gitignore
...
.env
.env.local
```

3. Atualize o arquivo `src/services/supabase.js` para usar as variáveis de ambiente:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não configuradas. Verifique o arquivo .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

## 11. Implementando um Toast de Notificação

Vamos melhorar a experiência do usuário adicionando notificações toast para ações como adicionar ao carrinho:

1. Instale o pacote `react-hot-toast`:

```bash
npm install react-hot-toast
```

2. Configure-o no `App.jsx`:

```jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePage from './HomePage';
import ProductsPage from './ProductsPage';
import CreateProductPage from './CreateProductPage';

function App() {
  const [cartItemCount, setCartItemCount] = useState(0);

  // Função para adicionar ao carrinho
  const handleAddToCart = (product) => {
    setCartItemCount(prevCount => prevCount + 1);
    
    // Mostrar notificação
    toast.success(`${product.title} adicionado ao carrinho!`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header cartCount={cartItemCount} />
        <main className="container my-4 flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={<HomePage onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/produtos"
              element={<ProductsPage onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/produtos/novo"
              element={<CreateProductPage />}
            />
          </Routes>
        </main>
        <Footer />
        
        {/* Componente Toaster para mostrar notificações */}
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
```

3. Use o toast também na página de criação de produto:

```jsx
// Em CreateProductPage.jsx, no createProductMutation
const createProductMutation = useMutation({
  mutationFn: productService.createProduct,
  onSuccess: () => {
    toast.success('Produto criado com sucesso!', {
      duration: 5000,
      icon: '✅',
    });
    navigate('/produtos');
  },
  onError: (error) => {
    toast.error(`Erro ao criar produto: ${error.message}`, {
      duration: 5000,
    });
  }
});

// Lembre-se de importar o toast
import { toast } from 'react-hot-toast';
```

## 12. Conclusão

Nesta aula, transformamos nossa aplicação de uma simples demonstração com dados estáticos para uma aplicação completa com backend real. Aprendemos:

1. **Como configurar o Supabase** como backend para nossa aplicação React.

2. **Operações CRUD** para gerenciar produtos através de uma API RESTful.

3. **Paginação** para lidar com grandes conjuntos de dados eficientemente.

4. **Formulários em React** para adicionar novos produtos e validar entradas.

5. **Gerenciamento de estado assíncrono** com React Query para melhorar a experiência do usuário e a eficiência da aplicação.

Estes conceitos formam a base para criação de aplicações React modernas e escaláveis conectadas a um backend. Na próxima aula, iremos expandir ainda mais nossa aplicação, focando em autenticação de usuários, detalhes de produto e implementação completa do carrinho de compras com persistência no Supabase.