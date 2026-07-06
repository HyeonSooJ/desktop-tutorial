document.getElementById('year').textContent = new Date().getFullYear();

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const BEST_SCORE_PREFIX = 'hunters_quiz_best_';

// --- Chart builders (simple illustrative SVGs, not real market data) ---

const trendChart = (direction, limitLabel) => {
  const bars = direction === 'up'
    ? [40, 55, 50, 68, 78, 92, 105, 130]
    : [130, 118, 122, 100, 90, 75, 60, 38];
  const barW = 32;
  const gap = 12;
  const baseY = 160;
  const lastIndex = bars.length - 1;
  const lastX = 16 + lastIndex * (barW + gap);
  const lastTopY = baseY - bars[lastIndex];
  const bars_svg = bars.map((h, i) => {
    const x = 16 + i * (barW + gap);
    const isLast = i === lastIndex;
    const fill = isLast ? (direction === 'up' ? 'var(--color-up)' : 'var(--color-down)') : '#c9c9c9';
    return `<rect x="${x}" y="${baseY - h}" width="${barW}" height="${h}" fill="${fill}" rx="2" />`;
  }).join('');
  return `
    <svg viewBox="0 0 400 180" class="quiz-chart" role="img" aria-label="${direction === 'up' ? '상한가' : '하한가'} 도달 차트">
      ${bars_svg}
      <line x1="8" y1="${baseY}" x2="392" y2="${baseY}" stroke="#d0d0d0" stroke-width="1" />
      <text x="${lastX + barW / 2}" y="${lastTopY - 10}" text-anchor="middle" class="chart-label chart-callout">${limitLabel}</text>
    </svg>
  `;
};

const winRateChart = (pct) => {
  const width = 360;
  const winW = (width * pct) / 100;
  return `
    <svg viewBox="0 0 380 90" class="quiz-chart" role="img" aria-label="예상 승률 ${pct}%">
      <rect x="10" y="30" width="${width}" height="32" fill="#e2e2e2" rx="3" />
      <rect x="10" y="30" width="${winW}" height="32" fill="var(--color-black)" rx="3" />
      <text x="${10 + winW / 2}" y="51" text-anchor="middle" class="chart-bar-label">${pct}%</text>
      <text x="10" y="20" class="chart-label">예상 승률</text>
    </svg>
  `;
};

const ratioChart = (favorable) => {
  const entryY = 90;
  const stopY = favorable ? 108 : 155;
  const targetY = favorable ? 25 : 65;
  const stopLabel = favorable ? '손절 -2%' : '손절 -20%';
  const targetLabel = favorable ? '목표 +20%' : '목표 +2%';
  return `
    <svg viewBox="0 0 380 180" class="quiz-chart" role="img" aria-label="손익비 ${favorable ? '유리' : '불리'}한 구조">
      <line x1="20" y1="${targetY}" x2="360" y2="${targetY}" stroke="var(--color-correct)" stroke-width="1.5" stroke-dasharray="5 5" />
      <text x="20" y="${targetY - 8}" class="chart-label" fill="var(--color-correct)">${targetLabel}</text>
      <line x1="20" y1="${entryY}" x2="360" y2="${entryY}" stroke="var(--color-black)" stroke-width="2" />
      <text x="20" y="${entryY - 8}" class="chart-label">진입가</text>
      <line x1="20" y1="${stopY}" x2="360" y2="${stopY}" stroke="var(--color-up)" stroke-width="1.5" stroke-dasharray="5 5" />
      <text x="20" y="${stopY + 16}" class="chart-label" fill="var(--color-up)">${stopLabel}</text>
    </svg>
  `;
};

