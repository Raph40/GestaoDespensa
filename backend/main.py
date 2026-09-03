from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import translators as ts
import openfoodfacts
import conecao
import re

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    'http://192.168.1.65:8080',
    'http://127.0.0.1:8080',
    'http://192.168.1.65:3000',
    'http://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Produto(BaseModel):
    idProduto: str = Field(min_length=1, max_length=13)
    quantidade: int = Field(gt=0)
    dataExpiracao: str = Field(min_length=1)
    dataCompra: str = Field(min_length=1)
    preco: float | int = Field(gt=0)
    superMercado: str = Field(min_length=1)

class verProduto(BaseModel):
    idProduto: str = Field(min_length=1, max_length=13)



api = openfoodfacts.API(user_agent="MyAwesomeApp/1.0")

@app.post("/produto")
async def produto(produto: Produto):
    mydb = conecao.sqlConnection().Connection()
    mycursor = mydb.cursor()
    produtoRecolhido = api.product.get(produto.idProduto, fields=["product_name_pt", "brands", "product_quantity", "product_quantity_unit", "categories_tags", "countries", "selected_images"])
    print(produtoRecolhido)
    categorias = [ts.translate_text(re.sub("en:", "", i), translator='google', from_language='en', to_language='pt') for i in produtoRecolhido["categories_tags"]]
    imagem = produtoRecolhido["selected_images"]["front"]["display"]["pt"]

    queryInserirProduto = 'INSERT INTO Produtos (codigoBarras, nome, marca, quantidade, unidade, imagem, localizacao) VALUES (%s,%s,%s,%s,%s,%s,%s)'
    valoresProduto = (produto.idProduto, produtoRecolhido["product_name_pt"], produtoRecolhido["brands"], produtoRecolhido["product_quantity"], produtoRecolhido["product_quantity_unit"], imagem, produtoRecolhido["countries"])
    mycursor.execute(queryInserirProduto, valoresProduto)

    queryInserirCategoria = 'INSERT INTO Categorias (categorias) VALUES (%s)'
    queryAssociarProdutoCategoria = 'INSERT INTO Produtos_has_Categorias (Produtos_idProdutos, Categorias_idCategorias) VALUES (%s,%s)'
    for i in categorias:
        mycursor.execute(queryInserirCategoria, (i, ))
        idCategoria = mycursor.lastrowid
        valoresProdutoCategorias = (produto.idProduto, idCategoria)
        mycursor.execute(queryAssociarProdutoCategoria, valoresProdutoCategorias)

    queryInserirInventario = 'INSERT INTO Inventário (Produtos_codigoBarras, quantidade, dataExpiracao, dataCompra, preco, localizacaoCompra) VALUES (%s,%s,%s,%s,%s,%s)'
    valoresInventario = (produto.idProduto, produto.quantidade, produto.dataExpiracao, produto.dataCompra, produto.preco, produto.superMercado)
    mycursor.execute(queryInserirInventario, valoresInventario)

    mydb.commit()
    mycursor.close()

@app.get("/getInventario")
async def getInventario():
    mydb = conecao.sqlConnection().Connection()
    mycursor = mydb.cursor()
    queryInventario = 'SELECT idInventário, Produtos_codigoBarras, quantidade, dataExpiracao, dataCompra, preco, localizacaoCompra FROM Inventário'
    mycursor.execute(queryInventario)
    infInventario = mycursor.fetchall()

    jsonInventario = []

    for i in infInventario:
        queryProdutoImagem = 'SELECT Produtos.imagem FROM Inventário JOIN Produtos ON Inventário.Produtos_codigoBarras = Produtos.codigoBarras WHERE Inventário.Produtos_codigoBarras = %s'
        mycursor.execute(queryProdutoImagem, (i[1],))
        imagemProduto = mycursor.fetchall()

        queryProdutoNome = 'SELECT Produtos.nome FROM Inventário JOIN Produtos ON Inventário.Produtos_codigoBarras = Produtos.codigoBarras WHERE Inventário.Produtos_codigoBarras = %s'
        mycursor.execute(queryProdutoNome, (i[1],))
        nomeProduto = mycursor.fetchall()

        jsonInventario.append({
            "idInventário": i[0],
            "produtos_codigoBarras": i[1],
            "quantidade": i[2],
            "dataExpiracao": i[3],
            "dataCompra": i[4],
            "preco": i[5],
            "imagem": imagemProduto,
            "nome": nomeProduto,
            "superMercado": i[6],
        })

    return jsonInventario

@app.post("/getProduto")
async def getProduto(produto: verProduto):
    mydb = conecao.sqlConnection().Connection()
    mycursor = mydb.cursor()
    queryProduto = 'SELECT codigoBarras, nome, marca, quantidade, unidade, imagem, localizacao FROM Produtos WHERE codigoBarras = %s'
    mycursor.execute(queryProduto, (produto.idProduto,))
    infProduto = mycursor.fetchall()[0]

    queryProdutoCategorias = 'SELECT Categorias_idCategorias FROM Produtos_has_Categorias WHERE Produtos_idProdutos = %s'
    mycursor.execute(queryProdutoCategorias, (produto.idProduto, ))
    categoriasAssociadas = mycursor.fetchall()

    listaCategorias = []
    for i in categoriasAssociadas:
        queryCategorias = 'SELECT categorias FROM Categorias WHERE idCategorias = %s'
        mycursor.execute(queryCategorias, (i[0], ))
        categorias = mycursor.fetchall()
        listaCategorias.append(categorias[0][0])

    infProdutoTotal = {
        "codigoBarras": infProduto[0],
        "nome": infProduto[1],
        "marca": infProduto[2],
        "quantidade": infProduto[3],
        "unidade": infProduto[4],
        "imagem": infProduto[5],
        "localizacaoCompra": infProduto[6],
        "Categorias": listaCategorias
    }

    return infProdutoTotal