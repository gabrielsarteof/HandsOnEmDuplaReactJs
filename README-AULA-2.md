# ReactJs :: Aula 02

**Prof. Ricardo Maroquio**

Bem-vindo à Aula 02 do nosso curso de ReactJS! Na Aula 01 (documentada no `README.md`), construímos a base da nossa aplicação de listagem de produtos, aprendendo sobre JSX, componentes funcionais, props e a configuração inicial com Vite.

Nesta aula, vamos aprofundar nossos conhecimentos, focando em:

1. **Melhorar a Componentização:** Refatorar o código para criar componentes mais genéricos e reutilizáveis.

2. **Introdução ao Estado (`useState`):** Aprender como gerenciar dados que mudam dentro de um componente, tornando nossa aplicação dinâmica.

3. **Manipulação de Eventos:** Responder a interações do usuário, como cliques em botões.

4. **Roteamento (Navegação):** Implementar navegação entre diferentes "páginas" dentro da aplicação sem recarregar o navegador, usando `react-router-dom`.

Vamos continuar evoluindo nosso estudo de caso da loja de produtos.

## 1. Refatoração: Criando o Componente `CardsGrid`

Na aula anterior, criamos um componente `Card` para exibir informações de produtos. Agora, vamos refatorar nosso código para criar um componente `CardsGrid`, que será responsável por renderizar uma grade de cards.

**Objetivo:** Criar um componente `CardsGrid` que renderize uma lista de `Card`s, permitindo a personalização do número de colunas e a adição de uma ação ao clicar em "Adicionar ao Carrinho".

**Implementação:**

1. **Criação do Componente (`src/components/CardsGrid.jsx`):**
   
Vamos criar um novo componente funcional chamado `CardsGrid`.

```jsx
import Card from "./Card"; // Importa o componente Card

// Recebe title, items (array), cols (número) e onAddToCart (função) como props
const CardsGrid = ({ title, items, cols = 4, onAddToCart }) => { // Define cols=4 como padrão
  // Define a classe de coluna do Bootstrap dinamicamente
  const colClass = `row-cols-1 row-cols-md-${Math.max(1, Math.floor(cols / 2))} row-cols-lg-${cols}`;
  return (
    <section className="mb-4">
      <h2>{title}</h2>
      <hr />
      <div className={`row ${colClass} g-3`}>
        {items.map((item) => (
          <Card
            key={item.id}
            image={item.image}
            title={item.title}
            description={item.description}
            link={`/item/${item.id}`}
            // Passa a função onAddToCart para o Card, associando-a ao item específico
            // Usamos uma arrow function para garantir que 'item' seja passado corretamente
            // quando o botão no Card for clicado.
            onAddToCartClick={() => onAddToCart(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default CardsGrid;
```

* **Props Genéricas:** O componente agora aceita `title`, `items`, `cols` e a nova prop `onAddToCart` (que será uma função).
  
* **Repasse da Função:** A função `onAddToCart` recebida é passada para a prop `onAddToCartClick` de cada `Card`. Usamos uma arrow function `() => onAddToCart(item)` para garantir que, quando o botão for clicado no `Card`, a função `onAddToCart` seja chamada com o `item` correto como argumento.

1. **Utilização no `App.jsx` (`src/pages/App.jsx`):**
    
Modificamos o `App.jsx` para importar e usar o novo componente, além de introduzir o estado.

```jsx
import { useState } from 'react'; // Importa o hook useState
import CardsGrid from "../components/CardsGrid";
import Footer from "../components/Footer";
import Header from "../components/Header";

function App() {
  // Inicializa o estado para a contagem de itens no carrinho
  const [cartItemCount, setCartItemCount] = useState(0);
  const products = [
    // ... (array de produtos)
  ];
  // Função chamada quando o botão "Adicionar ao Carrinho" em um Card é clicado
  const handleAddToCart = (product) => {
    setCartItemCount(prevCount => prevCount + 1);
    console.log("Adicionado ao carrinho:", product.title);
  };
  return (
    <>
      {/* Passa a contagem atual do carrinho como prop para o Header */}
      <Header cartCount={cartItemCount} />
      <main className="container my-4 flex-grow-1">
        {/* Passa a função handleAddToCart como prop para o CardsGrid */}
        <CardsGrid
          title="Produtos"
          items={products}
          cols={4}
          onAddToCart={handleAddToCart} // Passa a função definida acima
        />
      </main>
      <Footer />
    </>
  )
}

export default App;
```

