document.getElementById('year').textContent = new Date().getFullYear();

// --- 히어로 영상 ---
const heroVideo = document.getElementById('heroVideo');

if (heroVideo) {
  heroVideo.addEventListener('loadeddata', () => {
    heroVideo.classList.add('loaded');
  });
  heroVideo.muted = true;
  const tryPlay = () => heroVideo.play().catch(() => {});
  tryPlay();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay();
  });
}

// --- 히어로 배너 캐러셀 ---
const heroCarousel = document.getElementById('heroCarousel');
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDotsWrap = document.getElementById('heroDots');

if (heroCarousel && heroSlides.length && heroDotsWrap) {
  let heroIndex = 0;
  let heroTimer = null;

  heroSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `배너 ${i + 1}`);
    dot.addEventListener('click', () => goToHeroSlide(i));
    heroDotsWrap.appendChild(dot);
  });

  function goToHeroSlide(i) {
    heroSlides[heroIndex].classList.remove('active');
    heroDotsWrap.children[heroIndex].classList.remove('active');
    heroIndex = i;
    heroSlides[heroIndex].classList.add('active');
    heroDotsWrap.children[heroIndex].classList.add('active');
  }

  const nextHeroSlide = () => goToHeroSlide((heroIndex + 1) % heroSlides.length);
  const startHeroTimer = () => { heroTimer = setInterval(nextHeroSlide, 3000); };
  const stopHeroTimer = () => clearInterval(heroTimer);

  startHeroTimer();
  heroCarousel.addEventListener('mouseenter', stopHeroTimer);
  heroCarousel.addEventListener('mouseleave', startHeroTimer);
}

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

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      formStatus.textContent = '모든 항목을 올바르게 입력해주세요.';
      return;
    }

    formStatus.textContent = '문의가 정상적으로 접수되었습니다. 곧 연락드리겠습니다!';
    contactForm.reset();
  });
}

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

if (seoulDot && seoulZoom) {
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
}

// --- 모의투자 프로그램 ---

const MI_INITIAL_CASH = 500000;
const MI_MIN_YEAR = 2020;
const MI_MAX_YEAR = 2026;
const MI_ROUNDS = 2;
const MI_CHECKPOINTS = 4;

