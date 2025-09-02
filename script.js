// script.js

// Load apartments data
let apartmentData = {};
fetch('apartments.json')
  .then(res => res.json())
  .then(data => {
    apartmentData = data;
    const aptFromHash = window.location.hash.slice(1);
    if (aptFromHash && apartmentData[aptFromHash]) {
      showRoomPage(aptFromHash);
    } else {
      showHomePage();
    }
  })
  .catch(err => console.error('Error loading apartments.json:', err));

// Load room details data
let roomDetails = {};
fetch('rooms.json')
  .then(res => res.json())
  .then(data => roomDetails = data)
  .catch(err => console.error('Error loading rooms.json:', err));

// Render list of rooms on detail page
function renderRooms(rooms) {
  const container = document.getElementById('room-list-container');
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

  // Title click opens modal
  document.querySelectorAll('.room-title').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.key;
      const room = rooms.find(r => r.key === key);
      openRoomModal(room);
    });
  });
  // Book button opens link
  document.querySelectorAll('.btn-custom').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const room = rooms.find(r => r.key === key);
      window.open(room.link, '_blank');
    });
  });
}

// Show apartment detail page
function showRoomPage(id) {
  history.replaceState(null, '', `#${id}`);
  const apt = apartmentData[id];
  if (!apt) return;

  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('room-details-page').classList.remove('hidden');
  document.getElementById('home-navbar').classList.add('hidden');
  document.getElementById('detail-navbar').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.getElementById('breadcrumb-room-name').textContent = apt.name;
  document.getElementById('room-hero').style.backgroundImage = `url('${apt.heroImage}')`;
  document.getElementById('room-details-title').textContent = apt.name;
  document.getElementById('room-details-subtitle').textContent = apt.subtitle;
  document.getElementById('room-details-description').textContent = apt.description;

  document.getElementById('amenities-list').innerHTML =
    apt.amenities.map(a => `<li><i class="fa-solid fa-check"></i> ${a}</li>`).join('');

  renderRooms(apt.rooms);

  setTimeout(() => {
    if (!window.roomMapInstance) {
      window.roomMapInstance = L.map('room-map').setView(apt.coordinates, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(window.roomMapInstance);
    } else {
      window.roomMapInstance.setView(apt.coordinates, 15);
      window.roomMapInstance.eachLayer(l => {
        if (l instanceof L.Marker) window.roomMapInstance.removeLayer(l);
      });
    }
    L.marker(apt.coordinates).addTo(window.roomMapInstance);
    window.roomMapInstance.invalidateSize();
  }, 100);
}

// Show home page
function showHomePage() {
  history.replaceState(null, '', window.location.pathname);
  document.getElementById('home-page').classList.remove('hidden');
  document.getElementById('room-details-page').classList.add('hidden');
  document.getElementById('home-navbar').classList.remove('hidden');
  document.getElementById('detail-navbar').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.roomMapInstance) {
    window.roomMapInstance.remove();
    window.roomMapInstance = null;
  }
}

