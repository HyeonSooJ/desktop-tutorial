document.getElementById('year').textContent = new Date().getFullYear();

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    formStatus.textContent = '모든 항목을 올바르게 입력해주세요.';
    return;
  }

  formStatus.textContent = '문의가 정상적으로 접수되었습니다. 곧 연락드리겠습니다!';
  contactForm.reset();
});

const mediaInfo = {
  joongang: { name: '중앙일보', meta: '언론 보도 (2026.04)', logo: 'assets/logo-joongang.jpg' },
  khan: { name: '경향신문', meta: '언론 보도 (2026.04)', url: 'https://www.khan.co.kr/article/202606250600061', linkLabel: '기사 보기', logo: 'assets/logo-khan.webp' },
  newspim: { name: '뉴스핌', meta: '언론 보도 (2026.04)', url: 'https://m.newspim.com/news/view/20260513000725', linkLabel: '기사 보기', logo: 'assets/logo-newspim.webp' },
  kis: { name: '한국투자증권', meta: 'MOU 체결 (2026.05)', logo: 'assets/logo-kis.webp' },
  sbs: { name: 'SBS', meta: '지상파 방송 출연 (2026.07)', url: 'https://programs.sbs.co.kr/culture/morningwide/vod/65007/22000631957', linkLabel: '다시보기', logo: 'assets/logo-sbs.webp' },
};

const mediaDetail = document.getElementById('mediaDetail');
const mediaPins = document.querySelectorAll('.media-pin');

const showMediaDetail = (key) => {
  const info = mediaInfo[key];
  if (!info || !mediaDetail) return;

  mediaPins.forEach((pin) => pin.classList.toggle('active', pin.dataset.key === key));

  const linkHtml = info.url
    ? `<a class="btn btn-outline media-detail-link" href="${info.url}" target="_blank" rel="noopener">${info.linkLabel} →</a>`
    : '';

  const logoHtml = info.logo
    ? `<img class="media-detail-logo" src="${info.logo}" alt="${info.name} 로고">`
    : '';

  mediaDetail.innerHTML = `
    ${logoHtml}
    <p class="media-detail-name">${info.name}</p>
    <p class="media-detail-meta">${info.meta}</p>
    ${linkHtml}
  `;
};

mediaPins.forEach((pin) => {
  pin.addEventListener('click', () => showMediaDetail(pin.dataset.key));
  pin.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showMediaDetail(pin.dataset.key);
    }
  });
});

const seoulDot = document.getElementById('seoulDot');
const seoulZoom = document.getElementById('seoulZoom');

const toggleSeoulZoom = () => {
  const isOpen = seoulZoom.classList.toggle('open');
  seoulDot.classList.toggle('active', isOpen);
  seoulDot.setAttribute('aria-expanded', String(isOpen));
  if (!isOpen) {
    mediaPins.forEach((pin) => pin.classList.remove('active'));
    mediaDetail.innerHTML = '<p class="media-detail-placeholder">지도에서 위치를 선택하면 자세한 내용을 확인할 수 있습니다.</p>';
  }
};

seoulDot.addEventListener('click', toggleSeoulZoom);
seoulDot.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleSeoulZoom();
  }
});

// --- 모의투자 프로그램 ---

const MOCKINVEST_STORAGE_KEY = 'hunters_mockinvest_v1';
const MOCKINVEST_INITIAL_CASH = 10000000;

const MOCKINVEST_STOCKS = [
  { key: 'samsung', name: '삼성전자', base: 78300 },
  { key: 'skhynix', name: 'SK하이닉스', base: 215500 },
  { key: 'naver', name: 'NAVER', base: 221000 },
  { key: 'kakao', name: '카카오', base: 41200 },
  { key: 'hyundai', name: '현대차', base: 256000 },
  { key: 'kis', name: '한국투자증권', base: 15200 },
  { key: 'lgenergy', name: 'LG에너지솔루션', base: 412000 },
  { key: 'kodex200', name: 'KODEX 200', base: 36450 },
];

const mockinvestPrices = {};
MOCKINVEST_STOCKS.forEach((s) => { mockinvestPrices[s.key] = { price: s.base, prevClose: s.base }; });

