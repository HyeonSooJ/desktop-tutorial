document.getElementById('year').textContent = new Date().getFullYear();

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const STORAGE_KEY = 'hunters_mockinvest_v1';
const INITIAL_CASH = 10000000;

const STOCKS = [
  { key: 'samsung', name: '삼성전자', base: 78300 },
  { key: 'skhynix', name: 'SK하이닉스', base: 215500 },
  { key: 'naver', name: 'NAVER', base: 221000 },
  { key: 'kakao', name: '카카오', base: 41200 },
  { key: 'hyundai', name: '현대차', base: 256000 },
  { key: 'kis', name: '한국투자증권', base: 15200 },
  { key: 'lgenergy', name: 'LG에너지솔루션', base: 412000 },
  { key: 'kodex200', name: 'KODEX 200', base: 36450 },
];

const prices = {};
STOCKS.forEach((s) => { prices[s.key] = { price: s.base, prevClose: s.base }; });

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore corrupt state */ }
  return { cash: INITIAL_CASH, holdings: {}, txLog: [] };
};

let state = loadState();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const formatWon = (n) => `${Math.round(n).toLocaleString('ko-KR')}원`;

const holdingsValue = () => STOCKS.reduce((sum, s) => sum + (state.holdings[s.key] || 0) * prices[s.key].price, 0);

const renderStats = () => {
  const holdVal = holdingsValue();
  const total = state.cash + holdVal;
  const returnPct = ((total - INITIAL_CASH) / INITIAL_CASH) * 100;

  document.getElementById('statCash').textContent = formatWon(state.cash);
  document.getElementById('statHoldings').textContent = formatWon(holdVal);
  document.getElementById('statTotal').textContent = formatWon(total);

  const returnEl = document.getElementById('statReturn');
  const sign = returnPct >= 0 ? '+' : '';
  returnEl.textContent = `${sign}${returnPct.toFixed(2)}%`;
  returnEl.style.color = returnPct > 0 ? 'var(--color-up)' : returnPct < 0 ? 'var(--color-down)' : '';
};

const buildTable = () => {
  const tbody = document.getElementById('stockTableBody');
  tbody.innerHTML = STOCKS.map((s) => `
      <tr>
        <td class="stock-name">${s.name}</td>
        <td class="num" id="price-${s.key}"></td>
        <td class="num stock-change" id="change-${s.key}"></td>
        <td class="num" id="owned-${s.key}"></td>
        <td class="num" id="value-${s.key}"></td>
        <td>
          <div class="trade-controls">
            <input type="number" min="1" step="1" value="1" class="qty-input" id="qty-${s.key}">
            <button class="btn btn-primary btn-small" data-action="buy" data-key="${s.key}">매수</button>
            <button class="btn btn-outline btn-small" data-action="sell" data-key="${s.key}">매도</button>
          </div>
        </td>
      </tr>
    `).join('');

  tbody.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const action = btn.dataset.action;
      const qtyInput = document.getElementById(`qty-${key}`);
      const qty = Math.max(1, Math.floor(Number(qtyInput.value) || 0));
      if (action === 'buy') buyStock(key, qty);
      else sellStock(key, qty);
    });
  });

  updateTableValues();
};

const updateTableValues = () => {
  STOCKS.forEach((s) => {
    const p = prices[s.key];
    const changePct = ((p.price - p.prevClose) / p.prevClose) * 100;
    const changeClass = changePct > 0 ? 'up' : changePct < 0 ? 'down' : '';
    const changeSign = changePct >= 0 ? '▲' : '▼';
    const owned = state.holdings[s.key] || 0;
    const value = owned * p.price;

    document.getElementById(`price-${s.key}`).textContent = formatWon(p.price);
    const changeEl = document.getElementById(`change-${s.key}`);
    changeEl.textContent = `${changeSign} ${Math.abs(changePct).toFixed(2)}%`;
    changeEl.className = `num stock-change ${changeClass}`;
    document.getElementById(`owned-${s.key}`).textContent = `${owned.toLocaleString('ko-KR')}주`;
    document.getElementById(`value-${s.key}`).textContent = formatWon(value);
  });
};

const renderTxLog = () => {
  const log = document.getElementById('txLog');
  if (state.txLog.length === 0) {
    log.innerHTML = '<li class="tx-empty">아직 거래 내역이 없습니다.</li>';
    return;
  }
  log.innerHTML = state.txLog.slice(0, 20).map((tx) => `
    <li>
      <span class="tx-type ${tx.type === '매수' ? 'up' : 'down'}">${tx.type}</span>
      <span>${tx.name} ${tx.qty}주 · ${formatWon(tx.price)}</span>
      <span class="tx-time">${tx.time}</span>
    </li>
  `).join('');
};

const renderAll = () => {
  renderStats();
  updateTableValues();
  renderTxLog();
};

const logTx = (type, stock, qty, price) => {
  state.txLog.unshift({
    type,
    name: stock.name,
    qty,
    price,
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  });
};

const buyStock = (key, qty) => {
  const stock = STOCKS.find((s) => s.key === key);
  const price = prices[key].price;
  const cost = price * qty;
  if (cost > state.cash) {
    alert('보유 현금이 부족합니다.');
    return;
  }
  state.cash -= cost;
  state.holdings[key] = (state.holdings[key] || 0) + qty;
  logTx('매수', stock, qty, price);
  saveState();
  renderAll();
};

const sellStock = (key, qty) => {
  const stock = STOCKS.find((s) => s.key === key);
  const owned = state.holdings[key] || 0;
  if (qty > owned) {
    alert('보유한 수량보다 많이 매도할 수 없습니다.');
    return;
  }
  const price = prices[key].price;
  state.cash += price * qty;
  state.holdings[key] = owned - qty;
  logTx('매도', stock, qty, price);
  saveState();
  renderAll();
};

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('모의투자 계좌를 초기화할까요? 보유 자산과 거래 내역이 모두 사라집니다.')) return;
  state = { cash: INITIAL_CASH, holdings: {}, txLog: [] };
  saveState();
  renderAll();
});

setInterval(() => {
  STOCKS.forEach((s) => {
    const p = prices[s.key];
    p.prevClose = p.price;
    const changeRatio = (Math.random() - 0.5) * 0.04;
    p.price = Math.max(100, Math.round((p.price * (1 + changeRatio)) / 10) * 10);
  });
  renderStats();
  updateTableValues();
}, 3000);

buildTable();
renderAll();
