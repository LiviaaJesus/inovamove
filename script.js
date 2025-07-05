function initMap() {
  // Inicializa o mapa com Leaflet
  var map = L.map('map').setView([-23.5505, -46.6333], 13); // São Paulo

  // Mapa base gratuito do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Exemplo de alerta fixo
  L.marker([-23.5505, -46.6333])
    .addTo(map)
    .bindPopup('🚨 Alerta exemplo: Tiroteio na região')
    .openPopup();
}

// Inicializar o mapa quando a página carregar
window.onload = initMap;

// Captura e exibe os dados do formulário de alerta
document.getElementById("alertForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    descricao: this.descricao.value,
    tipo: this.tipo.value,
    localText: this.localText.value,
    cep: this.cep.value
  };

  console.log("📤 Alerta enviado:", data);
  alert("✅ Alerta enviado com sucesso! (simulação)");

  this.reset(); // limpa o formulário após envio
});
