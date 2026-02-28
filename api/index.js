<!-- Adicione isso no seu <head> para os ícones funcionarem -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com">

<style>
  :root {
    --bg: #0a0a0a;
    --card: #111;
    --a: #0070f3; /* Cor azul principal */
    --border: #333;
    --text-muted: #888;
    --good: #238636;
  }

  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 15px; }
  .hide { display: none; }
  .linha.entre { display: flex; justify-content: space-between; align-items: center; }
  .muted { color: var(--text-muted); font-size: 12px; margin-top: 4px; }
  .pill { background: #1a1a1a; border: 1px solid var(--border); padding: 4px 8px; border-radius: 20px; font-size: 11px; }
  .tag { color: var(--a); text-transform: uppercase; font-weight: bold; margin-right: 4px; }
  .hr { height: 1px; background: var(--border); margin: 15px 0; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  .inp, textarea { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: #000; color: #fff; width: 100%; box-sizing: border-box; }
  .btn { padding: 12px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; color: #fff; background: #333; }
  .btn.good { background: var(--good); }
  .notice { background: rgba(0, 112, 243, 0.1); border-left: 4px solid var(--a); padding: 15px; border-radius: 4px; }
</style>

<!-- HISTÓRICO (Final do painel anterior) -->
<div class="card" id="panelHist">
    <div class="linha entre">
      <div>
        <b><i class="fa-solid fa-clock-rotate-left" style="color:var(--a)"></i> Atividade</b>
        <div class="muted">seus últimos movimentos</div>
      </div>
      <span class="pill"><span class="tag">itens</span> <b id="histCount">0</b></span>
    </div>
    <div id="hist" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
</div>

<!-- TROCAS -->
<div class="card hide" id="panelTrocas">
  <div class="linha entre">
    <div>
      <b><i class="fa-solid fa-repeat" style="color:var(--a)"></i> Trocas</b>
      <div class="muted">produto + oferta</div>
    </div>
    <span class="pill"><span class="tag">posts</span> <b id="swapCount">0</b></span>
  </div>

  <div class="hr"></div>

  <div class="row">
    <input class="inp" id="swapTitle" placeholder="Nome do produto (ex: Tênis X)""")/>>
    <input class="inp" id="swapWant" placeholder="Quero em troca (ex: Moletom / BLUE)""")/>>
  </div>
  <div style="margin-top:10px">
    <textarea id="swapDesc" rows="3" placeholder="Descrição rápida..."></textarea>
  </div>

  <div class="row" style="margin-top:10px; align-items: center;">
    <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
      <i class="fa-solid fa-camera"></i> Foto/Vídeo
      <input id="swapFile" type="file" accept="image/*,video/*" style="display:none">
    </label>
    <button class="btn good" id="swapPost"><i class="fa-solid fa-bolt"></i> Publicar troca</button>
  </div>
  <div class="muted" id="swapPickInfo" style="margin-top:8px">Nenhum arquivo selecionado</div>

  <div class="hr"></div>
  <div class="grid" id="swapGrid" style="margin-top:10px"></div>
</div>

<!-- ADM -->
<div class="card hide" id="panelADM">
  <div class="linha entre">
    <div>
      <b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b>
      <div class="muted">ferramentas de controle</div>
    </div>
    <span class="pill"><span class="tag">usuários</span> <b id="uCount">0</b></span>
  </div>

  <div class="hr"></div>

  <div class="notice">
    <div class="row"><b>⛏️ “Minerar” BLUE (jogo)</b></div>
    <div class="muted" style="margin-top:6px">Clique para “quebrar gelo” e ganhe BLUE (demo).</div>
    <div class="row" style="margin-top:10px;align-items:center;gap:10px">
      <div class="pill"><span class="tag">ganho</span> <b id="mineInfo">0</b></div>
      <button class="btn good" id="mineBtn"><i class="fa-solid fa-hammer"></i> Minerar</button>
    </div>
  </div>

  <div class="hr"></div>

  <div class="linha entre">
    <b>Gerenciar Usuários</b>
    <span class="muted">banir / cargo</span>
  </div>
  <div id="uList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>

  <div class="hr"></div>

  <div class="linha entre">
    <b>Pedidos de Saque</b>
    <span class="pill"><span class="tag">pedidos</span> <b id="wCount">0</b></span>
  </div>
  <div id="wList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
</div>
    
