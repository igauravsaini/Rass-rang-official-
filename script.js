/* ============================================================
   RAAS~RANG GARBA NIGHTS 2026 — Interactive Engine
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ======================== CINEMATIC PRELOADER & TEMPLE BELL HOOK ========================
    const preloader = document.getElementById('preloader');

    // Gentle Temple Bell Sound Hook via Web Audio API
    function playTempleBell() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const audioCtx = new AudioCtx();
            
            // Bell frequencies: Root (432Hz - sacred pitch), Octave, 5th, Major 10th
            const partials = [
                { freq: 432, gain: 0.15, decay: 3.8 },
                { freq: 864, gain: 0.08, decay: 2.8 },
                { freq: 1296, gain: 0.04, decay: 2.0 },
                { freq: 2160, gain: 0.02, decay: 1.2 }
            ];

            const triggerBell = () => {
                const now = audioCtx.currentTime;
                partials.forEach(p => {
                    const osc = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(p.freq, now);

                    // Soft strike attack & long resonant acoustic decay
                    gainNode.gain.setValueAtTime(0.0001, now);
                    gainNode.gain.exponentialRampToValueAtTime(p.gain, now + 0.03);
                    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + p.decay);

                    osc.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    osc.start(now);
                    osc.stop(now + p.decay);
                });
            };

            if (audioCtx.state === 'suspended') {
                const unlockAudio = () => {
                    audioCtx.resume().then(() => triggerBell());
                    window.removeEventListener('click', unlockAudio);
                    window.removeEventListener('touchstart', unlockAudio);
                };
                window.addEventListener('click', unlockAudio);
                window.addEventListener('touchstart', unlockAudio);
            } else {
                setTimeout(triggerBell, 400);
            }
        } catch (e) {
            // Audio context restricted by browser policy
        }
    }

    // Trigger temple bell
    playTempleBell();

    // 3.5-second cinematic loading sequence before homepage appears
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('loaded');
            }
        }, 3400);
    });

    // Failsafe: hide preloader after 4.2s regardless
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
        }
    }, 4200);

    // ======================== GOLDEN PARTICLE SYSTEM ========================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = -Math.random() * 0.5 - 0.1;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.growing = Math.random() > 0.5;
            // Gold/saffron color palette
            const colors = [
                { r: 217, g: 167, b: 58 },  // Antique Gold
                { r: 240, g: 201, b: 94 },  // Gold Light
                { r: 255, g: 111, b: 0 },   // Saffron
                { r: 250, g: 232, b: 176 }, // Gold Pale
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Gentle sway
            this.x += Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.15;

            if (this.growing) {
                this.opacity += this.fadeSpeed;
                if (this.opacity >= 0.6) this.growing = false;
            } else {
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0) this.reset();
            }

            // Reset if out of bounds
            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset();
                this.y = canvas.height + 10;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;

            // Draw with glow
            ctx.shadowBlur = this.size * 4;
            ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Create particles based on screen size
    function initParticles() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animFrameId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Performance: pause particles when tab not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animFrameId);
        } else {
            animateParticles();
        }
    });


    // ======================== NAVIGATION ========================
    const navbar = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll handler for navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !expanded);
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    function updateActiveNav() {
        const scrollY = window.pageYOffset + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });


    // ======================== COUNTDOWN TIMER ========================
    const eventDate = new Date('2026-10-17T18:00:00+05:30').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = eventDate - now;

        if (diff <= 0) {
            document.getElementById('countdown-container').innerHTML =
                '<div class="countdown-label" style="color: var(--antique-gold); font-size: 1.2rem;">🎉 The Celebration Has Begun! 🎉</div>';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdown-days').textContent = String(days).padStart(2, '0');
        document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);


    // ======================== SCROLL REVEAL ========================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ======================== ANIMATED COUNTERS ========================
    const statValues = document.querySelectorAll('.stat-value[data-target]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                const duration = 2000;
                const start = performance.now();

                function animateCount(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);
                    el.textContent = current.toLocaleString('en-IN') + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(animateCount);
                    }
                }
                requestAnimationFrame(animateCount);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(el => counterObserver.observe(el));


    // ======================== TICKET QUANTITY CONTROLS ========================
    document.querySelectorAll('.qty-controls').forEach(control => {
        const input = control.querySelector('.qty-input');
        const minusBtn = control.querySelector('.qty-minus');
        const plusBtn = control.querySelector('.qty-plus');

        minusBtn.addEventListener('click', () => {
            const val = parseInt(input.value);
            if (val > 1) input.value = val - 1;
        });

        plusBtn.addEventListener('click', () => {
            const val = parseInt(input.value);
            if (val < 10) input.value = val + 1;
        });

        input.addEventListener('change', () => {
            let val = parseInt(input.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 10) val = 10;
            input.value = val;
        });
    });


    // ======================== PROMO CODE ========================
    const promoApply = document.getElementById('promo-apply');
    const promoInput = document.getElementById('promo-code-input');

    if (promoApply) {
        promoApply.addEventListener('click', () => {
            const code = promoInput.value.trim();
            if (code) {
                promoApply.textContent = 'Applied ✓';
                promoApply.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                promoApply.style.border = '1px solid #2ecc71';
                setTimeout(() => {
                    promoApply.textContent = 'Apply';
                    promoApply.style.background = '';
                    promoApply.style.border = '';
                }, 3000);
            }
        });
    }


    // ======================== GALLERY FILTER & LIGHTBOX ========================
    const galleryFilters = document.querySelectorAll('.gallery-filter');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    let currentLightboxIndex = 0;
    let visibleItems = [];

    // Gallery filter
    galleryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            galleryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            const category = filter.dataset.filter;
            galleryItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // Lightbox open
    galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            visibleItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
            currentLightboxIndex = visibleItems.indexOf(item);
            openLightbox();
        });
    });

    function openLightbox() {
        const item = visibleItems[currentLightboxIndex];
        const img = item.querySelector('img');
        const label = item.querySelector('.gallery-label');

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = label ? label.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-prev').addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
        openLightbox();
    });
    document.querySelector('.lightbox-next').addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
        openLightbox();
    });

    // Lightbox keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
            currentLightboxIndex = (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
            openLightbox();
        }
        if (e.key === 'ArrowRight') {
            currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
            openLightbox();
        }
    });

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });


    // ======================== CONTACT FORM ========================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('contact-submit');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Sending...';
            submitBtn.style.pointerEvents = 'none';

            setTimeout(() => {
                submitBtn.textContent = 'Message Sent ✓';
                submitBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.pointerEvents = '';
                    contactForm.reset();
                }, 3000);
            }, 1500);
        });
    }


    // ======================== SMOOTH SCROLL ========================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 75;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ======================== TICKET BOOKING BUTTONS ========================
    document.querySelectorAll('.ticket-book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.ticket-card');
            const name = card.querySelector('.ticket-name').textContent;
            const qty = card.querySelector('.qty-input').value;
            const price = card.querySelector('.price-amount').textContent;

            btn.textContent = `Added ${qty}× ${name}`;
            btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

            setTimeout(() => {
                btn.textContent = 'Book Now';
                btn.style.background = '';
            }, 2500);
        });
    });

});
