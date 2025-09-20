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
function openRoomModal(room, roomData) {
  const icons = {
    'Oven': 'fa-solid fa-temperature-high',
    'Microwave': 'fa-solid fa-microchip',
    'Toaster': 'fa-solid fa-bread-slice',
    'Coffee Maker': 'fa-solid fa-coffee',
    'Dishes & Utensils': 'fa-solid fa-utensils',
    'Kitchen': 'fa-solid fa-kitchen-set',
    'Pantry Items': 'fa-solid fa-box-open',
    'Refrigerator': 'fa-solid fa-snowflake',
    'Stove': 'fa-solid fa-fire-burner',
    'Internet': 'fa-solid fa-wifi',
    'Linens Provided': 'fa-solid fa-bed',
    'Towels Provided': 'fa-solid fa-hand-sparkles',
    'Hair Dryer': 'fa-solid fa-wind',
    'Free wifi': 'fa-solid fa-wifi',
    'Fire extinguisher': 'fa-solid fa-fire-extinguisher'
  };

  // Mobile title
  const titleEl = document.getElementById('modal-room-title');
  if (titleEl) titleEl.textContent = roomData.room_name || room.name;
  
  // Mobile room details
  const bedInfo = document.getElementById('modal-bed-info');
  if (bedInfo) {
    const label = bedInfo.querySelector('.label');
    const value = bedInfo.querySelector('.value');
    if (label) label.textContent = 'Bed Type';
    if (value) value.textContent = roomData.bed || '—';
  }
  
  const viewInfo = document.getElementById('modal-view-info');
  if (viewInfo) {
    const label = viewInfo.querySelector('.label');
    const value = viewInfo.querySelector('.value');
    if (label) label.textContent = 'View';
    if (value) value.textContent = roomData.view || '—';
  }

  // Plus info
  const plusEl = document.getElementById('modal-plus-info');
  if (plusEl) {
    if (roomData.plus) {
      plusEl.style.display = 'block';
      const spanEl = plusEl.querySelector('span');
      if (spanEl) spanEl.textContent = `Special: ${roomData.plus}`;
    } else {
      plusEl.style.display = 'none';
    }
  }
  
  // Amenities from rooms.json
  const amenitiesContainer = document.getElementById('modal-amenities');
  if (amenitiesContainer) {
    amenitiesContainer.innerHTML = (roomData.amenities || []).map(a => `
      <div>
        <i class="${icons[a] || 'fa-solid fa-check'}"></i>
        <span>${a}</span>
      </div>
    `).join('');
  }

  // Images from rooms.json
  const mainImg = document.getElementById('modal-main-img');
  const thumbs = document.getElementById('gallery-thumbs');
  
  if (thumbs) thumbs.innerHTML = '';
  
  if (roomData.images && roomData.images.length) {
    roomData.images.forEach((src, i) => {
      if (thumbs) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = roomData.room_name || room.name;
        
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
        });
        
        thumbs.appendChild(img);
      }
    });
  }

  // Price and link
  const priceEl = document.getElementById('modal-room-price');
  const linkEl = document.getElementById('modal-room-link');
  if (priceEl) priceEl.textContent = room.price;
  if (linkEl) {
    linkEl.href = room.link;
    linkEl.textContent = 'Book Now';
  }

  // Show modal
  const modal = document.getElementById('room-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('room-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  document.body.style.overflow = 'auto';
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