* **Importação do `useState`:** O hook `useState` é importado do React.

* **Inicialização do Estado:** `const [cartItemCount, setCartItemCount] = useState(0);` cria uma variável de estado `cartItemCount` (inicializada com 0) e uma função `setCartItemCount` para atualizá-la.

* **Função `handleAddToCart`:** Esta função será chamada quando um item for adicionado, ou seja, quando o botão *Adicionar ao Carrinho* de um card for clicado. Ela usa `setCartItemCount` para atualizar o estado.

* **Passando Props:** A função `handleAddToCart` é passada como prop `onAddToCart` para o `CardsGrid`, e o valor atual de `cartItemCount` é passado como prop `cartCount` para o `Header`.

**Benefícios da Refatoração:**

* Código mais legível e organizado.

* Maior reutilização de componentes.

* Manutenção facilitada.

* Separação de responsabilidades.

## 2. Estado e Eventos: Adicionando Interatividade

Até agora, nossa aplicação era estática. Os dados (lista de produtos) eram definidos uma vez e a UI era renderizada com base neles. Mas e se quisermos que a UI mude em resposta a ações do usuário, como clicar em um botão? É aí que entram o **Estado** e os **Eventos**.

**O que é Estado?**

* Estado (`state`) refere-se a dados que pertencem a um componente e podem mudar ao longo do tempo.

* Quando o estado de um componente muda, o React automaticamente **re-renderiza** esse componente (e seus filhos, se necessário) para refletir a mudança na UI.

* Diferente das `props` (que são passadas de pai para filho e são imutáveis *dentro* do filho), o estado é gerenciado *internamente* pelo próprio componente.

**O Hook `useState`**

* Para adicionar estado a componentes funcionais, usamos **Hooks**. O hook fundamental para gerenciar estado é o `useState`.

* **Como usar:**
  
  1. Importe-o: `import { useState } from 'react';`
  
  2. Chame-o dentro do componente: `const [nomeDaVariavel, setNomeDaVariavel] = useState(valorInicial);`
      
      * `useState(valorInicial)`: Define o valor inicial do estado.
      
      * Retorna um array com duas coisas:
          
          * `nomeDaVariavel`: A variável que contém o valor *atual* do estado.
          
          * `setNomeDaVariavel`: A função que você **deve** usar para *atualizar* o valor do estado. Chamar essa função dispara a re-renderização.

**O que são Eventos?**

* Eventos são ações que acontecem no navegador, como cliques de mouse (`click`), digitação (`change`, `keyDown`), envio de formulário (`submit`) etc.

* React fornece uma forma de "escutar" e responder a esses eventos diretamente nos elementos JSX.

**Manipulando Eventos em React**

* Usamos atributos especiais nos elementos JSX, como `onClick`, `onChange`, `onSubmit` etc. (note o camelCase).

* O valor desses atributos deve ser uma **função** (geralmente chamada de *event handler* ou *callback*) que será executada quando o evento ocorrer.
    
```jsx
<button onClick={minhaFuncaoDeClique}>Clique Aqui</button>
```

**Implementando o "Adicionar ao Carrinho":**

Nosso objetivo é:

1. Adicionar um botão "Adicionar ao Carrinho" em cada `Card`.

2. Quando o botão for clicado, incrementar um contador geral de itens no carrinho.

3. Exibir essa contagem no `Header`.

**Fluxo de Dados e Eventos:**

Como o contador (`cartItemCount`) precisa ser exibido no `Header` e atualizado por ações nos `Cards` (que estão dentro do `CardsGrid`), o local mais lógico para gerenciar esse estado é no componente pai comum mais próximo: o `App.jsx`.

O fluxo será o seguinte:

1. **`App.jsx`:**
    
    * Define o estado `cartItemCount` usando `useState(0)`.
    
    * Define a função `handleAddToCart(product)` que chama `setCartItemCount` para incrementar o estado.
    
    * Passa `cartItemCount` como prop `cartCount` para o `Header`.
    
    * Passa `handleAddToCart` como prop `onAddToCart` para o `CardsGrid`.