const loadMockinvestState = () => {
  try {
    const raw = localStorage.getItem(MOCKINVEST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore corrupt state */ }
  return { cash: MOCKINVEST_INITIAL_CASH, holdings: {}, txLog: [] };
};

let mockinvestState = loadMockinvestState();

const saveMockinvestState = () => {
  localStorage.setItem(MOCKINVEST_STORAGE_KEY, JSON.stringify(mockinvestState));
};

const formatWon = (n) => `${Math.round(n).toLocaleString('ko-KR')}원`;

const mockinvestHoldingsValue = () => MOCKINVEST_STOCKS.reduce(
  (sum, s) => sum + (mockinvestState.holdings[s.key] || 0) * mockinvestPrices[s.key].price,
  0,
);

const renderMockinvestStats = () => {
  const holdVal = mockinvestHoldingsValue();
  const total = mockinvestState.cash + holdVal;
  const returnPct = ((total - MOCKINVEST_INITIAL_CASH) / MOCKINVEST_INITIAL_CASH) * 100;

  document.getElementById('statCash').textContent = formatWon(mockinvestState.cash);
  document.getElementById('statHoldings').textContent = formatWon(holdVal);
  document.getElementById('statTotal').textContent = formatWon(total);

  const returnEl = document.getElementById('statReturn');
  const sign = returnPct >= 0 ? '+' : '';
  returnEl.textContent = `${sign}${returnPct.toFixed(2)}%`;
  returnEl.style.color = returnPct > 0 ? 'var(--color-up)' : returnPct < 0 ? 'var(--color-down)' : '';
};

const buildMockinvestTable = () => {
  const tbody = document.getElementById('stockTableBody');
  tbody.innerHTML = MOCKINVEST_STOCKS.map((s) => `
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
      if (action === 'buy') buyMockinvestStock(key, qty);
      else sellMockinvestStock(key, qty);
    });
  });

  updateMockinvestTableValues();
};

const updateMockinvestTableValues = () => {
  MOCKINVEST_STOCKS.forEach((s) => {
    const p = mockinvestPrices[s.key];
    const changePct = ((p.price - p.prevClose) / p.prevClose) * 100;
    const changeClass = changePct > 0 ? 'up' : changePct < 0 ? 'down' : '';
    const changeSign = changePct >= 0 ? '▲' : '▼';
    const owned = mockinvestState.holdings[s.key] || 0;
    const value = owned * p.price;

    document.getElementById(`price-${s.key}`).textContent = formatWon(p.price);
    const changeEl = document.getElementById(`change-${s.key}`);
    changeEl.textContent = `${changeSign} ${Math.abs(changePct).toFixed(2)}%`;
    changeEl.className = `num stock-change ${changeClass}`;
    document.getElementById(`owned-${s.key}`).textContent = `${owned.toLocaleString('ko-KR')}주`;
    document.getElementById(`value-${s.key}`).textContent = formatWon(value);
  });
};

const renderMockinvestTxLog = () => {
  const log = document.getElementById('txLog');
  if (mockinvestState.txLog.length === 0) {
    log.innerHTML = '<li class="tx-empty">아직 거래 내역이 없습니다.</li>';
    return;
  }
  log.innerHTML = mockinvestState.txLog.slice(0, 20).map((tx) => `
    <li>
      <span class="tx-type ${tx.type === '매수' ? 'up' : 'down'}">${tx.type}</span>
      <span>${tx.name} ${tx.qty}주 · ${formatWon(tx.price)}</span>
      <span class="tx-time">${tx.time}</span>
    </li>
  `).join('');
};

const renderMockinvestAll = () => {
  renderMockinvestStats();
  updateMockinvestTableValues();
  renderMockinvestTxLog();
};

const logMockinvestTx = (type, stock, qty, price) => {
  mockinvestState.txLog.unshift({
    type,
    name: stock.name,
    qty,
    price,
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  });
};

const buyMockinvestStock = (key, qty) => {
  const stock = MOCKINVEST_STOCKS.find((s) => s.key === key);
  const price = mockinvestPrices[key].price;
  const cost = price * qty;
  if (cost > mockinvestState.cash) {
    alert('보유 현금이 부족합니다.');
    return;
  }
  mockinvestState.cash -= cost;
  mockinvestState.holdings[key] = (mockinvestState.holdings[key] || 0) + qty;
  logMockinvestTx('매수', stock, qty, price);
  saveMockinvestState();
  renderMockinvestAll();
};

const sellMockinvestStock = (key, qty) => {
  const stock = MOCKINVEST_STOCKS.find((s) => s.key === key);
  const owned = mockinvestState.holdings[key] || 0;
  if (qty > owned) {
    alert('보유한 수량보다 많이 매도할 수 없습니다.');
    return;
  }
  const price = mockinvestPrices[key].price;
  mockinvestState.cash += price * qty;
  mockinvestState.holdings[key] = owned - qty;
  logMockinvestTx('매도', stock, qty, price);
  saveMockinvestState();
  renderMockinvestAll();
};

const mockinvestResetBtn = document.getElementById('resetBtn');
if (mockinvestResetBtn) {
  mockinvestResetBtn.addEventListener('click', () => {
    if (!confirm('모의투자 계좌를 초기화할까요? 보유 자산과 거래 내역이 모두 사라집니다.')) return;
    mockinvestState = { cash: MOCKINVEST_INITIAL_CASH, holdings: {}, txLog: [] };
    saveMockinvestState();
    renderMockinvestAll();
  });
}

if (document.getElementById('stockTableBody')) {
  setInterval(() => {
    MOCKINVEST_STOCKS.forEach((s) => {
      const p = mockinvestPrices[s.key];
      p.prevClose = p.price;
      const changeRatio = (Math.random() - 0.5) * 0.04;
      p.price = Math.max(100, Math.round((p.price * (1 + changeRatio)) / 10) * 10);
    });
    renderMockinvestStats();
    updateMockinvestTableValues();
  }, 3000);

  buildMockinvestTable();
  renderMockinvestAll();
}

// --- 주식강의 퀴즈 ---

const QUIZ_BEST_SCORE_PREFIX = 'hunters_quiz_best_';

const QUIZ_CHART_W = 400;
const QUIZ_CHART_H = 180;
const QUIZ_PAD_X = 16;

const quizToPoints = (values) => {
  const step = (QUIZ_CHART_W - QUIZ_PAD_X * 2) / (values.length - 1);
  return values.map((y, i) => [QUIZ_PAD_X + i * step, y]);
};

const quizPolylineChart = ({ values, color, callout, refLines = [], topLabel }) => {
  const points = quizToPoints(values);
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const dots = points.map((p, i) => {
    const isLast = i === points.length - 1;
    return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${isLast ? 5 : 3}" fill="${isLast ? color : '#c9c9c9'}" />`;
  }).join('');
  const refs = refLines.map((r) => `
    <line x1="8" y1="${r.y}" x2="392" y2="${r.y}" stroke="${r.color}" stroke-width="1.5" stroke-dasharray="5 5" />
    <text x="12" y="${r.textY != null ? r.textY : r.y - 7}" class="chart-label" fill="${r.color}">${r.text}</text>
  `).join('');
  const calloutSvg = callout
    ? `<text x="${callout.x}" y="${callout.y}" text-anchor="${callout.anchor || 'middle'}" class="chart-label chart-callout" fill="${color}">${callout.text}</text>`
    : '';
  const topLabelSvg = topLabel
    ? `<text x="12" y="20" class="chart-label">${topLabel}</text>`
    : '';
  return `
    <svg viewBox="0 0 ${QUIZ_CHART_W} ${QUIZ_CHART_H}" class="quiz-chart" role="img" aria-label="${callout ? callout.text : (topLabel || '')}">
      ${refs}
      ${topLabelSvg}
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" />
      ${dots}
      ${calloutSvg}
    </svg>
  `;
};

