// GitHub Pages redirect handler (if you ever use GitHub Pages)
(function handleGitHubPagesRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  if (redirect) {
    history.replaceState(null, '', redirect);
    window.redirectPath = redirect;
  }
})();

// Load apartments data and handle initial routing
let apartmentData = {};
fetch('apartments.json')
  .then(res => res.json())
  .then(data => {
    apartmentData = data;
    renderApartmentsList();

    // Handle SPA route on load
    if (window.redirectPath) {
      const key = window.redirectPath.slice(1);
      if (apartmentData[key]) {
        showRoomPageWithoutPush(key);
        return;
      }
    }
    const path = window.location.pathname.replace(/^\//, '');
    if (path && apartmentData[path]) {
      showRoomPageWithoutPush(path);
    } else {
      showHomePageWithoutPush();
    }
  })
  .catch(err => console.error('Error loading apartments.json:', err));

// Load room details
let roomDetails = {};
fetch('rooms.json')
  .then(res => res.json())
  .then(data => roomDetails = data)
  .catch(err => console.error('Error loading rooms.json:', err));

// Polyfill for scrollIntoView smooth
if (!('scrollBehavior' in document.documentElement.style)) {
  import('https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js').then(() => {
    smoothscroll.polyfill();
  });
}

// Utility: set hero background with fallback
function setHeroBackground(el, url) {
  if (!el || !url) return;
  const img = new Image();
  img.onload = () => {
    el.style.backgroundImage = `url('${url}')`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
  };
  img.onerror = () => {
    el.style.backgroundColor = '#f5f5f5';
    el.style.backgroundImage = 'none';
  };
  img.src = url;
}

// Renders apartment cards on home page
function renderApartmentsList() {
  const list = document.getElementById('apartment-list');
  if (!list) return;
  list.innerHTML = Object.entries(apartmentData).map(([key, apt]) => {
    let carousel = '';
    if (apt.carouselImages && apt.carouselImages.length) {
      carousel = `
        <div class="apartment-carousel" data-key="${key}">
          ${apt.carouselImages.map((img, i) =>
            `<img src="${img}" class="carousel-image ${i===0?'active':''}" alt="${apt.name}">`
          ).join('')}
          ${apt.carouselImages.length>1?`
            <button class="carousel-btn carousel-prev" data-key="${key}">&#8249;</button>
            <button class="carousel-btn carousel-next" data-key="${key}">&#8250;</button>
            <div class="carousel-dots">
              ${apt.carouselImages.map((_,i)=>
                `<span class="carousel-dot ${i===0?'active':''}" data-key="${key}" data-index="${i}"></span>`
              ).join('')}
            </div>`:''}
        </div>`;
    }
    return `
      <div class="apartment-card cursor-pointer p-4 bg-white rounded-lg shadow transition hover:shadow-lg" data-key="${key}">
        ${carousel}
        <h3 class="font-semibold text-lg mb-2">${apt.name}</h3>
        <p class="text-gray-600">${apt.subtitle}</p>
      </div>`;
  }).join('');
  attachApartmentHandlers();
}

// Attaches click handlers for apartment cards and carousels
function attachApartmentHandlers() {
  // Navigate to apartment
  document.querySelectorAll('.apartment-card').forEach(el=>{
    el.addEventListener('click', ()=>showRoomPage(el.dataset.key));
  });
  // Carousel buttons
  document.querySelectorAll('.carousel-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      const key = btn.dataset.key;
      const carousel = document.querySelector(`.apartment-carousel[data-key="${key}"]`);
      const imgs = carousel.querySelectorAll('.carousel-image');
      let idx = Array.from(imgs).findIndex(i=>i.classList.contains('active'));
      idx = btn.classList.contains('carousel-prev')?
        (idx-1+imgs.length)%imgs.length:
        (idx+1)%imgs.length;
      updateCarousel(key, idx);
    });
  });
  // Carousel dots
  document.querySelectorAll('.carousel-dot').forEach(dot=>{
    dot.addEventListener('click', e=>{
      e.stopPropagation();
      updateCarousel(dot.dataset.key, +dot.dataset.index);
    });
  });
}

// Updates carousel image and active dot
function updateCarousel(key, idx) {
  const carousel = document.querySelector(`.apartment-carousel[data-key="${key}"]`);
  if (!carousel) return;
  const imgs = carousel.querySelectorAll('.carousel-image');
  const dots = carousel.querySelectorAll('.carousel-dot');
  imgs.forEach(i=>i.classList.remove('active'));
  dots.forEach(d=>d.classList.remove('active'));
  imgs[idx].classList.add('active');
  dots[idx].classList.add('active');
}

// Show room detail page (pushState)
function showRoomPage(key) {
  history.pushState(null,'',`/${key}`);
  renderRoomDetail(key);
}