2. **`CardsGrid.jsx`:**
    
    * Recebe a prop `onAddToCart`.
    
    * Para cada `item` mapeado, passa uma *nova função* `() => onAddToCart(item)` como prop `onAddToCartClick` para o `Card`. Isso garante que quando o botão no `Card` for clicado, a função original `handleAddToCart` no `App` seja chamada com o `item` correto.

3. **`Card.jsx`:**
    
    * Recebe a prop `onAddToCartClick`.
    
    * Adiciona um `<button>`.
    
    * Define o atributo `onClick` do botão para ser a função `onAddToCartClick` recebida.

4. **`Header.jsx`:**
    
    * Recebe a prop `cartCount`.
    
    * Exibe o valor de `cartCount` dentro de um `<span>` ou `badge`.

**Modificações no Código:**

1. **`src/components/Card.jsx`:**
    
```javascript
// Adiciona onAddToCartClick às props recebidas
const Card = ({ image, title, description, onAddToCartClick }) => {
  return (
    <>
      <div className="col">
        <div className="card">
          <img src={image} className="card-img-top" alt="imagem do card" />
          <div className="card-body">
            <h5 className="card-title">{title}</h5>
            <p className="card-text">{description}</p>
          </div>
          <div className="card-footer">                      
            {/* Botão para adicionar ao carrinho */}
            {/* O evento onClick chama a função recebida via prop */}
            <button onClick={onAddToCartClick} className="btn btn-success w-100">
              Adicionar ao Carrinho
            </button>
            {/* O link "Ver Detalhes" foi removido para este exemplo,
                poderia ser mantido ou adaptado conforme a necessidade */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Card;
```
    
* Adicionamos a prop `onAddToCartClick`.
    
* Adicionamos o botão e atribuímos a função recebida à prop `onClick`.

2. **`src/components/CardsGrid.jsx`:** (Já mostrado na seção anterior, mas relevante aqui)
    
    * Recebe `onAddToCart` e passa `() => onAddToCart(item)` para cada `Card`.

3. **`src/pages/App.jsx`:** (Já mostrado na seção anterior, mas relevante aqui)
    
    * Importa `useState`.
    
    * Define `[cartItemCount, setCartItemCount] = useState(0)`.
    
    * Define `handleAddToCart`.
    
    * Passa `cartCount={cartItemCount}` para `Header`.
    
    * Passa `onAddToCart={handleAddToCart}` para `CardsGrid`.

4. **`src/components/Header.jsx`:**

```javascript
// Recebe cartCount como prop
const Header = ({ cartCount = 0 }) => { // Define 0 como valor padrão
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <a className="navbar-brand" href="/">React</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menuPrincipal">
            <div className="navbar-nav">
              <a className="nav-link active" href="/">Home</a>
              <a className="nav-link" href="/produtos">Produtos</a>
              <a className="nav-link" href="/sobre">Quem Somos</a>
              <a className="nav-link" href="/contato">Contato</a>
            </div>
            {/* Exibe a contagem do carrinho no final da navbar */}
            <span className="navbar-text ms-auto"> {/* ms-auto alinha à direita */}
              Carrinho:
              <span className="badge bg-secondary ms-2">{cartCount}</span>
            </span>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header;
```

* Recebe a prop `cartCount`.

* Exibe o valor dentro de um `<span>` com um badge do Bootstrap.

**Resultado:**

Agora, ao clicar no botão "Adicionar ao Carrinho" em qualquer card, o número no contador do cabeçalho será incrementado. Isso demonstra o ciclo fundamental do React: **Evento -> Atualização do Estado -> Re-renderização da UI**.

**Pontos Chave:**

* Use `useState` para dados que mudam e afetam a UI.

* Use a função `set...` retornada pelo `useState` para atualizar o estado.

* Use manipuladores de evento como `onClick` para responder a interações.

* Passe funções de callback como props para permitir que componentes filhos comuniquem eventos aos pais.

* Coloque o estado no componente pai comum mais próximo que precisa da informação ou da capacidade de alterá-la.

## 3. Roteamento: Navegando entre Páginas com `react-router-dom`

Até agora, nossa aplicação tinha apenas uma "visualização" principal dentro do `App.jsx`. Aplicações web reais geralmente possuem múltiplas páginas ou seções (Home, Produtos, Sobre, Contato etc.). Em aplicações web tradicionais, clicar em um link geralmente causa um recarregamento completo da página pelo navegador.