const trendLineChart = (direction, confirmed) => {
  const isUp = direction === 'up';
  const color = isUp ? 'var(--color-up)' : 'var(--color-down)';
  let values;
  if (isUp && confirmed) values = [150, 132, 118, 100, 82, 65, 45, 24];
  else if (isUp && !confirmed) values = [150, 128, 108, 90, 65, 32, 55, 78];
  else if (!isUp && confirmed) values = [24, 45, 65, 82, 100, 118, 135, 154];
  else values = [24, 48, 70, 92, 118, 145, 118, 92];

  const limitY = isUp ? 20 : 160;
  const limitTextY = isUp ? 13 : 174;
  const limitLabel = isUp ? '상한가 (+30%)' : '하한가 (-30%)';

  const points = quizToPoints(values);
  const lastPoint = points[points.length - 1];
  let callout = null;
  if (!confirmed) {
    const noteText = `${isUp ? '되밀림' : '반등'}`;
    const calloutY = lastPoint[1] > 90 ? lastPoint[1] - 14 : lastPoint[1] + 22;
    callout = { x: lastPoint[0], y: calloutY, text: noteText, anchor: 'middle' };
  }

  return quizPolylineChart({
    values,
    color,
    callout,
    refLines: [{ y: limitY, textY: limitTextY, color: '#9a9a9a', text: limitLabel }],
  });
};

