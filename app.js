// ===================== FÓRMULAS DE PONTUAÇÃO =====================
// Funções não podem viver no JSON, então ficam aqui, indexadas pelo id da peça
// (definido em data.json). Cada função recebe um objeto com os valores
// preenchidos na calculadora (chaves = calcVars[].k) e retorna um número.
const CALC_FORMULAS = {
  wheelbarrow: (v) => v.oeste * v.props,
  boot:        (v) => (v.mao * v.props) / (v.jogadores + 1),
  iron:        (v) => v.herdeiro / 2,
  thimble:     (v) => { const r = v.vitima - v.dinheiro; return r < 0 ? Math.abs(r) : r; },
  battleship:  (v) => v.oeste * v.casas,
  car:         (v) => v.oeste * v.hoteis,
  dog:         (v) => v.oeste / 2,
  hat:         ()  => 0,
  cat:         ()  => 0,
  penguin:     (v) => v.vitima,
  duck:        (v) => v.presos * v.props,
  trex:        (v) => v.pessoas * v.props,
};

// ===================== ESTADO GLOBAL =====================
let DATA = null;

// ===================== CARREGAMENTO DOS DADOS =====================
async function loadData(){
  try{
    const res = await fetch('data.json');
    if(!res.ok) throw new Error('HTTP ' + res.status);
    DATA = await res.json();
    initApp();
  }catch(err){
    document.body.innerHTML = `
      <div style="max-width:640px; margin:4rem auto; padding:1.5rem; font-family:sans-serif; border:3px solid #1A1A1A; background:#F7F3E3;">
        <h2 style="color:#B22222;">Não foi possível carregar data.json</h2>
        <p>Navegadores bloqueiam <code>fetch()</code> de arquivos abertos direto do disco (protocolo <code>file://</code>).</p>
        <p>Para abrir este projeto localmente, sirva a pasta com um servidor simples, por exemplo:</p>
        <pre style="background:#1A1A1A; color:#F7F3E3; padding:0.75rem; overflow-x:auto;">python -m http.server 8000</pre>
        <p>...e acesse <code>http://localhost:8000/index.html</code> no navegador.</p>
        <p style="color:#333;">Detalhe técnico: ${err.message}</p>
      </div>
    `;
  }
}

function initApp(){
  renderRegras();
  renderPecas(DATA.pecas);
  document.getElementById('piece-search').addEventListener('input', onPieceSearch);

  renderEspeciais();

  renderCards();
  document.getElementById('card-search').addEventListener('input', renderCards);
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => onTabClick(btn));
  });

  renderTabuleiro();
  setupModal();
  setupCalculadora();
}

// ===================== REGRAS GERAIS =====================
function renderRegras(){
  const grid = document.getElementById('regras-grid');
  grid.innerHTML = DATA.regrasGerais.map(r => `
    <div class="card brick-border-thin" style="padding:1.1rem;">
      <div style="font-size:1.6rem;">${r.icon}</div>
      <h3 style="font-size:1.05rem; margin:0.5rem 0 0.35rem;">${r.title}</h3>
      <p style="margin:0; font-size:0.93rem; color:var(--iron);">${r.text}</p>
    </div>
  `).join('');
}