// 2020년 이전에 상장되어 있던 국내 종목 목록 (실제 상장사명/종목코드)
// 가격 데이터는 하드코딩하지 않고, 선택된 종목만 data/ohlc/<code>.json에서 실시간으로 불러온다
const MI_STOCK_POOL = [
  { key: '005930', name: '삼성전자' },
  { key: '000660', name: 'SK하이닉스' },
  { key: '207940', name: '삼성바이오로직스' },
  { key: '005380', name: '현대차' },
  { key: '000270', name: '기아' },
  { key: '051910', name: 'LG화학' },
  { key: '006400', name: '삼성SDI' },
  { key: '035420', name: 'NAVER' },
  { key: '035720', name: '카카오' },
  { key: '105560', name: 'KB금융' },
  { key: '055550', name: '신한지주' },
  { key: '086790', name: '하나금융지주' },
  { key: '316140', name: '우리금융지주' },
  { key: '012330', name: '현대모비스' },
  { key: '028260', name: '삼성물산' },
  { key: '015760', name: '한국전력' },
  { key: '032830', name: '삼성생명' },
  { key: '009150', name: '삼성전기' },
  { key: '010130', name: '고려아연' },
  { key: '011170', name: '롯데케미칼' },
  { key: '096770', name: 'SK이노베이션' },
  { key: '018260', name: '삼성에스디에스' },
  { key: '034730', name: 'SK' },
  { key: '017670', name: 'SK텔레콤' },
  { key: '030200', name: 'KT' },
  { key: '003550', name: 'LG' },
  { key: '066570', name: 'LG전자' },
  { key: '051900', name: 'LG생활건강' },
  { key: '090430', name: '아모레퍼시픽' },
  { key: '004020', name: '현대제철' },
  { key: '010950', name: 'S-Oil' },
  { key: '011200', name: 'HMM' },
  { key: '010140', name: '삼성중공업' },
  { key: '011210', name: '현대위아' },
  { key: '024110', name: '기업은행' },
  { key: '138040', name: '메리츠금융지주' },
  { key: '000810', name: '삼성화재' },
  { key: '032640', name: 'LG유플러스' },
  { key: '003670', name: '포스코퓨처엠' },
  { key: '005490', name: 'POSCO홀딩스' },
  { key: '068270', name: '셀트리온' },
  { key: '196170', name: '알테오젠' },
  { key: '036570', name: '엔씨소프트' },
  { key: '251270', name: '넷마블' },
  { key: '036460', name: '한국가스공사' },
  { key: '016360', name: '삼성증권' },
  { key: '005940', name: 'NH투자증권' },
  { key: '039490', name: '키움증권' },
  { key: '078930', name: 'GS' },
  { key: '011780', name: '금호석유' },
  { key: '010060', name: 'OCI' },
  { key: '004990', name: '롯데지주' },
  { key: '097950', name: 'CJ제일제당' },
  { key: '001040', name: 'CJ' },
  { key: '079160', name: 'CJ CGV' },
  { key: '035760', name: 'CJ ENM' },
  { key: '008770', name: '호텔신라' },
  { key: '271560', name: '오리온' },
  { key: '005300', name: '롯데칠성' },
  { key: '002790', name: '아모레G' },
  { key: '069960', name: '현대백화점' },
  { key: '023530', name: '롯데쇼핑' },
  { key: '139480', name: '이마트' },
  { key: '282330', name: 'BGF리테일' },
  { key: '128940', name: '한미약품' },
  { key: '000100', name: '유한양행' },
  { key: '185750', name: '종근당' },
  { key: '069620', name: '대웅제약' },
  { key: '000720', name: '현대건설' },
  { key: '006360', name: 'GS건설' },
  { key: '047040', name: '대우건설' },
  { key: '028050', name: '삼성엔지니어링' },
  { key: '294870', name: 'HDC현대산업개발' },
  { key: '180640', name: '한진칼' },
  { key: '003490', name: '대한항공' },
  { key: '020560', name: '아시아나항공' },
  { key: '089590', name: '제주항공' },
  { key: '009540', name: '한국조선해양' },
  { key: '028670', name: '팬오션' },
  { key: '004000', name: '롯데정밀화학' },
  { key: '192820', name: '코스맥스' },
  { key: '096530', name: '씨젠' },
  { key: '028300', name: 'HLB' },
  { key: '068760', name: '셀트리온제약' },
  { key: '086900', name: '메디톡스' },
  { key: '145020', name: '휴젤' },
  { key: '214450', name: '파마리서치' },
  { key: '214150', name: '클래시스' },
  { key: '054450', name: '텔레칩스' },
  { key: '046890', name: '서울반도체' },
  { key: '108320', name: '실리콘웍스' },
  { key: '005290', name: '동진쎄미켐' },
  { key: '064760', name: '티씨케이' },
  { key: '066970', name: '엘앤에프' },
  { key: '086520', name: '에코프로' },
  { key: '247540', name: '에코프로비엠' },
  { key: '047050', name: '포스코인터내셔널' },
  { key: '009830', name: '한화솔루션' },
  { key: '272210', name: '한화시스템' },
  { key: '006260', name: 'LS' },
  { key: '010120', name: 'LS ELECTRIC' },
  { key: '004800', name: '효성' },
  { key: '353200', name: '대덕전자' },
  { key: '222800', name: '심텍' },
  { key: '079550', name: 'LIG넥스원' },
  { key: '012450', name: '한화에어로스페이스' },
  { key: '047810', name: '한국항공우주' },
  { key: '322000', name: '현대에너지솔루션' },
  { key: '145720', name: '덴티움' },
  { key: '041830', name: '인바디' },
  { key: '021240', name: '코웨이' },
  { key: '007310', name: '오뚜기' },
  { key: '004370', name: '농심' },
  { key: '000080', name: '하이트진로' },
  { key: '267980', name: '매일유업' },
  { key: '035250', name: '강원랜드' },
  { key: '034230', name: '파라다이스' },
  { key: '039130', name: '하나투어' },
  { key: '080160', name: '모두투어' },
  { key: '272450', name: '진에어' },
  { key: '000120', name: 'CJ대한통운' },
  { key: '086280', name: '현대글로비스' },
  { key: '002380', name: 'KCC' },
  { key: '011790', name: 'SKC' },
];

// 종목별 실제 일별 시가/고가/저가/종가(OHLC) 데이터를 지연 로딩하고 캐시한다
// (FinanceData/marcap KRX 데이터셋 기준, 2020-01-02 ~ 2026-07-03)
// <script> 태그로 불러온다: fetch()는 file:// 로 열었을 때 CORS로 막히지만 <script src>는 로컬 파일에서도 동작한다.
window.MI_OHLC_DATA = window.MI_OHLC_DATA || {};
const miOhlcCache = {};
const miOhlcLoading = {};

const miFetchOhlc = (code) => {
  if (miOhlcCache[code]) return Promise.resolve(miOhlcCache[code]);
  if (miOhlcLoading[code]) return miOhlcLoading[code];

  miOhlcLoading[code] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `data/ohlc/${code}.js`;
    script.onload = () => {
      const data = window.MI_OHLC_DATA[code];
      miOhlcCache[code] = data;
      delete miOhlcLoading[code];
      resolve(data);
    };
    script.onerror = () => {
      delete miOhlcLoading[code];
      script.remove();
      reject(new Error(`${code} 시세 데이터를 불러오지 못했습니다.`));
    };
    document.head.appendChild(script);
  });

  return miOhlcLoading[code];
};

const miFractionalYearToDate = (year) => {
  const y = Math.floor(year);
  const frac = year - y;
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y + 1, 0, 1);
  return new Date(start + frac * (end - start));
};

