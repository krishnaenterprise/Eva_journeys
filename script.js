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

    // 6. Newsletter Form Handler (Google Sheets)
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzQi72oWv-QlPxlhF9MRMEGNM6yOwsJT1_EKUJTuEN4zmEiMK0YHkfDX6Q6udlwnWKI/exec';

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput ? emailInput.value.trim() : '';
            const successMsg = document.getElementById('newsletter-success');
            const submitBtn = newsletterForm.querySelector('button');

            if (!email) return;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;

            // Send to Google Sheets
            fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, date: new Date().toLocaleString() })
            })
            .then(() => {
                // Show success (no-cors always resolves, but Apps Script will save it)
                newsletterForm.style.display = 'none';
                if (successMsg) successMsg.style.display = 'flex';
            })
            .catch(() => {
                // Even on error, show success (no-cors limitation)
                newsletterForm.style.display = 'none';
                if (successMsg) successMsg.style.display = 'flex';
            });
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

        // 6. Automated Review Screenshot Slideshow
        const slideshowContainer = document.getElementById('reviewSlideshow');
        const loader = document.getElementById('reviewLoader');
        
        if (slideshowContainer) {
            let validImages = [];
            let maxChecks = 15; // Checks up to 15 images (1 to 15)
            
            // Function to check if an image exists with a timeout fallback
            const checkImage = (index, ext) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    // Timeout ensures it never hangs if local browser doesn't fire onerror
                    const timeout = setTimeout(() => resolve(null), 250);
                    img.onload = () => { clearTimeout(timeout); resolve(`assets/reviews/${index}.${ext}`); };
                    img.onerror = () => { clearTimeout(timeout); resolve(null); };
                    img.src = `assets/reviews/${index}.${ext}`;
                });
            };

            // Discover images
            const discoverImages = async () => {
                let promises = [];
                for (let i = 1; i <= maxChecks; i++) {
                    promises.push(checkImage(i, 'jpg'));
                    promises.push(checkImage(i, 'png'));
                    promises.push(checkImage(i, 'jpeg'));
                }
                
                const results = await Promise.all(promises);
                validImages = results.filter(src => src !== null);
                
                if (validImages.length === 0) {
                    slideshowContainer.innerHTML = '<p style="text-align:center; padding-top: 15%; color: var(--text);">Upload review screenshots (1.jpg, 2.png) to the assets/reviews/ folder.</p>';
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
                    imgEl.src = src;
                    
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
        let maxArchiveChecks = 30; // Check up to 30 images
        
        const checkArchiveImage = (index, ext) => {
            return new Promise((resolve) => {
                const img = new Image();
                const timeout = setTimeout(() => resolve(null), 250);
                img.onload = () => { clearTimeout(timeout); resolve(`assets/archive/${index}.${ext}`); };
                img.onerror = () => { clearTimeout(timeout); resolve(null); };
                img.src = `assets/archive/${index}.${ext}`;
            });
        };

        const discoverArchiveImages = async () => {
            let promises = [];
            for (let i = 1; i <= maxArchiveChecks; i++) {
                promises.push(checkArchiveImage(i, 'jpg'));
                promises.push(checkArchiveImage(i, 'jpeg'));
                promises.push(checkArchiveImage(i, 'png'));
                promises.push(checkArchiveImage(i, 'heic'));
                promises.push(checkArchiveImage(i, 'HEIC'));
            }
            
            const results = await Promise.all(promises);
            validArchiveImages = results.filter(src => src !== null);
            
            if (validArchiveImages.length === 0) {
                archiveContainer.innerHTML = '<p style="text-align:center; width: 100%; color: #666;">No archive photos found. Upload to assets/archive/</p>';
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
                imgEl.src = src;
                
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
                        imgToSwap.src = newSrc;
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