const equityLineChart = (pct, values, favorable) => {
  const color = favorable ? 'var(--color-correct)' : 'var(--color-up)';
  return quizPolylineChart({
    values,
    color,
    topLabel: `예상 승률 ${pct}%`,
  });
};

const riskRewardLineChart = (scenario) => {
  // scenario: 'favorable-hold' | 'unfavorable-stopped'
  const favorable = scenario === 'favorable-hold';
  const entryY = 95;
  const stopY = favorable ? 115 : 158;
  const targetY = favorable ? 22 : 65;
  const stopLabel = favorable ? '손절 -2%' : '손절 -20%';
  const targetLabel = favorable ? '목표 +20%' : '목표 +2%';
  const values = favorable
    ? [95, 105, 112, 100, 80, 55, 35, 22]
    : [95, 110, 130, 148, 158, 158, 158, 158];
  const color = favorable ? 'var(--color-correct)' : 'var(--color-up)';
  return quizPolylineChart({
    values,
    color,
    refLines: [
      { y: targetY, textY: targetY - 7, color: 'var(--color-correct)', text: targetLabel },
      { y: entryY, color: 'var(--color-black)', text: '진입가' },
      { y: stopY, color: 'var(--color-up)', text: stopLabel },
    ],
  });
};

const QUIZ_SETS = {
  sangtta_basic: {
    title: '상따하따 · 기본',
    questions: [
      {
        q: '한국 주식시장의 하루 가격제한폭은 얼마인가요?',
        options: ['±10%', '±20%', '±30%', '±50%'],
        answer: 2,
        explain: '코스피·코스닥 모두 하루 가격 변동 폭이 상하 30%로 제한되어 있고, 제한폭에 도달하면 더 이상 오르거나 내리지 못한 채 거래가 종료됩니다.',
      },
      {
        q: "'상따'란 무엇을 의미하나요?",
        options: ['상한가에 도달한 종목을 따라 매수하는 전략', '하한가에 도달한 종목을 따라 매수하는 전략', '배당수익률이 높은 종목에 투자하는 전략', '신규 상장 종목에 투자하는 전략'],
        answer: 0,
        explain: "상따는 '상한가 따라잡기'의 줄임말로, 상한가에 진입한 종목의 상승 추세가 이어질 것을 기대하고 매수하는 기법입니다.",
      },
      {
        q: "'하따'란 무엇을 의미하나요?",
        options: ['하한가에 도달한 종목을 따라 매수하는 전략', '상한가에 도달한 종목을 따라 매도하는 전략', '배당을 많이 주는 종목에 장기 투자하는 전략', '신규 상장 종목을 공매도하는 전략'],
        answer: 0,
        explain: "하따는 '하한가 따라잡기'의 줄임말로, 과도하게 하락해 하한가에 도달한 종목의 반등을 기대하고 매수하는 기법입니다.",
      },
      {
        q: '모의투자대회와 달리 실전투자에서 상따·하따 전략에 더욱 신중해야 하는 이유는?',
        options: ['과거 데이터 기반의 승률이 실전에서는 달라질 수 있기 때문에', '모의투자보다 수수료가 더 비싸기 때문에', '실전에서는 상한가·하한가 제도가 없기 때문에', '실전투자는 손절매가 불가능하기 때문에'],
        answer: 0,
        explain: '실전투자는 승률이 100%였던 전략도 과거 데이터를 기반으로 하기 때문에 틀릴 수 있어, 약 60% 승률의 상따·하따를 실전에 그대로 적용하는 것은 위험할 수 있습니다.',
      },
    ],
  },
  sangtta_advanced: {
    title: '상따하따 · 심화',
    questions: [
      {
        q: '아래 차트처럼 한 종목이 급등하며 상한가에 도달했습니다. 상따 전략 관점에서 이 상황에 해당하는 대응은?',
        chart: trendLineChart('up', true),
        options: ['상한가 진입을 확인하고 추세 지속을 기대하며 매수한다', '상한가에 도달했으니 즉시 전량 매도한다', '거래량과 상관없이 무조건 공매도한다', '아무 대응도 하지 않고 관망만 한다'],
        answer: 0,
        explain: '상따는 상한가 진입 이후에도 상승 추세가 이어질 가능성에 베팅하는 전략으로, 상한가 진입을 확인한 뒤 매수에 나서는 것이 핵심입니다.',
      },
      {
        q: '이번엔 차트처럼 한 종목이 급락하며 하한가까지 도달했습니다. 하따 전략은 이 상황에서 어떤 판단을 내리나요?',
        chart: trendLineChart('down', true),
        options: ['과도하게 눌린 만큼 반등을 기대하고 매수를 고려한다', '하한가이므로 더 떨어질 것을 기대하고 공매도한다', '무조건 손절매를 실행한다', '거래를 중단하고 다른 종목을 찾는다'],
        answer: 0,
        explain: '하따는 하한가까지 과하게 눌린 종목이 이후 반등할 가능성에 베팅해 매수를 고려하는 전략입니다.',
      },
      {
        q: '아래 차트처럼 상한가에 근접했다가 막판에 밀려 상한가 진입에 실패했습니다. 이 경우 상따 전략 관점에서 올바른 판단은?',
        chart: trendLineChart('up', false),
        options: ['상한가가 확정되지 않았으므로 진입에 신중해야 한다', '근접했으니 상한가와 동일하게 취급해 매수한다', '되밀렸으므로 즉시 공매도로 전환한다', '거래량과 무관하게 추가 매수를 늘린다'],
        answer: 0,
        explain: '상따는 상한가 진입이 확정된 경우를 전제로 하는 전략입니다. 근접 후 되밀린 경우는 신호가 확정되지 않은 것이므로 신중한 판단이 필요합니다.',
      },
      {
        q: '아래 차트처럼 하한가 근처까지 급락했다가 이후 반등해 하한가에 진입하지 않았습니다. 이 상황은 무엇을 시사하나요?',
        chart: trendLineChart('down', false),
        options: ['하한가가 확정되지 않고 매수세가 유입되며 반등했다는 신호일 수 있다', '하한가에 진입했으므로 즉시 매도해야 한다', '반등과 무관하게 계속 하락할 것이 확정적이다', '차트와 무관하게 항상 매수해야 한다'],
        answer: 0,
        explain: '하한가 근접 후 진입 없이 반등했다면 매수세 유입으로 낙폭이 축소된 것으로, 하따가 전제하는 하한가 확정 상황과는 다르게 해석해야 합니다.',
      },
    ],
  },
  kelly_basic: {
    title: '켈리공식 · 기본',
    questions: [
      {
        q: '켈리공식의 기본 원리는 무엇인가요?',
        options: ['승률이 낮을수록 더 큰 금액을 베팅한다', '승률이 클수록 더 큰 금액을 베팅한다', '손익비와 상관없이 항상 동일한 금액을 베팅한다', '시장 상황과 무관하게 최대 금액을 베팅한다'],
        answer: 1,
        explain: '켈리공식은 "승률이 클수록 더 큰 금액을 투자하라"는 공식으로, 승률에 비례해 베팅 비중을 조절합니다.',
      },
      {
        q: '켈리공식에 따르면 승률이 50% 이하일 때 어떻게 해야 하나요?',
        options: ['투자하지 않는다', '최대 금액을 투자한다', '자산의 절반을 투자한다', '손익비를 무시하고 투자한다'],
        answer: 0,
        explain: '승률이 50% 이하라면 켈리공식 관점에서 투자를 하지 않는 것이 원칙이며, 승률이 100%에 가까워질수록 베팅 금액을 키웁니다.',
      },
      {
        q: '켈리공식에서 승률이 100%에 가까워질수록 베팅 금액은 어떻게 되나요?',
        options: ['점점 커진다', '점점 작아진다', '변하지 않는다', '0이 된다'],
        answer: 0,
        explain: '켈리공식은 승률이 100%에 가까워질수록 베팅 비중을 점점 늘리도록 제안합니다.',
      },
      {
        q: '켈리공식이 강조하는 투자 판단의 핵심 기준은 무엇인가요?',
        options: ['승률에 비례한 베팅 규모 조절', '무조건 균등한 금액 베팅', '손실이 나면 베팅을 두 배로 늘리는 마틴게일 방식', '시장 심리와 무관한 정액 적립식 투자'],
        answer: 0,
        explain: '켈리공식의 핵심은 승률에 따라 베팅 규모를 동적으로 조절하는 것입니다.',
      },
    ],
  },
  kelly_advanced: {
    title: '켈리공식 · 심화',
    questions: [
      {
        q: '한 트레이더의 백테스트 결과, 반복 거래에 따른 누적 자산 변화가 아래 차트처럼 나타났습니다(예상 승률 80%). 켈리공식 관점에서 올바른 대응은?',
        chart: equityLineChart(80, [150, 130, 140, 115, 95, 105, 80, 55], true),
        options: ['승률이 높으므로 베팅 비중을 늘린다', '승률과 무관하게 항상 소액만 베팅한다', '승률이 100%가 아니므로 투자하지 않는다', '반대 방향으로 베팅한다'],
        answer: 0,
        explain: '승률이 100%에 가까울수록 켈리공식은 더 큰 비중의 베팅을 제안합니다. 80%는 높은 승률이므로 비중을 늘리는 것이 원칙에 부합합니다.',
      },
      {
        q: '반대로 예상 승률 40%인 전략의 누적 자산 변화가 아래 차트처럼 나타났습니다. 켈리공식에 따르면 어떻게 해야 하나요?',
        chart: equityLineChart(40, [150, 140, 155, 145, 160, 150, 168, 160], false),
        options: ['승률이 50% 미만이므로 투자를 피한다', '승률이 낮을수록 베팅을 늘려 만회한다', '무조건 전액 투자한다', '손익비만 좋으면 승률은 무시해도 된다'],
        answer: 0,
        explain: '승률이 50%를 넘지 못하면 켈리공식 관점에서 투자를 하지 않는 것이 원칙입니다.',
      },
      {
        q: '예상 승률 95%로 나타난 전략의 누적 자산 변화가 아래 차트처럼 꾸준히 우상향합니다. 켈리공식 관점에서 가장 적절한 대응은?',
        chart: equityLineChart(95, [150, 133, 118, 100, 82, 63, 45, 22], true),
        options: ['승률이 100%에 가까우므로 베팅 비중을 최대한 늘린다', '승률이 너무 높아 오히려 투자를 줄인다', '승률과 상관없이 소액만 유지한다', '즉시 반대 포지션을 잡는다'],
        answer: 0,
        explain: '켈리공식은 승률이 100%에 가까워질수록 베팅 비중을 적극적으로 늘리도록 제안합니다. 95%는 매우 높은 승률이므로 비중을 키우는 것이 원칙에 맞습니다.',
      },
      {
        q: '예상 승률 50%로 나타난 전략의 누적 자산 변화가 아래 차트처럼 등락을 반복하며 제자리걸음입니다. 켈리공식 관점에서 어떻게 해야 하나요?',
        chart: equityLineChart(50, [150, 138, 155, 132, 148, 128, 145, 133], false),
        options: ['승률이 50%에 불과해 베팅을 매우 보수적으로 하거나 피해야 한다', '승률이 50%면 최대 금액을 베팅해야 한다', '등락이 반복되므로 무조건 유리한 구간이다', '켈리공식은 이런 경우 적용할 수 없다'],
        answer: 0,
        explain: '켈리공식은 승률 50%를 기준으로 그 이하에서는 투자를 지양하도록 제안합니다. 50%에 근접한 경계 구간 역시 베팅을 늘릴 근거가 되지 못합니다.',
      },
    ],
  },
  ratio_basic: {
    title: '손익비 · 기본',
    questions: [
      {
        q: '손익비란 무엇을 의미하나요?',
        options: ['익절 시 수익과 손절 시 손실의 비율', '매수와 매도 거래 횟수의 비율', '배당금과 주가의 비율', '거래량과 시가총액의 비율'],
        answer: 0,
        explain: '손익비는 익절했을 때의 수익과 손절했을 때의 손실 크기를 비교한 비율입니다.',
      },
      {
        q: '손익비가 10:1인 전략에서 맞췄을 때 100만원을 벌었다면, 틀렸을 때의 손실은 얼마인가요?',
        options: ['10만원', '100만원', '1,000만원', '1만원'],
        answer: 0,
        explain: '손익비 10:1은 수익과 손실의 비율이 10대 1이라는 의미이므로, 100만원 수익 대비 손실은 10만원입니다.',
      },
      {
        q: '손익비가 유리한 전략은 승률이 낮아도 반복할수록 어떻게 되나요?',
        options: ['잔고가 우상향할 수 있다', '반드시 손실이 커진다', '승률이 자동으로 올라간다', '거래를 반복할 수 없다'],
        answer: 0,
        explain: '손익비가 유리한 구간에서는 승률이 낮더라도 거래를 반복할수록 잔고가 우상향하는 구조를 만들 수 있습니다.',
      },
      {
        q: '손익비를 고려할 때 투자자가 우선적으로 신경 써야 할 것은 무엇인가요?',
        options: ['승률만 높이는 것보다 손익비를 함께 고려하는 것', '무조건 승률이 높은 전략만 찾는 것', '손절 라인을 아예 설정하지 않는 것', '목표가를 항상 낮게 설정하는 것'],
        answer: 0,
        explain: '높은 승률만 쫓기보다 손익비를 함께 고려해, 틀렸을 때 적게 잃고 맞았을 때 크게 버는 구조를 만드는 것이 중요합니다.',
      },
    ],
  },
  ratio_advanced: {
    title: '손익비 · 심화',
    questions: [
      {
        q: '아래 차트처럼 진입가 대비 손절 라인은 가깝고, 목표가는 훨씬 멀리 설정되어 있습니다. 이 구조가 의미하는 것은?',
        chart: riskRewardLineChart('favorable-hold'),
        options: ['손익비가 유리해 승률이 낮아도 반복하면 유리할 수 있다', '손익비가 불리해 이 거래는 피해야 한다', '손절 라인이 가까우므로 무조건 손해다', '목표가가 멀어서 실현 가능성이 없다'],
        answer: 0,
        explain: '손절은 가깝게, 목표가는 멀게 설정하면 손익비가 유리해져 승률이 낮아도 반복할수록 잔고가 우상향할 수 있습니다.',
      },
      {
        q: '이번엔 반대로 손절 라인은 멀고 목표가는 가까운 구조입니다. 아래 차트처럼 결국 손절 라인에 도달했다면 무엇을 보여주나요?',
        chart: riskRewardLineChart('unfavorable-stopped'),
        options: ['손익비가 불리해 한 번의 손실 규모가 커진다는 것을 보여준다', '손익비가 유리해 무조건 수익이 난다', '목표가가 가까우므로 무조건 안전하다', '승률과 손익비는 무관하다'],
        answer: 0,
        explain: '손절은 멀고 목표가는 가까운 구조에서는 한 번의 손실 규모가 커져 손익비가 불리해지고, 승률이 다소 높더라도 반복하면 손실이 누적될 수 있습니다.',
      },
      {
        q: '손익비가 유리한 거래에서 가격이 아래 차트처럼 손절 라인 근처까지 눌렸다가 목표가까지 반등했습니다. 이 상황에서 취해야 할 태도는?',
        chart: riskRewardLineChart('favorable-hold'),
        options: ['손절 라인에 닿지 않았다면 원칙대로 목표가까지 기다린다', '눌렸을 때 바로 손절하고 포기한다', '눌리는 즉시 목표가를 낮춰 조기 청산한다', '손익비와 무관하게 감정적으로 대응한다'],
        answer: 0,
        explain: '손익비가 유리하게 설계된 거래는 일시적으로 눌리더라도 손절 라인에 닿지 않았다면 원칙대로 목표가까지 기다리는 것이 전략의 취지에 부합합니다.',
      },
      {
        q: '아래 차트처럼 손절 라인이 멀어 손실 폭이 큰 구조에서 실제로 손절이 발생했습니다. 이런 거래를 자주 반복하면 어떤 위험이 있나요?',
        chart: riskRewardLineChart('unfavorable-stopped'),
        options: ['승률이 어느 정도 높아도 큰 손실이 누적되어 전체 수익을 갉아먹을 수 있다', '손절 라인이 멀수록 항상 더 안전하다', '손익비와 승률은 서로 상쇄되어 결과에 영향이 없다', '한 번 손절하면 이후 거래는 자동으로 유리해진다'],
        answer: 0,
        explain: '손절 폭이 큰 불리한 손익비 구조를 반복하면, 승률이 어느 정도 높더라도 한 번의 큰 손실이 그동안의 수익을 갉아먹을 수 있어 장기적으로 불리합니다.',
      },
    ],
  },
};