// 목표 날짜 이후 첫 실제 거래일의 인덱스를 찾는다 (주말/공휴일은 데이터에 없으므로)
const miFindCheckpointIndex = (ohlc, targetDate) => {
  const targetStr = targetDate.toISOString().slice(0, 10);
  const idx = ohlc.d.findIndex((d) => d >= targetStr);
  return idx === -1 ? ohlc.d.length - 1 : idx;
};

const miFormatPeriodLabel = (year) => {
  const y = Math.floor(year);
  let month = Math.round((year - y) * 12) + 1;
  let labelYear = y;
  if (month > 12) { month -= 12; labelYear += 1; }
  return `${labelYear}년 ${month}월`;
};

const miCheckpointYears = (startYear, endYear) => {
  const years = [];
  for (let i = 0; i <= MI_CHECKPOINTS; i += 1) {
    years.push(startYear + ((endYear - startYear) * i) / MI_CHECKPOINTS);
  }
  return years;
};

const formatWon = (n) => `${Math.round(n).toLocaleString('ko-KR')}원`;

const MI_CANDLE_W = 400;
const MI_CANDLE_H = 220;
const MI_CANDLE_PAD_TOP = 16;
const MI_CANDLE_PAD_BOTTOM = 26;
const MI_CANDLE_PAD_RIGHT = 8;
const MI_Y_TICKS = 4;

// 체크포인트 index(0..uptoCheckpointIndex)를 분기 구간별 세그먼트로 나눈다.
// 세그먼트[0]은 1분기 진입 이전의 실제 추이(직전 한 분기 길이)를 보여주기 위한 구간이고,
// 이후 세그먼트[k]는 (k-1)번째 체크포인트 ~ k번째 체크포인트 구간이다.
// 각 세그먼트는 차트 폭을 동일하게 나눠 쓰므로, 분기가 늘어날수록 이전 구간들은 상대적으로 압축되어 보인다.
const miBuildSegments = (ohlc, years, uptoCheckpointIndex) => {
  const allIdxs = years.map((y) => miFindCheckpointIndex(ohlc, miFractionalYearToDate(y)));
  const idxs = allIdxs.slice(0, uptoCheckpointIndex + 1);
  const quarterLen = Math.max(1, allIdxs[1] - allIdxs[0]);
  const lookbackStart = Math.max(0, idxs[0] - quarterLen);

  const firstSeg = { from: lookbackStart, to: idxs[0] };
  // 시작 연도를 데이터의 첫날(2020-01-02)로 고르면 1분기 이전 실제 시세가 아예 없다.
  // 이 경우에만 예외적으로, 다음 분기 체크포인트 가격이 드러나지 않을 만큼(최대 20거래일, 다음
  // 체크포인트 이전까지만) 실제 이후 거래일을 살짝 끌어와 1분기도 단일 봉이 아닌 차트로 보이게 한다.
  // (몇 분기까지 진행됐는지와 무관하게 항상 같은 범위를 써야, 이후 분기에서 이 구간이 압축될 때도
  // 하나의 늘어난 봉이 아니라 여러 봉이 자연스럽게 좁아지는 모양이 된다.)
  if (lookbackStart === idxs[0] && allIdxs[1] > idxs[0] + 1) {
    const peekLen = Math.min(20, quarterLen - 1);
    firstSeg.to = Math.min(idxs[0] + peekLen, allIdxs[1] - 1);
    firstSeg.entryIdx = idxs[0];
  }

  const segments = [firstSeg];
  // 세그먼트[1]은 세그먼트[0]이 실제로 끝난 지점(늘려 봤다면 그 지점)에서 이어져야
  // 이미 보여준 날짜가 다음 세그먼트에서 중복으로 다시 그려지지 않는다.
  for (let i = 1; i < idxs.length; i += 1) {
    segments.push({ from: i === 1 ? firstSeg.to : idxs[i - 1], to: idxs[i] });
  }
  return segments;
};

// 구간에 담긴 실제 거래일 수가 maxBars보다 많으면, 여러 거래일을 하나의 봉으로 묶어
// (시가=구간 첫날 시가, 종가=구간 마지막날 종가, 고가·저가=구간 내 최댓·최솟값) 반환한다.
// 이렇게 하면 기간이 길어 하루짜리 봉이 실핏줄처럼 가늘어지는 대신, 항상 눈에 보이는 굵기의
// 봉으로 유지된다. 마지막 봉의 끝은 항상 toIdx이므로, 강조 표시할 체크포인트 당일 가격은 그대로 정확하다.
const miAggregateBars = (ohlc, fromIdx, toIdx, maxBars) => {
  const totalDays = toIdx - fromIdx + 1;
  if (totalDays <= maxBars) {
    const bars = [];
    for (let i = fromIdx; i <= toIdx; i += 1) {
      bars.push({ o: ohlc.o[i], h: ohlc.h[i], l: ohlc.l[i], c: ohlc.c[i], endIdx: i });
    }
    return bars;
  }
  const bars = [];
  const groupLen = totalDays / maxBars;
  for (let g = 0; g < maxBars; g += 1) {
    const gs = fromIdx + Math.round(g * groupLen);
    const ge = g === maxBars - 1 ? toIdx : fromIdx + Math.round((g + 1) * groupLen) - 1;
    if (gs > ge) continue;
    let h = -Infinity;
    let l = Infinity;
    for (let i = gs; i <= ge; i += 1) {
      h = Math.max(h, ohlc.h[i]);
      l = Math.min(l, ohlc.l[i]);
    }
    bars.push({ o: ohlc.o[gs], h, l, c: ohlc.c[ge], endIdx: ge });
  }
  return bars;
};

