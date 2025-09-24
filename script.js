// script.js - COMPLETE VERSION WITH ALL FUNCTIONS + CLEAN URL ROUTING

// ===== GLOBAL VARIABLES =====
let apartmentData = {};
let roomDetails = {};

// ===== ROUTING FUNCTIONS (CHANGED FROM HASH TO CLEAN URLs) =====
function showHomePage() {
  history.replaceState(null, '', '/');
  
  const homePage = document.getElementById('home-page');
  const roomDetailsPage = document.getElementById('room-details-page');
  const homeNavbar = document.getElementById('home-navbar');
  const detailNavbar = document.getElementById('detail-navbar');
  
  if (homePage) homePage.classList.remove('hidden');
  if (roomDetailsPage) roomDetailsPage.classList.add('hidden');
  if (homeNavbar) homeNavbar.classList.remove('hidden');
  if (detailNavbar) detailNavbar.classList.add('hidden');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (window.roomMapInstance) {
    window.roomMapInstance.remove();
    window.roomMapInstance = null;
  }
  
  // Push virtual pageview event to GTM
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'virtualPageview',
    pagePath: window.location.pathname,
    pageTitle: document.title || 'Home'
  });
}


function showRoomPage(key) {
  const apt = apartmentData[key];
  if (!apt) return;

  history.pushState({ apartment: key }, '', `/${key}`);

  const homePage = document.getElementById('home-page');
  const roomDetailsPage = document.getElementById('room-details-page');
  const homeNavbar = document.getElementById('home-navbar');
  const detailNavbar = document.getElementById('detail-navbar');

  if (homePage) homePage.classList.add('hidden');
  if (roomDetailsPage) roomDetailsPage.classList.remove('hidden');
  if (homeNavbar) homeNavbar.classList.add('hidden');
  if (detailNavbar) detailNavbar.classList.remove('hidden');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render apartment details
  renderRoomDetails(key);

  // Push virtual pageview event to GTM
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'virtualPageview',
    pagePath: window.location.pathname,
    pageTitle: apt.name || document.title
  });
}


// Expose globally for inline onclick
window.showHomePage = showHomePage;
window.showRoomPage = showRoomPage;

// ===== ROUTING INITIALIZATION (CHANGED FROM HASH TO CLEAN URLs) =====
function initializeRouting() {
  const path = window.location.pathname.slice(1); // Remove leading slash
  
  if (path && apartmentData[path]) {
    showRoomPage(path);
  } else {
    showHomePage();
  }
  
  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    const path = window.location.pathname.slice(1);
    if (path && apartmentData[path]) {
      showRoomPage(path);
    } else {
      showHomePage();
    }
  });
}

// ===== HERO BACKGROUND HELPER =====
function setHeroBackground(element, imageUrl) {
    if (!element || !imageUrl) return;
    
    const img = new Image();
    
    img.onload = function() {
        element.style.backgroundImage = `url('${imageUrl}')`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
    };
    
    img.onerror = function() {
        console.error('Failed to load hero image:', imageUrl);
        element.style.backgroundColor = '#f5f5f5';
        element.style.backgroundImage = 'none';
    };
    
    img.src = imageUrl;
}

// ===== DATA LOADING =====
fetch('apartments.json')
  .then(res => res.json())
  .then(data => {
    apartmentData = data;
    renderApartmentsList();
    initializeRouting(); // CHANGED: Use clean URL routing instead of hash
  })
  .catch(err => console.error('Error loading apartments.json:', err));

fetch('rooms.json')
  .then(res => res.json())
  .then(data => {
    roomDetails = data;
    console.log('Rooms data loaded:', Object.keys(roomDetails).length, 'rooms');
  })
  .catch(err => console.error('Error loading rooms.json:', err));

