import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Servir ficheiros estáticos (HTML, JS, CSS, imagens, pasta paginas, etc.)
// O Express verifica primeiro se o ficheiro físico existe no disco.
app.use(express.static(__dirname));

// 2. Fallback da SPA: qualquer rota não encontrada como ficheiro real entrega o index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});