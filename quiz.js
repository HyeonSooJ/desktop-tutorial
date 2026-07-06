document.getElementById('year').textContent = new Date().getFullYear();

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const BEST_SCORE_KEY = 'hunters_quiz_best_v1';

const QUESTIONS = [
  {
    q: 'PER(주가수익비율)은 어떻게 계산하나요?',
    options: ['주가 ÷ 주당순이익', '주가 ÷ 매출액', '시가총액 ÷ 자본금', '부채 ÷ 자기자본'],
    answer: 0,
    explain: 'PER은 주가를 주당순이익(EPS)으로 나눈 값으로, 순이익 대비 주가 수준을 나타냅니다.',
  },
  {
    q: '분산투자의 주된 목적은 무엇인가요?',
    options: ['거래 비용 절감', '리스크 분산', '세금 절감', '배당금 극대화'],
    answer: 1,
    explain: '여러 자산에 나누어 투자하면 특정 자산의 손실이 전체 포트폴리오에 미치는 영향을 줄일 수 있습니다.',
  },
  {
    q: '코스피(KOSPI)는 무엇을 의미하나요?',
    options: ['한국거래소 파생상품 지수', '한국종합주가지수', '중소기업 전용 시장 지수', '채권 시장 지수'],
    answer: 1,
    explain: '코스피는 한국거래소 유가증권시장에 상장된 종목들의 시가총액을 기준으로 산출하는 종합주가지수입니다.',
  },
  {
    q: '배당수익률이란 무엇인가요?',
    options: ['주가 대비 연간 배당금 비율', '순이익 대비 배당금 비율', '자본금 대비 배당금 비율', '거래량 대비 배당금 비율'],
    answer: 0,
    explain: '배당수익률은 연간 배당금을 현재 주가로 나눈 값으로, 투자금 대비 배당 수익을 가늠하는 지표입니다.',
  },
  {
    q: '시가총액은 어떻게 계산하나요?',
    options: ['주가 × 발행주식수', '자본금 + 부채', '매출액 × 영업이익률', '주가 ÷ 발행주식수'],
    answer: 0,
    explain: '시가총액은 현재 주가에 발행주식수를 곱해 계산하며, 기업의 시장 가치를 나타냅니다.',
  },
  {
    q: "'블루칩' 주식이 의미하는 것은?",
    options: ['최근 상장한 신규 종목', '재무구조가 우량한 대형 안정주', '단기 급등이 예상되는 테마주', '거래가 거의 없는 소형주'],
    answer: 1,
    explain: '블루칩은 재무구조가 튼튼하고 오랜 기간 안정적인 실적을 보여온 대형 우량주를 가리키는 표현입니다.',
  },
  {
    q: 'ETF는 무엇의 약자인가요?',
    options: ['Equity Trading Fund', 'Exchange Traded Fund', 'Extra Term Finance', 'Enterprise Trust Fund'],
    answer: 1,
    explain: 'ETF(Exchange Traded Fund, 상장지수펀드)는 특정 지수를 추종하며 주식처럼 거래소에서 매매할 수 있는 펀드입니다.',
  },
  {
    q: '손절매(스탑로스)를 하는 주된 이유는?',
    options: ['세금을 줄이기 위해', '추가 손실을 막기 위해', '배당금을 더 받기 위해', '거래량을 늘리기 위해'],
    answer: 1,
    explain: '손절매는 정해둔 손실 구간에 도달하면 매도해 추가적인 손실 확대를 막기 위한 전략입니다.',
  },
  {
    q: "PBR(주가순자산비율)이 1보다 낮다는 것은 어떤 의미인가요?",
    options: ['주가가 순자산가치보다 낮게 거래됨', '회사가 부도 직전임', '배당을 전혀 하지 않음', '거래가 정지됨'],
    answer: 0,
    explain: 'PBR이 1보다 낮으면 주가가 장부상 순자산가치보다 낮게 거래되고 있다는 뜻으로, 저평가 신호로 해석되기도 합니다.',
  },
  {
    q: '코스닥(KOSDAQ) 시장에는 주로 어떤 기업이 상장되어 있나요?',
    options: ['대형 금융지주회사 위주', '중소·벤처·기술 기업 위주', '공기업 위주', '해외 기업 위주'],
    answer: 1,
    explain: '코스닥은 코스피에 비해 중소기업, 벤처기업, 기술 성장 기업이 다수 상장되어 있는 시장입니다.',
  },
];

let current = 0;
let score = 0;
let answered = false;

const quizCard = document.getElementById('quizCard');

const getBestScore = () => Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
const setBestScore = (value) => {
  if (value > getBestScore()) localStorage.setItem(BEST_SCORE_KEY, String(value));
};

const renderQuestion = () => {
  answered = false;
  const item = QUESTIONS[current];
  quizCard.innerHTML = `
    <p class="quiz-progress">${current + 1} / ${QUESTIONS.length}</p>
    <h3 class="quiz-question">${item.q}</h3>
    <div class="quiz-options" id="quizOptions">
      ${item.options.map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt}</button>`).join('')}
    </div>
    <p class="quiz-explain" id="quizExplain" hidden></p>
    <button class="btn btn-primary" id="nextBtn" hidden>다음 문제 →</button>
  `;

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
      nextBtn.textContent = current === QUESTIONS.length - 1 ? '결과 보기 →' : '다음 문제 →';
      nextBtn.addEventListener('click', () => {
        current += 1;
        if (current < QUESTIONS.length) {
          renderQuestion();
        } else {
          renderResult();
        }
      });
    });
  });
};

const renderResult = () => {
  setBestScore(score);
  const pct = Math.round((score / QUESTIONS.length) * 100);
  let tier = '다시 도전해보세요';
  if (pct >= 90) tier = '투자 고수';
  else if (pct >= 70) tier = '우수한 실력';
  else if (pct >= 50) tier = '보통 수준';

  quizCard.innerHTML = `
    <div class="quiz-result">
      <p class="quiz-progress">퀴즈 완료</p>
      <h3 class="quiz-question">${QUESTIONS.length}문제 중 ${score}문제 정답 (${pct}%)</h3>
      <p class="quiz-tier">${tier}</p>
      <p class="quiz-best">최고 기록: ${getBestScore()} / ${QUESTIONS.length}</p>
      <button class="btn btn-primary" id="retryBtn">다시 풀기</button>
    </div>
  `;
  document.getElementById('retryBtn').addEventListener('click', () => {
    current = 0;
    score = 0;
    renderQuestion();
  });
};

renderQuestion();
