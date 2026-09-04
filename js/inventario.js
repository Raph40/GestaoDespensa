async function postProdutos(event) {
    let produto = document.getElementById("inputProdutos")
    let quantidade = document.getElementById("inputQuantidade")
    let dataExpiracao = document.getElementById("inputDataExpiracao")
    let dataCompra = document.getElementById("inputDataCompra")
    let preco = document.getElementById("inputPreco")
    let superMercado = document.getElementById("inputSuperMercado")

    event.preventDefault();
    const dataHoje = new Date()
    const data = dataHoje.toISOString().split("T")[0];
    console.log(produto.length);

    if (produto.value.length !== 13) {
        document.getElementById("inputProdutosError").textContent = "Campo deve conter 13 numeros"
        document.getElementById("inputProdutosError").style.color = "red"
    }

    if (quantidade.value <= 0) {
        document.getElementById("inputQuantidadeError").textContent = "Campo só aceita numeros positivos"
        document.getElementById("inputQuantidadeError").style.color = "red"
    }

    if (dataExpiracao.value < data) {
        document.getElementById("inputDataExpiracaoError").textContent = "Produto já com validade expirada"
        document.getElementById("inputDataExpiracaoError").style.color = "red"
    }

    if (dataCompra.value > data) {
        document.getElementById("inputDataCompraError").textContent = "Data Incorreta"
        document.getElementById("inputDataCompraError").style.color = "red"
    }

    if (preco.value <= 0) {
        document.getElementById("inputPrecoError").textContent = "Campo só aceita numeros positivos"
        document.getElementById("inputPrecoError").style.color = "red"
        return
    }

    const resposta = await fetch("http://127.0.0.1:8000/produto", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            idProduto: produto.value.toString(),
            quantidade: parseInt(quantidade.value),
            dataExpiracao: dataExpiracao.value,
            dataCompra: dataCompra.value,
            preco: parseFloat(preco.value),
            superMercado: superMercado.value
        }),
    })
    console.log("Status:", resposta.status);
    getInventario()
}

export async function listaInventario() {
    let tabelaInf = document.getElementById("tableInventario")

    const resposta = await fetch("http://127.0.0.1:8000/getInventario")
    const listaInf = await resposta.json()

    listaInf.forEach(produto => {
        let validade = validadeDias(produto.dataExpiracao)

        let cor

        if (validade <= 0) {
            cor = "red";
        } else if (validade <= 7) {
            cor = "yellow";
        } else {
            cor = "green";
        }

        tabelaInf.innerHTML += `
            <table class="custom-table">
                <tr>
                    <td>${produto.idInventário}</td>
                    <td><img src="${produto.imagem}" id="imagemInventario"/> </td>
                    <td>${produto.nome}</td>
                    <td>${produto.produtos_codigoBarras}</td>
                    <td>${produto.quantidade}</td>
                    <td>${produto.dataCompra}</td>
                    <td>${produto.superMercado}</td>
                    <td>${produto.preco}€</td>
                    <td style="color: ${cor}">${validade}</td>
                    <td id="acoesButtons">
                        <button popovertarget="mypopoverVer" class="verProduto" data-id-produto="${produto.produtos_codigoBarras}">Ver</button>
                        <button>Editar</button>
                        <button>Apagar</button>
                    </td>
                </tr>
            </table>
        `


    })

    tabelaInf.addEventListener("click", async (event) => {
        if (event.target.classList.contains("verProduto")) {
            const infProdutos = event.target.getAttribute("data-id-produto")
            console.log(infProdutos)
            let campoInf = document.getElementById("mypopoverVer")
            const resposta = await fetch("http://127.0.0.1:8000/getProduto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    idProduto: infProdutos
                }),
            })
            const produto = await resposta.json()
            const listaInfVer = listaInf.find(x => x.produtos_codigoBarras === infProdutos)

            let faltaDias = validadeDias(listaInfVer.dataExpiracao)
            console.log(faltaDias)

            campoInf.innerHTML = `
                <div>
                    <div>
                        <img src="${produto.imagem}" id="imagemInventario"/>
                    </div>
                    <div>
                        <p>${produto.nome}</p>
                        <p>${produto.marca}</p>
                    </div>
                    <div>
                        <p>${produto.codigoBarras}</p>
                    </div>
                    <div>
                        <p>${produto.quantidade}</p>
                        <p>${produto.unidade}</p>
                        <p>${produto.localizacaoCompra}</p>
                    </div>
                    <div>
                        <p>${listaInfVer.superMercado}</p>
                    </div>
                    <div>
                        <p>${listaInfVer.dataCompra}</p>
                        <p>${listaInfVer.dataExpiracao}</p>
                        <p>${faltaDias}</p>
                    </div>
                    
                    <p>${produto.Categorias}</p>
                </div>
            `
        }
    })
}

function validadeDias(diaExpiracao) {
    const hoje = new Date();
    const expiracao = new Date(diaExpiracao);

    const diferenca = expiracao - hoje;

    return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

window.postProdutos = postProdutos

