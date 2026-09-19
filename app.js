// ==========================================
// 1. BANCO DE DADOS LOCAL (STORAGE)
// ==========================================
let clientes = JSON.parse(localStorage.getItem('app_clientes')) || [];
let entregas = JSON.parse(localStorage.getItem('app_entregas')) || [];

function salvarDados() {
  localStorage.setItem('app_clientes', JSON.stringify(clientes));
  localStorage.setItem('app_entregas', JSON.stringify(entregas));
}

// ==========================================
// 2. NAVEGAÇÃO ENTRE ABAS
// ==========================================
function mudarAba(idAba, elementoBotao) {
  document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
  document.querySelectorAll('.btn-nav').forEach(btn => btn.classList.remove('ativo'));

  const abaAlvo = document.getElementById(idAba);
  if (abaAlvo) abaAlvo.classList.add('ativa');
  if (elementoBotao) elementoBotao.classList.add('ativo');

  if (idAba === 'aba-cliente') renderizarClientes();
  if (idAba === 'aba-entrega') renderizarEntregas();
  if (idAba === 'aba-resumo') renderizarResumo();
}

// ==========================================
// 3. CAPTURA DE GPS
// ==========================================
function capturarGps() {
  const statusGps = document.getElementById('statusGps');
  if (!navigator.geolocation) {
    if (statusGps) statusGps.innerText = '❌ Geolocalização não suportada.';
    return;
  }

  if (statusGps) statusGps.innerText = '⏳ Obtendo localização...';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const coordEl = document.getElementById('coordenadas');
      if (coordEl) coordEl.value = `${lat},${lng}`;
      if (statusGps) statusGps.innerText = `✅ GPS capturado: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    },
    (err) => {
      if (statusGps) statusGps.innerText = '❌ Erro ao obter GPS. Verifique a permissão.';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ==========================================
// 4. GESTÃO DE CLIENTES
// ==========================================
function adicionarCampoGalao(valor = '') {
  const container = document.getElementById('containerGaloes');
  if (!container) return;

  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.marginBottom = '8px';

  div.innerHTML = `
    <input type="text" class="validade-galao" placeholder="Validade (Ex: 05/28)" value="${valor}" style="flex: 1; padding: 8px; box-sizing: border-box;">
    <button type="button" onclick="this.parentElement.remove()" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer;">❌</button>
  `;
  container.appendChild(div);
}

const formCliente = document.getElementById('formCliente');
if (formCliente) {
  formCliente.addEventListener('submit', (e) => {
    e.preventDefault();

    const idEditando = document.getElementById('clienteIdEditando').value;
    const nome = document.getElementById('nomeCliente').value.trim();
    const whatsapp = document.getElementById('whatsApp').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const coordenadas = document.getElementById('coordenadas').value.trim();
    const vasilhamesComprados = document.getElementById('vasilhamesComprados').value.trim() || 'Nenhum';
    const notas = document.getElementById('notas').value.trim();

    const galoesInputs = document.querySelectorAll('.validade-galao');
    const galoes = Array.from(galoesInputs).map(i => i.value.trim()).filter(v => v !== '');

    if (idEditando) {
      const index = clientes.findIndex(c => c.id === idEditando);
      if (index !== -1) {
        clientes[index] = { ...clientes[index], nome, whatsapp, endereco, coordenadas, galoes, vasilhamesComprados, notas };
      }
    } else {
      const novoCliente = {
        id: Date.now().toString(),
        nome,
        whatsapp,
        endereco,
        coordenadas,
        galoes,
        vasilhamesComprados,
        notas
      };
      clientes.push(novoCliente);
    }

    salvarDados();
    limparFormularioCliente();
    renderizarClientes();
    alert('Cliente salvo com sucesso!');
  });
}

function editarCliente(id) {
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return;

  document.getElementById('clienteIdEditando').value = cliente.id;
  document.getElementById('nomeCliente').value = cliente.nome || '';
  document.getElementById('whatsApp').value = cliente.whatsapp || '';
  document.getElementById('endereco').value = cliente.endereco || '';
  document.getElementById('coordenadas').value = cliente.coordenadas || '';
  document.getElementById('vasilhamesComprados').value = cliente.vasilhamesComprados !== 'Nenhum' ? cliente.vasilhamesComprados : '';
  document.getElementById('notas').value = cliente.notas || '';

  const container = document.getElementById('containerGaloes');
  if (container) {
    container.innerHTML = '';
    if (cliente.galoes && cliente.galoes.length > 0) {
      cliente.galoes.forEach(val => adicionarCampoGalao(val));
    } else {
      adicionarCampoGalao();
    }
  }

  const btnSalvar = document.getElementById('btnSalvarCliente');
  if (btnSalvar) btnSalvar.innerText = '💾 Salvar Alterações';

  const btnCancelar = document.getElementById('btnCancelarEdicao');
  if (btnCancelar) btnCancelar.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormularioCliente() {
  const form = document.getElementById('formCliente');
  if (form) form.reset();

  const idEditando = document.getElementById('clienteIdEditando');
  if (idEditando) idEditando.value = '';

  const coord = document.getElementById('coordenadas');
  if (coord) coord.value = '';

  const statusGps = document.getElementById('statusGps');
  if (statusGps) statusGps.innerText = '';

  const container = document.getElementById('containerGaloes');
  if (container) {
    container.innerHTML = '';
    adicionarCampoGalao();
  }

  const btnSalvar = document.getElementById('btnSalvarCliente');
  if (btnSalvar) btnSalvar.innerText = '💾 Salvar Cliente';

  const btnCancelar = document.getElementById('btnCancelarEdicao');
  if (btnCancelar) btnCancelar.style.display = 'none';
}

function excluirCliente(id) {
  if (confirm('Deseja realmente excluir este cliente?')) {
    clientes = clientes.filter(c => c.id !== id);
    salvarDados();
    renderizarClientes();
  }
}

function renderizarClientes() {
  const lista = document.getElementById('listaClientes');
  if (!lista) return;

  if (clientes.length === 0) {
    lista.innerHTML = '<p style="color: #666;">Nenhum cliente cadastrado.</p>';
    return;
  }

  lista.innerHTML = clientes.map(c => `
    <div style="background: #f8f9fa; border: 1px solid #ddd; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
      <strong style="font-size: 1.1rem; color: #007bff;">${c.nome}</strong><br>
      📞 ${c.whatsapp || 'Não informado'}<br>
      📍 ${c.endereco || 'Sem endereço'}<br>
      🪣 Galões: ${c.galoes ? c.galoes.join(', ') : 'Nenhum'}<br>
      <div style="margin-top: 10px; display: flex; gap: 6px;">
        <button onclick="adicionarEntrega('${c.id}')" style="background: #28a745; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">➕ Novo Pedido</button>
        <button onclick="editarCliente('${c.id}')" style="background: #ffc107; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">✏️ Editar</button>
        <button onclick="excluirCliente('${c.id}')" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 5. GESTÃO DE ENTREGAS
// ==========================================
function adicionarEntrega(clienteId, quantidade = 1) {
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) return;

  const novaEntrega = {
    id: Date.now().toString(),
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    endereco: cliente.endereco,
    coordenadas: cliente.coordenadas,
    quantidade: quantidade,
    data: new Date().toLocaleString('pt-BR'),
    status: 'Pendente'
  };

  entregas.unshift(novaEntrega);
  salvarDados();
  renderizarEntregas();
}