// --- Quiz content, grouped by topic and level ---

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
    ],
  },
  sangtta_advanced: {
    title: '상따하따 · 심화',
    questions: [
      {
        q: '아래 차트처럼 한 종목이 급등하며 상한가에 도달했습니다. 상따 전략 관점에서 이 상황에 해당하는 대응은?',
        chart: trendChart('up', '상한가 (+30%)'),
        options: ['상한가 진입을 확인하고 추세 지속을 기대하며 매수한다', '상한가에 도달했으니 즉시 전량 매도한다', '거래량과 상관없이 무조건 공매도한다', '아무 대응도 하지 않고 관망만 한다'],
        answer: 0,
        explain: '상따는 상한가 진입 이후에도 상승 추세가 이어질 가능성에 베팅하는 전략으로, 상한가 진입을 확인한 뒤 매수에 나서는 것이 핵심입니다.',
      },
      {
        q: '이번엔 차트처럼 한 종목이 급락하며 하한가까지 도달했습니다. 하따 전략은 이 상황에서 어떤 판단을 내리나요?',
        chart: trendChart('down', '하한가 (-30%)'),
        options: ['과도하게 눌린 만큼 반등을 기대하고 매수를 고려한다', '하한가이므로 더 떨어질 것을 기대하고 공매도한다', '무조건 손절매를 실행한다', '거래를 중단하고 다른 종목을 찾는다'],
        answer: 0,
        explain: '하따는 하한가까지 과하게 눌린 종목이 이후 반등할 가능성에 베팅해 매수를 고려하는 전략입니다.',
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
    ],
  },
  kelly_advanced: {
    title: '켈리공식 · 심화',
    questions: [
      {
        q: '한 트레이더의 백테스트 결과 특정 전략의 예상 승률이 아래 차트처럼 나타났습니다. 켈리공식 관점에서 올바른 대응은?',
        chart: winRateChart(80),
        options: ['승률이 높으므로 베팅 비중을 늘린다', '승률과 무관하게 항상 소액만 베팅한다', '승률이 100%가 아니므로 투자하지 않는다', '반대 방향으로 베팅한다'],
        answer: 0,
        explain: '승률이 100%에 가까울수록 켈리공식은 더 큰 비중의 베팅을 제안합니다. 80%는 높은 승률이므로 비중을 늘리는 것이 원칙에 부합합니다.',
      },
      {
        q: '반대로 예상 승률이 아래 차트처럼 나타난 전략이 있습니다. 켈리공식에 따르면 어떻게 해야 하나요?',
        chart: winRateChart(40),
        options: ['승률이 50% 미만이므로 투자를 피한다', '승률이 낮을수록 베팅을 늘려 만회한다', '무조건 전액 투자한다', '손익비만 좋으면 승률은 무시해도 된다'],
        answer: 0,
        explain: '승률이 50%를 넘지 못하면 켈리공식 관점에서 투자를 하지 않는 것이 원칙입니다.',
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
    ],
  },
  ratio_advanced: {
    title: '손익비 · 심화',
    questions: [
      {
        q: '아래 차트처럼 진입가 대비 손절 라인은 가깝고, 목표가는 훨씬 멀리 설정되어 있습니다. 이 구조가 의미하는 것은?',
        chart: ratioChart(true),
        options: ['손익비가 유리해 승률이 낮아도 반복하면 유리할 수 있다', '손익비가 불리해 이 거래는 피해야 한다', '손절 라인이 가까우므로 무조건 손해다', '목표가가 멀어서 실현 가능성이 없다'],
        answer: 0,
        explain: '손절은 가깝게, 목표가는 멀게 설정하면 손익비가 유리해져 승률이 낮아도 반복할수록 잔고가 우상향할 수 있습니다.',
      },
      {
        q: '이번엔 반대로 손절 라인은 멀고 목표가는 가까운 구조입니다. 이런 거래를 반복하면 어떻게 될 가능성이 높나요?',
        chart: ratioChart(false),
        options: ['손익비가 불리해 승률이 높아도 장기적으로 손실이 쌓일 수 있다', '손익비가 유리해 무조건 수익이 난다', '목표가가 가까우므로 무조건 안전하다', '승률과 손익비는 무관하다'],
        answer: 0,
        explain: '손절은 멀고 목표가는 가까우면 손익비가 불리해져, 승률이 다소 높더라도 반복하면 장기적으로 손실이 누적될 수 있습니다.',
      },
    ],
  },
};

const quizCard = document.getElementById('quizCard');

const getBestScore = (setKey) => Number(localStorage.getItem(BEST_SCORE_PREFIX + setKey) || 0);
const setBestScore = (setKey, value) => {
  if (value > getBestScore(setKey)) localStorage.setItem(BEST_SCORE_PREFIX + setKey, String(value));
};

let activeSetKey = null;
let current = 0;
let score = 0;
let answered = false;

const renderMenu = () => {
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
            <button class="btn btn-outline" data-set="${g.basic}">기본 (${getBestScore(g.basic)}/${QUIZ_SETS[g.basic].questions.length})</button>
            <button class="btn btn-outline" data-set="${g.advanced}">심화 (${getBestScore(g.advanced)}/${QUIZ_SETS[g.advanced].questions.length})</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  quizCard.querySelectorAll('button[data-set]').forEach((btn) => {
    btn.addEventListener('click', () => startSet(btn.dataset.set));
  });
};

const startSet = (setKey) => {
  activeSetKey = setKey;
  current = 0;
  score = 0;
  renderQuestion();
};

const renderQuestion = () => {
  answered = false;
  const set = QUIZ_SETS[activeSetKey];
  const item = set.questions[current];
  quizCard.innerHTML = `
    <p class="quiz-progress">${set.title} · ${current + 1} / ${set.questions.length}</p>
    <h3 class="quiz-question">${item.q}</h3>
    ${item.chart ? `<div class="quiz-chart-wrap">${item.chart}</div>` : ''}
    <div class="quiz-options" id="quizOptions">
      ${item.options.map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt}</button>`).join('')}
    </div>
    <p class="quiz-explain" id="quizExplain" hidden></p>
    <div class="quiz-actions">
      <button class="btn btn-outline" id="menuBtn">메뉴로</button>
      <button class="btn btn-primary" id="nextBtn" hidden>다음 →</button>
    </div>
  `;

  document.getElementById('menuBtn').addEventListener('click', renderMenu);

  const optionButtons = quizCard.querySelectorAll('.quiz-option');
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const selected = Number(btn.dataset.index);
      const correct = item.answer;

      optionButtons.forEach((b) => { b.disabled = true; });
      btn.classList.add(selected === correct ? 'correct' : 'wrong');
      if (selected !== correct) {
        optionButtons[correct].classList.add('correct');
      } else {
        score += 1;
      }

      const explainEl = document.getElementById('quizExplain');
      explainEl.textContent = item.explain;
      explainEl.hidden = false;

      const nextBtn = document.getElementById('nextBtn');
      nextBtn.hidden = false;
      nextBtn.textContent = current === set.questions.length - 1 ? '결과 보기 →' : '다음 →';
      nextBtn.addEventListener('click', () => {
        current += 1;
        if (current < set.questions.length) {
          renderQuestion();
        } else {
          renderResult();
        }
      });
    });
  });
};

const renderResult = () => {
  const set = QUIZ_SETS[activeSetKey];
  setBestScore(activeSetKey, score);
  const total = set.questions.length;
  const pct = Math.round((score / total) * 100);
  let tier = '다시 도전해보세요';
  if (pct === 100) tier = '완벽해요';
  else if (pct >= 50) tier = '좋아요';

  quizCard.innerHTML = `
    <div class="quiz-result">
      <p class="quiz-progress">${set.title} · 완료</p>
      <h3 class="quiz-question">${total}문제 중 ${score}문제 정답 (${pct}%)</h3>
      <p class="quiz-tier">${tier}</p>
      <p class="quiz-best">최고 기록: ${getBestScore(activeSetKey)} / ${total}</p>
      <div class="quiz-actions quiz-actions-center">
        <button class="btn btn-outline" id="menuBtn2">메뉴로</button>
        <button class="btn btn-primary" id="retryBtn">다시 풀기</button>
      </div>
    </div>
  `;
  document.getElementById('menuBtn2').addEventListener('click', renderMenu);
  document.getElementById('retryBtn').addEventListener('click', () => startSet(activeSetKey));
};

renderMenu();