// Show room detail without changing history (for popstate)
function showRoomPageWithoutPush(key) {
  renderRoomDetail(key);
}

// Renders detail view for an apartment
function renderRoomDetail(key) {
  const apt = apartmentData[key];
  if (!apt) return;
  // Toggle pages
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('room-details-page').classList.remove('hidden');
  document.getElementById('home-navbar').classList.add('hidden');
  document.getElementById('detail-navbar').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
  // Breadcrumb
  const bc = document.getElementById('breadcrumb-room-name');
  if (bc) bc.textContent = apt.name;
  // Hero image
  const hero = document.getElementById('room-hero');
  if (hero && apt.heroImage) setHeroBackground(hero,apt.heroImage);
  // Text
  document.getElementById('room-details-title').textContent = apt.name;
  document.getElementById('room-details-subtitle').textContent = apt.subtitle;
  document.getElementById('room-details-description').textContent = apt.description;
  // Amenities
  const aList = document.getElementById('amenities-list');
  if (aList) aList.innerHTML = apt.amenities.map(a=>`<li><i class="fa-solid fa-check"></i> ${a}</li>`).join('');
  // Rooms
  renderRooms(apt.rooms);
  // Map
  initRoomMap(apt.coordinates);
}

// Show home page and clear history
function showHomePage() {
  history.pushState(null,'',window.location.pathname);
  showHomePageWithoutPush();
}

// Show home without state change
function showHomePageWithoutPush() {
  document.getElementById('home-page').classList.remove('hidden');
  document.getElementById('room-details-page').classList.add('hidden');
  document.getElementById('home-navbar').classList.remove('hidden');
  document.getElementById('detail-navbar').classList.add('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
  if (window.roomMapInstance) {
    window.roomMapInstance.remove();
    window.roomMapInstance=null;
  }
}

// Render individual room cards
function renderRooms(rooms) {
  const container = document.getElementById('room-list-container');
  if (!container) return;
  container.innerHTML = rooms.map(r=>`
    <div class="room-card flex justify-between items-center p-4 mb-4 bg-white rounded-lg shadow">
      <div onclick="openRoomModal('${r.key}')" class="cursor-pointer">
        <h4 class="font-semibold">${r.name}</h4>
        <p class="text-sm text-gray-600 whitespace-pre-line">${r.price}</p>
      </div>
      <button onclick="window.open('${r.link}','_blank')" class="btn-custom px-4 py-2 rounded-lg">Book Now</button>
    </div>
  `).join('');
}

// Initialize detail map
function initRoomMap(coords) {
  setTimeout(()=>{
    const el = document.getElementById('room-map');
    if (!el) return;
    if (!window.roomMapInstance) {
      window.roomMapInstance = L.map('room-map').setView(coords,15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(window.roomMapInstance);
    } else {
      window.roomMapInstance.setView(coords,15);
      window.roomMapInstance.eachLayer(l=>l instanceof L.Marker && window.roomMapInstance.removeLayer(l));
    }
    L.marker(coords).addTo(window.roomMapInstance);
    window.roomMapInstance.invalidateSize();
  },100);
}

// Room modal open
function openRoomModal(roomKey) {
  const r = roomDetails[roomKey];
  if (!r) return;
  const modal = document.getElementById('room-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow='hidden';
  populateModal(r);
}

// Populate modal content
function populateModal(r) {
  // Titles
  document.getElementById('modal-room-title').textContent = r.room_name;
  document.getElementById('modal-room-title-desktop').textContent = r.room_name;
  // Bed/View
  document.querySelectorAll('#modal-bed-info .value, #modal-bed-info-desktop .value').forEach(el=>el.textContent=r.bed);
  document.querySelectorAll('#modal-view-info .value, #modal-view-info-desktop .value').forEach(el=>el.textContent=r.view);
  // Plus
  ['modal-plus-info','modal-plus-info-desktop'].forEach(id=>{
    const el=document.getElementById(id);
    if(r.plus) { el.style.display='block'; el.querySelector('span').textContent=`Plus: ${r.plus}`; }
    else el.style.display='none';
  });
  // Amenities
  const iconMap = {
    Oven:'fa-solid fa-temperature-high',Microwave:'fa-solid fa-microchip',
    'Coffee Maker':'fa-solid fa-coffee','Dishes & Utensils':'fa-solid fa-utensils',
    Kitchen:'fa-solid fa-kitchen-set','Refrigerator':'fa-solid fa-snowflake',
    Stove:'fa-solid fa-fire-burner','Internet':'fa-solid fa-wifi','Hair Dryer':'fa-solid fa-wind',
    'Free wifi':'fa-solid fa-wifi','Fire extinguisher':'fa-solid fa-fire-extinguisher'
  };
  ['modal-amenities','modal-amenities-desktop'].forEach(id=>{
    const c=document.getElementById(id);
    if(c) c.innerHTML = (r.amenities||[]).map(a=>`<div class="flex items-center"><i class="${iconMap[a]||'fa-solid fa-check'} mr-2"></i><span>${a}</span></div>`).join('');
  });
  // Images
  ['modal-main-img','modal-main-img-desktop'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) { el.src=r.images[0]||''; el.onerror=()=>el.src='https://via.placeholder.com/400x300'; }
  });
  ['gallery-thumbs','gallery-thumbs-desktop'].forEach(id=>{
    const cont=document.getElementById(id);
    if(cont){
      cont.innerHTML = (r.images||[]).map((src,i)=>`
        <img src="${src}" class="thumb ${i===0?'selected':''}" data-index="${i}">
      `).join('');
      cont.querySelectorAll('.thumb').forEach(img=>{
        img.addEventListener('click',()=>{
          const idx=+img.dataset.index;
          ['modal-main-img','modal-main-img-desktop'].forEach(mid=>{
            const m=document.getElementById(mid);
            m.src=r.images[idx]||''; m.onerror=()=>m.src='https://via.placeholder.com/400x300';
          });
          cont.querySelectorAll('.thumb').forEach(t=>t.classList.remove('selected'));
          img.classList.add('selected');
        });
      });
    }
  });
  // Price & link
  const offer = Object.values(apartmentData).flatMap(a=>a.rooms).find(x=>x.key===r.key);
  if(offer){
    ['modal-room-price','modal-room-price-desktop'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.textContent = offer.price;
    });
    ['modal-room-link','modal-room-link-desktop'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.href = offer.link;
    });
  }
}

