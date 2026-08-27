let sidebar = document.getElementById("sidebar");

function toggleSidebar() {
    sidebar.classList.toggle("close");
}

const data = new Date()

let ano = data.getFullYear()
let mes = data.toLocaleDateString("pt-Pt", {month: "long"})
let dia = data.getDate()
let diaSemana = data.toLocaleDateString("pt-Pt", {weekday: "long"})

document.getElementById("data").textContent = `${diaSemana}, ${dia} de ${mes} ${ano}`