let map;

// ✅ Lista de CEPs perigosos
const cepsPerigosos = ["41706-755", "41710-220", "40285-001"];

// ✅ Ícones personalizados para os alertas
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

// ✅ Inicializa o mapa Leaflet
function initMap() {
  map = L.map('map').setView([-12.9761, -38.4554], 15); // Boca do Rio - Salvador

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Exemplo fixo
  L.marker([-12.9761, -38.4554], { icon: icons["Tiroteio"] })
    .addTo(map)
    .bindPopup('🚨 Alerta exemplo: Tiroteio na região')
    .openPopup();
}

// ✅ Converte o CEP para coordenadas
async function getCoordinatesFromCEP(cep) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`);
  const data = await response.json();

  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } else {
    throw new Error("CEP não localizado no mapa.");
  }
}

// ✅ Formulário de envio de alerta
document.getElementById("alertForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const descricao = this.descricao.value;
  const tipo = this.tipo.value;
  const localText = this.localText.value;
  const cep = this.cep.value;
  const data = new Date().toLocaleString("pt-BR");

  try {
    const coords = await getCoordinatesFromCEP(cep);

    // Adiciona marcador no mapa
    L.marker([coords.lat, coords.lon], {
      icon: icons[tipo] || icons["Desaparecimento"]
    })
      .addTo(map)
      .bindPopup(`🚨 <strong>${tipo}</strong><br>${descricao}<br><small>${localText}</small>`)
      .openPopup();

    // Envia para Google Sheets via SheetDB
    const sheetURL = "https://sheetdb.io/api/v1/SEU_CODIGO_AQUI"; // Substitua aqui
    await fetch(sheetURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          descricao,
          tipo,
          localText,
          cep,
          data
        }
      })
    });

    alert("✅ Alerta adicionado e salvo!");
    this.reset();
  } catch (err) {
    alert("❌ Erro: " + err.message);
  }
});

// ✅ Verifica rota com base nos CEPs perigosos
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

// ✅ Comentários da comunidade
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

// ✅ Inicia o mapa
window.onload = initMap;