// Tabela de rotas da nossa SPA.
//
// A chave é o URL que queremos utilizar
// e o valor é o ficheiro HTML que deve ser carregado.
const routes = {
    "/dashboard": "teste.html",
    "/inventario": "inventario.html",
}


async function rotas() {

    // Obtém apenas o caminho atual do URL.
    //
    // Exemplo:
    // http://localhost:5500/dashboard
    //                    ↑
    //              window.location.pathname
    //
    // Resultado: "/dashboard"
    const path = window.location.pathname

    // Procura no objeto "routes" qual é o HTML associado
    // ao caminho atual.
    //
    // Se path = "/dashboard"
    // route = "teste.html"
    const route = routes[path]

    console.log(path)

    // Vai buscar o ficheiro HTML correspondente.
    //
    // Por exemplo:
    // fetch("paginas/teste.html")
    //
    // O fetch faz um pedido ao servidor para obter esse ficheiro.
    const resposta = await fetch(`paginas/${route}`)

    // Converte a resposta do servidor para texto HTML.
    const html = await resposta.text()

    // Coloca o HTML obtido dentro do elemento
    // com id="main-page".
    //
    // IMPORTANTE:
    // A página inteira não é recarregada.
    // Apenas o conteúdo de #main-page é substituído.
    document.getElementById("main-page").innerHTML = html
}


// Escuta todos os cliques que acontecem no documento.
document.addEventListener("click", (event) => {

    // Verifica se o elemento clicado (ou algum dos seus pais)
    // é um elemento que possui o atributo data-link.
    //
    // Exemplo:
    // <a href="/inventario" data-link>Inventário</a>
    //
    // closest() devolve esse <a>.
    const link = event.target.closest("[data-link]");


    // Impede o comportamento normal do <a>.
    //
    // Normalmente, clicar num <a> faria o browser navegar
    // para outra página e recarregaria o HTML.
    //
    // Numa SPA não queremos esse comportamento.
    event.preventDefault();


    // Altera o URL no browser sem recarregar a página.
    //
    // Exemplo:
    // /dashboard
    //      ↓
    // /inventario
    //
    // O conteúdo da página ainda não mudou neste momento.
    history.pushState(null, "", link.href);


    // Agora que o URL mudou, carregamos o conteúdo
    // correspondente à nova rota.
    rotas();
});