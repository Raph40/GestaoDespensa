async function postProdutos() {
    let produto = document.getElementById("inputProdutos")
    let quantidade = document.getElementById("inputQuantidade")
    let dataExpiracao = document.getElementById("inputDataExpiracao")
    let dataCompra = document.getElementById("inputDataCompra")
    let preco = document.getElementById("inputPreco")
    let superMercado = document.getElementById("inputSuperMercado")
    console.log(typeof produto.value.toString())
    console.log(typeof parseInt(quantidade.value))
    console.log(typeof dataExpiracao.value)
    console.log(typeof dataCompra.value)
    console.log(typeof parseFloat(preco.value))
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

async function getInventario() {
    const resposta = await fetch("http://127.0.0.1:8000/getInventario")
    const data = await resposta.json()
    return await data
}

export async function listaInventario() {
    let div = document.getElementById("gridInventario")
    console.log(div)

    let listaInf = await getInventario()

    console.log(listaInf)

    listaInf.forEach(produto => {
        div.innerHTML += `
            <table class="custom-table">
                <tr>
                    <th>ID</th>
                    <th>Imagem</th>
                    <th>Produto</th>
                    <th>Codigo de Barras</th>
                    <th>Quantidade</th>
                    <th>Produto adquirido</th>
                    <th>Preço</th>
                    <th>Data de Validade</th>
                    <th>Ações</th>
                </tr>
                <tr>
                    <td>${produto.idInventário}</td>
                    <td><img src="${produto.imagem}" id="imagemInventario"/> </td>
                    <td>${produto.nome}</td>
                    <td>${produto.produtos_codigoBarras}</td>
                    <td>${produto.quantidade}</td>
                    <td>${produto.dataCompra}</td>
                    <td>${produto.preco}€</td>
                    <td>${produto.dataExpiracao}</td>
                    <td id="acoesButtons">
                        <button>Ver</button>
                        <button>Editar</button>
                        <button>Apagar</button>
                    </td>
                </tr>
            </table>
        `
    })
}