// Close modal
function closeModal() {
  const modal = document.getElementById('room-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow='auto';
}

// Attach close handlers
document.addEventListener('DOMContentLoaded',()=>{
  const modal = document.getElementById('room-modal');
  document.getElementById('modal-close').addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  // Show more toggle
  document.getElementById('toggle-description').addEventListener('click',()=>{
    const d=document.getElementById('host-description');
    d.classList.toggle('expanded');
    document.getElementById('toggle-description').textContent = d.classList.contains('expanded')?'Show less':'Show more';
  });
  // FAQ
  document.querySelectorAll('.faq-toggle').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const c=btn.nextElementSibling, ch=btn.querySelector('.faq-chevron');
      c.classList.toggle('hidden');
      ch.classList.toggle('rotate');
    });
  });
  // Testimonials carousel
  const track=document.getElementById('testimonial-track'), prev=document.getElementById('carousel-prev'), next=document.getElementById('carousel-next');
  if(track&&prev&&next){
    let idx=0,slides=track.children.length;
    const update=()=>{
      const spv=window.innerWidth>=1024?3:window.innerWidth>=768?2:1;
      track.style.transform=`translateX(${-idx*(track.clientWidth/spv)}px)`;
    };
    prev.onclick=()=>{const spv=window.innerWidth>=1024?3:window.innerWidth>=768?2:1;idx=idx>0?idx-1:slides-spv;update();};
    next.onclick=()=>{const spv=window.innerWidth>=1024?3:window.innerWidth>=768?2:1;idx=idx<slides-spv?idx+1:0;update();};
    window.onresize=()=>{idx=0;update();};
    update();
  }
  // Main map
  const mEl=document.getElementById('map');
  if(mEl&&typeof L!=='undefined'){
    const map=L.map('map').setView([38.715,-9.15],14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
    const locs=[
      ['OLYMPO',[38.71000190857739,-9.160553280061636]],
      ['SANTOS',[38.70765573893287,-9.15951458006177]],
      ['PALMIRA',[38.72396692533869,-9.133889984288666]],
      ['MARIA',[38.72336820407823,-9.133562425999576]],
      ['ARRIAGA',[38.70431580212892,-9.165665021345829]],
      ['PATIO',[38.70432417473284,-9.165643563673596]],
      ['LOFT',[38.717922382466064,-9.133941759865937]]
    ];
    const fg=L.featureGroup();
    locs.forEach(l=>{L.marker(l[1]).bindPopup(`<b>${l[0]}</b>`).addTo(fg);});
    fg.addTo(map);
    map.fitBounds(fg.getBounds(),{padding:[10,10]});
  }
  // Back-to-apts arrow
  const back=document.getElementById('back-to-apts'), footer=document.querySelector('footer');
  window.onscroll=()=>{if(back&&footer){
    const hide=footer.getBoundingClientRect().top>=window.innerHeight+100;
    back.classList.toggle('hidden',hide);
  }};
  back&&back.addEventListener('click',()=>document.querySelector('#winter-rooms').scrollIntoView({behavior:'smooth'}));
});

// Handle history navigation
window.addEventListener('popstate',()=>{
  const key=window.location.pathname.replace(/^\//,'');
  if(key && apartmentData[key]) showRoomPageWithoutPush(key);
  else showHomePageWithoutPush();
});
