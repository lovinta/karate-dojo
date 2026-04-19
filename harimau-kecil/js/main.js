/**
 * Harimau Kecil - Karate Dojo
 * Main JavaScript File
 */

(function() {
  'use strict';

  // ========================================
  // DOM Elements
  // ========================================
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const modal = document.getElementById('lesson-modal');
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.getElementById('modal-body');
  const moduleButtons = document.querySelectorAll('.btn-module');
  const faqQuestions = document.querySelectorAll('.faq-question');

  // ========================================
  // Lesson Module Data
  // ========================================
  const moduleData = {
    1: {
      title: 'Modul 1: Salam dan Hormat',
      steps: [
        {
          subtitle: 'Persiapan',
          content: 'Berdiri tegak dengan posisi siap. Kaki selebar bahu, tangan di samping badan.'
        },
        {
          subtitle: 'Gerakan Bow (Hormat)',
          content: 'Lipat kedua tangan di depan dada, telapak tangan saling menyentuh. Condongkan badan ke depan sekitar 30 derajat.'
        },
        {
          subtitle: 'Seiko (Salam)',
          content: 'Untuk seiko, turunkan badan dengan kedua lutut ditekuk. Punggung tetap lurus. Kembali ke posisi berdiri tegak.'
        },
        {
          subtitle: 'Tips Penting',
          content: 'Selalu ucapkan "Osu!" atau "Onegaishimasu" saat memberikan hormat sebagai tanda respek.'
        }
      ]
    },
    2: {
      title: 'Modul 2: Posisi Siap',
      steps: [
        {
          subtitle: 'Heiko Dachi (Posisi Kaki Sejajar)',
          content: 'Berdiri dengan kaki sejajar selebar bahu. Berat badan seimbang di kedua kaki.'
        },
        {
          subtitle: 'Shizentai Dachi (Posisi Siap Alamiah)',
          content: 'Posisi berdiri tegak, kaki kiri sedikit di depan kaki kanan. Jarak antar kaki sekitar satu kepalan tangan.'
        },
        {
          subtitle: 'Sayasune Dachi (Posisi Pertahanan)',
          content: 'Kaki membentuk huruf V terbalik. Lutut sedikit ditekuk. Tubuh siap bergerak ke segala arah.'
        },
        {
          subtitle: 'Latihan Pernapasan',
          content: 'Tarik napas dalam melalui hidung selama 4 detik, tahan 4 detik, hembuskan melalui mulut 4 detik.'
        }
      ]
    },
    3: {
      title: 'Modul 3: Kuda-Kuda Dasar',
      steps: [
        {
          subtitle: 'Kiba Dachi (Kuda-Kuda Depan)',
          content: 'Buka kedua kaki lebar-lebar, putar kaki mengarah keluar 90 derajat. Tekuk lutut seperti duduk di atas kuda.'
        },
        {
          subtitle: 'Kokutsu Dachi (Kuda-Kuda Belakang)',
          content: 'Kaki kanan di depan, kaki kiri di belakang. Berat badan 70% di kaki belakang. Pinggul menghadap depan.'
        },
        {
          subtitle: 'Zenku Tsugi Dachi (Kuda-Kuda Depan Pendek)',
          content: 'Kaki kanan di depan dalam posisi setengah jongkok. Kaki kiri di belakang setengah langkah. Lutut depan tidak boleh melewati jari kaki.'
        },
        {
          subtitle: 'Tips Keseimbangan',
          content: 'Latihan statis 30 detik per posisi untuk membangun kekuatan kaki dan keseimbangan tubuh.'
        }
      ]
    },
    4: {
      title: 'Modul 4: Pukulan Lurus Dasar',
      steps: [
        {
          subtitle: 'Oi Tsuki (Pukulan Lurus Searah)',
          content: 'Kaki kanan di depan (dalam kiba dachi). Tangannya yang satu sisi dengan kaki depan menusuk lurus ke depan. Tangan belakang melindungi dagu.'
        },
        {
          subtitle: 'Gerakan Kaki',
          content: 'Putar pinggul sedikit ke depan saat memukul untuk menambah kekuatan. Kaki belakang mengikuti sedikit.'
        },
        {
          subtitle: 'Teknik Breathing',
          content: 'Hembuskan napas "KIAI!" saat momen pukulan maksimal. Ini membantu fokus dan power.'
        },
        {
          subtitle: 'Kesalahan Umum',
          content: 'Jangan menegangkan bahu terlalu tinggi. Relakskan dan fokus pada rotasi pinggul untuk kekuatan.'
        }
      ]
    },
    5: {
      title: 'Modul 5: Tangkisan Dasar',
      steps: [
        {
          subtitle: 'Age Uke (Tangkisan Naik)',
          content: 'Angkat tangan dari bawah ke atas di depan wajah. Siku ditekuk membentuk sudut 90 derajat. Telapak tangan menghadap keluar.'
        },
        {
          subtitle: 'Soto Uke (Tangkisan Luar)',
          content: 'Lengan bergerak dari luar ke dalam, melewati depan wajah. Tekankan gerakan dari pinggul, bukan hanya tangan.'
        },
        {
          subtitle: 'Uchi Uke (Tangkisan Dalam)',
          content: 'Lengan bergerak dari dalam ke luar dengan sudut yang tepat. Kombinasi dengan posisi kuda-kuda yang benar.'
        },
        {
          subtitle: 'Latihan Kombinasi',
          content: 'Praktikkan: Tangkis (age uke) - Pukul (oi tsuki). Ulangi 10x setiap sisi dengan tempo yang terkontrol.'
        }
      ]
    },
    6: {
      title: 'Modul 6: Tendangan Dasar Ringan',
      steps: [
        {
          subtitle: 'Mae Keage (Tendangan Depan)',
          content: 'Angkat lutut ke depan setinggi dada, lalu tendang ke atas dengan cepat menggunakan tungkai bawah. Kaki seperti mengayun.'
        },
        {
          subtitle: 'Yoko Geri (Tendangan Samping)',
          content: 'Berlaku di atas satu kaki. Kaki pendukung sedikit ditekuk. Kaki yang menendang bergerak ke samping dengan telapak kaki menghadap target.'
        },
        {
          subtitle: 'Safety First',
          content: 'Untuk pemula, tendangan hanya sampai setinggi lutut. Fokus pada kontrol dan teknik, bukan ketinggian.'
        },
        {
          subtitle: 'Latihan Kekuatan Kaki',
          content: 'Lakukan penguatan otot paha dengan wall sit selama 20 detik, 3 set. Ini membantu stabilitas saat menendang.'
        }
      ]
    }
  };

  // ========================================
  // Header Scroll Effect
  // ========================================
  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // ========================================
  // Mobile Navigation
  // ========================================
  function openNav() {
    hamburger.classList.add('active');
    nav.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    
    // Create overlay if not exists
    if (!document.querySelector('.nav-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.addEventListener('click', closeNav);
      document.body.appendChild(overlay);
      setTimeout(() => overlay.classList.add('active'), 10);
    } else {
      document.querySelector('.nav-overlay').classList.add('active');
    }
  }

  function closeNav() {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    
    const overlay = document.querySelector('.nav-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  hamburger.addEventListener('click', function() {
    if (nav.classList.contains('active')) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close nav when clicking a link
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth < 1024) {
        closeNav();
      }
    });
  });

  // Close nav on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      closeNav();
    }
  });

  // ========================================
  // Smooth Scroll Navigation
  // ========================================
  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Only handle internal anchor links
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          const headerHeight = header.offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ========================================
  // Lesson Modal
  // ========================================
  function openModal(moduleId) {
    const data = moduleData[moduleId];
    if (!data) return;

    modalTitle.textContent = data.title;
    
    let bodyHTML = '';
    data.steps.forEach(function(step, index) {
      bodyHTML += '<h4>' + (index + 1) + '. ' + step.subtitle + '</h4>';
      bodyHTML += '<p>' + step.content + '</p>';
    });
    
    modalBody.innerHTML = bodyHTML;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    
    // Focus trap - focus the close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  moduleButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const moduleId = this.getAttribute('data-module');
      if (moduleId) {
        openModal(moduleId);
      }
    });
  });

  // Close modal events
  const closeModalButtons = modal.querySelectorAll('[data-close-modal]');
  closeModalButtons.forEach(function(btn) {
    btn.addEventListener('click', closeModal);
  });

  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  // Close modal on click outside content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ========================================
  // FAQ Accordion
  // ========================================
  function toggleFaq(question) {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    const answerId = question.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);

    // Close all other FAQs on mobile
    if (window.innerWidth < 768) {
      faqQuestions.forEach(function(q) {
        if (q !== question) {
          q.setAttribute('aria-expanded', 'false');
          const qAnswerId = q.getAttribute('aria-controls');
          const qAnswer = document.getElementById(qAnswerId);
          if (qAnswer) qAnswer.hidden = true;
        }
      });
    }

    // Toggle current FAQ
    question.setAttribute('aria-expanded', !isExpanded);
    if (answer) {
      answer.hidden = isExpanded;
    }
  }

  faqQuestions.forEach(function(question) {
    question.addEventListener('click', function() {
      toggleFaq(this);
    });

    // Keyboard support
    question.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFaq(this);
      }
    });
  });

  // ========================================
  // Scroll Animations
  // ========================================
  function animateOnScroll() {
    const elements = document.querySelectorAll('[data-animate]');
    
    elements.forEach(function(el) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Element is in viewport
      if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
        el.classList.add('animated');
      }
    });
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // Initial check
    animateOnScroll();
    
    // On scroll
    window.addEventListener('scroll', animateOnScroll, { passive: true });
  } else {
    // If user prefers reduced motion, show all elements immediately
    document.querySelectorAll('[data-animate]').forEach(function(el) {
      el.classList.add('animated');
    });
  }

  // ========================================
  // Initialize
  // ========================================
  function init() {
    handleHeaderScroll();
    animateOnScroll();
    
    // Add focus-visible polyfill behavior for older browsers
    document.querySelectorAll('.btn, .nav-link, .faq-question').forEach(function(el) {
      el.addEventListener('focus', function() {
        this.classList.add('focus-visible');
      }, true);
      el.addEventListener('blur', function() {
        this.classList.remove('focus-visible');
      }, true);
    });
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
