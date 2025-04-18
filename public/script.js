// public/script.js

let trackingInterval = null;

/**
 * Inicia o rastreamento de localização em relação a um CEP destino.
 * @param {string|null} cepManual - CEP passado manualmente, se houver.
 */
async function startTracking(cepManual = null) {
  clearInterval(trackingInterval);

  const cep = cepManual || document.getElementById('cep').value;
  if (!cep) {
    alert("Digite um CEP válido");
    return;
  }

  // Chama BrasilAPI para obter coordenadas geográficas do CEP
  const cepRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
  const cepData = await cepRes.json();

  if (!cepData.location || !cepData.location.coordinates) {
    document.getElementById('status').innerText = 'CEP inválido ou sem coordenadas.';
    return;
  }

  const destinoLat = cepData.location.coordinates.latitude;
  const destinoLng = cepData.location.coordinates.longitude;

  // A cada segundo, obtém a posição atual e calcula a distância
  trackingInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const distancia = calcularDistancia(latitude, longitude, destinoLat, destinoLng);
      document.getElementById('status').innerText = `Distância até o destino: ${distancia.toFixed(2)} km`;
    });
  }, 1000);
}

/**
 * Calcula a distância em km entre duas coordenadas usando a fórmula de Haversine.
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Carrega a lista de restaurantes do backend e popula a tabela.
 */
async function carregarLojas() {
  const res = await fetch('/api/restaurantes');
  const restaurantes = await res.json();

  const tbody = document.querySelector('#tabelaLojas tbody');
  tbody.innerHTML = '';

  restaurantes.forEach(rest => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${rest.nome}</td>
      <td>${rest.cep}</td>
      <td>
        <button onclick="startTracking('${rest.cep}')">Rastrear</button>
        <button onclick="removerLoja(${rest.id})">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Remove um restaurante pelo ID e recarrega a lista.
 */
async function removerLoja(id) {
  await fetch(`/api/restaurantes/${id}`, { method: 'DELETE' });
  carregarLojas();
}

// Quando a página carrega, já busca os restaurantes
window.onload = carregarLojas;
