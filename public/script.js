let trackingInterval = null;

async function startTracking(cepManual = null) {
  clearInterval(trackingInterval);

  const cep = cepManual || document.getElementById('cep').value;
  if (!cep) return alert("Digite um CEP válido");

  const cepRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
  const cepData = await cepRes.json();
  if (!cepData.location || !cepData.location.coordinates) {
    document.getElementById('status').innerText = 'CEP inválido ou sem coordenadas.';
    return;
  }

  const destinoLat = cepData.location.coordinates.latitude;
  const destinoLng = cepData.location.coordinates.longitude;

  trackingInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const distancia = calcularDistancia(latitude, longitude, destinoLat, destinoLng);
      document.getElementById('status').innerText = `Distância até o destino: ${distancia.toFixed(2)} km`;
    });
  }, 1000);
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function carregarLojas() {
  const res = await fetch('/api/lojas');
  const lojas = await res.json();
  const tbody = document.querySelector('#tabelaLojas tbody');
  tbody.innerHTML = '';

  lojas.forEach(loja => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${loja.nome}</td>
      <td>${loja.cep}</td>
      <td>
        <button onclick="startTracking('${loja.cep}')">Rastrear</button>
        <button onclick="removerLoja(${loja.id})">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function adicionarLoja() {
  const nome = document.getElementById('nomeLoja').value;
  const cep = document.getElementById('cepLoja').value;
  if (!nome || !cep) return alert('Preencha o nome e o CEP');

  await fetch('/api/lojas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, cep }),
  });

  document.getElementById('nomeLoja').value = '';
  document.getElementById('cepLoja').value = '';
  carregarLojas();
}

async function removerLoja(id) {
  await fetch(`/api/lojas/${id}`, { method: 'DELETE' });
  carregarLojas();
}

window.onload = carregarLojas;
