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
            <div id="gridContainer">
                <div id="card">
                    <img src="${produto.imagem}" id="imagemInventario"/> 
                    <p>Codigo de Barras: ${produto.Produtos_codigoBarras}</p>
                    <p>Quantidade: ${produto.quantidade}</p>
                    <p>Data de Validade: ${produto.dataExpiracao}</p>
                    <p>Produto adquirido: ${produto.dataCompra}</p>
                    <p>Preço: ${produto.preco}</p>
                </div>
            </div>
        `
    })
}