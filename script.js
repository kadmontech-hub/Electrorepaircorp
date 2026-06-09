/**
 * ELECTRO REPAIR CORP — script.js
 * Pure JS. No frameworks. No external deps.
 * Handles: header scroll, mobile nav, reveal animations,
 *          FAQ accordion, sticky CTA.
 */

(function () {
  'use strict';

  /* ── UTILITIES ─────────────────────────────────────── */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Respect prefers-reduced-motion globally */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  /* ── HEADER: scroll shadow + sticky state ───────────── */

  const header = $('#header');

  if (header) {
    const onScroll = () => {
      if (window.scrollY > 10) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }


  /* ── MOBILE NAV ─────────────────────────────────────── */

  const hamburger = $('#hamburger');
  const nav = $('.nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('is-open');
      nav.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Close nav when a link is clicked
    $$('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        nav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        hamburger.classList.remove('is-open');
        nav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ── SCROLL REVEAL ──────────────────────────────────── */

  if (!prefersReducedMotion) {
    const revealElements = $$('.reveal');

    if (revealElements.length && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              /* Stagger siblings within the same parent */
              const siblings = $$('.reveal', entry.target.parentElement);
              const index = siblings.indexOf(entry.target);
              entry.target.style.transitionDelay = `${index * 80}ms`;
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
      );

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      /* Fallback: show all immediately */
      revealElements.forEach(el => el.classList.add('is-visible'));
    }
  } else {
    /* Reduced motion: show everything without animation */
    $$('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }


  /* ── FAQ ACCORDION ──────────────────────────────────── */

  const faqItems = $$('.faq__item');

  faqItems.forEach(item => {
    const btn = $('.faq__question', item);
    const answer = $('.faq__answer', item);

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(other => {
        const otherBtn = $('.faq__question', other);
        const otherAnswer = $('.faq__answer', other);
        if (otherBtn && otherAnswer && otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.setAttribute('hidden', '');
        }
      });

      // Toggle current
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        answer.setAttribute('hidden', '');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });


  /* ── STICKY WHATSAPP CTA ────────────────────────────── */

  const stickyCta = $('#sticky-cta');

  if (stickyCta) {
    // Show after user scrolls past the hero
    const heroSection = $('.hero');
    const heroHeight = heroSection ? heroSection.offsetHeight : 500;

    const stickyObserverTarget = document.createElement('div');
    stickyObserverTarget.style.cssText = `position:absolute;top:${heroHeight}px;left:0;width:1px;height:1px;pointer-events:none;`;
    document.body.appendChild(stickyObserverTarget);

    if ('IntersectionObserver' in window) {
      const stickyObserver = new IntersectionObserver(
        ([entry]) => {
          // Show sticky CTA once target is scrolled past
          if (!entry.isIntersecting) {
            stickyCta.classList.add('is-visible');
          } else {
            stickyCta.classList.remove('is-visible');
          }
        },
        { threshold: 0 }
      );
      stickyObserver.observe(stickyObserverTarget);
    } else {
      // Fallback: show after scroll
      window.addEventListener('scroll', () => {
        if (window.scrollY > heroHeight) {
          stickyCta.classList.add('is-visible');
        } else {
          stickyCta.classList.remove('is-visible');
        }
      }, { passive: true });
    }

    // On mobile only: hide sticky CTA when user is near CTA final section
    const ctaFinal = $('.cta-final');
    if (ctaFinal) {
      const ctaFinalObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            stickyCta.classList.remove('is-visible');
          }
        },
        { threshold: 0.5 }
      );
      ctaFinalObserver.observe(ctaFinal);
    }
  }


  /* ── SMOOTH ANCHOR SCROLL (with header offset) ──────── */

  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: targetTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });


  /* ── LAZY LOAD (non-critical images) ─────────────────── */

  if ('loading' in HTMLImageElement.prototype) {
    $$('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  } else if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          imgObserver.unobserve(img);
        }
      });
    });
    $$('img[data-src]').forEach(img => imgObserver.observe(img));
  }


  /* ── WHATSAPP LINK BUILDER ───────────────────────────── */
  /**
   * Optional: if you want to pre-fill WhatsApp with dynamic info
   * from a form field in the future, use this helper.
   *
   * buildWALink({ phone: '5491124982008', message: 'Hola...' })
   * returns: 'https://wa.me/5491124982008?text=Hola...'
   */
  // eslint-disable-next-line no-unused-vars
  function buildWALink({ phone, message }) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

})();
