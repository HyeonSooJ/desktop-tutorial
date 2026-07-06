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
  joongang: { name: '중앙일보', meta: '언론 보도 (2026.04)' },
  khan: { name: '경향신문', meta: '언론 보도 (2026.04)', url: 'https://www.khan.co.kr/article/202606250600061', linkLabel: '기사 보기' },
  newspim: { name: '뉴스핌', meta: '언론 보도 (2026.04)', url: 'https://m.newspim.com/news/view/20260513000725', linkLabel: '기사 보기' },
  kis: { name: '한국투자증권', meta: 'MOU 체결 (2026.05)' },
  sbs: { name: 'SBS', meta: '지상파 방송 출연 (2026.07)', url: 'https://programs.sbs.co.kr/culture/morningwide/vod/65007/22000631957', linkLabel: '다시보기' },
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

  mediaDetail.innerHTML = `
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