const quizCard = document.getElementById('quizCard');

const getQuizBestScore = (setKey) => Number(localStorage.getItem(QUIZ_BEST_SCORE_PREFIX + setKey) || 0);
const setQuizBestScore = (setKey, value) => {
  if (value > getQuizBestScore(setKey)) localStorage.setItem(QUIZ_BEST_SCORE_PREFIX + setKey, String(value));
};

let quizActiveSetKey = null;
let quizCurrent = 0;
let quizScore = 0;
let quizAnswered = false;

const renderQuizMenu = () => {
  const groups = [
    { label: '상따하따', basic: 'sangtta_basic', advanced: 'sangtta_advanced' },
    { label: '켈리공식', basic: 'kelly_basic', advanced: 'kelly_advanced' },
    { label: '손익비', basic: 'ratio_basic', advanced: 'ratio_advanced' },
  ];

  quizCard.innerHTML = `
    <div class="quiz-menu">
      ${groups.map((g) => `
        <div class="quiz-menu-group">
          <h3>${g.label}</h3>
          <div class="quiz-menu-buttons">
            <button class="btn btn-outline" data-set="${g.basic}">기본 (${getQuizBestScore(g.basic)}/${QUIZ_SETS[g.basic].questions.length})</button>
            <button class="btn btn-outline" data-set="${g.advanced}">심화 (${getQuizBestScore(g.advanced)}/${QUIZ_SETS[g.advanced].questions.length})</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  quizCard.querySelectorAll('button[data-set]').forEach((btn) => {
    btn.addEventListener('click', () => startQuizSet(btn.dataset.set));
  });
};