function concluirEntrega(id) {
  const index = entregas.findIndex(e => e.id === id);
  if (index !== -1) {
    entregas[index].status = 'Concluído';
    salvarDados();
    renderizarEntregas();
  }
}

function cancelarPedido(id) {
  if (confirm('Cancelar este pedido?')) {
    entregas = entregas.filter(e => e.id !== id);
    salvarDados();
    renderizarEntregas();
  }
}

function renderizarEntregas() {
  const lista = document.getElementById('listaEntregas');
  if (!lista) return;

  const pendentes = entregas.filter(e => e.status === 'Pendente');

  if (pendentes.length === 0) {
    lista.innerHTML = '<p style="color: #666;">Nenhuma entrega pendente na fila.</p>';
    return;
  }

  lista.innerHTML = pendentes.map(e => {
    const destino = e.coordenadas ? e.coordenadas : encodeURIComponent(e.endereco);
    const linkMaps = `https://www.google.com/maps/search/?api=1&query=${destino}`;

    return `
      <div style="background: #fff; border-left: 5px solid #ffc107; border: 1px solid #ddd; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
        <strong>👤 ${e.clienteNome}</strong><br>
        📦 Quantidade: <b>${e.quantidade} galão(ões)</b><br>
        📍 ${e.endereco || 'Endereço não informado'}<br>
        🕒 Pedido feito em: ${e.data}<br>
        <div style="margin-top: 10px; display: flex; gap: 8px;">
          <button onclick="concluirEntrega('${e.id}')" style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; flex: 1;">✅ Concluir</button>
          <a href="${linkMaps}" target="_blank" style="background: #17a2b8; color: white; text-decoration: none; padding: 8px 12px; border-radius: 4px; text-align: center; flex: 1;">🗺️ NAVEGAR</a>
          <button onclick="cancelarPedido('${e.id}')" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">❌</button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 6. RESUMO / RELATÓRIO
// ==========================================
function renderizarResumo() {
  const divResumo = document.getElementById('conteudoResumo');
  if (!divResumo) return;

  const concluidas = entregas.filter(e => e.status === 'Concluído');
  const totalGaloes = concluidas.reduce((acc, curr) => acc + (parseInt(curr.quantidade) || 1), 0);

  divResumo.innerHTML = `
    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
      <div style="flex: 1; background: #e9ecef; padding: 12px; border-radius: 6px; text-align: center;">
        <h3 style="margin:0;">${concluidas.length}</h3>
        <small>Entregas Concluídas</small>
      </div>
      <div style="flex: 1; background: #e9ecef; padding: 12px; border-radius: 6px; text-align: center;">
        <h3 style="margin:0;">${totalGaloes}</h3>
        <small>Galões Entregues</small>
      </div>
    </div>
  `;
}

// ==========================================
// 7. RECONHECIMENTO DE VOZ INTEGRADO
// ==========================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconhecimentoVoz = null;
let escutandoVoz = false;

if (SpeechRecognition) {
  reconhecimentoVoz = new SpeechRecognition();
  reconhecimentoVoz.lang = 'pt-BR';
  reconhecimentoVoz.continuous = true;
  reconhecimentoVoz.interimResults = false;

  reconhecimentoVoz.onstart = () => {
    escutandoVoz = true;
    atualizarUiVoz('🟢 Ouvindo...', '#28a745', 'Desligar Voz');
  };

  reconhecimentoVoz.onend = () => {
    if (escutandoVoz) {
      reconhecimentoVoz.start();
    } else {
      atualizarUiVoz('Aguardando comando...', '#007bff', 'Ligar Voz');
    }
  };

  reconhecimentoVoz.onerror = (event) => {
    console.error('Erro de Voz:', event.error);
    if (event.error === 'not-allowed') {
      escutandoVoz = false;
      atualizarUiVoz('❌ Permissão negada.', '#dc3545', 'Ligar Voz');
    }
  };

  reconhecimentoVoz.onresult = (event) => {
    const ultimoIndice = event.results.length - 1;
    const comando = event.results[ultimoIndice][0].transcript.toLowerCase().trim();
    
    const statusVoz = document.getElementById('statusVoz');
    if (statusVoz) statusVoz.innerText = `🗣️ "${comando}"`;
    
    processarComandoVoz(comando);
  };
}

function alternarVoz() {
  if (!reconhecimentoVoz) {
    alert('Navegador não suporta reconhecimento de voz.');
    return;
  }

  if (escutandoVoz) {
    escutandoVoz = false;
    reconhecimentoVoz.stop();
  } else {
    try {
      reconhecimentoVoz.start();
    } catch (e) {
      reconhecimentoVoz.stop();
    }
  }
}

function atualizarUiVoz(textoStatus, corBarra, textoBotao) {
  const status = document.getElementById('statusVoz');
  const btnText = document.getElementById('txtBtnVoz');
  const barra = document.getElementById('barra-voz');

  if (status) status.innerText = textoStatus;
  if (btnText) btnText.innerText = textoBotao;
  if (barra) barra.style.backgroundColor = corBarra;
}

function processarComandoVoz(cmdOriginal) {
  // 1. Limpa pontuações (pontos, vírgulas) que o celular insere automaticamente
  let cmd = cmdOriginal.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .trim();

  // NAVEGAÇÃO ENTRE ABAS
  if (cmd.includes('cliente') || cmd.includes('clientes')) {
    mudarAba('aba-cliente', document.querySelectorAll('.btn-nav')[0]);
    return;
  }
  if (cmd.includes('entrega') || cmd.includes('entregas') || cmd.includes('fila')) {
    mudarAba('aba-entrega', document.querySelectorAll('.btn-nav')[1]);
    return;
  }
  if (cmd.includes('resumo') || cmd.includes('relatorio') || cmd.includes('faturamento')) {
    mudarAba('aba-resumo', document.querySelectorAll('.btn-nav')[2]);
    return;
  }

  // GPS E MAPAS
  if (cmd.includes('pegar gps') || cmd.includes('minha localizacao') || cmd.includes('capturar gps')) {
    capturarGps();
    return;
  }

  if (cmd.includes('navegar para') || cmd.includes('gps para')) {
    const nome = cmd.replace('navegar para', '').replace('gps para', '').trim();
    const cliente = clientes.find(c => c.nome.toLowerCase().includes(nome));
    if (cliente) {
      const destino = cliente.coordenadas ? cliente.coordenadas : encodeURIComponent(cliente.endereco);
      window.open(`https://www.google.com/maps/search/?api=1&query=${destino}`, '_blank');
    } else {
      alert(`Cliente "${nome}" não encontrado.`);
    }
    return;
  }

  // CONCLUIR ENTREGA
  if (cmd.includes('concluir') || cmd.includes('entregar para') || cmd.includes('finalizar')) {
    const nome = cmd.replace('concluir entrega do', '')
                   .replace('concluir entrega', '')
                   .replace('entregar para', '')
                   .replace('finalizar', '').trim();

    const pedido = entregas.find(e => e.status === 'Pendente' && e.clienteNome.toLowerCase().includes(nome));
    if (pedido) {
      concluirEntrega(pedido.id);
      alert(`Entrega de ${pedido.clienteNome} concluída!`);
    } else {
      alert(`Nenhum pedido pendente para "${nome}".`);
    }
    return;
  }

  // ==========================================
  // PREENCHIMENTO DIRETO: CAMPO POR CAMPO
  // ==========================================
  if (cmd.startsWith('nome ')) {
    mudarAba('aba-cliente', document.querySelectorAll('.btn-nav')[0]);
    const valor = cmdOriginal.replace(/^nome/i, '').trim();
    document.getElementById('nomeCliente').value = valor.toUpperCase();
    return;
  }

  if (cmd.startsWith('telefone ') || cmd.startsWith('whatsapp ') || cmd.startsWith('celular ') || cmd.startsWith('fone ')) {
    mudarAba('aba-cliente', document.querySelectorAll('.btn-nav')[0]);
    const num = cmd.replace(/^(telefone|whatsapp|celular|fone)/i, '').replace(/\D/g, '');
    document.getElementById('whatsApp').value = num;
    return;
  }

  if (cmd.startsWith('endereço ') || cmd.startsWith('endereco ')) {
    mudarAba('aba-cliente', document.querySelectorAll('.btn-nav')[0]);
    const end = cmdOriginal.replace(/^(endereço|endereco)/i, '').trim();
    document.getElementById('endereco').value = end;
    return;
  }

  // ==========================================
  // PREENCHIMENTO FRASE COMPLETA (INTELIGENTE)
  // ==========================================
  if (cmd.includes('cadastrar') || cmd.includes('novo cliente')) {
    mudarAba('aba-cliente', document.querySelectorAll('.btn-nav')[0]);

    let texto = cmdOriginal;

    // Busca inteligente por telefone/fone/zap
    let telMatch = texto.match(/(?:telefone|celular|whatsapp|zap|fone)\s+([\d\s\(\)\-]+)/i);
    // Busca inteligente por endereço/rua
    let endMatch = texto.match(/(?:endereço|endereco|rua|avenida)\s+(.+?)(?=\s+(?:telefone|celular|whatsapp|zap|fone)|$)/i);

    let telefoneExtraido = telMatch ? telMatch[1].replace(/\D/g, '') : '';
    let enderecoExtraido = endMatch ? endMatch[1].trim() : '';

    // Isola o nome removendo as outras partes
    let nomeExtraido = texto
      .replace(/cadastrar cliente/i, '')
      .replace(/novo cliente/i, '')
      .replace(/cadastrar/i, '');

    if (telMatch) nomeExtraido = nomeExtraido.replace(telMatch[0], '');
    if (endMatch) nomeExtraido = nomeExtraido.replace(endMatch[0], '');

    nomeExtraido = nomeExtraido.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();

    if (nomeExtraido) document.getElementById('nomeCliente').value = nomeExtraido.toUpperCase();
    if (telefoneExtraido) document.getElementById('whatsApp').value = telefoneExtraido;
    if (enderecoExtraido) document.getElementById('endereco').value = enderecoExtraido;

    alert(`Preenchido por voz:\n👤 Nome: ${nomeExtraido || 'Verificar'}\n📞 Tel: ${telefoneExtraido || 'Verificar'}\n📍 End: ${enderecoExtraido || 'Verificar'}`);
    return;
  }

  // CRIAR NOVO PEDIDO POR VOZ
  if (cmd.includes('novo pedido') || cmd.includes('fazer pedido') || cmd.includes('pedido')) {
    mudarAba('aba-entrega', document.querySelectorAll('.btn-nav')[1]);

    let partes = cmd.replace('novo pedido para', '').replace('fazer pedido para', '').replace('novo pedido', '').replace('pedido para', '').replace('pedido', '').trim();
    let nomeCliente = partes;
    let quantidade = 1;

    if (partes.includes('quantidade') || partes.includes('qtd')) {
      const dados = partes.split(/quantidade|qtd/);
      nomeCliente = dados[0].trim();
      const qtdExtraida = parseInt(dados[1].replace(/\D/g, ''));
      if (!isNaN(qtdExtraida)) quantidade = qtdExtraida;
    }

    const clienteEncontrado = clientes.find(c => c.nome.toLowerCase().includes(nomeCliente));
    if (clienteEncontrado) {
      adicionarEntrega(clienteEncontrado.id, quantidade);
      alert(`Pedido de ${quantidade} galão(ões) criado para ${clienteEncontrado.nome}!`);
    } else {
      alert(`Cliente "${nomeCliente}" não encontrado na lista.`);
    }
    return;
  }

  if (cmd.includes('limpar')) {
    limparFormularioCliente();
    return;
  }
}

// INICIALIZAÇÃO AO CARREGAR A PÁGINA
window.onload = () => {
  adicionarCampoGalao();
  renderizarClientes();
  renderizarEntregas();
  renderizarResumo();
};