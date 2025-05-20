# ReactJS :: Aula 01

**Prof. Ricardo Maroquio**

Bem-vindo à primeira aula sobre ReactJS! Este projeto serve como um estudo de caso prático para introduzir os conceitos fundamentais do React, utilizando ferramentas modernas como Vite e SWC. Ele foi pensado para alunos que já possuem conhecimentos básicos de HTML, CSS (incluindo Bootstrap 5) e JavaScript.

## 1. O que é ReactJS?

ReactJS é uma biblioteca JavaScript de código aberto, criada e mantida pelo Facebook, focada na construção de interfaces de usuário (UI - User Interfaces) interativas e reutilizáveis. Suas principais características são:

* **Declarativo:** Você descreve como a UI *deve* parecer em diferentes estados, e o React se encarrega de atualizar o DOM (Document Object Model) de forma eficiente quando os dados mudam. Isso torna o código mais previsível e fácil de depurar.

* **Baseado em Componentes:** Interfaces são quebradas em peças independentes e reutilizáveis chamadas "componentes". Cada componente gerencia seu próprio estado e lógica, e eles podem ser combinados para criar UIs complexas.

* **Aprenda uma vez, escreva em qualquer lugar:** Embora focado na web, os princípios do React podem ser aplicados em outras plataformas, como mobile (com React Native).

Nesta aula, construiremos um projeto com uma única página que exibe uma lista de produtos em cards, utilizando uma estrutura básica com cabeçalho e rodapé.

### Ferramentas Utilizadas

* **Node.js e npm:** O Node.js é um ambiente de execução JavaScript fora do navegador. O npm (Node Package Manager) é o gerenciador de pacotes padrão do Node.js, usado para instalar bibliotecas como o React e ferramentas de desenvolvimento.

* **Vite:** Uma ferramenta de build extremamente rápida para desenvolvimento web moderno. Ele oferece um servidor de desenvolvimento com Hot Module Replacement (HMR) instantâneo e otimiza o código para produção. Vite utiliza ferramentas nativas como esbuild (para pré-empacotamento de dependências) e SWC (para transpilação rápida de JavaScript/JSX).

    * **Alternativa:** Create React App (CRA) era a ferramenta oficial recomendada anteriormente, mas Vite tem ganhado popularidade devido à sua velocidade superior.

    * **SWC (Speedy Web Compiler):** Um compilador ultrarrápido escrito em Rust, usado pelo Vite para converter código moderno (incluindo JSX) em JavaScript compatível com navegadores. É uma alternativa mais performática ao Babel em muitos casos.

* **React e ReactDOM:** As bibliotecas principais para construir a UI. `react` contém a lógica central do React (componentes, estado, etc.), enquanto `react-dom` fornece os métodos específicos para interagir com o DOM do navegador.

* **Bootstrap 5:** Um framework CSS popular para estilização rápida e responsiva. Usamos via CDN para simplificar a configuração inicial.

### Pré-requisitos

*   Conhecimento básico de HTML, CSS e JavaScript (ES6+).

*   Familiaridade com os conceitos básicos do Bootstrap 5 (classes de grid, cards, navbar).