const MI_MIN_BAR_PX = 4;
// Y축은 항상 0원부터 시작해서, 지금 화면에 보이는 구간의 최고가보다 이만큼 위까지만 잡는다.
const MI_AXIS_HEADROOM = 50000;

// 지금 화면에 보이는 구간(segments)만 기준으로 Y축 범위를 계산한다 — 분기가 넘어갈 때마다
// 그 시점까지 실제로 드러난 최고가에 맞춰 축이 다시 잡힌다(아직 오지 않은 분기의 가격을
// 미리 반영해 축 범위로 최고가를 짐작할 수 있게 하지 않기 위해). 0원부터 시작하므로 특정
// 봉의 꼬리가 세로 길이 전체를 짓누르는 일도 자연히 없다.
const miComputeYRange = (ohlc, segments) => {
  const overallFrom = segments[0].from;
  const overallTo = segments[segments.length - 1].to;

  let dataMax = -Infinity;
  for (let i = overallFrom; i <= overallTo; i += 1) {
    dataMax = Math.max(dataMax, ohlc.h[i]);
  }

  const min = 0;
  const max = dataMax + MI_AXIS_HEADROOM;
  return { min, max, range: max - min, step: (max - min) / MI_Y_TICKS };
};

// 여러 분기 세그먼트를 이어 붙여 실제 일별 캔들(양봉/음봉) 차트를 그린다.
// 세그먼트가 늘어날수록 각 세그먼트 폭은 1/N로 줄어들고, 가격(Y축)은 지금까지 드러난
// 구간에 맞춰 매번 다시 계산된다.
const miCandleChart = (ohlc, segments) => {
  const overallFrom = segments[0].from;
  const overallTo = segments[segments.length - 1].to;

  const { min, range, step } = miComputeYRange(ohlc, segments);
  const innerH = MI_CANDLE_H - MI_CANDLE_PAD_TOP - MI_CANDLE_PAD_BOTTOM;
  const scaleY = (p) => MI_CANDLE_PAD_TOP + (1 - (p - min) / range) * innerH;

  // 눈금 위치 자체는 정확한 값을 쓰지만, 화면에 찍히는 숫자는 백 원·십 원 단위가 보이지
  // 않도록 항상 5천 원 또는 만 원 단위로 반올림해서 보여준다.
  const tickRoundUnit = step >= 20000 ? 10000 : 5000;
  const formatAxisPrice = (p) => (Math.round(p / tickRoundUnit) * tickRoundUnit).toLocaleString('ko-KR');

  // 가격이 몇 자리든(수만 원대 ~ 수백만 원대 종목) Y축 자릿수가 잘리지 않도록,
  // 실제 표시될 눈금 라벨 중 가장 긴 문자열 폭에 맞춰 왼쪽 여백을 동적으로 잡는다.
  const tickPrices = Array.from({ length: MI_Y_TICKS + 1 }, (_, t) => min + step * t);
  const maxTickLen = Math.max(...tickPrices.map((p) => formatAxisPrice(p).length));
  const padLeft = 12 + maxTickLen * 7.5;

  const plotW = MI_CANDLE_W - padLeft - MI_CANDLE_PAD_RIGHT;
  const segW = plotW / segments.length;

  let candlesSvg = '';

  segments.forEach((seg, segIdx) => {
    const segX0 = padLeft + segIdx * segW;
    const isLastSegment = segIdx === segments.length - 1;
    const highlightIdx = seg.entryIdx ?? seg.to;

    const maxBars = Math.max(1, Math.floor(segW / MI_MIN_BAR_PX));
    const bars = miAggregateBars(ohlc, seg.from, seg.to, maxBars);
    const count = bars.length;
    const slotW = segW / count;
    const bodyW = Math.max(1.5, slotW * 0.6);

    bars.forEach(({ o, h, l, c, endIdx }, pos) => {
      const isUp = c >= o;
      const color = isUp ? 'var(--color-up)' : 'var(--color-down)';
      const cx = segX0 + slotW * pos + slotW / 2;
      const yOpen = scaleY(o);
      const yClose = scaleY(c);
      const yHigh = scaleY(h);
      const yLow = scaleY(l);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(1, Math.abs(yClose - yOpen));
      const isLast = isLastSegment && endIdx === highlightIdx;
      const strokeAttr = isLast ? ' stroke="var(--color-black)" stroke-width="1"' : '';
      candlesSvg += `<line x1="${cx.toFixed(1)}" y1="${yHigh.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${yLow.toFixed(1)}" stroke="${color}" stroke-width="1" />`
        + `<rect x="${(cx - bodyW / 2).toFixed(1)}" y="${bodyTop.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${bodyH.toFixed(1)}" fill="${color}"${strokeAttr} />`;
    });
  });

  let gridSvg = '';
  tickPrices.forEach((p) => {
    const y = scaleY(p);
    gridSvg += `<line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${MI_CANDLE_W - MI_CANDLE_PAD_RIGHT}" y2="${y.toFixed(1)}" stroke="var(--color-border)" stroke-width="1" />`
      + `<text x="${padLeft - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" class="chart-label">${formatAxisPrice(p)}</text>`;
  });

  return `
    <div class="quiz-chart-wrap">
      <svg viewBox="0 0 ${MI_CANDLE_W} ${MI_CANDLE_H}" class="quiz-chart" role="img" aria-label="일별 캔들 차트 (양봉/음봉), 세로축 가격">
        ${gridSvg}
        ${candlesSvg}
        <text x="${padLeft}" y="${MI_CANDLE_H - 8}" class="chart-label">${ohlc.d[overallFrom]}</text>
        <text x="${MI_CANDLE_W - MI_CANDLE_PAD_RIGHT}" y="${MI_CANDLE_H - 8}" text-anchor="end" class="chart-label">${ohlc.d[overallTo]}</text>
      </svg>
    </div>
  `;
};