// ===== RENDER APARTMENTS LIST =====
function renderApartmentsList() {
  const list = document.getElementById('apartment-list');
  if (!list) return;
  
  list.innerHTML = Object.entries(apartmentData).map(
    ([key, apt]) => {
      let carouselHTML = '';
      if (apt.carouselImages && apt.carouselImages.length > 0) {
        carouselHTML = `
          <div class="apartment-carousel" data-key="${key}">
            ${apt.carouselImages.map((img, i) => 
              `<img src="${img}" class="carousel-image ${i === 0 ? 'active' : ''}" alt="${apt.name}">`
            ).join('')}
            ${apt.carouselImages.length > 1 ? `
              <button class="carousel-btn carousel-prev" data-key="${key}">‹</button>
              <button class="carousel-btn carousel-next" data-key="${key}">›</button>
              <div class="carousel-dots">
                ${apt.carouselImages.map((_, i) => 
                  `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-key="${key}" data-index="${i}"></span>`
                ).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }

      return `
        <div class="p-4 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer apartment-card" data-key="${key}">
          ${carouselHTML}
          <h3 class="font-semibold text-lg mb-2">${apt.name}</h3>
          <p class="text-gray-600">${apt.subtitle}</p>
        </div>
      `;
    }
  ).join('');

  // Click handlers
  document.querySelectorAll('.apartment-card').forEach(el => {
    el.addEventListener('click', () => showRoomPage(el.dataset.key));
  });

  // Carousel handlers
  initializeCarouselHandlers();
}

// ===== RENDER ROOM DETAILS =====
function renderRoomDetails(apartmentKey) {
  const apartment = apartmentData[apartmentKey];
  if (!apartment) return;

  // Set hero image
  const heroElement = document.getElementById('room-hero');
  if (heroElement && apartment.heroImage) {
    setHeroBackground(heroElement, apartment.heroImage);
  }
  
  // Set text content
  document.getElementById('breadcrumb-room-name').textContent = apartment.name;
  document.getElementById('room-details-title').textContent = apartment.name;
  document.getElementById('room-details-subtitle').textContent = apartment.subtitle;
  document.getElementById('room-details-description').textContent = apartment.description;

  // Render amenities
  const amenitiesList = document.getElementById('amenities-list');
  if (amenitiesList && apartment.amenities) {
    amenitiesList.innerHTML = apartment.amenities.map(amenity => 
      `<li><i class="fa-solid fa-check"></i> ${amenity}</li>`
    ).join('');
  }

  // Render rooms
  renderRooms(apartment.rooms);
  
  // Initialize map
  if (apartment.coordinates) {
    initRoomMap(apartment.coordinates);
  }
}

// ===== RENDER ROOMS =====
function renderRooms(rooms) {
  const container = document.getElementById('room-list-container');
  if (!container || !rooms) return;
  
  container.innerHTML = rooms.map(room => `
    <div class="room-card flex flex-col sm:flex-row items-center justify-between p-4 mb-4">
      <div class="text-center sm:text-left mb-2 sm:mb-0">
        <p class="room-title font-semibold text-lg" data-key="${room.key}">${room.name}</p>
        <p class="text-gray-600 text-sm">${room.price}</p>
      </div>
      <button class="btn-custom py-2 px-6 rounded-full w-full sm:w-auto text-sm font-medium" data-key="${room.key}">
        Book Now
      </button>
    </div>
  `).join('');

  // Room title click handlers (opens modal)
  document.querySelectorAll('.room-title').forEach(el => {
    el.addEventListener('click', () => {
      const roomKey = el.dataset.key;
      const room = rooms.find(r => r.key === roomKey);
      if (room && roomDetails[roomKey]) {
        openRoomModal(room, roomDetails[roomKey]);
      }
    });
  });
  
  // Book now handlers
  document.querySelectorAll('.btn-custom').forEach(btn => {
    btn.addEventListener('click', () => {
      const room = rooms.find(r => r.key === btn.dataset.key);
      if (room) window.open(room.link, '_blank');
    });
  });
}

// ===== CAROUSEL HANDLERS =====
function initializeCarouselHandlers() {
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.key;
      const carousel = document.querySelector(`[data-key="${key}"]`);
      if (!carousel) return;
      
      const images = carousel.querySelectorAll('.carousel-image');
      const dots = carousel.querySelectorAll('.carousel-dot');
      let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
      let newIndex;
      
      if (btn.classList.contains('carousel-prev')) {
        newIndex = (currentIndex - 1 + images.length) % images.length;
      } else {
        newIndex = (currentIndex + 1) % images.length;
      }
      
      images[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');
      images[newIndex].classList.add('active');
      if (dots[newIndex]) dots[newIndex].classList.add('active');
    });
  });

  document.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = dot.dataset.key;
      const index = parseInt(dot.dataset.index);
      const carousel = document.querySelector(`[data-key="${key}"]`);
      if (!carousel) return;
      
      const images = carousel.querySelectorAll('.carousel-image');
      const dots = carousel.querySelectorAll('.carousel-dot');
      
      images.forEach(img => img.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      images[index].classList.add('active');
      dots[index].classList.add('active');
    });
  });
}

