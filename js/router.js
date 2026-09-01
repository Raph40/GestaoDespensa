import { listaInventario } from "./inventario.js"

// Tabela de rotas da nossa SPA.
//
// A chave é o URL que queremos utilizar
// e o valor é o ficheiro HTML que deve ser carregado.
const routes = {
    "/inventario": "inventario.html",
}

function infHeader() {
    const data = new Date()
    const rota = window.location.pathname
    const primeiraLetra = rota.charAt(1).toUpperCase() + rota.slice(2)

    let ano = data.getFullYear()
    let mes = data.toLocaleDateString("pt-Pt", {month: "long"})
    let dia = data.getDate()
    let diaSemana = data.toLocaleDateString("pt-Pt", {weekday: "long"})

    document.getElementById("data").innerHTML = `
        <div id="headerInf">
            <h2>${primeiraLetra.replace("/","")}</h2>  
            <h4>${diaSemana}, ${dia} de ${mes} ${ano}</h4>
        </div>  
    `
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

    if (path === "/") {
        document.getElementById("main-page").innerHTML = "";
        return;
    }

    // Procura no objeto "routes" qual é o HTML associado
    // ao caminho atual.
    //
    // Se path = "/dashboard"
    // route = "teste.html"
    const route = routes[path]

    if (!route) {
        return
    }

    // Vai buscar o ficheiro HTML correspondente.
    //
    // Por exemplo:
    // fetch("paginas/teste.html")
    //
    // O fetch faz um pedido ao servidor para obter esse ficheiro.
    const resposta = await fetch(`/paginas/${route}`)

    // Converte a resposta do servidor para texto HTML.
    const html = await resposta.text()

    // Coloca o HTML obtido dentro do elemento
    // com id="main-page".
    //
    // IMPORTANTE:
    // A página inteira não é recarregada.
    // Apenas o conteúdo de #main-page é substituído.
    document.getElementById("main-page").innerHTML = html

    if (path === "/inventario") {
        listaInventario()
    }

    infHeader()
}


// Escuta todos os cliques que acontecem no documento.
document.addEventListener("click", (event) => {

    // Verifica se o elemento clicado (ou algum dos seus pais) possui o atributo data-link.
    const link = event.target.closest("[data-link]");

    const path = window.location.pathname

    // SE NÃO FOR UM LINK COM DATA-LINK, NÃO FAZ NADA E DEIXA O BROWSER AGIR NORMALMENTE
    if (!link) {
        return;
    }

    // Impede o comportamento normal do <a> (apenas para os links da SPA)
    event.preventDefault();

    if (link.getAttribute("href") === path) {
        return
    }

    // Altera o URL no browser sem recarregar a página.
    history.pushState(null, "", link.href);

    rotas();
});

window.addEventListener("DOMContentLoaded", rotas);
window.addEventListener("popstate", rotas);