const mockinvestApp = document.getElementById('mockinvestApp');

let miStarted = false;
let miStartYear = MI_MIN_YEAR;
let miEndYear = MI_MAX_YEAR;
let miSelectedKeys = [];
let miRoundIndex = 0;
let miCheckpointIndex = 0;
let miCash = MI_INITIAL_CASH;
let miHoldings = 0;
let miRoundResults = [];
let miCurrentOhlc = null;
let miRoundStartCash = MI_INITIAL_CASH;

const renderMiPeriodStep = () => {
  const yearOptions = (selected) => {
    let opts = '';
    for (let y = MI_MIN_YEAR; y <= MI_MAX_YEAR; y += 1) {
      opts += `<option value="${y}" ${y === selected ? 'selected' : ''}>${y}년</option>`;
    }
    return opts;
  };

  mockinvestApp.innerHTML = `
    <h3>1단계 · 투자 기간 선택</h3>
    <p class="mi-help">2020년부터 2026년 사이에서 모의투자를 진행할 기간을 선택하세요.</p>
    <div class="mi-period-row">
      <div class="form-group">
        <label for="miStartYear">시작 연도</label>
        <select id="miStartYear" class="mi-select">${yearOptions(miStartYear)}</select>
      </div>
      <div class="form-group">
        <label for="miEndYear">종료 연도</label>
        <select id="miEndYear" class="mi-select">${yearOptions(miEndYear)}</select>
      </div>
    </div>
    <p class="mi-error" id="miPeriodError" hidden>종료 연도는 시작 연도보다 최소 1년 이상 뒤여야 합니다.</p>
    <button class="btn btn-primary" id="miPeriodNext">다음 →</button>
  `;

  document.getElementById('miPeriodNext').addEventListener('click', () => {
    const start = Number(document.getElementById('miStartYear').value);
    const end = Number(document.getElementById('miEndYear').value);
    if (end <= start) {
      document.getElementById('miPeriodError').hidden = false;
      return;
    }
    miStartYear = start;
    miEndYear = end;
    renderMiStockStep();
  });
};

const renderMiStockGrid = (filter) => {
  const grid = document.getElementById('miStockGrid');
  const keyword = filter.trim().toLowerCase();
  const filtered = keyword
    ? MI_STOCK_POOL.filter((s) => s.name.toLowerCase().includes(keyword) || s.key.includes(keyword))
    : MI_STOCK_POOL;

  grid.innerHTML = filtered
    .map((s) => `<button class="mi-stock-btn${miSelectedKeys.includes(s.key) ? ' selected' : ''}" data-key="${s.key}" type="button">${s.name}</button>`)
    .join('') || '<p class="mi-help">검색 결과가 없습니다.</p>';

  grid.querySelectorAll('.mi-stock-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const idx = miSelectedKeys.indexOf(key);
      if (idx >= 0) {
        miSelectedKeys.splice(idx, 1);
        btn.classList.remove('selected');
      } else if (miSelectedKeys.length < 2) {
        miSelectedKeys.push(key);
        btn.classList.add('selected');
        miFetchOhlc(key).catch(() => {});
      }
    });
  });
};

const renderMiStockStep = () => {
  mockinvestApp.innerHTML = `
    <h3>2단계 · 투자 종목 선택 (2020년 이전 상장 종목, ${MI_STOCK_POOL.length}개)</h3>
    <p class="mi-help">모의투자를 진행할 종목 2개를 선택하세요. 각 종목당 1라운드씩, 총 2라운드로 진행됩니다.</p>
    <input type="text" class="mi-select mi-stock-search" id="miStockSearch" placeholder="종목명으로 검색">
    <div class="mi-stock-grid" id="miStockGrid"></div>
    <p class="mi-error" id="miStockError" hidden>종목을 정확히 2개 선택해주세요.</p>
    <div class="quiz-actions">
      <button class="btn btn-outline" id="miStockBack">이전</button>
      <button class="btn btn-primary" id="miStockNext">투자 시작 →</button>
    </div>
  `;

  renderMiStockGrid('');
  document.getElementById('miStockSearch').addEventListener('input', (event) => {
    renderMiStockGrid(event.target.value);
  });

  document.getElementById('miStockBack').addEventListener('click', renderMiPeriodStep);
  document.getElementById('miStockNext').addEventListener('click', () => {
    if (miSelectedKeys.length !== 2) {
      document.getElementById('miStockError').hidden = false;
      return;
    }
    miRoundIndex = 0;
    miRoundResults = [];
    beginMiRound();
  });
};