// ===== MAP INITIALIZATION =====
function initRoomMap(coords) {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) return;
  
  setTimeout(() => {
    const mapContainer = document.getElementById('room-map');
    if (!mapContainer) return;
    
    if (!window.roomMapInstance) {
      window.roomMapInstance = L.map('room-map').setView(coords, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(window.roomMapInstance);
    } else {
      window.roomMapInstance.setView(coords, 15);
      window.roomMapInstance.eachLayer(l => {
        if (l instanceof L.Marker) window.roomMapInstance.removeLayer(l);
      });
    }
    L.marker(coords).addTo(window.roomMapInstance);
    window.roomMapInstance.invalidateSize();
    
    setTimeout(() => {
      if (window.roomMapInstance) {
        window.roomMapInstance.invalidateSize();
      }
    }, 300);
  }, 100);
}

// ===== MODAL FUNCTIONALITY =====
function closeModal() {
  const modal = document.getElementById('room-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  document.body.style.overflow = 'auto';
}

function openRoomModal(room) {
  const d = roomDetails[room.key] || {};
  
  const icons = {
    Oven: 'fa-solid fa-temperature-high',
    Microwave: 'fa-solid fa-microchip',
    Toaster: 'fa-solid fa-bread-slice',
    'Coffee Maker': 'fa-solid fa-coffee',
    'Dishes & Utensils': 'fa-solid fa-utensils',
    Kitchen: 'fa-solid fa-kitchen-set',
    'Pantry Items': 'fa-solid fa-box-open',
    Refrigerator: 'fa-solid fa-snowflake',
    Stove: 'fa-solid fa-fire-burner',
    Internet: 'fa-solid fa-wifi',
    'Linens Provided': 'fa-solid fa-bed',
    'Towels Provided': 'fa-solid fa-hand-sparkles',
    'Hair Dryer': 'fa-solid fa-wind',
    'Free wifi': 'fa-solid fa-wifi',
    'Fire extinguisher': 'fa-solid fa-fire-extinguisher'
  };

  // ========== MOBILE LAYOUT POPULATION ==========
  
  // Mobile Title
  const titleEl = document.getElementById('modal-room-title');
  if (titleEl) titleEl.textContent = d.room_name || room.name;
  
  // Mobile Room Details
  const bedInfo = document.getElementById('modal-bed-info');
  const viewInfo = document.getElementById('modal-view-info');
  
  if (bedInfo) {
    const label = bedInfo.querySelector('.label');
    const value = bedInfo.querySelector('.value');
    if (label) label.textContent = 'Bed Type';
    if (value) value.textContent = d.bed || '—';
  }
  
  if (viewInfo) {
    const label = viewInfo.querySelector('.label');
    const value = viewInfo.querySelector('.value');
    if (label) label.textContent = 'View';
    if (value) value.textContent = d.view || '—';
  }

  // Mobile Plus Info
  const plusEl = document.getElementById('modal-plus-info');
  if (plusEl) {
    if (d.plus) {
      plusEl.style.display = 'block';
      const spanEl = plusEl.querySelector('span');
      if (spanEl) spanEl.textContent = `Special: ${d.plus}`;
    } else {
      plusEl.style.display = 'none';
    }
  }
  
  // Mobile Amenities
  const amenitiesContainer = document.getElementById('modal-amenities');
  if (amenitiesContainer) {
    amenitiesContainer.innerHTML = (d.amenities || []).map(a => `
      <div>
        <i class="${icons[a] || 'fa-solid fa-check'}"></i>
        <span>${a}</span>
      </div>
    `).join('');
  }

  // Mobile Images
  const mainImg = document.getElementById('modal-main-img');
  const thumbs = document.getElementById('gallery-thumbs');
  
  if (thumbs) thumbs.innerHTML = '';
  
  if (d.images && d.images.length) {
    d.images.forEach((src, i) => {
      if (thumbs) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = d.room_name || room.name;
        
        img.onerror = function() {
          this.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
        };
        
        if (i === 0) {
          img.classList.add('selected');
          if (mainImg) {
            mainImg.src = src;
            mainImg.onerror = function() {
              this.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            };
          }
        }
        
        img.addEventListener('click', () => {
          if (mainImg) mainImg.src = src;
          thumbs.querySelectorAll('img').forEach(el => el.classList.remove('selected'));
          img.classList.add('selected');
          
          // Sync with desktop images if they exist
          const thumbsDesktop = document.getElementById('gallery-thumbs-desktop');
          const mainImgDesktop = document.getElementById('modal-main-img-desktop');
          if (thumbsDesktop) {
            thumbsDesktop.querySelectorAll('img').forEach((el, idx) => {
              el.classList.remove('selected', 'opacity-100', 'border-2', 'border-amber-800');
              el.classList.add('opacity-70');
              if (idx === i) {
                el.classList.add('selected', 'opacity-100', 'border-2', 'border-amber-800');
              }
            });
          }
          if (mainImgDesktop) mainImgDesktop.src = src;
        });
        
        thumbs.appendChild(img);
      }
    });
  } else {
    if (mainImg) mainImg.src = 'https://via.placeholder.com/400x300?text=No+Image';
  }

  // Mobile Price and Link
  const priceEl = document.getElementById('modal-room-price');
  const linkEl = document.getElementById('modal-room-link');
  if (priceEl) priceEl.textContent = room.price;
  if (linkEl) {
    linkEl.href = room.link;
    linkEl.textContent = 'Book Now';
  }
  // ========== DESKTOP LAYOUT POPULATION ==========
  
  // Desktop Title
  const titleDesktop = document.getElementById('modal-room-title-desktop');
  if (titleDesktop) titleDesktop.textContent = d.room_name || room.name;
  
  // Desktop Room Details
  const bedDesktop = document.getElementById('modal-bed-info-desktop');
  const viewDesktop = document.getElementById('modal-view-info-desktop');
  if (bedDesktop) bedDesktop.innerHTML = `<span class="block text-gray-600">Bed Type</span><span class="font-semibold">${d.bed || '—'}</span>`;
  if (viewDesktop) viewDesktop.innerHTML = `<span class="block text-gray-600">View</span><span class="font-semibold">${d.view || '—'}</span>`;

  // Desktop Plus Info
  const plusDesktop = document.getElementById('modal-plus-info-desktop');
  if (plusDesktop) {
    if (d.plus) {
      plusDesktop.style.display = 'block';
      const span = plusDesktop.querySelector('span');
      if (span) span.textContent = `Special: ${d.plus}`;
    } else {
      plusDesktop.style.display = 'none';
    }
  }
  
  // Desktop Amenities
  const amenitiesDesktop = document.getElementById('modal-amenities-desktop');
  if (amenitiesDesktop) {
    amenitiesDesktop.innerHTML = (d.amenities || []).map(a => `
      <div class="flex items-center py-1 text-sm">
        <i class="${icons[a] || 'fa-solid fa-check'} mr-2 text-amber-800"></i>
        <span>${a}</span>
      </div>
    `).join('');
  }

  // Desktop Images
  const mainImgDesktop = document.getElementById('modal-main-img-desktop');
  const thumbsDesktop = document.getElementById('gallery-thumbs-desktop');
  
  if (thumbsDesktop) thumbsDesktop.innerHTML = '';
  
  if (d.images && d.images.length) {
    d.images.forEach((src, i) => {
      if (thumbsDesktop) {
        const imgDesktop = document.createElement('img');
        imgDesktop.src = src;
        imgDesktop.alt = d.room_name || room.name;
        imgDesktop.className = 'w-16 h-12 object-cover rounded cursor-pointer opacity-70 hover:opacity-100 transition';
        
        imgDesktop.onerror = function() {
          this.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
        };
        
        if (i === 0) {
          imgDesktop.classList.add('selected', 'opacity-100', 'border-2', 'border-amber-800');
          if (mainImgDesktop) {
            mainImgDesktop.src = src;
            mainImgDesktop.onerror = function() {
              this.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            };
          }
        }
        
        imgDesktop.addEventListener('click', () => {
          if (mainImgDesktop) mainImgDesktop.src = src;
          thumbsDesktop.querySelectorAll('img').forEach(el => {
            el.classList.remove('selected', 'opacity-100', 'border-2', 'border-amber-800');
            el.classList.add('opacity-70');
          });
          imgDesktop.classList.add('selected', 'opacity-100', 'border-2', 'border-amber-800');
          
          // Sync with mobile images if they exist
          if (mainImg) mainImg.src = src;
          if (thumbs) {
            thumbs.querySelectorAll('img').forEach((el, idx) => {
              el.classList.remove('selected');
              if (idx === i) el.classList.add('selected');
            });
          }
        });
        
        thumbsDesktop.appendChild(imgDesktop);
      }
    });
  } else {
    if (mainImgDesktop) mainImgDesktop.src = 'https://via.placeholder.com/400x300?text=No+Image';
  }

  // Desktop Price and Link
  const priceDesktop = document.getElementById('modal-room-price-desktop');
  const linkDesktop = document.getElementById('modal-room-link-desktop');
  if (priceDesktop) priceDesktop.textContent = room.price;
  if (linkDesktop) {
    linkDesktop.href = room.link;
    linkDesktop.textContent = 'Book Now';
  }

  // Show Modal and force repaint to fix desktop render bug
  const modal = document.getElementById('room-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Force repaint/reflow for correct rendering on desktop
    void modal.offsetHeight;

    document.body.style.overflow = 'hidden';
  }
}

