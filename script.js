document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 50
        });
    }

    // Lightweight skeleton state for real content images.
    const prepareLazyImage = (img, src = null) => {
        if (!img) return;

        const skipSkeleton = img.closest('.hero-slideshow') || img.closest('.logo');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        if (!skipSkeleton && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');

        if (!skipSkeleton) {
            img.classList.add('lazy-media');
            img.classList.remove('is-loaded', 'has-error');

            img.addEventListener('load', () => {
                img.classList.add('is-loaded');
            }, { once: true });

            img.addEventListener('error', () => {
                img.classList.add('is-loaded', 'has-error');
            }, { once: true });
        }

        if (src) {
            img.src = src;
        } else if (!skipSkeleton && img.complete && img.naturalWidth > 0) {
            img.classList.add('is-loaded');
        }
    };

    document.querySelectorAll('img').forEach((img) => prepareLazyImage(img));

    const mediaManifest = {
        reviews: [
            'assets/optimized/reviews/1.webp',
            'assets/optimized/reviews/2.webp',
            'assets/optimized/reviews/3.webp',
            'assets/optimized/reviews/4.webp',
            'assets/optimized/reviews/5.webp'
        ],
        archive: [
            'assets/optimized/archive/1.webp',
            'assets/optimized/archive/2.webp',
            'assets/optimized/archive/3.webp',
            'assets/optimized/archive/4.webp',
            'assets/optimized/archive/5.webp',
            'assets/optimized/archive/6.webp',
            'assets/optimized/archive/7.webp',
            'assets/optimized/archive/8.webp',
            'assets/optimized/archive/9.webp'
        ]
    };

    const loadDeferredHeroImages = () => {
        document.querySelectorAll('.hero-slideshow img[data-src]').forEach((img) => {
            if (!img.getAttribute('src')) {
                img.setAttribute('src', img.dataset.src);
            }
        });
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(loadDeferredHeroImages, { timeout: 1800 });
    } else {
        window.addEventListener('load', () => {
            setTimeout(loadDeferredHeroImages, 500);
        }, { once: true });
    }

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.querySelector('i').classList.remove('fa-times');
                    hamburger.querySelector('i').classList.add('fa-bars');
                }

                // Smooth scroll
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Search Button Functionality
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const dest = document.getElementById('search-destination');
            const dateInput = document.getElementById('search-date');
            const guestsSelect = document.getElementById('search-guests');

            const destination = dest ? dest.value.trim() : '';
            const date = dateInput ? dateInput.value : '';
            const guests = guestsSelect ? guestsSelect.value : '';

            // Validate destination
            if (!destination) {
                dest.style.outline = '2px solid #e74c3c';
                dest.setAttribute('placeholder', 'Please enter a destination!');
                dest.focus();
                setTimeout(() => {
                    dest.style.outline = 'none';
                    dest.setAttribute('placeholder', 'Search destinations...');
                }, 2500);
                return;
            }

            // Build WhatsApp message with search details
            let message = `Hi Eva Journeys! I'm interested in travelling to *${destination}*.`;
            if (date) message += `\nPreferred date: ${date}`;
            if (guests) message += `\nTravellers: ${guests}`;
            message += `\n\nPlease share available packages and pricing. Thank you!`;

            const waUrl = `https://wa.me/919274577699?text=${encodeURIComponent(message)}`;

            // Smooth scroll to packages section first
            const packagesSection = document.querySelector('#packages');
            if (packagesSection) {
                packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Open WhatsApp after a short delay
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 1200);
        });
    }

    // 6. Newsletter / Subscribe Form Handler (Web3Forms)
    const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        const successMsg = document.getElementById('newsletter-success');
        const errorMsg = document.getElementById('newsletter-error');
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        const btnDefault = submitBtn ? submitBtn.innerHTML : 'Subscribe';

        const showError = (text) => {
            if (!errorMsg) return;
            errorMsg.textContent = text;
            errorMsg.style.display = 'block';
        };

        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorMsg) errorMsg.style.display = 'none';

            const name = (document.getElementById('newsletter-name')?.value || '').trim();
            const email = (document.getElementById('newsletter-email')?.value || '').trim();
            const mobile = (document.getElementById('newsletter-mobile')?.value || '').trim();

            // Basic client-side validation for all three fields
            if (!name || !email || !mobile) {
                showError('Please fill in your name, email and mobile number.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            if (!/^[+]?[\d\s-]{7,15}$/.test(mobile)) {
                showError('Please enter a valid mobile number.');
                return;
            }

            // Loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            submitBtn.disabled = true;

            try {
                const payload = Object.fromEntries(new FormData(newsletterForm).entries());
                const res = await fetch(WEB3FORMS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.success) {
                    newsletterForm.style.display = 'none';
                    if (successMsg) successMsg.style.display = 'flex';
                } else {
                    throw new Error(data.message || 'Submission failed');
                }
            } catch (err) {
                showError('Something went wrong. Please try again or contact us on WhatsApp.');
                submitBtn.innerHTML = btnDefault;
                submitBtn.disabled = false;
            }
        });
    }

    // 7. Initialize Swiper for Destinations
    if (typeof Swiper !== 'undefined') {
        const destSwiper = new Swiper('.destinations-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            speed: 4000,
            autoplay: {
                delay: 0,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 20 },
                992: { slidesPerView: 3, spaceBetween: 30 },
                1200: { slidesPerView: 4, spaceBetween: 30 }
            }
        });

        // 5b. Demo Review Carousel (generated text testimonials)
        const testimonialsWrapper = document.getElementById('testimonialsWrapper');
        if (testimonialsWrapper) {
            const testimonials = [
                { name: 'Riya Sharma', location: 'Ahmedabad', trip: 'Maldives Luxury Escape', rating: 5, text: 'Absolutely magical! Every detail from the resort to the transfers was handled flawlessly. Eva Journeys turned our honeymoon into a dream.' },
                { name: 'Aarav Patel', location: 'Gandhinagar', trip: 'Switzerland Alpine Magic', rating: 5, text: 'The Swiss Alps trip exceeded all expectations. Perfectly planned itinerary, premium hotels and zero stress. Highly recommended!' },
                { name: 'Sneha Desai', location: 'Mehsana', trip: 'Kerala Backwaters', rating: 5, text: 'The houseboat experience was serene and beautiful. The team was available 24/7 and made us feel truly cared for throughout.' },
                { name: 'Vikram Joshi', location: 'Palanpur', trip: 'Leh Ladakh Bike Trip', rating: 5, text: 'A bucket-list adventure done right. Great bikes, well-marked routes and an amazing guide. Best trip of my life so far!' },
                { name: 'Pooja Mehta', location: 'Surat', trip: 'Dubai Desert Safari', rating: 5, text: 'From the Burj Khalifa to the desert safari, everything was top-class. Loved the personal touch and quick responses on WhatsApp.' },
                { name: 'Karan Shah', location: 'Vadodara', trip: 'Bali Tropical Vibes', rating: 5, text: 'Stunning villas, smooth transfers and a beautifully crafted plan. Eva Journeys made our family trip completely hassle-free.' },
                { name: 'Ananya Nair', location: 'Rajkot', trip: 'Paris Romance & Heritage', rating: 5, text: 'Paris was pure romance! The museum passes and hotel choice were perfect. Thank you for an unforgettable anniversary getaway.' },
                { name: 'Rohan Trivedi', location: 'Ahmedabad', trip: 'Royal Rajasthan Tour', rating: 5, text: 'Heritage palaces, great food and seamless logistics. The team thought of everything before we even asked. Truly premium service.' }
            ];

            const avatarColors = ['#0e8369', '#FF6B6B', '#FFB703', '#1C2541', '#2bb594', '#E25555'];
            const initials = (n) => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const starsHtml = (r) => Array.from({ length: 5 }, (_, i) =>
                `<i class="fas fa-star${i < r ? '' : '-half-alt'}"></i>`).join('');

            // Shuffle for a fresh order each visit
            testimonials.sort(() => Math.random() - 0.5);

            testimonials.forEach((t, idx) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `
                    <div class="testimonial-card">
                        <i class="fas fa-quote-right quote-icon"></i>
                        <div class="stars">${starsHtml(t.rating)}</div>
                        <p class="review-text">${t.text}</p>
                        <div class="reviewer">
                            <div class="avatar-initials" style="background:${avatarColors[idx % avatarColors.length]}">${initials(t.name)}</div>
                            <div class="reviewer-info">
                                <h4>${t.name}</h4>
                                <span>${t.location} &middot; ${t.trip}</span>
                            </div>
                        </div>
                    </div>`;
                testimonialsWrapper.appendChild(slide);
            });

            new Swiper('.testimonials-slider', {
                slidesPerView: 1,
                spaceBetween: 24,
                grabCursor: true,
                loop: true,
                speed: 700,
                autoplay: { delay: 4500, disableOnInteraction: false },
                pagination: { el: '.testimonials-pagination', clickable: true },
                breakpoints: {
                    768: { slidesPerView: 2, spaceBetween: 28 },
                    1100: { slidesPerView: 3, spaceBetween: 30 }
                }
            });
        }

        // 6. Automated Review Screenshot Slideshow
        const slideshowContainer = document.getElementById('reviewSlideshow');
        const loader = document.getElementById('reviewLoader');
        
        if (slideshowContainer) {
            let validImages = [];

            // Use a manifest so production servers do not probe missing files on every visit.
            const discoverImages = async () => {
                validImages = [...mediaManifest.reviews];
                
                if (validImages.length === 0) {
                    slideshowContainer.innerHTML = '<p style="text-align:center; padding-top: 15%; color: var(--text);">Upload review screenshots (1.jpg, 2.png) to the reviews/ folder.</p>';
                    const loaderEl = document.getElementById('reviewLoader');
                    if (loaderEl) loaderEl.style.display = 'none';
                    return;
                }
                
                // Shuffle array to show random order as requested
                validImages.sort(() => Math.random() - 0.5);
                
                // Inject images into DOM as Swiper slides
                validImages.forEach((src) => {
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    
                    const imgWrap = document.createElement('div');
                    imgWrap.className = 'review-img-wrap';
                    
                    const imgEl = document.createElement('img');
                    imgEl.alt = 'Traveler review screenshot';
                    prepareLazyImage(imgEl, src);
                    
                    imgWrap.appendChild(imgEl);
                    slide.appendChild(imgWrap);
                    slideshowContainer.appendChild(slide);
                });
                
                // Hide loader
                const loaderEl = document.getElementById('reviewLoader');
                if (loaderEl) loaderEl.style.display = 'none';
                
                // Initialize Swiper
                new Swiper('#reviewSwiper', {
                    grabCursor: true,
                    centeredSlides: true,
                    slidesPerView: 1.5,
                    spaceBetween: 20,
                    loop: true,
                    speed: 800,
                    autoplay: {
                        delay: 2000,
                        disableOnInteraction: false,
                    },
                    breakpoints: {
                        640: { slidesPerView: 2.5, spaceBetween: 30 },
                        1024: { slidesPerView: 3, spaceBetween: 40 }
                    }
                });
            };
            
            discoverImages();
        }

        // 7. Initialize Swiper for Packages (4.5 cards logic)
        let packagesSwiper = new Swiper('#packagesSlider', {
            slidesPerView: 1.2,
            spaceBetween: 20,
            pagination: {
                el: '.packages-pagination',
                clickable: true,
            },
            breakpoints: {
                640: { slidesPerView: 2.2, spaceBetween: 20 },
                992: { slidesPerView: 3.5, spaceBetween: 30 },
                1200: { slidesPerView: 4.5, spaceBetween: 30 }
            }
        });

        // 8. View All Packages Button Logic
        const viewAllBtn = document.getElementById('viewAllPackagesBtn');
        const packagesWrapper = document.getElementById('packagesWrapper');
        const packagesPagination = document.querySelector('.packages-pagination');

        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function() {
                if (packagesWrapper.classList.contains('grid-mode')) {
                    // Re-initialize Swiper
                    packagesWrapper.classList.remove('grid-mode');
                    packagesPagination.classList.remove('hidden');
                    packagesSwiper = new Swiper('#packagesSlider', {
                        slidesPerView: 1.2,
                        spaceBetween: 20,
                        pagination: {
                            el: '.packages-pagination',
                            clickable: true,
                        },
                        breakpoints: {
                            640: { slidesPerView: 2.2, spaceBetween: 20 },
                            992: { slidesPerView: 3.5, spaceBetween: 30 },
                            1200: { slidesPerView: 4.5, spaceBetween: 30 }
                        }
                    });
                    this.innerHTML = 'View All Packages <i class="fas fa-arrow-right"></i>';
                    
                    // Scroll back to top of packages section
                    document.getElementById('packages').scrollIntoView({ behavior: 'smooth' });
                } else {
                    // Destroy Swiper and apply grid mode
                    if (packagesSwiper) {
                        packagesSwiper.destroy(true, true);
                        packagesSwiper = null;
                    }
                    packagesWrapper.classList.add('grid-mode');
                    packagesPagination.classList.add('hidden');
                    this.innerHTML = 'Show Less <i class="fas fa-arrow-up"></i>';
                }
            });
        }
    }


    // 9. Archive Hanging Gallery Logic
    const archiveContainer = document.getElementById('archivePhotos');
    if (archiveContainer) {
        let validArchiveImages = [];

        const discoverArchiveImages = async () => {
            validArchiveImages = [...mediaManifest.archive];
            
            if (validArchiveImages.length === 0) {
                archiveContainer.innerHTML = '<p style="text-align:center; width: 100%; color: #666;">No archive photos found. Upload to archive/</p>';
                return;
            }
            
            // Shuffle
            validArchiveImages.sort(() => Math.random() - 0.5);
            
            const framesToShow = window.innerWidth < 768 ? 2 : (window.innerWidth < 1024 ? 3 : 4);
            const activeImages = validArchiveImages.slice(0, framesToShow);
            const availablePool = validArchiveImages.slice(framesToShow);
            
            activeImages.forEach((src) => {
                const frame = document.createElement('div');
                frame.className = 'polaroid-frame';
                const rotation = (Math.random() * 12 - 6).toFixed(1);
                frame.style.transform = `rotate(${rotation}deg)`;
                
                const imgEl = document.createElement('img');
                imgEl.alt = 'Previous trip memory';
                prepareLazyImage(imgEl, src);
                
                frame.appendChild(imgEl);
                archiveContainer.appendChild(frame);
            });
            
            if (availablePool.length > 0) {
                setInterval(() => {
                    const frames = archiveContainer.querySelectorAll('.polaroid-frame');
                    if(frames.length === 0) return;
                    
                    const randomFrameIdx = Math.floor(Math.random() * frames.length);
                    const frameToSwap = frames[randomFrameIdx];
                    const imgToSwap = frameToSwap.querySelector('img');
                    
                    const newImgIdx = Math.floor(Math.random() * availablePool.length);
                    const newSrc = availablePool[newImgIdx];
                    
                    availablePool.push(imgToSwap.src);
                    availablePool.splice(newImgIdx, 1);
                    
                    frameToSwap.classList.add('fade-out');
                    
                    setTimeout(() => {
                        prepareLazyImage(imgToSwap, newSrc);
                        const rotation = (Math.random() * 12 - 6).toFixed(1);
                        frameToSwap.style.transform = `rotate(${rotation}deg)`;
                        frameToSwap.classList.remove('fade-out');
                    }, 1500); // Wait for CSS fade transition
                    
                }, 4000); // Swap frequency
            }
        };
        
        discoverArchiveImages();
    }

    // 10. Search Tabs Interaction
    const searchTabs = document.querySelectorAll('.search-tabs .tab');
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
});