const beginMiRound = async () => {
  miCheckpointIndex = 0;
  miRoundStartCash = miCash;
  miHoldings = 0;
  const stock = MI_STOCK_POOL.find((s) => s.key === miSelectedKeys[miRoundIndex]);
  mockinvestApp.innerHTML = `<p class="mi-help">${stock.name} 실제 시세 데이터를 불러오는 중...</p>`;
  try {
    miCurrentOhlc = await miFetchOhlc(stock.key);
    renderMiRoundStep();
  } catch (err) {
    mockinvestApp.innerHTML = `
      <p class="mi-error">${stock.name} 시세 데이터를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.</p>
      <button class="btn btn-primary mi-next-btn" id="miRetryLoad">다시 시도 →</button>
    `;
    document.getElementById('miRetryLoad').addEventListener('click', beginMiRound);
  }
};

const renderMiRoundStep = () => {
  const stock = MI_STOCK_POOL.find((s) => s.key === miSelectedKeys[miRoundIndex]);
  const years = miCheckpointYears(miStartYear, miEndYear);
  const year = years[miCheckpointIndex];
  const idx = miFindCheckpointIndex(miCurrentOhlc, miFractionalYearToDate(year));
  const price = miCurrentOhlc.c[idx];
  const isLast = miCheckpointIndex === MI_CHECKPOINTS;

  // 5분기(마지막 시점)에는 매수/매도 없이 종가만 안내하고, 보유 중인 주식은 그 가격에 자동 매도 처리한다
  if (isLast && miHoldings > 0) {
    miCash += miHoldings * price;
    miHoldings = 0;
  }

  const total = miCash + miHoldings * price;
  const returnPct = ((total - miRoundStartCash) / miRoundStartCash) * 100;
  // 분기가 늘어날수록 차트를 동일 폭 세그먼트로 나눠, 이전 분기 구간은 압축되고 현재 분기가 새로 채워지도록 보여준다
  const segments = miBuildSegments(miCurrentOhlc, years, miCheckpointIndex);
  const periodLabel = isLast ? '5분기 · 최종 정산가' : `${miCheckpointIndex + 1}분기`;

  mockinvestApp.innerHTML = `
    <h3>라운드 ${miRoundIndex + 1} / ${MI_ROUNDS} · ${stock.name}</h3>
    <p class="mi-help">${periodLabel} · ${miFormatPeriodLabel(year)} (실제 거래일 ${miCurrentOhlc.d[idx]})${isLast ? ' — 이 시점은 매수/매도 없이 보유 주식이 이 가격에 자동 매도됩니다.' : ''}</p>

    ${miCandleChart(miCurrentOhlc, segments)}

    <div class="portfolio-stats">
      <div class="stat-card"><strong>${formatWon(price)}</strong><span>${isLast ? '정산가' : '현재가'}</span></div>
      <div class="stat-card"><strong>${formatWon(miCash)}</strong><span>보유 현금</span></div>
      <div class="stat-card"><strong>${miHoldings.toLocaleString('ko-KR')}주</strong><span>보유 수량</span></div>
      <div class="stat-card"><strong style="color:${returnPct > 0 ? 'var(--color-up)' : returnPct < 0 ? 'var(--color-down)' : '#fff'}">${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%</strong><span>현재 수익률</span></div>
    </div>

    ${isLast ? '' : `
    <div class="trade-controls mi-trade-controls">
      <input type="number" min="1" step="1" value="1" class="qty-input" id="miQty">
      <button class="btn btn-primary btn-small" id="miBuyBtn">매수</button>
      <button class="btn btn-outline btn-small" id="miSellBtn">매도</button>
    </div>
    <p class="mi-error" id="miTradeError" hidden></p>
    `}

    <button class="btn btn-primary mi-next-btn" id="miNextCheckpoint">${isLast ? '라운드 결과 보기 →' : '다음 시점으로 →'}</button>
  `;

  if (!isLast) {
    const qtyInput = document.getElementById('miQty');
    const errorEl = document.getElementById('miTradeError');

    document.getElementById('miBuyBtn').addEventListener('click', () => {
      const qty = Math.max(1, Math.floor(Number(qtyInput.value) || 0));
      const cost = price * qty;
      if (cost > miCash) {
        errorEl.textContent = '보유 현금을 초과하는 수량은 매수할 수 없습니다.';
        errorEl.hidden = false;
        return;
      }
      miCash -= cost;
      miHoldings += qty;
      renderMiRoundStep();
    });

    document.getElementById('miSellBtn').addEventListener('click', () => {
      const qty = Math.max(1, Math.floor(Number(qtyInput.value) || 0));
      if (qty > miHoldings) {
        errorEl.textContent = '보유 수량을 초과하는 수량은 매도할 수 없습니다.';
        errorEl.hidden = false;
        return;
      }
      miCash += price * qty;
      miHoldings -= qty;
      renderMiRoundStep();
    });
  }

  document.getElementById('miNextCheckpoint').addEventListener('click', () => {
    if (isLast) {
      renderMiRoundResult(stock);
    } else {
      miCheckpointIndex += 1;
      renderMiRoundStep();
    }
  });
};