// ===== SET UP UI INTERACTIONS AFTER DOM LOADS =====
document.addEventListener('DOMContentLoaded', () => {
  // Enhanced modal close handlers
  const modal = document.getElementById('room-modal');
  const closeBtn = document.getElementById('modal-close');
  
  if (modal && closeBtn) {
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Add escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  // Show More toggle
  const toggleButton = document.getElementById('toggle-description');
  const descriptionText = document.getElementById('host-description');
  if (toggleButton && descriptionText) {
    toggleButton.addEventListener('click', () => {
      if (descriptionText.classList.contains('expanded')) {
        descriptionText.classList.remove('expanded');
        toggleButton.textContent = 'Show more';
      } else {
        descriptionText.classList.add('expanded');
        toggleButton.textContent = 'Show less';
      }
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const chevron = button.querySelector('.faq-chevron');
      if (content) content.classList.toggle('hidden');
      if (chevron) chevron.classList.toggle('rotate');
    });
  });

  // Testimonials carousel
  const track = document.getElementById('testimonial-track');
  const prev = document.getElementById('carousel-prev');
  const next = document.getElementById('carousel-next');
  if (track && prev && next) {
    const getSpv = () => window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    let idx = 0; 
    const slides = track.querySelectorAll('.carousel-slide'), total = slides.length;
    const update = () => { 
      const spv = getSpv(); 
      track.style.transform = `translateX(${-idx * (track.clientWidth / spv)}px)`; 
    };
    prev.addEventListener('click', () => { 
      const spv = getSpv(); 
      idx = idx > 0 ? idx - 1 : total - spv; 
      update(); 
    });
    next.addEventListener('click', () => { 
      const spv = getSpv(); 
      idx = idx < total - spv ? idx + 1 : 0; 
      update(); 
    });
    window.addEventListener('resize', () => { 
      idx = 0; 
      update(); 
    });
    update();
  }

  // Main map initialization
  const mapContainer = document.getElementById('map');
  if (mapContainer && typeof L !== 'undefined') {
    const map = L.map('map').setView([38.715, -9.15], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap contributors' 
    }).addTo(map);
    
    const locations = [
      {title: 'OLYMPO', coordinates: [38.71000190857739, -9.160553280061636], desc: 'Our apartment is in a central location and has an amazing rooftop to enjoy Tagus River view'},
      {title: 'SANTOS', coordinates: [38.70765573893287, -9.15951458006177], desc: 'Our apartment is in a central location and has an amazing rooftop to enjoy Tagus River view'},
      {title: 'PALMIRA', coordinates: [38.72396692533869, -9.133889984288666], desc: 'For surfers who want to enjoy Lisbon waves'},
      {title: 'MARIA', coordinates: [38.72336820407823, -9.133562425999576], desc: 'Central apartment close to Historic Lisbon'},
      {title: 'ARRIAGA', coordinates: [38.70431580212892, -9.165665021345829], desc: 'Elegance and comfort'},
      {title: 'PATIO', coordinates: [38.70432417473284, -9.165643563673596], desc: 'Cozy space, bright patio'},
      {title: 'LOFT', coordinates: [38.717922382466064, -9.133941759865937], desc: 'Private studio'}
    ];
    
    const markerGroup = L.featureGroup();
    locations.forEach(loc => {
      L.marker(loc.coordinates)
       .bindPopup(`<div class="p-2"><h2 class="font-bold text-lg">${loc.title}</h2><p class="text-sm text-gray-700">${loc.desc}</p></div>`)
       .addTo(markerGroup);
    });
    markerGroup.addTo(map);
    map.fitBounds(markerGroup.getBounds());
  }

  // Back-to-apartments arrow
  const backBtn = document.getElementById('back-to-apts');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const winterRooms = document.querySelector('#winter-rooms');
      if (winterRooms) {
        winterRooms.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-apts');
    const footer = document.querySelector('footer');
    if (btn && footer) {
      btn.classList.toggle('hidden', footer.getBoundingClientRect().top >= window.innerHeight + 100);
    }
  });

  // Initialize carousels for hardcoded apartment cards
  initializeHardcodedCarousels();
});

