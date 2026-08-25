from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator
import openfoodfacts
import conecao
import re

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    'http://192.168.1.67:8080',
    'http://127.0.0.1:8080',
]

class Produto(BaseModel):
    idProduto: int
    """quantidade: int
    dataExpiracao: str
    dataCompra: str
    preco: float"""


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = openfoodfacts.API(user_agent="MyAwesomeApp/1.0")

@app.post("/produto")
async def produto(produto: Produto):
    mydb = conecao.sqlConnection().Connection()
    mycursor = mydb.cursor()
    tradutorPT = GoogleTranslator(source="auto", target="pt")
    produtoRecolhido = api.product.get(str(produto.idProduto), fields=["product_name_pt", "brands", "quantity", "categories_tags", "countries", "selected_images"])
    categorias = [tradutorPT.translate(re.sub("en:", "", i)) for i in produtoRecolhido["categories_tags"]]
    imagem = produtoRecolhido["selected_images"]["front"]["display"]["pt"]
    return produtoRecolhido
