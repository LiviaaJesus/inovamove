let map;

function initMap() {
  // Inicializa o mapa com Leaflet
 // Inicializa o mapa com Leaflet na região de Boca do Rio - Salvador
  map = L.map('map').setView([-12.9761, -38.4554], 15); // Boca do Rio

  // Mapa base gratuito do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Alerta de exemplo fixo
  L.marker([-12.9761, -38.4554])
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
// Evento do formulário de rotas seguras
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

// Inicializa o mapa ao carregar a página
window.onload = initMap;

