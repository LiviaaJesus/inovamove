
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 12,
  });

  new google.maps.Marker({
    position: { lat: -23.5505, lng: -46.6333 },
    map,
    title: "Alerta exemplo",
  });
}

document.getElementById("alertForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const data = {
    descricao: this.descricao.value,
    tipo: this.tipo.value,
    localText: this.localText.value,
  };
  console.log("Alerta enviado:", data);
  alert("Alerta enviado com sucesso! (Simulação)");
});
