(function () {
  'use strict';

  const TYPING_TEXTS = [
    '유튜브 수익화 걱정 끝,',
    '검증된 플랫폼으로',
    '미션만 달성해도 95%,',
    '구독자 0명도 OK,',
  ];
  const TYPING_SPEED_MS = 80;
  const TYPING_FADE_OUT_MS = 300;
  const TYPING_PAUSE_MS = 1500;
  const PROFIT_CASE_INTERVAL_MS = 2500;
  const SCROLL_HIDE_THRESHOLD_PX = 200;

  const profitCaseButtons = document.querySelectorAll('[data-profit-case]');
  const profitCaseTextEl = document.querySelector('[data-profit-case-text]');
  const profitGraphAreaEl = document.querySelector('[data-profit-graph-area]');
  const particleVideoEl = document.querySelector('[data-particle-video]');
  const profitRatioBoxEl = document.querySelector('[data-profit-ratio-box]');
  const typingTextEl = document.querySelector('[data-typing-text]');
  const scrollDownInfoEl = document.querySelector('[data-scroll-down-info]');
  const customerBarEl = document.querySelector('[data-customer-bar]');
  const profitSectionEl = document.querySelector('[data-profit-section]');
  const questionModalEl = document.querySelector('[data-question-modal]');
  const dimEl = document.getElementById('dim');
  const offcanvasGnbEl = document.getElementById('musicflex_offcanvas_gnb');
  const hamburgerBtnEl = document.querySelector('[data-gnb-hamburger]');

  let currentProfitCase = 'before';
  let isProfitCaseInterval = true;
  let profitCaseIntervalId = null;

  const profitCaseTexts = {
    before:
      '유튜브 쇼츠는 발생하는 총 수익에서<br><span>음원 저작권자</span>와 <span>영상 크리에이터</span>에게<br class="only_mobile_br"> 수익을 분배하여 제공합니다.',
    after:
      '쇼츠에 음원만 쓰면<br>뮤직플렉스에서 <strong>음원 수익을<br class="only_mobile_br"> 크리에이터에게 90%</strong> 돌려드려요.',
  };

  function preventInternalNavigation(event) {
    const linkEl = event.currentTarget;
    const href = linkEl.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#')) {
      event.preventDefault();
    }
  }

  function initInternalLinkGuards() {
    document.querySelectorAll('[data-no-navigate]').forEach(linkEl => {
      linkEl.addEventListener('click', preventInternalNavigation);
    });
  }

  function selectProfitCase(caseKey) {
    currentProfitCase = caseKey;
    isProfitCaseInterval = false;
    if (profitCaseIntervalId) {
      clearInterval(profitCaseIntervalId);
      profitCaseIntervalId = null;
    }
    updateProfitCaseUi();
  }

  function updateProfitCaseUi() {
    profitCaseButtons.forEach(buttonEl => {
      buttonEl.classList.toggle('active', buttonEl.dataset.profitCase === currentProfitCase);
    });

    if (profitCaseTextEl) {
      profitCaseTextEl.innerHTML = profitCaseTexts[currentProfitCase];
    }

    if (profitGraphAreaEl) {
      profitGraphAreaEl.classList.remove('before', 'after');
      profitGraphAreaEl.classList.add(currentProfitCase);
    }

    if (particleVideoEl && currentProfitCase === 'after') {
      particleVideoEl.classList.add('active');
      particleVideoEl.currentTime = 0;
      particleVideoEl.play().catch(() => {});
    } else if (particleVideoEl) {
      particleVideoEl.classList.remove('active');
    }
  }

  function startProfitCaseInterval() {
    if (profitCaseIntervalId) {
      clearInterval(profitCaseIntervalId);
    }

    profitCaseIntervalId = setInterval(() => {
      if (!isProfitCaseInterval) {
        return;
      }
      currentProfitCase = currentProfitCase === 'before' ? 'after' : 'before';
      updateProfitCaseUi();
    }, PROFIT_CASE_INTERVAL_MS);
  }

  function initProfitCaseButtons() {
    profitCaseButtons.forEach(buttonEl => {
      buttonEl.addEventListener('click', () => {
        selectProfitCase(buttonEl.dataset.profitCase);
      });
    });
    updateProfitCaseUi();
    startProfitCaseInterval();
  }

  function initCoinAnimationObserver() {
    if (!profitRatioBoxEl) {
      return;
    }

    const coinObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        document.querySelectorAll('[data-bg-coin]').forEach(coinEl => {
          coinEl.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );

    coinObserver.observe(profitRatioBoxEl);
  }

  function initTypingAnimation() {
    if (!typingTextEl) {
      return;
    }

    let currentIndex = 0;
    let charIndex = 0;
    let timeoutId = null;

    function typeText() {
      const currentText = TYPING_TEXTS[currentIndex];
      if (charIndex < currentText.length) {
        typingTextEl.textContent = currentText.slice(0, charIndex + 1);
        charIndex += 1;
        const currentSpeed = charIndex === currentText.length ? TYPING_SPEED_MS * 2 : TYPING_SPEED_MS;
        timeoutId = setTimeout(typeText, currentSpeed);
        return;
      }
      timeoutId = setTimeout(fadeOutAndSwitch, TYPING_PAUSE_MS);
    }

    function fadeOutAndSwitch() {
      typingTextEl.classList.add('fade_out');
      timeoutId = setTimeout(() => {
        currentIndex = (currentIndex + 1) % TYPING_TEXTS.length;
        charIndex = 0;
        typingTextEl.textContent = '';
        typingTextEl.classList.remove('fade_out');
        timeoutId = setTimeout(typeText, TYPING_SPEED_MS);
      }, TYPING_FADE_OUT_MS);
    }

    timeoutId = setTimeout(typeText, TYPING_SPEED_MS);
  }

  function updateScrollUi() {
    const scrollPosition = window.scrollY || window.pageYOffset;
    const isDesktop = window.innerWidth > 991;

    if (scrollDownInfoEl) {
      scrollDownInfoEl.style.display = scrollPosition > SCROLL_HIDE_THRESHOLD_PX ? 'none' : '';
    }

    if (customerBarEl) {
      customerBarEl.style.position =
        isDesktop && scrollPosition <= SCROLL_HIDE_THRESHOLD_PX ? 'fixed' : 'absolute';
    }
  }

  function scrollToProfitSection(event) {
    event.preventDefault();
    if (!profitSectionEl) {
      return;
    }
    profitSectionEl.scrollIntoView({ behavior: 'smooth' });
  }

  function openQuestionModal() {
    if (!questionModalEl || !dimEl) {
      return;
    }
    questionModalEl.classList.add('active');
    dimEl.classList.add('active');
  }

  function closeQuestionModal() {
    if (!questionModalEl || !dimEl) {
      return;
    }
    questionModalEl.classList.remove('active');
    if (!offcanvasGnbEl || !offcanvasGnbEl.classList.contains('active')) {
      dimEl.classList.remove('active');
    }
  }

  function openOffcanvasGnb() {
    if (!offcanvasGnbEl || !dimEl) {
      return;
    }
    offcanvasGnbEl.classList.add('active');
    dimEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeOffcanvasGnb() {
    if (!offcanvasGnbEl || !dimEl) {
      return;
    }
    offcanvasGnbEl.classList.remove('active');
    if (!questionModalEl || !questionModalEl.classList.contains('active')) {
      dimEl.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  function initGnbInteractions() {
    if (hamburgerBtnEl) {
      hamburgerBtnEl.addEventListener('click', openOffcanvasGnb);
    }

    if (dimEl) {
      dimEl.addEventListener('click', () => {
        closeOffcanvasGnb();
        closeQuestionModal();
      });
    }

    document.querySelectorAll('#musicflex_offcanvas_gnb [data-offcanvas-toggle]').forEach(menuItemEl => {
      menuItemEl.addEventListener('click', event => {
        if (window.innerWidth > 991) {
          return;
        }
        const dropdownEl = menuItemEl.querySelector('.gnb_dropdown');
        if (!dropdownEl) {
          return;
        }
        event.preventDefault();
        menuItemEl.classList.toggle('active');
        dropdownEl.style.height = menuItemEl.classList.contains('active')
          ? `${dropdownEl.scrollHeight}px`
          : '0';
      });
    });
  }

  function initPageActions() {
    document.querySelectorAll('[data-scroll-profit]').forEach(buttonEl => {
      buttonEl.addEventListener('click', scrollToProfitSection);
    });

    const questionButtonEl = document.querySelector('[data-head-question]');
    if (questionButtonEl) {
      questionButtonEl.addEventListener('click', openQuestionModal);
    }
  }

  function init() {
    initInternalLinkGuards();
    initProfitCaseButtons();
    initCoinAnimationObserver();
    initTypingAnimation();
    initGnbInteractions();
    initPageActions();
    updateScrollUi();

    window.addEventListener('scroll', updateScrollUi, { passive: true });
    window.addEventListener('resize', updateScrollUi, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
