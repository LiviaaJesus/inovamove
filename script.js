let map;

// Lista de CEPs perigosos
const cepsPerigosos = ["41706-755", "41710-220", "40285-001"];

// Ícones personalizados para os alertas
const icons = {
  "Tiroteio": L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  "Assalto": L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/189/189664.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  "Sequestro": L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  "Desaparecimento": L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1511/1511859.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
};

const sheetURL = "https://sheetdb.io/api/v1/fnra9k6ukz7mm";

// Inicializa o mapa Leaflet (só se existir o div #map)
function initMap() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  map = L.map('map').setView([-12.9761, -38.4554], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([-12.9761, -38.4554], { icon: icons["Tiroteio"] })
    .addTo(map)
    .bindPopup('🚨 Alerta exemplo: Tiroteio na região')
    .openPopup();
}

// Pega coordenadas do CEP
async function getCoordinatesFromCEP(cep) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`);
  const data = await response.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } else {
    throw new Error("CEP não encontrado.");
  }
}

// Envio de alerta
const alertForm = document.getElementById("alertForm");
if (alertForm) {
  alertForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const descricao = this.descricao.value;
    const tipo = this.tipo.value;
    const localText = this.localText.value;
    const cep = this.cep.value;
    const data = new Date().toLocaleString("pt-BR");

    try {
      const coords = await getCoordinatesFromCEP(cep);

      L.marker([coords.lat, coords.lon], { icon: icons[tipo] || icons["Desaparecimento"] })
        .addTo(map)
        .bindPopup(`🚨 <strong>${tipo}</strong><br>${descricao}<br><small>${localText}</small>`)
        .openPopup();

      await fetch(sheetURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { descricao, tipo, localText, cep, data }
        })
      });

      alert("✅ Alerta adicionado e salvo!");
      this.reset();
    } catch (err) {
      alert("❌ Erro: " + err.message);
    }
  });
}

// Verifica rotas seguras
const rotaForm = document.getElementById("rota-form");
if (rotaForm) {
  rotaForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const cepDestino = document.getElementById("cep-destino").value.trim();
    const rotaResultado = document.getElementById("rota-resultado");

    if (cepDestino === "") {
      rotaResultado.textContent = "Por favor, digite um CEP válido.";
      rotaResultado.classList.remove("hidden");
      return;
    }

    if (cepsPerigosos.includes(cepDestino)) {
      rotaResultado.innerHTML = `
        <p class="text-red-600 font-semibold">⚠️ Atenção! A rota até o CEP <strong>${cepDestino}</strong> passa por áreas com ocorrências recentes.</p>
        <p>Tente escolher outro trajeto ou volte mais tarde.</p>`;
    } else {
      rotaResultado.innerHTML = `
        <p class="text-green-700 font-semibold">✅ Rota segura identificada!</p>
        <p>Você pode seguir até o destino <strong>${cepDestino}</strong> com base nos dados da comunidade — sem ocorrências registradas.</p>`;
    }

    rotaResultado.classList.remove("hidden");
  });
}

// Envio de comentário
const commentForm = document.getElementById("comment-form");
if (commentForm) {
  commentForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userComment = document.getElementById("user-comment");
    const comentario = userComment.value.trim();
    const data = new Date().toLocaleString("pt-BR");

    if (!comentario) return;

    try {
      await fetch(sheetURL + "?sheet=comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { comentario, data } })
      });

      addComment(comentario, data);
      userComment.value = "";
    } catch (err) {
      alert("Erro ao salvar comentário.");
    }
  });
}

// Adiciona comentário à tela
function addComment(text, date = "") {
  const commentsSection = document.getElementById("comments-section");
  if (!commentsSection) return;

  const div = document.createElement("div");
  div.classList.add("p-3", "bg-gray-50", "rounded", "border", "text-gray-800");
  div.innerHTML = `<p>${text}</p><small class="text-gray-500">${date}</small>`;
  commentsSection.prepend(div);
}

// Carrega comentários existentes da planilha
async function carregarComentarios() {
  const commentsSection = document.getElementById("comments-section");
  if (!commentsSection) return;

  try {
    const res = await fetch(sheetURL + "?sheet=comentarios");
    const comentarios = await res.json();
    commentsSection.innerHTML = "";

    comentarios.forEach(c => {
      addComment(c.comentario, c.data);
    });
  } catch (err) {
    console.error("Erro ao carregar comentários:", err);
  }
}

// Executa ao carregar a página
window.onload = function () {
  initMap();           // só carrega se houver #map
  carregarComentarios(); // carrega os comentários sempre que possível
};