const renderMiRoundResult = (stock) => {
  const finalValue = miCash;
  const returnPct = ((finalValue - miRoundStartCash) / miRoundStartCash) * 100;
  miRoundResults.push({ name: stock.name, finalValue, returnPct });

  const isLastRound = miRoundIndex === MI_ROUNDS - 1;
  const years = miCheckpointYears(miStartYear, miEndYear);
  const segments = miBuildSegments(miCurrentOhlc, years, MI_CHECKPOINTS);

  mockinvestApp.innerHTML = `
    <h3>라운드 ${miRoundIndex + 1} 결과 · ${stock.name}</h3>
    ${miCandleChart(miCurrentOhlc, segments)}
    <div class="portfolio-stats">
      <div class="stat-card"><strong>${formatWon(finalValue)}</strong><span>최종 자산</span></div>
      <div class="stat-card"><strong style="color:${returnPct > 0 ? 'var(--color-up)' : returnPct < 0 ? 'var(--color-down)' : '#fff'}">${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%</strong><span>라운드 수익률</span></div>
    </div>
    <button class="btn btn-primary mi-next-btn" id="miRoundResultNext">${isLastRound ? '최종 결과 보기 →' : '다음 라운드 시작 →'}</button>
  `;

  document.getElementById('miRoundResultNext').addEventListener('click', () => {
    if (isLastRound) {
      renderMiFinalResult();
    } else {
      miRoundIndex += 1;
      beginMiRound();
    }
  });
};

const renderMiFinalResult = () => {
  // 라운드 사이에 현금이 그대로 이어지므로, 마지막 라운드의 최종 자산이 곧 전체 최종 자산이다
  const totalFinal = miRoundResults[miRoundResults.length - 1].finalValue;
  const totalReturnPct = (totalFinal / MI_INITIAL_CASH) * 100 - 100;

  mockinvestApp.innerHTML = `
    <h3>모의투자 최종 결과</h3>
    <ul class="mi-result-list">
      ${miRoundResults.map((r, i) => `
        <li>
          <span class="mi-result-round">라운드 ${i + 1} · ${r.name}</span>
          <span style="color:${r.returnPct > 0 ? 'var(--color-up)' : r.returnPct < 0 ? 'var(--color-down)' : 'inherit'}">${r.returnPct >= 0 ? '+' : ''}${r.returnPct.toFixed(2)}%</span>
        </li>
      `).join('')}
    </ul>
    <div class="portfolio-stats">
      <div class="stat-card"><strong>${formatWon(totalFinal)}</strong><span>총 최종 자산</span></div>
      <div class="stat-card"><strong style="color:${totalReturnPct > 0 ? 'var(--color-up)' : totalReturnPct < 0 ? 'var(--color-down)' : '#fff'}">${totalReturnPct >= 0 ? '+' : ''}${totalReturnPct.toFixed(2)}%</strong><span>총 수익률</span></div>
    </div>
    <button class="btn btn-outline mi-next-btn" id="miRestartBtn">다시 하기</button>
  `;

  document.getElementById('miRestartBtn').addEventListener('click', () => {
    miSelectedKeys = [];
    miCash = MI_INITIAL_CASH;
    miHoldings = 0;
    renderMiPeriodStep();
  });
};

const startMockinvest = () => {
  if (miStarted) return;
  miStarted = true;
  renderMiPeriodStep();
};

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

let quizStarted = false;

const startQuiz = () => {
  if (quizStarted) return;
  quizStarted = true;
  renderQuizMenu();
};

// --- 기타 탭: 모의투자 / 퀴즈 상호 배타적 표시 + 지연 초기화 ---

const mockinvestSection = document.getElementById('mockinvest-tool');
const quizSection = document.getElementById('quiz-tool');
const openMockinvestLink = document.getElementById('openMockinvest');
const openQuizLink = document.getElementById('openQuiz');

if (openMockinvestLink && quizSection && mockinvestSection) {
  openMockinvestLink.addEventListener('click', () => {
    quizSection.hidden = true;
    mockinvestSection.hidden = false;
    startMockinvest();
  });
}

if (openQuizLink && quizSection && mockinvestSection) {
  openQuizLink.addEventListener('click', () => {
    mockinvestSection.hidden = true;
    quizSection.hidden = false;
    startQuiz();
  });
}

// --- 성과 게시판 ---