// Open room details modal
function openRoomModal(room) {
  const d = roomDetails[room.key] || {};

  document.getElementById('modal-room-title').textContent = d.room_name || room.name;
  document.getElementById('modal-bed-info').textContent = `Bed: ${d.bed || '–'}`;
  document.getElementById('modal-view-info').textContent = `View: ${d.view || '–'}`;

  const plusEl = document.getElementById('modal-plus-info');
  if (d.plus) {
    plusEl.style.display = 'flex';
    plusEl.querySelector('span').textContent = `Plus: ${d.plus}`;
  } else {
    plusEl.style.display = 'none';
  }

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
  document.getElementById('modal-amenities').innerHTML =
    (d.amenities || []).map(a => {
      const cls = icons[a] || 'fa-solid fa-check';
      return `<div class="flex items-center"><i class="${cls} mr-2 text-[#2b1102]"></i>${a}</div>`;
    }).join('');

  const mainImg = document.getElementById('modal-main-img');
  const thumbs  = document.getElementById('gallery-thumbs');
  thumbs.innerHTML = '';
  if (d.images && d.images.length) {
    d.images.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src; img.alt = d.room_name;
      if (i === 0) {
        img.classList.add('selected');
        mainImg.src = src;
      }
      img.addEventListener('click', () => {
        mainImg.src = src;
        thumbs.querySelectorAll('img').forEach(el => el.classList.remove('selected'));
        img.classList.add('selected');
      });
      thumbs.appendChild(img);
    });
  } else {
    mainImg.src = 'https://via.placeholder.com/400x300?text=No+Image';
  }

  document.getElementById('modal-room-price').textContent = room.price;
  document.getElementById('modal-room-link').href = room.link;

  const modal = document.getElementById('room-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Set up event listeners after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // Close modal handlers
  const modal = document.getElementById('room-modal');
  const closeBtn = document.getElementById('modal-close');
  if (modal && closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
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
      content.classList.toggle('hidden');
      chevron.classList.toggle('rotate');
    });
  });

  // Testimonials carousel
  const track = document.getElementById('testimonial-track');
  const prevButton = document.getElementById('carousel-prev');
  const nextButton = document.getElementById('carousel-next');
  if (track && prevButton && nextButton) {
    const getSlidesPerView = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    };
    let currentIndex = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    const updateCarousel = () => {
      const spv = getSlidesPerView();
      track.style.transform = `translateX(${-currentIndex * (track.clientWidth / spv)}px)`;
    };
    prevButton.addEventListener('click', () => {
      const spv = getSlidesPerView();
      currentIndex = currentIndex > 0 ? currentIndex - 1 : totalSlides - spv;
      updateCarousel();
    });
    nextButton.addEventListener('click', () => {
      const spv = getSlidesPerView();
      currentIndex = currentIndex < totalSlides - spv ? currentIndex + 1 : 0;
      updateCarousel();
    });
    window.addEventListener('resize', () => {
      currentIndex = 0;
      updateCarousel();
    });
    updateCarousel();
  }

  // Initialize main map
  const map = L.map('map').setView([38.715, -9.15], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  const locations = [
    { title: 'OLYMPO', coordinates: [38.71000190857739, -9.160553280061636], description: 'Our apartment is in a central location and has an amazing rooftop to enjoy Tagus River view' },
    { title: 'SANTOS', coordinates: [38.70765573893287, -9.15951458006177], description: 'Our apartment is in a central location and has an amazing rooftop to enjoy Tagus River view' },
    { title: 'PALMIRA', coordinates: [38.72396692533869, -9.133889984288666], description: 'For surfers who want to enjoy Lisbon waves' },
    { title: 'MARIA', coordinates: [38.72336820407823, -9.133562425999576], description: 'Central apartment close to Historic Lisbon' },
    { title: 'ARRIAGA', coordinates: [38.70431580212892, -9.165665021345829], description: 'Elegance and comfort' },
    { title: 'PATIO', coordinates: [38.70432417473284, -9.165643563673596], description: 'Cozy space, bright patio' },
    { title: 'LOFT', coordinates: [38.717922382466064, -9.133941759865937], description: 'Private studio' }
  ];
  const markerGroup = L.featureGroup();
  locations.forEach(loc => {
    L.marker(loc.coordinates)
      .bindPopup(`<div class="p-2"><h2 class="font-bold text-lg">${loc.title}</h2><p class="text-sm text-gray-700">${loc.description}</p></div>`)
      .addTo(markerGroup);
  });
  markerGroup.addTo(map);
  map.fitBounds(markerGroup.getBounds());

  // Back-to-apartments arrow
  document.getElementById('back-to-apts').addEventListener('click', () => {
    document.querySelector('#winter-rooms').scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-apts');
    const footerTop = document.querySelector('footer').getBoundingClientRect().top;
    btn.classList.toggle('hidden', footerTop >= window.innerHeight + 100);
  });
});
