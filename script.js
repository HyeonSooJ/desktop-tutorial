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
