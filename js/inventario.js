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
    getInventario()
}

export async function listaInventario() {
    let tabelaInf = document.getElementById("tableInventario")

    const resposta = await fetch("http://127.0.0.1:8000/getInventario")
    const listaInf = await resposta.json()
    console.log(listaInf)

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
                        <button popovertarget="mypopoverEditar" class="editarProduto" data-id-produto-editar="${produto.produtos_codigoBarras}">Editar</button>
                        <button>Apagar</button>
                    </td>
                </tr>
            </table>
        `


    })

    tabelaInf.addEventListener("click", async (event) => {
        if (event.target.classList.contains("verProduto")) {
            const infProdutos = event.target.getAttribute("data-id-produto")
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

            campoInf.innerHTML = `
                <div class="cartao-produto">
                    <div class="caixa-superior">
                        <div class="container-imagem">
                            <img src="${produto.imagem}" id="imagemVer" alt="Imagem"/>
                        </div>
                        <div class="informacao">
                            <div class="linha">
                                <h2>${produto.nome} - ${produto.marca}</h2>
                            </div>
                            <div class="linha">
                                <p>Codigo de Barras: ${produto.codigoBarras}</p>
                            </div>
                            <div class="linha">
                                <p>Quantidade: ${produto.quantidade}${produto.unidade}</p>
                                <p>Origem: ${produto.localizacaoCompra} - ${listaInfVer.superMercado}</p>
                            </div>
                            <div class="linha">
                                <p>Data da Compra: ${listaInfVer.dataCompra}</p>
                                <p>Data da Validade: ${listaInfVer.dataExpiracao}</p>
                                <p>${faltaDias}</p>
                            </div>
                        </div>
                        
                    </div>
                    <div class="seccao-inferior">
                        <h1>Categorias</h1>
                        <p>${produto.Categorias}</p>
                    </div> 
                </div>
            `
        } else if (event.target.classList.contains("editarProduto")) {
            const infProdutos = event.target.getAttribute("data-id-produto-editar")
            let campoInf = document.getElementById("mypopoverEditar")
            const resposta = await fetch("http://127.0.0.1:8000/getInventario")
            const produto = await resposta.json()
            const listaInfEditar = produto.find(x => x.produtos_codigoBarras === infProdutos)

            campoInf.innerHTML = `
                <div id="caixaFormEditar">
                    <h2>Editar Produto</h2>
                    <form>
                        <div class="linhaEditar">
                            <div class="caixaImagem">
                                <img src="${listaInfEditar.imagem}" id="imagemVerEditar"/>
                                <label for="editarImagem">Selecione uma imagem:</label>
                                <input type="file" id="editarImagem" name="imagem" accept="image/*"/>
                            </div>
                
                            <div class="caixaCampos">
                                <label for="editarQuantidade">Quantidade:</label>
                                <input type="number" id="editarQuantidade" value="${listaInfEditar.quantidade}" required/>
                                <p id="inputQuantidadeError"></p>
                
                                <label for="editarDataExpiracao">Data de Expiração:</label>
                                <input type="date" id="editarDataExpiracao" value="${listaInfEditar.dataExpiracao}" required/>
                                <p id="inputDataExpiracaoError"></p>
                
                                <label for="editarDataCompra">Data da Compra:</label>
                                <input type="date" id="editarDataCompra" value="${listaInfEditar.dataExpiracao}" required/>
                                <p id="inputDataCompraError"></p>
                
                                <label for="editarPreco">Preço:</label>
                                <input type="number" id="editarPreco" value="${listaInfEditar.preco}" required/>
                                <p id="inputPrecoError"></p>
                
                                <label for="editarSuperMercado">SuperMercado:</label>
                                <input type="text" id="editarSuperMercado" value="${listaInfEditar.superMercado}" required/>
                            </div>
                        </div>
                
                        <button type="button" id="atualizarProduto">Atualizar dados</button>
                    </form>
                </div>
            `
            document.getElementById("atualizarProduto").addEventListener("click", (event) => {
                atualizarProdutos(event, listaInfEditar.produtos_codigoBarras, listaInfEditar.imagem)
            })
        }
    })
}

async function atualizarProdutos(event, codigoBarras, imagem){
    let quantidade = document.getElementById("editarQuantidade").value
    let dataExpiracao = document.getElementById("editarDataExpiracao").value
    let dataCompra = document.getElementById("editarDataCompra").value
    let preco = document.getElementById("editarPreco").value
    let superMercado = document.getElementById("editarSuperMercado").value
    let imagemNova = document.getElementById("editarImagem").files
    console.log(imagem[0][0])
    if (imagemNova.item(0)) {
        await fetch("http://127.0.0.1:8000/putProduto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                idProduto: codigoBarras.toString(),
                imagem: imagemNova.item(0),
                quantidade: parseInt(quantidade),
                dataExpiracao: dataExpiracao,
                dataCompra: dataCompra,
                preco: parseFloat(preco),
                superMercado: superMercado
            }),
        })
        location.reload();
    } else {
        await fetch("http://127.0.0.1:8000/putProduto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                idProduto: codigoBarras.toString(),
                imagem: imagem.toString(),
                quantidade: parseInt(quantidade),
                dataExpiracao: dataExpiracao,
                dataCompra: dataCompra,
                preco: parseFloat(preco),
                superMercado: superMercado
            }),
        })
        location.reload();
    }
}

function validadeDias(diaExpiracao) {
    const hoje = new Date();
    const expiracao = new Date(diaExpiracao);

    const diferenca = expiracao - hoje;

    return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

window.postProdutos = postProdutos
window.atualizarProdutos = atualizarProdutos