const startQuizSet = (setKey) => {
  quizActiveSetKey = setKey;
  quizCurrent = 0;
  quizScore = 0;
  renderQuizQuestion();
};

const renderQuizQuestion = () => {
  quizAnswered = false;
  const set = QUIZ_SETS[quizActiveSetKey];
  const item = set.questions[quizCurrent];
  quizCard.innerHTML = `
    <p class="quiz-progress">${set.title} · ${quizCurrent + 1} / ${set.questions.length}</p>
    <h3 class="quiz-question">${item.q}</h3>
    ${item.chart ? `<div class="quiz-chart-wrap">${item.chart}</div>` : ''}
    <div class="quiz-options" id="quizOptions">
      ${item.options.map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt}</button>`).join('')}
    </div>
    <p class="quiz-explain" id="quizExplain" hidden></p>
    <div class="quiz-actions">
      <button class="btn btn-outline" id="quizMenuBtn">메뉴로</button>
      <button class="btn btn-primary" id="quizNextBtn" hidden>다음 →</button>
    </div>
  `;

  document.getElementById('quizMenuBtn').addEventListener('click', renderQuizMenu);

  const optionButtons = quizCard.querySelectorAll('.quiz-option');
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const selected = Number(btn.dataset.index);
      const correct = item.answer;

      optionButtons.forEach((b) => { b.disabled = true; });
      btn.classList.add(selected === correct ? 'correct' : 'wrong');
      if (selected !== correct) {
        optionButtons[correct].classList.add('correct');
      } else {
        quizScore += 1;
      }

      const explainEl = document.getElementById('quizExplain');
      explainEl.textContent = item.explain;
      explainEl.hidden = false;

      const nextBtn = document.getElementById('quizNextBtn');
      nextBtn.hidden = false;
      nextBtn.textContent = quizCurrent === set.questions.length - 1 ? '결과 보기 →' : '다음 →';
      nextBtn.addEventListener('click', () => {
        quizCurrent += 1;
        if (quizCurrent < set.questions.length) {
          renderQuizQuestion();
        } else {
          renderQuizResult();
        }
      });
    });
  });
};

const renderQuizResult = () => {
  const set = QUIZ_SETS[quizActiveSetKey];
  setQuizBestScore(quizActiveSetKey, quizScore);
  const total = set.questions.length;
  const pct = Math.round((quizScore / total) * 100);
  let tier = '다시 도전해보세요';
  if (pct === 100) tier = '완벽해요';
  else if (pct >= 50) tier = '좋아요';

  quizCard.innerHTML = `
    <div class="quiz-result">
      <p class="quiz-progress">${set.title} · 완료</p>
      <h3 class="quiz-question">${total}문제 중 ${quizScore}문제 정답 (${pct}%)</h3>
      <p class="quiz-tier">${tier}</p>
      <p class="quiz-best">최고 기록: ${getQuizBestScore(quizActiveSetKey)} / ${total}</p>
      <div class="quiz-actions quiz-actions-center">
        <button class="btn btn-outline" id="quizMenuBtn2">메뉴로</button>
        <button class="btn btn-primary" id="quizRetryBtn">다시 풀기</button>
      </div>
    </div>
  `;
  document.getElementById('quizMenuBtn2').addEventListener('click', renderQuizMenu);
  document.getElementById('quizRetryBtn').addEventListener('click', () => startQuizSet(quizActiveSetKey));
};

if (quizCard) {
  renderQuizMenu();
}
