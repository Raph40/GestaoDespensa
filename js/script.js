async function postProdutos() {
    let produto = document.getElementById("inputProdutos")
    console.log(produto.value)
    const resposta = await fetch("http://127.0.0.1:8000/produto", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({idProduto: produto.value}),
    })
    const json = await resposta.json()
    console.log(json)
}

const data = new Date()

let ano = data.getFullYear()
let mes = data.toLocaleDateString("pt-Pt", {month: "long"})
let dia = data.getDate()
let diaSemana = data.toLocaleDateString("pt-Pt", {weekday: "long"})

document.getElementById("data").textContent = `${diaSemana}, ${dia} de ${mes} ${ano}`