**Single Page Applications (SPAs)**

React é frequentemente usado para construir SPAs. Em uma SPA, a aplicação carrega um único arquivo HTML inicial (nosso `index.html`) e, a partir daí, o JavaScript (React, neste caso) manipula o DOM dinamicamente para exibir diferentes "páginas" ou visualizações *sem* recarregar a página inteira do servidor. Isso resulta em uma experiência de usuário mais rápida e fluida, semelhante a um aplicativo desktop ou móvel.

**Como funciona o Roteamento em SPAs?**

Bibliotecas de roteamento como `react-router-dom` interceptam a navegação. Quando você clica em um link especial (ou a URL muda), em vez de fazer uma nova requisição ao servidor, a biblioteca:

1. Atualiza a URL na barra de endereços do navegador (usando a History API do HTML5).

2. Verifica qual componente React está associado à nova URL.

3. Renderiza o componente correspondente na área designada da página.

**A Biblioteca `react-router-dom`**

É a biblioteca de roteamento mais popular para aplicações React. Ela fornece um conjunto de componentes e hooks para gerenciar a navegação.

**Implementação:**

**Objetivo:** Criar duas páginas distintas:

* `HomePage`: Exibirá uma mensagem de boas-vindas e produtos em destaque.

* `ProductsPage`: Exibirá todos os produtos do catálogo.

Depois de criar as páginas, devemos permitir a navegação entre elas usando links no `Header`, que, por sua vez, devem indicar qual página está ativa.

**Passos:**

1. **Instalação:**

Primeiro, adicionamos a biblioteca ao projeto:

```bash
npm install react-router-dom
```

2. **Criação dos Componentes de Página:**

Criamos componentes separados para cada página dentro de `src/pages/`:

* **`src/pages/HomePage.jsx`:**
    
```jsx
import CardsGrid from "../components/CardsGrid";

// Recebe a lista de produtos e a função onAddToCart como props
const HomePage = ({ products, onAddToCart }) => {
  // Simula produtos em destaque pegando os 3 primeiros
  const featuredProducts = products.slice(0, 3);
  return (
    <div>
      <h1>Bem-vindo à Nossa Loja!</h1>
      <p>Confira nossos produtos em destaque:</p>
      <CardsGrid
        title="Destaques"
        items={featuredProducts}
        cols={3} // Exibe 3 colunas na home
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default HomePage;
```

* **`src/pages/ProductsPage.jsx`:**
    
```jsx
import CardsGrid from "../components/CardsGrid";

// Recebe a lista completa de produtos e a função onAddToCart como props
const ProductsPage = ({ products, onAddToCart }) => {
  return (
    <div>
      <CardsGrid
        title="Todos os Produtos"
        items={products}
        cols={4} // Mantém 4 colunas na página de produtos
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default ProductsPage;
```

* Note que ambas as páginas recebem `products` e `onAddToCart` como props, pois precisam desses dados/funções que são gerenciados pelo `App`.

3. **Configuração do Roteador no `App.jsx`:**

O componente `App.jsx` agora se torna o ponto central para configurar o layout principal e as rotas para as páginas da aplicação. O código atualizado do `App.jsx` fica assim:

```jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Importa componentes do router
// Importa os componentes de layout e páginas
import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePage from './HomePage'; // Importa a nova página Home
import ProductsPage from './ProductsPage'; // Importa a nova página Produtos

function App() {
  // Estado do carrinho e dados dos produtos permanecem aqui
  const [cartItemCount, setCartItemCount] = useState(0);
  const products = [ /* ... array de produtos ... */ ];
  const handleAddToCart = (product) => { /* ... função ... */ };
  // O componente App agora configura o roteador e o layout principal
  return (
    // 1. BrowserRouter: Envolve toda a aplicação que usará roteamento.
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        {/* Header fica fora das Routes para ser exibido em todas as páginas */}
        <Header cartCount={cartItemCount} />
        <main className="container my-4 flex-grow-1">
          {/* 2. Routes: Define a área onde o componente da rota correspondente será renderizado. */}
          <Routes>
            {/* 3. Route: Define uma rota específica. */}
            <Route
              path="/" // O caminho (URL) para esta rota
              // O componente (página) a ser renderizado quando a URL corresponder ao path.
              // Passamos as props necessárias para a página.
              element={<HomePage products={products} onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/produtos"
              element={<ProductsPage products={products} onAddToCart={handleAddToCart} />}
            />
            {/* Poderíamos adicionar mais rotas aqui */}
          </Routes>
        </main>
        {/* Footer também fica fora das Routes */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
```