*   Node.js e npm (ou yarn) instalados em sua máquina. Você pode baixá-los em [nodejs.org](https://nodejs.org/).

## 2. Configuração do Ambiente

1.  **Clone o Repositório (Opcional):** Se você já tem o projeto, pode pular esta etapa.
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA>
    ```

2.  **Inicie um Projeto com Vite (Alternativa):** Para começar do zero:
    ```bash
    npm create vite@latest meu-primeiro-app-react --template react
    cd meu-primeiro-app-react
    ```
    
    *   Isso cria uma estrutura básica de projeto React com Vite.

3.  **Instale as Dependências:** Navegue até a pasta do projeto no terminal e execute:
    ```bash
    npm install
    ```    
    
    *   Este comando lê o arquivo `package.json` e baixa todas as bibliotecas necessárias (React, ReactDOM, etc.) para a pasta `node_modules`.

## 3. Estrutura do Projeto

A estrutura de pastas final desta aula, considerando um projeto React feito com Vite é:

```
react01/
├── node_modules/      # Dependências instaladas pelo npm
├── public/            # Arquivos estáticos (não processados pelo Vite)
├── src/               # Código-fonte da aplicação
│   ├── assets/        # Imagens, fontes, etc.
│   ├── components/    # Componentes reutilizáveis da UI
│   │   ├── Card.jsx
│   │   ├── Footer.jsx
│   │   └── Header.jsx
│   ├── pages/         # Componentes que representam "páginas" (neste caso, o App principal)
│   │   └── App.jsx
│   └── main.jsx       # Ponto de entrada da aplicação React
├── .eslintrc.cjs      # Configuração do ESLint (ferramenta de linting)
├── .gitignore         # Arquivos/pastas ignorados pelo Git
├── index.html         # Ponto de entrada HTML (processado pelo Vite)
├── package-lock.json  # Registro exato das versões das dependências
├── package.json       # Metadados do projeto e lista de dependências
└── vite.config.js     # Arquivo de configuração do Vite
```

## 4. Passo a Passo do Desenvolvimento (Estudo de Caso)

A partir de agora, vamos detalhar cada parte do código, explicando o que cada arquivo faz e como eles se interagem.

**1. `index.html` (Raiz do Projeto)**

Este é o arquivo HTML principal que o navegador carrega. O Vite o utiliza como ponto de entrada.

```html
<!doctype html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Incluindo Bootstrap 5 via CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Usando React</title>
</head>
<body>
    <!-- O container onde a aplicação React será renderizada -->
    <div id="root" class="d-flex flex-column min-vh-100"></div>

    <!-- O script principal da aplicação React (processado pelo Vite) -->
    <script type="module" src="/src/main.jsx"></script>

    <!-- Incluindo o JavaScript do Bootstrap 5 (necessário para componentes interativos) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

*   **`<div id="root">`:** Elemento crucial onde o React montará a aplicação. As classes `d-flex flex-column min-vh-100` do Bootstrap são usadas para garantir que o layout ocupe toda a altura da viewport e que o rodapé (que adicionaremos depois) fique no final.

*   **`<script type="module" src="/src/main.jsx">`:** Carrega o ponto de entrada da nossa aplicação React. `type="module"` é essencial para usar `import`/`export` do JavaScript moderno.

**2. `src/main.jsx` (Ponto de Entrada do React)**

Este arquivo inicializa o React e renderiza o componente principal (`App`) dentro do `div#root`.

```jsx
import { StrictMode } from 'react'; // Importa o StrictMode
import { createRoot } from 'react-dom/client'; // Importa a API moderna de renderização
import App from './pages/App'; // Importa nosso componente principal

// Seleciona o elemento root no HTML
const rootElement = document.getElementById('root');

// Cria a raiz da aplicação React nesse elemento
const root = createRoot(rootElement);

// Renderiza o componente App dentro da raiz
root.render(
  <StrictMode> {/* Envolve o App com StrictMode */}
    <App />
  </StrictMode>
);
```

*   **`createRoot`:** A API recomendada para iniciar aplicações React. Ela oferece melhorias de performance e concorrência em comparação com a antiga `ReactDOM.render`.
   
*   **`StrictMode`:** Um componente especial do React que não renderiza nenhuma UI visível, mas ativa verificações e avisos adicionais em desenvolvimento para ajudar a identificar potenciais problemas (ex: uso de APIs legadas, efeitos colaterais inesperados). É uma boa prática usá-lo na raiz da aplicação. Após a fase de desenvolvimento, ele pode ser removido ou mantido, dependendo do projeto.
   
*   **`<App />`:** É aqui que nosso componente principal é chamado. A sintaxe `<NomeComponente />` é como usamos componentes em JSX.

**3. Componentização: Criando Peças Reutilizáveis**

A ideia central do React é dividir a UI em componentes. Vamos criar três componentes básicos: `Header`, `Footer` e `Card`.

*   Crie as pastas `src/components` e `src/pages`.

*   Mova (ou crie) o `App.jsx` para dentro de `src/pages`.

*   Crie os arquivos `Header.jsx`, `Footer.jsx` e `Card.jsx` dentro de `src/components`.

**4. `src/components/Header.jsx`**

Este é um componente funcional (baseado em função) simples para o cabeçalho. Versões iniciais do React usavam classes, mas a abordagem funcional é mais moderna e recomendada.

```jsx
// Define o componente funcional Header usando arrow function
const Header = () => {
  // Retorna a estrutura JSX da navbar do Bootstrap
  return (
    <> {/* Fragmento: permite retornar múltiplos elementos sem um div extra */}
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <a className="navbar-brand" href="/">React App</a>
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
          </div>
        </div>
      </nav>
    </>
  );
};

// Exporta o componente para que possa ser importado em outros arquivos
export default Header;
```

*   **Componente Funcional:** A forma moderna e recomendada de criar componentes em React. É basicamente uma função JavaScript que retorna JSX.

*   **JSX (JavaScript XML):** Uma extensão de sintaxe que permite escrever "HTML" dentro do JavaScript. Note que usamos `className` em vez de `class`.

*   **`export default Header;`:** Torna o componente `Header` disponível para ser importado em outros arquivos (como o `App.jsx`).

*   **Alternativa de Navegação:** Em uma aplicação React completa com múltiplas páginas (Single Page Application - SPA), usaríamos uma biblioteca como `react-router-dom` e seus componentes `<Link>` em vez de `<a>` para evitar recarregamentos completos da página.

**5. `src/components/Footer.jsx`**

Similar ao Header, um componente funcional para o rodapé.

```jsx
const Footer = () => {
  return (
    <>
      {/* mt-auto empurra o footer para baixo em layouts flexbox */}
      <footer className="text-bg-dark mt-auto">
        <div className="container py-3 text-center">
          <p className="m-0">© 2025 Meu Primeiro App React. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
```

**6. `src/components/Card.jsx`**

Este componente receberá dados (via `props`) para exibir informações diferentes para cada produto.

```jsx
// Recebe props (image, title, description, link) como argumento
// Usamos desestruturação ({...}) para acessar as props diretamente
const Card = ({ image, title, description, link }) => {
  return (
    <>
      {/* Usa a classe 'col' do Bootstrap para se encaixar no grid */}
      <div className="col">
        <div className="card h-100"> {/* h-100 para igualar altura dos cards */}
          {/* Usa a prop 'image' no src da imagem */}
          <img src={image} className="card-img-top" alt={title} /> {/* Boa prática: alt dinâmico */}
          <div className="card-body d-flex flex-column"> {/* Flex column para alinhar botão */}
            {/* Usa a prop 'title' */}
            <h5 className="card-title">{title}</h5>
            {/* Usa a prop 'description' */}
            <p className="card-text">{description}</p>
            {/* Usa a prop 'link' no href do botão. mt-auto empurra o botão para baixo */}
            <a href={link} className="btn btn-primary mt-auto">Ver Detalhes</a>
          </div>
          {/* O card-footer foi removido para simplificar e usar mt-auto no botão */}
        </div>
      </div>
    </>
  );
};

export default Card;
```

*   **Props (Propriedades):** São como argumentos de função para componentes React. Permitem passar dados de um componente pai (`App`) para um componente filho (`Card`). Aqui, recebemos `image`, `title`, `description` e `link`.

*   **Desestruturação (`{ image, title, ... }`):** Uma forma concisa de extrair valores de objetos ou arrays. Facilita o acesso às props.

*   **Expressões `{}` em JSX:** Permitem incorporar variáveis ou expressões JavaScript diretamente no JSX.

**7. `src/pages/App.jsx` (Componente Principal)**

Agora, vamos montar tudo no componente `App`.

```jsx
// Importa os componentes que vamos usar
import Card from "../components/Card";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Define o componente funcional App
function App() {
  // Dados dos produtos (em uma aplicação real, viriam de uma API)
  const products = [
    { id: 1, image: "https://picsum.photos/300/200?random=1", title: "Produto 1", description: "Descrição breve e interessante do Produto 1." },
    { id: 2, image: "https://picsum.photos/300/200?random=2", title: "Produto 2", description: "Descrição breve e interessante do Produto 2." },
    { id: 3, image: "https://picsum.photos/300/200?random=3", title: "Produto 3", description: "Descrição breve e interessante do Produto 3." },
    { id: 4, image: "https://picsum.photos/300/200?random=4", title: "Produto 4", description: "Descrição breve e interessante do Produto 4." },
    { id: 5, image: "https://picsum.photos/300/200?random=5", title: "Produto 5", description: "Descrição breve e interessante do Produto 5." },
    { id: 6, image: "https://picsum.photos/300/200?random=6", title: "Produto 6", description: "Descrição breve e interessante do Produto 6." },
  ];

  // Retorna a estrutura JSX da página
  return (
    <> {/* Usa Fragment para agrupar Header, main e Footer */}
      <Header /> {/* Renderiza o componente Header */}
      <main className="container my-4 flex-grow-1"> {/* flex-grow-1 para ocupar espaço disponível */}
        <h1>Nossos Produtos</h1>
        <hr />
        {/* Grid do Bootstrap para os cards: 4 colunas em telas médias ou maiores */}
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4"> {/* Ajustado para melhor responsividade */}
          {/* Mapeia o array de produtos para renderizar um Card para cada um */}
          {products.map((product) => (
            // Passa os dados do produto como props para o componente Card
            // A prop 'key' é ESSENCIAL para o React otimizar a renderização de listas
            <Card
              key={product.id} // Chave única para cada item da lista
              image={product.image}
              title={product.title}
              description={product.description}
              link={"/produto/" + product.id} // Exemplo de link dinâmico
            />
          ))}
        </div>
      </main>
      <Footer /> {/* Renderiza o componente Footer */}
    </>
  );
}

// Exporta o componente App
export default App;
```

*   **Importando Componentes:** Usamos `import` para trazer os componentes `Header`, `Footer` e `Card`.

*   **Dados:** Definimos um array `products` diretamente no código. Em aplicações reais, esses dados geralmente vêm de uma fonte externa (API).

*   **Renderização de Listas com `.map()`:** O método `map` do JavaScript é usado para transformar cada item do array `products` em um componente `<Card>`.

*   **Passando Props:** Para cada `product` no `map`, passamos suas propriedades (`id`, `image`, `title`, `description`) como `props` para o componente `<Card>`.

*   **Prop `key`:** Ao renderizar listas, o React precisa de uma `key` única e estável para cada elemento. Isso ajuda o React a identificar eficientemente quais itens mudaram, foram adicionados ou removidos, otimizando as atualizações do DOM. Usar o `id` do produto é ideal aqui. **Nunca use o índice do array como `key` se a ordem dos itens puder mudar.**
   
### Como Executar o Projeto

1.  Certifique-se de ter instalado as dependências com `npm install`.

2.  Inicie o servidor de desenvolvimento Vite:

```bash
npm run dev
```

3.  Abra seu navegador e acesse o endereço fornecido pelo Vite (geralmente `http://localhost:5173`).

Você verá a página de produtos funcionando! Qualquer alteração que você fizer nos arquivos `.jsx` será refletida quase instantaneamente no navegador graças ao HMR do Vite.

## 5. Conceitos Fundamentais Revisados

*   **Componentes Funcionais:** Funções JavaScript que retornam JSX.

*   **JSX:** Sintaxe que mistura HTML e JavaScript (`className`, `{expressões}`).

*   **Props:** Como passar dados de componentes pai para filho.

*   **Componentização:** Dividir a UI em partes reutilizáveis (`Header`, `Footer`, `Card`).

*   **Renderização de Listas:** Usar `.map()` para gerar múltiplos componentes a partir de dados.

*   **Keys:** Atributo essencial para otimizar a renderização de listas.

*   **`createRoot` e `StrictMode`:** A forma moderna de iniciar a aplicação e detectar problemas.

*   **Vite e SWC:** Ferramentas que tornam o desenvolvimento rápido e eficiente.

### Próximos Passos

Este projeto é apenas o começo! A partir daqui, vamos estudar conceitos mais avançados do React, a saber:

*   **Roteamento (`react-router-dom`):** Para criar aplicações com múltiplas páginas (SPAs).
  
*   **Estado (`useState`):** Para gerenciar dados que mudam ao longo do tempo dentro de um componente (ex: contador, dados de formulário).

*   **Eventos (`onClick`, `onChange`):** Para responder a interações do usuário.

*   **Hooks (`useEffect`, `useContext`, etc.):** Funções especiais que permitem usar estado e outros recursos do React em componentes funcionais.

*   **Requisições a APIs (`fetch` ou `axios`):** Para buscar dados de um servidor externo.

*   **Estilização:** Explorar outras formas de estilizar componentes (CSS Modules, Styled Components, Tailwind CSS).

Espero que esta aula tenha fornecido uma introdução clara e prática ao mundo do ReactJS! Até a próxima aula!

## 6. Conclusão

Neste primeiro contato com o React, você aprendeu os conceitos fundamentais da biblioteca, como criar componentes funcionais, passar props e renderizar listas. Além disso, conheceu ferramentas modernas, como Vite e SWC, que tornam o desenvolvimento mais rápido e eficiente. Com essa base, você está pronto para explorar recursos mais avançados e construir aplicações web dinâmicas e interativas.