// Chat toggle functionality
const chatToggle = document.getElementById('chat-toggle');
if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    const icons = document.getElementById('chat-icons');
    if (icons) {
      icons.classList.toggle('hidden');
    }
  });
}

// ===== INITIALIZE HARDCODED CAROUSELS (YOUR ORIGINAL FUNCTION) =====
function initializeHardcodedCarousels() {
  // Carousel navigation
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      
      const carousel = btn.closest('.apartment-carousel');
      if (!carousel) return;
      
      const images = carousel.querySelectorAll('.carousel-image');
      const dots = carousel.querySelectorAll('.carousel-dot');
      
      let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
      let newIndex;
      
      if (btn.classList.contains('carousel-prev')) {
        newIndex = (currentIndex - 1 + images.length) % images.length;
      } else {
        newIndex = (currentIndex + 1) % images.length;
      }
      
      // Update active image and dot
      images[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');
      images[newIndex].classList.add('active');
      if (dots[newIndex]) dots[newIndex].classList.add('active');
    });
  });

  // Dot navigation
  document.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      
      const carousel = dot.closest('.apartment-carousel');
      if (!carousel) return;
      
      const images = carousel.querySelectorAll('.carousel-image');
      const dots = carousel.querySelectorAll('.carousel-dot');
      const index = parseInt(dot.dataset.index);
      
      // Update active image and dot
      images.forEach(img => img.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      if (images[index]) images[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
    });
  });
}