* **`<BrowserRouter>`:** Componente que habilita o roteamento baseado na History API do HTML5. Deve envolver toda a parte da sua aplicação que precisa de roteamento.

* **`<Routes>`:** Funciona como um `switch`. Ele olha para a URL atual e renderiza o primeiro `<Route>` cujo `path` corresponda.

* **`<Route>`:** Define a associação entre um caminho (`path`) e um componente (`element`). Quando a URL bate com o `path`, o componente especificado em `element` é renderizado dentro do `<Routes>`. Passamos as props necessárias (`products`, `onAddToCart`) para os componentes de página aqui.

* **Layout Persistente:** Note que `<Header>` e `<Footer>` estão *fora* do `<Routes>`. Isso significa que eles serão renderizados em *todas* as páginas definidas pelas rotas, criando um layout consistente. Apenas o conteúdo dentro de `<main>` mudará conforme a rota.

4. **Atualização dos Links no `Header.jsx` com `<NavLink>`:**

Para que os links no cabeçalho funcionem com o roteador (sem recarregar a página) e para que eles possam indicar visualmente qual página está ativa, substituímos as tags `<a>` pelo componente `<NavLink>` do `react-router-dom`.

```jsx
import { NavLink } from 'react-router-dom'; // Importa NavLink

const Header = ({ cartCount = 0 }) => {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <NavLink className="navbar-brand" to="/">React Router App</NavLink>
          <button /* ... */ > {/* Botão Toggler */} </button>
          <div className="collapse navbar-collapse" id="menuPrincipal">
            <div className="navbar-nav">
              {/* NavLink em vez de <a> */}
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
              <NavLink className="nav-link" to="/produtos">
                Produtos
              </NavLink>
              {/* Links para rotas não definidas ainda podem ser <a> */}
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

* **`<NavLink>` vs `<Link>`:** Ambos criam links que funcionam com o roteador. A principal diferença é que `<NavLink>` sabe se ele está "ativo" (se seu atributo `to` corresponde à URL atual) e automaticamente adiciona a classe `active` ao elemento.

* **Prop `to`:** Especifica o caminho para onde o link deve navegar (semelhante ao `href`).

* **Prop `end`:** Essencial para links de índice (como `to="/"`). Sem `end`, o link "Home" ficaria ativo mesmo quando estivéssemos em `/produtos`, porque `/produtos` *começa com* `/`. A prop `end` força uma correspondência exata do caminho.

**Resultado:**

A aplicação agora tem duas páginas distintas (`/` e `/produtos`). Clicar nos links "Home" e "Produtos" no cabeçalho alterna entre as páginas `HomePage` e `ProductsPage` sem recarregar o navegador. O link correspondente à página atual recebe a classe `active`, destacando-o visualmente.

**Conceitos Adicionais de Roteamento que Ainda Exploraremos:**

* **Parâmetros de Rota:** Definir rotas que capturam valores da URL (ex: `/produto/:productId`) para exibir detalhes de um item específico. Usa-se o hook `useParams`.

* **Rotas Aninhadas:** Estruturar rotas dentro de outras rotas para layouts mais complexos.

* **Navegação Programática:** Mudar de rota através de código JavaScript (ex: após um login bem-sucedido), usando o hook `useNavigate`.

* **Rotas Protegidas:** Redirecionar usuários não autenticados para uma página de login.

* **Página 404 (Not Found):** Criar uma rota "catch-all" (`path="*"`) para exibir uma mensagem amigável quando nenhuma outra rota corresponder.

## 4. Conclusão

Nesta aula, aprendemos a refatorar nosso código para criar componentes mais reutilizáveis, introduzimos o conceito de estado e eventos no React, e implementamos roteamento com `react-router-dom` para navegar entre diferentes páginas da nossa aplicação.

Com isso, nossa aplicação agora é mais modular, interativa e pronta para escalar. Na próxima aula, vamos explorar mais sobre gerenciamento de estado com Context API e Hooks personalizados, além de introduzir o hook `useEffect` para lidar com efeitos colaterais, como chamadas a APIs.