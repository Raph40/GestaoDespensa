from fastapi import FastAPI
from pydantic import BaseModel
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
    idProduto: str
    quantidade: int
    dataExpiracao: str
    dataCompra: str
    preco: float
    superMercado: str



api = openfoodfacts.API(user_agent="MyAwesomeApp/1.0")

@app.post("/produto")
async def produto(produto: Produto):
    mydb = conecao.sqlConnection().Connection()
    mycursor = mydb.cursor()
    produtoRecolhido = api.product.get(produto.idProduto, fields=["product_name_pt", "brands", "product_quantity", "product_quantity_unit", "categories_tags", "countries", "selected_images"])
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

    queryProduto = 'SELECT imagem FROM Produtos'
    mycursor.execute(queryProduto)
    imagemProduto = mycursor.fetchall()

    jsonInventario = [{
        "idInventário": i[0],
        "Produtos_codigoBarras": i[1],
        "quantidade": i[2],
        "dataExpiracao": i[3],
        "dataCompra": i[4],
        "preco": i[5],
        "imagem": imagemProduto,
        "superMercado": i[6],
    }for i in infInventario]

    return jsonInventario