const BOARD_POSTS = [
  {
    id: 'kis-mou',
    category: '기업협력',
    date: '2026.05.12',
    title: '한국투자증권과 기업협력 MOU 체결',
    summary: '기업협력팀 주도로 한국투자증권과 산학협력 MOU를 체결했습니다.',
    body: `
      <p>thehunters는 2026년 5월, 한국투자증권과 산학협력 MOU(업무협약)를 체결했습니다. 이번 협약은 기업협력팀이 지난 한 학기 동안 준비해온 결과물로, 동아리 회원들이 실제 증권업계 실무를 경험할 수 있는 다양한 프로그램을 함께 운영하기 위해 마련되었습니다.</p>
      <p>협약에 따라 앞으로 한국투자증권 실무진과 함께하는 특강, 모의투자 대회 공동 주최, 우수 회원 대상 인턴십 연계 등 실질적인 협력 프로그램이 순차적으로 진행될 예정입니다.</p>
      <p>회장은 "동아리 차원에서 준비한 협업 제안서가 실제 업무협약으로 이어진 첫 사례"라며 "앞으로도 회원들이 이론에 그치지 않고 실전 감각을 키울 수 있는 기회를 계속 만들어가겠다"고 소감을 밝혔습니다.</p>
    `,
  },
  {
    id: 'kis-contest',
    category: '수상',
    date: '2026.05.28',
    title: '한국투자증권 모의투자 대회 수상',
    summary: '한국투자증권이 주최한 모의투자 대회에서 thehunters 팀이 입상했습니다.',
    body: `
      <p>한국투자증권이 주최한 전국 대학생 모의투자 대회에서 thehunters 소속 팀이 입상하는 성과를 거두었습니다. 이번 대회는 실제 시장 데이터를 기반으로 정해진 기간 동안 포트폴리오 수익률을 겨루는 방식으로 진행되었습니다.</p>
      <p>참가팀은 자산운용팀과 금융AI팀이 함께 구성한 합동 팀으로, 평소 스터디에서 다뤄온 종목 분석 방법론과 리스크 관리 원칙을 실전에 적용해 좋은 결과를 냈습니다.</p>
      <p>이번 수상은 앞서 체결한 한국투자증권과의 기업협력 MOU와도 이어지는 성과로, thehunters의 실전 투자 교육 프로그램이 대외적으로도 인정받은 사례로 평가받고 있습니다.</p>
    `,
  },
  {
    id: 'sbs-morning',
    category: '방송',
    date: '2026.07.03',
    title: 'SBS <모닝와이드> 촬영',
    summary: '회원들이 직접 투자 노하우를 소개하는 콘텐츠로 SBS 아침 방송에 출연했습니다.',
    body: `
      <p>thehunters 회원들이 SBS 아침 정보 프로그램 <모닝와이드>에 출연해 대학생들의 실전 투자 스터디 문화를 소개했습니다. 촬영은 정기 스터디 현장과 회원 인터뷰를 중심으로 진행되었습니다.</p>
      <p>방송에서는 금융AI팀의 데이터 기반 종목 분석 스터디 모습과, 자산운용팀이 진행하는 모의투자 포트폴리오 운용 방식이 소개되었습니다. 회원들은 각자의 투자 관점과 동아리 활동을 통해 얻은 경험을 직접 설명했습니다.</p>
      <p>이번 방송 출연은 창립 8개월 만에 누적 회원 1,500명을 돌파한 시점과 맞물려, thehunters의 성장세를 대외적으로 알리는 계기가 되었습니다.</p>
    `,
  },
];

const boardListEl = document.getElementById('boardList');

if (boardListEl) {
  boardListEl.innerHTML = BOARD_POSTS.map((post) => `
    <a class="board-row" href="post.html?id=${post.id}">
      <span class="board-category">${post.category}</span>
      <span class="board-title">${post.title}</span>
      <span class="board-date">${post.date}</span>
    </a>
  `).join('');
}

const postDetailEl = document.getElementById('postDetail');

if (postDetailEl) {
  const params = new URLSearchParams(window.location.search);
  const post = BOARD_POSTS.find((p) => p.id === params.get('id'));

  if (post) {
    document.title = `${post.title} | thehunters`;
    postDetailEl.innerHTML = `
      <p class="eyebrow">${post.category}</p>
      <h1>${post.title}</h1>
      <p class="post-date">${post.date}</p>
      <div class="post-body">${post.body}</div>
      <a href="achievements.html" class="btn btn-outline post-back">← 목록으로</a>
    `;
  } else {
    postDetailEl.innerHTML = `
      <p class="post-not-found">게시글을 찾을 수 없습니다.</p>
      <a href="achievements.html" class="btn btn-outline post-back">← 목록으로</a>
    `;
  }
}

// --- 내비게이션 현재 페이지 표시 ---
document.querySelectorAll('.nav a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href.startsWith('#')) return; // 같은 페이지 내 앵커(기타 등)는 현재 페이지 표시 대상에서 제외
  const linkPath = href.split('#')[0] || 'index.html';
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (linkPath === currentPath) {
    link.classList.add('active');
  }
});
