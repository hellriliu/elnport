/*
  Сайт-визитка: скрипты.
  Что здесь происходит:
  1. меню на телефоне;
  2. плавное появление блоков при прокрутке;
  3. подсветка пункта меню и линия в разделе «Технологический вектор»;
  4. подсветка карточек под курсором;
  5. фон из точек и линий на главном экране.
*/

const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Короткая замена querySelectorAll, которая сразу возвращает массив
const findAll = (selector) => [...document.querySelectorAll(selector)];
const find = (selector) => document.querySelector(selector);


/* 1. Меню на телефоне */
function initMenu() {
  const burgerButton = find('.burger');
  const menu = find('#menu');

  function closeMenu() {
    menu.classList.remove('open');
    burgerButton.setAttribute('aria-expanded', 'false');
  }

  burgerButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    burgerButton.setAttribute('aria-expanded', isOpen);
  });

  findAll('nav a').forEach((link) => link.addEventListener('click', closeMenu));
}


/* 2. Появление блоков при прокрутке */
function initRevealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  findAll('.rv').forEach((block) => observer.observe(block));
}


/* 3. Активный пункт меню и линия «вектора» */
function initScrollState() {
  const sections = findAll('main section[id]');
  const menuLinks = findAll('nav a');
  const steps = findAll('.step');
  const path = find('#path');
  const pathFill = find('#fill');

  function getCurrentSectionId() {
    const readingLine = scrollY + innerHeight * 0.4;
    let currentId = '';
    sections.forEach((section) => {
      if (section.offsetTop <= readingLine) currentId = section.id;
    });
    return currentId;
  }

  function updateMenu() {
    const currentId = getCurrentSectionId();
    menuLinks.forEach((link) => {
      link.classList.toggle('on', link.getAttribute('href') === `#${currentId}`);
    });
  }

  function updatePath() {
    const triggerLine = innerHeight * 0.6;
    const pathBox = path.getBoundingClientRect();
    const filledHeight = Math.max(0, Math.min(pathBox.height - 12, triggerLine - pathBox.top));
    pathFill.style.height = `${filledHeight}px`;

    steps.forEach((step) => {
      step.classList.toggle('on', step.getBoundingClientRect().top < triggerLine);
    });
  }

  function update() {
    updateMenu();
    updatePath();
  }

  addEventListener('scroll', update, { passive: true });
  update();
}


/* 4. Подсветка карточки под курсором */
function initCardSpotlight() {
  findAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--x', `${event.clientX - box.left}px`);
      card.style.setProperty('--y', `${event.clientY - box.top}px`);
    });
  });
}


/* 5. Фон главного экрана: точки и линии между близкими точками */
function initParticleBackground() {
  const MAX_PARTICLES = 70;
  const AREA_PER_PARTICLE = 16000; // сколько пикселей экрана приходится на одну точку
  const LINK_DISTANCE = 140;

  const canvas = find('#net');
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let frameId;

  const createParticle = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  });

  function resize() {
    const box = canvas.parentNode.getBoundingClientRect();
    width = canvas.width = box.width;
    height = canvas.height = box.height;

    const count = Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE));
    particles = Array.from({ length: count }, createParticle);
  }

  function moveParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;
  }

  function drawLink(a, b) {
    const distance = Math.hypot(a.x - b.x, a.y - b.y);
    if (distance >= LINK_DISTANCE) return;

    const opacity = 0.22 * (1 - distance / LINK_DISTANCE);
    context.strokeStyle = `rgba(110, 150, 255, ${opacity})`;
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  function drawDot(particle) {
    context.fillStyle = 'rgba(125, 211, 252, 0.7)';
    context.beginPath();
    context.arc(particle.x, particle.y, 1.6, 0, Math.PI * 2);
    context.fill();
  }

  function drawFrame() {
    context.clearRect(0, 0, width, height);

    if (!prefersReducedMotion) particles.forEach(moveParticle);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        drawLink(particles[i], particles[j]);
      }
    }
    particles.forEach(drawDot);

    if (!prefersReducedMotion) frameId = requestAnimationFrame(drawFrame);
  }

  function restart() {
    cancelAnimationFrame(frameId);
    resize();
    drawFrame();
  }

  addEventListener('resize', restart);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frameId);
    else if (!prefersReducedMotion) drawFrame();
  });

  restart();
}


initMenu();
initRevealOnScroll();
initScrollState();
initCardSpotlight();
initParticleBackground();
