// public/script.js

let trackingInterval = null;

/**
 * Inicia o rastreamento de localização até um CEP.
 * Pode receber o CEP diretamente ou buscar do input na tela.
 * 
 * @param {string|null} cepManual - CEP opcional passado diretamente.
 */
async function startTracking(cepManual = null) {
  clearInterval(trackingInterval); // Cancela rastreamento anterior, se houver

  const cep = cepManual || document.getElementById('cep').value;
  if (!cep) {
    alert("Digite um CEP válido");
    return;
  }

  try {
    // Consulta BrasilAPI para obter as coordenadas do CEP
    const cepRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    const cepData = await cepRes.json();

    if (!cepData.location || !cepData.location.coordinates) {
      document.getElementById('status').innerText = 'CEP inválido ou sem coordenadas.';
      return;
    }

    const destinoLat = cepData.location.coordinates.latitude;
    const destinoLng = cepData.location.coordinates.longitude;

    // Inicia rastreamento de posição atual em relação ao destino
    trackingInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const distancia = calcularDistancia(latitude, longitude, destinoLat, destinoLng);
        document.getElementById('status').innerText =
          `Distância até o destino: ${distancia.toFixed(2)} km`;
      });
    }, 1000);

  } catch (err) {
    document.getElementById('status').innerText = 'Erro ao buscar informações do CEP.';
    console.error("Erro ao rastrear:", err);
  }
}

/**
 * Calcula a distância (em km) entre dois pontos geográficos
 * usando a fórmula de Haversine.
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio médio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Carrega os restaurantes do backend e exibe na tabela.
 */
async function carregarLojas() {
  try {
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

  } catch (err) {
    console.error("Erro ao carregar restaurantes:", err);
  }
}

/**
 * Remove um restaurante pelo ID e atualiza a lista.
 */
async function removerLoja(id) {
  try {
    await fetch(`/api/restaurantes/${id}`, { method: 'DELETE' });
    carregarLojas();
  } catch (err) {
    console.error("Erro ao remover restaurante:", err);
  }
}

// Carrega a lista automaticamente ao abrir a página
window.onload = carregarLojas;
