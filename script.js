let map;

function initMap() {
  // Inicializa o mapa com Leaflet
  map = L.map('map').setView([-23.5505, -46.6333], 13); // São Paulo

  // Mapa base gratuito do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Alerta de exemplo fixo
  L.marker([-23.5505, -46.6333])
    .addTo(map)
    .bindPopup('🚨 Alerta exemplo: Tiroteio na região')
    .openPopup();
}

// Converte o CEP em coordenadas via Nominatim (OpenStreetMap)
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

// Captura o envio do formulário e adiciona o alerta no mapa
document.getElementById("alertForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const descricao = this.descricao.value;
  const tipo = this.tipo.value;
  const localText = this.localText.value;
  const cep = this.cep.value;

  const dados = {
    descricao,
    tipo,
    localText,
    cep
  };

  console.log("📤 Alerta enviado:", dados);

  try {
    const coords = await getCoordinatesFromCEP(cep);

    L.marker([coords.lat, coords.lon])
      .addTo(map)
      .bindPopup(`🚨 <strong>${tipo}</strong><br>${descricao}<br><small>${localText}</small>`)
      .openPopup();

    alert("✅ Alerta adicionado ao mapa!");
    this.reset(); // limpa o formulário
  } catch (err) {
    alert("❌ Erro: " + err.message);
  }
});

// Inicializa o mapa ao carregar a página
window.onload = initMap;
