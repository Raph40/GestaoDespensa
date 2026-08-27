async function postProdutos() {
    let produto = document.getElementById("inputProdutos")
    let quantidade = document.getElementById("inputQuantidade")
    let dataExpiracao = document.getElementById("inputDataExpiracao")
    let dataCompra = document.getElementById("inputDataCompra")
    let preco = document.getElementById("inputPreco")
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
            preco: parseFloat(preco.value)
        }),
    })
    console.log("Status:", resposta.status);
}
function getInventario() {
    console.log("funciona")
}

async function getInventario() {
    const resposta = await fetch("http://127.0.0.1:8000/getInventario")
    const data = await resposta.json()
    console.log(data)
}