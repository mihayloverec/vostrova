/* =========================================
   OSTROV (VOSTROVA LLC) - Main Script
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // trigger when 15% is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: stop observing once it's visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements with reveal classes
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    // --- 2. Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileToggle && mobileNav) {
        // Toggle menu on hamburger click
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('is-active');
            mobileNav.classList.toggle('is-open');
            document.body.style.overflow = mobileNav.classList.contains('is-open') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('is-active');
                mobileNav.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 3. Contact Form Popup & Telegram Submission ---

    const popupOverlay = document.getElementById('contactPopup');
    const openPopupBtns = document.querySelectorAll('.open-contact-modal');
    const closePopupBtn = document.querySelector('.popup-close');
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.querySelector('.form-status');

    // Open popup
    openPopupBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            popupOverlay.classList.add('is-active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close popup function
    const closePopup = () => {
        popupOverlay.classList.remove('is-active');
        document.body.style.overflow = '';
        if (contactForm) {
            contactForm.reset();
            formStatus.textContent = '';
            formStatus.className = 'form-status';
        }
    };

    // Close on X button
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', closePopup);
    }

    // Close on overlay click
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                closePopup();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popupOverlay && popupOverlay.classList.contains('is-active')) {
            closePopup();
        }
    });

    // Handle Form Submit
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.form-submit');
            const originalBtnText = submitBtn.innerHTML;
            
            // Set loading state
            submitBtn.innerHTML = '<span>SENDING...</span>';
            submitBtn.disabled = true;
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            // Gather Data
            const formData = new FormData(contactForm);
            const payload = {
                lang: formData.get('lang'),
                name: formData.get('name'),
                contact: formData.get('contact'),
                message: formData.get('message')
            };

            // Отправляем данные на наш серверный скрипт (PHP), 
            // который уже безопасно (без показа токена в браузере) отправит их в Telegram.
            const url = 'send.php';

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                // Проверяем, вернул ли скрипт JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const rawText = await response.text();
                    
                    // Пытаемся очистить ответ от невидимых/вредных символов (например, 'x' в конце)
                    let cleanText = rawText.trim();
                    const lastBraceIndex = cleanText.lastIndexOf('}');
                    if (lastBraceIndex !== -1 && lastBraceIndex < cleanText.length - 1) {
                        cleanText = cleanText.substring(0, lastBraceIndex + 1);
                    }
                    const firstBraceIndex = cleanText.indexOf('{');
                    if (firstBraceIndex > 0) {
                        cleanText = cleanText.substring(firstBraceIndex);
                    }

                    const result = JSON.parse(cleanText);
                    
                    if (response.ok && result.success) {
                        formStatus.textContent = payload.lang === 'Vietnamese' ? 'Yêu cầu của bạn đã được gửi thành công!' : 
                                                 payload.lang === 'Russian' ? 'Ваша заявка успешно отправлена!' : 
                                                 'Your request was sent successfully!';
                        formStatus.className = 'form-status status-success';
                        contactForm.reset();
                        
                        // Close popup after 2 seconds on success
                        setTimeout(() => {
                            closePopup();
                        }, 2000);
                    } else {
                        throw new Error(result.error || 'Server processing error');
                    }
                } else {
                    throw new Error('Received non-JSON response from server');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                formStatus.textContent = 'Oops! Error sending request. Please check server configuration.';
                formStatus.className = 'form-status status-error';
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

});