// ===================== PEÇAS =====================
function renderPecas(list){
  const grid = document.getElementById('pieces-grid');
  const empty = document.getElementById('pieces-empty');
  if(list.length === 0){
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = list.map(p => `
    <div class="card-piece" style="padding:1.1rem;" data-id="${p.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${p.nome}">
      <div style="display:flex; align-items:center; flex-direction: column">
        <div class="badge-icon">${p.icon}</div>
        <div>
          <h3 style="font-size:1rem; margin:0;">${p.nome}</h3>
          <center><p class="label-narrow" style="margin:0.1rem 0 0; font-size:0.82rem; color:var(--red); font-weight:700;">${p.identidade}</p></center>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.card-piece').forEach(el => {
    el.addEventListener('click', () => openPecaModal(el.dataset.id));
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openPecaModal(el.dataset.id); } });
  });
}

function onPieceSearch(e){
  const q = e.target.value.toLowerCase().trim();
  const filtered = DATA.pecas.filter(p =>
    p.nome.toLowerCase().includes(q) ||
    p.identidade.toLowerCase().includes(q) ||
    p.habilidade.toLowerCase().includes(q) ||
    p.endgame.toLowerCase().includes(q)
  );
  renderPecas(filtered);
}

function openPecaModal(id){
  const p = DATA.pecas.find(x => x.id === id);
  if(!p) return;
  document.getElementById('modal-content').innerHTML = `
    <div style="display:flex; align-items:center; gap:0.85rem; margin-bottom:0.75rem;">
      <div class="badge-icon" style="font-size:2.2rem; width:3.6rem; height:3.6rem;">${p.icon}</div>
      <div>
        <h2 id="modal-title" style="margin:0; font-size:1.3rem;">${p.nome}</h2>
        <p class="label-narrow" style="margin:0.15rem 0 0; color:var(--red); font-weight:700;">${p.identidade}</p>
      </div>
    </div>
    <h4 style="margin-bottom:0.25rem;">Habilidade em jogo</h4>
    <p style="margin-top:0;">${p.habilidade}</p>
    <h4 style="margin-bottom:0.25rem;">Fim de Jogo</h4>
    <p style="margin-top:0;">${p.endgame}</p>
    <div class="card brick-border-thin" style="padding:0.85rem 1rem; margin-top:0.75rem;">
      <p style="margin:0;" class="label-narrow"><strong>Pontuação:</strong> ${p.formula}</p>
    </div>
  `;
  openModal();
}

// ===================== REGRAS ESPECIAIS =====================
function renderEspeciais(){
  const grid = document.getElementById('especiais-grid');
  grid.innerHTML = DATA.especiais.map(sec => `
    <div class="card brick-border-thin" style="padding:1.25rem;">
      <h3 style="font-size:1.1rem; color:var(--red); margin-top:0;">${sec.titulo}</h3>
      <ul style="margin:0; padding-left:1.1rem;">
        ${sec.itens.map(i => `<li style="margin-bottom:0.5rem;">${i}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ===================== CARTAS =====================
function renderCartaList(containerId, list, query){
  const el = document.getElementById(containerId);
  const filtered = list.filter(c =>
    c.nome.toLowerCase().includes(query) || c.texto.toLowerCase().includes(query)
  );
  if(filtered.length === 0){
    el.innerHTML = '';
    return 0;
  }
  el.innerHTML = `<div style="display:flex; flex-direction:column; gap:0.6rem;">` + filtered.map((c,i) => `
    <div class="acc-item">
      <button class="acc-header" aria-expanded="false" data-idx="${containerId}-${i}">
        <span class="star">${c.nome}</span>
        <span class="chev">▾</span>
      </button>
      <div class="acc-panel" id="panel-${containerId}-${i}">
        <p style="margin:0;">${c.texto}</p>
      </div>
    </div>
  `).join('') + `</div>`;

  el.querySelectorAll('.acc-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById('panel-' + btn.dataset.idx);
      const isOpen = panel.classList.contains('open');
      if(isOpen){
        panel.classList.remove('open');
        panel.style.maxHeight = null;
        btn.setAttribute('aria-expanded','false');
      } else {
        panel.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded','true');
      }
    });
  });
  return filtered.length;
}

function renderCards(){
  const q = document.getElementById('card-search').value.toLowerCase().trim();
  const n1 = renderCartaList('cards-no-chance', DATA.noChance, q);
  const n2 = renderCartaList('cards-communist-test', DATA.communistTest, q);
  document.getElementById('cards-empty').style.display = (n1 === 0 && n2 === 0) ? 'block' : 'none';
}

function onTabClick(btn){
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const tab = btn.dataset.tab;
  document.getElementById('cards-no-chance').style.display = tab === 'no-chance' ? 'block' : 'none';
  document.getElementById('cards-communist-test').style.display = tab === 'communist-test' ? 'block' : 'none';
}

// ===================== TABULEIRO =====================
function renderTabuleiro(){
  const grid = document.getElementById('board-grid');
  grid.innerHTML = DATA.tabuleiro.map((nome, i) => {
    const isCorner = DATA.cornerSpaces.includes(nome);
    const isSpecial = !!DATA.espacosEspeciais[nome];
    const cls = isCorner ? 'board-cell corner' : (isSpecial ? 'board-cell special' : 'board-cell');
    return `
      <div class="${cls}" ${isSpecial ? `data-special="${nome}" tabindex="0" role="button" aria-label="Detalhes de ${nome}"` : ''}>
        <span class="pos-num">${i+1}${isSpecial ? ' ★' : ''}</span>
        <span class="cell-name">${nome}</span>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('[data-special]').forEach(el => {
    const open = () => openEspacoModal(el.dataset.special);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
  });
}

function openEspacoModal(nome){
  document.getElementById('modal-content').innerHTML = `
    <h2 id="modal-title" style="margin-top:0; font-size:1.25rem; color:var(--red);">${nome}</h2>
    <p style="margin:0;">${DATA.espacosEspeciais[nome]}</p>
  `;
  openModal();
}

// ===================== MODAL GENÉRICO =====================
let overlay, isModalSetup = false;
function setupModal(){
  if(isModalSetup) return;
  overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });
  isModalSetup = true;
}
function openModal(){ overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(){ overlay.classList.remove('open'); document.body.style.overflow = ''; }

// ===================== CALCULADORA DE PONTUAÇÃO =====================
function setupCalculadora(){
  const calcSelect = document.getElementById('calc-piece');
  calcSelect.innerHTML = DATA.pecas.map(p => `<option value="${p.id}">${p.icon} ${p.nome}</option>`).join('');

  function renderCalcInputs(){
    const p = DATA.pecas.find(x => x.id === calcSelect.value);
    const inputsEl = document.getElementById('calc-inputs');
    const noteEl = document.getElementById('calc-note');
    document.getElementById('calc-result').textContent = '';

    inputsEl.innerHTML = p.calcVars.map(v => `
      <div>
        <label class="label-narrow" style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.25rem;">${v.label}</label>
        <input type="number" data-var="${v.k}" value="0" style="width:100%;">
      </div>
    `).join('');

    noteEl.textContent = p.special
      ? 'Peça de mecânica interativa: o resultado depende de outro jogador (herança, roubo ou rotação). Preencha o valor combinado com o grupo.'
      : '';

    calculateScore();
  }

  function calculateScore(){
    const p = DATA.pecas.find(x => x.id === calcSelect.value);
    const values = {};
    document.querySelectorAll('#calc-inputs input').forEach(inp => {
      values[inp.dataset.var] = parseFloat(inp.value) || 0;
    });
    let result;
    try{
      result = CALC_FORMULAS[p.id](values);
    }catch(e){
      result = 0;
    }
    if(!isFinite(result)) result = 0;
    document.getElementById('calc-result').textContent = `${Math.round(result*100)/100} pontos`;
  }

  calcSelect.addEventListener('change', renderCalcInputs);
  document.getElementById('calc-inputs').addEventListener('input', calculateScore);

  renderCalcInputs();
}

// ===================== INICIAR =====================
loadData();