// ===== REPOSITION MAP ON MOBILE (YOUR ORIGINAL FUNCTION) =====
function repositionMapOnMobile() {
    const map = document.getElementById('room-map');
    const roomCardsContainer = document.getElementById('room-list-container');
    
    if (window.innerWidth <= 1024) {
        // Mobile: Move map after room cards
        if (map && roomCardsContainer && roomCardsContainer.parentNode) {
            roomCardsContainer.parentNode.appendChild(map);
        }
    }
}

// Call on page load and window resize
window.addEventListener('load', repositionMapOnMobile);
window.addEventListener('resize', repositionMapOnMobile);


// 🚨 ADD THIS WINTER SCROLL FUNCTION TO YOUR SCRIPT.JS

// SCROLL TO APARTMENTS FUNCTION
function scrollToApartments() {
    // Find apartments section
    const apartmentsSection = document.querySelector('#apartments') || 
                            document.querySelector('.apartments-grid') ||
                            document.querySelector('[class*="apartment"]') ||
                            document.querySelector('main');
    
    if (apartmentsSection) {
        apartmentsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        // Fallback - scroll to section after banner
        const banner = document.querySelector('.winter-banner-section');
        if (banner) {
            const nextSection = banner.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
    
    // Track banner click for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'winter_banner_clicked', {
            'event_category': 'promotion',
            'event_label': 'winter_2024'
        });
    }
}

// Make function globally available
window.scrollToApartments = scrollToApartments;
