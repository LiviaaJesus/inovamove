let map;

// CEPs perigosos para exemplo
const cepsPerigosos = ["41706-755", "41710-220", "40285-001"];

// Ícones personalizados para cada tipo de alerta
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

function initMap() {
  map = L.map('map').setView([-12.9761, -38.4554], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([-12.9761, -38.4554])
    .addTo(map)
    .bindPopup('🚨 Alerta exemplo: Tiroteio na região')
    .openPopup();
}

async function getCoordinatesFromCEP(cep) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`);
  const data = await response.json();

  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } else {
    throw new Error("CEP não localizado no mapa.");
  }
}

document.getElementById("alertForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const descricao = this.descricao.value;
  const tipo = this.tipo.value;
  const localText = this.localText.value;
  const cep = this.cep.value;

  const dados = { descricao, tipo, localText, cep };

  try {
    const coords = await getCoordinatesFromCEP(cep);

    L.marker([coords.lat, coords.lon])
      .addTo(map)
      .bindPopup(`🚨 <strong>${tipo}</strong><br>${descricao}<br><small>${localText}</small>`)
      .openPopup();

    alert("✅ Alerta adicionado ao mapa!");
    this.reset();
  } catch (err) {
    alert("❌ Erro: " + err.message);
  }
});

document.getElementById("rota-form").addEventListener("submit", function (e) {
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
      <p>Tente escolher outro trajeto ou volte mais tarde.</p>
    `;
  } else {
    rotaResultado.innerHTML = `
      <p class="text-green-700 font-semibold">✅ Rota segura identificada!</p>
      <p>Você pode seguir até o destino <strong>${cepDestino}</strong> com base nos dados da comunidade — sem ocorrências registradas.</p>
    `;
  }

  rotaResultado.classList.remove("hidden");
});

document.getElementById("comment-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const comentario = document.getElementById("user-comment").value.trim();
  if (!comentario) return;

  const novoComentario = document.createElement("div");
  novoComentario.classList.add("p-3", "bg-gray-100", "rounded", "border", "text-gray-800");
  novoComentario.textContent = comentario;

  document.getElementById("comments-section").appendChild(novoComentario);
  document.getElementById("user-comment").value = "";
});

window.onload = initMap;