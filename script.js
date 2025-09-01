// Load room details JSON
let roomDetails = {};
fetch('rooms.json')
  .then(res => res.json())
  .then(data => roomDetails = data)
  .catch(err => console.error('Error loading rooms.json:', err));


// "Show More" functionality for the host description
const toggleButton = document.getElementById('toggle-description');
const descriptionText = document.getElementById('host-description');

toggleButton.addEventListener('click', () => {
    if (descriptionText.classList.contains('expanded')) {
        descriptionText.classList.remove('expanded');
        toggleButton.textContent = 'Show more';
    } else {
        descriptionText.classList.add('expanded');
        toggleButton.textContent = 'Show less';
    }
});

// FAQ accordion functionality
document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const chevron = button.querySelector('.faq-chevron');

        content.classList.toggle('hidden');
        chevron.classList.toggle('rotate');
    });
});

// Carousel functionality for testimonials
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('testimonial-track');
    const prevButton = document.getElementById('carousel-prev');
    const nextButton = document.getElementById('carousel-next');

    // Determine the number of visible slides based on screen size
    const getSlidesPerView = () => {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    };

    let currentIndex = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;

    /**
     * Updates the carousel's position based on the current index.
     */
    const updateCarousel = () => {
        const slidesPerView = getSlidesPerView();
        const totalVisibleSlides = Math.ceil(totalSlides / slidesPerView) * slidesPerView;
        const slideWidth = track.clientWidth / slidesPerView;

        track.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
    };

    // Event listeners for carousel buttons
    prevButton.addEventListener('click', () => {
        const slidesPerView = getSlidesPerView();
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalSlides - slidesPerView;
        }
        updateCarousel();
    });

    nextButton.addEventListener('click', () => {
        const slidesPerView = getSlidesPerView();
        if (currentIndex < totalSlides - slidesPerView) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    });

    // Handle window resizing to ensure carousel stays in place
    window.addEventListener('resize', () => {
        currentIndex = 0; // Reset index on resize to prevent issues
        updateCarousel();
    });
    
    // Initial call to set up the carousel
    updateCarousel();

    // Initialize the map, centered on a general area of Lisbon
    const map = L.map('map').setView([38.715, -9.15], 14);

    // Add OpenStreetMap tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define the locations with their data
    const locations = [
        {
            title: 'OLYMPO',
            coordinates: [38.71000190857739, -9.160553280061636],
            description: 'Our apartment is in a central location and has an amazing rooftop to enjoy Tagus River view'
        },
        {
            title: 'SANTOS',
            coordinates: [38.70765573893287, -9.15951458006177],
            description: 'Our apartment is in a central location and has an amazing rooftop to enjoy Tagus River view'
        },
        {
            title: 'PALMIRA',
            coordinates: [38.72396692533869, -9.133889984288666],
            description: 'For surfers who want to enjoy Lisbon waves'
        },
        {
            title: 'MARIA',
            coordinates: [38.72336820407823, -9.133562425999576],
            description: 'Central apartment close to Historic Lisbon'
        },
        {
            title: 'ARRIAGA',
            coordinates: [38.70431580212892, -9.165665021345829],
            description: 'Elegance and comfort'
        },
        {
            title: 'PATIO',
            coordinates: [38.70432417473284, -9.165643563673596],
            description: 'Cozy space, bright patio'
        },
        {
            title: 'LOFT',
            coordinates: [38.717922382466064, -9.133941759865937],
            description: 'Private studio'
        }
    ];

    // Create a feature group to hold all the markers
    const markerGroup = L.featureGroup();

    // Loop through the locations and add a marker with a popup for each
    locations.forEach(loc => {
        const marker = L.marker(loc.coordinates)
            .bindPopup(`
                <div class="p-2">
                    <h2 class="font-bold text-lg">${loc.title}</h2>
                    <p class="text-sm text-gray-700">${loc.description}</p>
                </div>
            `);
        markerGroup.addLayer(marker);
    });
    
    // Add the group to the map
    markerGroup.addTo(map);

    // Fit the map's view to the bounds of all markers
    map.fitBounds(markerGroup.getBounds());
});
// Apartment data for room details (replace your existing object)
const apartmentData = {
  arriaga: {
    name: "ARRIAGA",
    subtitle: "Elegant Apartments in Alcântara",
    heroImage: "http://surfgasm.world/wp-content/uploads/2023/11/Arriaga-carrousel-1.jpg",
    description: "Get ready to be charmed by the elegance, style, and incredible view of the iconic Port of Lisbon. Located in the historic Alcântara neighborhood, our apartments are perfectly situated to offer both a peaceful retreat and easy access to the city's vibrant life. Known for its waterfront and converted warehouses, Alcântara is a hub for art, design, and nightlife.",
    amenities: ["River View", "Fast Wi-Fi", "Modern Kitchen", "Laundry Facilities", "Air Conditioning", "Work Desk", "Shared Bathrooms", "24/7 Access"],
    rooms: [
      { key: "arriaga_a", name: "ARRIAGA A",                         price: "from €29 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-a-arriaga-embassy-with-marina-view/94cb73" },
      { key: "arriaga_b", name: "ARRIAGA B",                         price: "from €31 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-b-arriaga-embassy-tejo-marina-view/b41854" },
      { key: "arriaga_c", name: "ARRIAGA C",                         price: "from €33 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-c-arriaga-embassy-tejo-marina-view/65ac5f" },
      { key: "arriaga_d", name: "ARRIAGA D",                         price: "from €32 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-d-arriaga-embassy-tejo-marina-view/5f3d44" },
      { key: "arriaga_e", name: "ARRIAGA E",                         price: "from €34 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-e-arriaga-embassy-tejo-marina-view/2b0cf8" },
      { key: "arriaga_f", name: "ARRIAGA F",                         price: "from €30 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-f-arriaga-embassy-tejo-marina-view/3a7ee5" },
      { key: "arriaga_g", name: "ARRIAGA G",                         price: "from €35 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-g-arriaga-embassy-tejo-marina-view/643044" }
    ],
    coordinates: [38.70431580212892, -9.165665021345829]
  },
  maria: {
    name: "MARIA",
    subtitle: "Bohemian Lisbon Vibe",
    heroImage: "https://surfgasm.world/wp-content/uploads/2023/11/maria-carrousel-4.jpg",
    description: "Nestled in the heart of Lisbon, this charming apartment offers the perfect blend of comfort and bohemian style. The area is renowned for its classic Portuguese architecture, quaint cafes, and local shops. It's a perfect spot for travelers who want to immerse themselves in the authentic Lisbon lifestyle.",
    amenities: ["Private Bedrooms", "Shared Kitchen", "Shared Living Room", "High-speed Wi-Fi", "Close to Public Transit", "Traditional Decor"],
    rooms: [
      { key: "maria_a", name: "MARIA A", price: "from €38 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/maria-room-a--culturally-rich-hotspot-apartment/cd0c7a" },
      { key: "maria_b", name: "MARIA B", price: "from €33 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/maria-room-b--culturally-rich-hotspot-apartment/5dd2d1" },
      { key: "maria_c", name: "MARIA C", price: "from €31 / night", link: "https://surfgasm.bookeddirectly.com/g/lisbon/maria-room-c-with-private-bathroom-central-lisbon/f51db8" }
    ],
    coordinates: [38.72336820407823, -9.133562425999576]
  },
  olympo: {
    name: "OLYMPO",
    subtitle: "Private Lisbon Rooftop Paradise",
    heroImage: "https://surfgasm.world/wp-content/uploads/2023/11/olympo-carrousel-2.jpg",
    description: "Where sun meets skyline: this private Lisbon rooftop paradise offers breathtaking views and an exclusive stay. Located in the Lapa district, known for its embassies and elegant homes, you will enjoy a tranquil and sophisticated environment while still being a short distance from the city's main attractions.",
    amenities: ["Rooftop Terrace", "Stunning Views", "Full Kitchen", "Private Bathrooms", "Luxurious Decor", "Air Conditioning"],
    rooms: [
      { key: "olympo_a", name: "OLYMPO A", price: "from €55 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/olympoa%252C-penthouse-views%252C-private-roof%252C-guesthouse/295211" },
      { key: "olympo_b", name: "OLYMPO B", price: "from €48 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/olympo-room-b-stunning-penthouse-views%252C-riverside/17bdb4" },
      { key: "olympo_c", name: "OLYMPO C", price: "from €42 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/olympo-room-c-stunning-penthouse-views%252C-riverside/cd12b0" },
      { key: "olympo_d", name: "OLYMPO D", price: "from €36 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/olympo-room-d-stunning-penthouse-views%252Criverside/a3714b" }
    ],
    coordinates: [38.71000190857739, -9.160553280061636]
  },
  palmira: {
    name: "PALMIRA",
    subtitle: "Heart of Lisbon",
    heroImage: "http://surfgasm.world/wp-content/uploads/2023/11/Palmira-apartment-cover.jpg",
    description: "In the heart of Lisbon, be close to the main venues of the historical center and public transportation. This location is unbeatable for those who want to explore the city on foot and experience its authentic charm, from the lively streets to the hidden gems.",
    amenities: ["Central Location", "High-speed Wi-Fi", "Shared Kitchen", "Shared Living Space", "Balcony", "Historic Building"],
    rooms: [
      { key: "palmira_a", name: "PALMIRA A", price: "from €38 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/palmira-room-a---bright-room-in-historical-lisbon/1e15c5" },
      { key: "palmira_b", name: "PALMIRA B", price: "from €33 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/palmira-b-double-room-in-central-lisbon/c4f516" },
      { key: "palmira_c", name: "PALMIRA C", price: "from €31 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/palmira-room-c--bright-room-historical-lisbon/bc666c" },
      { key: "palmira_d", name: "PALMIRA D", price: "from €31 / night", link: "https://surfgasm.bookeddirectly.com/g/lisbon/palmira-d-double-room/72e8f6" },
      { key: "palmira_e", name: "PALMIRA E", price: "from €31 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/solo-traveler-cosy-room-e-historical-lisbon/72cbf8" }
    ],
    coordinates: [38.72396692533869, -9.133889984288666]
  },
  patio: {
    name: "PATIO",
    subtitle: "Cozy space, bright patio",
    heroImage: "http://surfgasm.world/wp-content/uploads/2023/11/patio-carrousel-3.jpg",
    description: "Cozy space and bright patio in the center of Lisbon, close to all amenities and public transportation. This hidden gem offers a tranquil private patio where you can relax after a day of exploring the city's bustling streets. A perfect urban sanctuary.",
    amenities: ["Private Patio", "Fast Wi-Fi", "Shared Kitchen", "Shared Bathroom", "Close to Metro", "Outdoor Seating"],
    rooms: [
      { key: "patio_a", name: "PATIO A", price: "from €45 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-a-in-cozy-apartment-patio/748933" },
      { key: "patio_b", name: "PATIO B", price: "from €42 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/double-bedroom-with-balcony-patio-b/3ca645" },
      { key: "patio_c", name: "PATIO C", price: "from €35 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-c-patio-apartment-with-bright-patio/b5c30c" },
      { key: "patio_d", name: "PATIO D", price: "from €40 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/room-d-patio-apartment-with-bright-patio/034aca" }
    ],
    coordinates: [38.70432417473284, -9.165643563673596]
  },
  santos: {
    name: "SANTOS",
    subtitle: "Where curious souls unite",
    heroImage: "http://surfgasm.world/wp-content/uploads/2023/11/santos-cover.jpg",
    description: "Where curious souls unite! A backpacker's oasis for connecting and exploring. Located in the hip and historic Santos-o-Velho district, this apartment is a true urban retreat. Known for its art galleries, design shops, and riverside location, Santos offers a perfect blend of modern style and traditional charm.",
    amenities: ["Spacious Living Area", "Modern Kitchen", "High-speed Internet", "Secure Entry", "Backpacker Community", "Shared Workspace"],
    rooms: [
      { key: "santos_a", name: "SANTOS A", price: "from €35 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/santos-room-a--river-view--sunny-central-lisbon/6f0284" },
      { key: "santos_b", name: "SANTOS B", price: "from €33 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/santos-room-b-river-view-sunny-central-lisbon/571bc3" },
      { key: "santos_c", name: "SANTOS C", price: "from €28 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/santos-room-c-river-view-sunny-central-lisbon/8077d8" },
      { key: "santos_d", name: "SANTOS D", price: "from €25 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/santos-room-d-river-view-sunny-central-lisbon/130b78" },
      { key: "santos_f", name: "SANTOS F", price: "from €27 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/santos-room-f--river-view-sunny-central-lisbon/5d214c" },
      { key: "santos_h1", name: "SANTOS H1", price: "from €37 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/santos-room-h1--central-lisbon/6983a3" },
      { key: "santos_h2", name: "SANTOS H2", price: "from €29 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/santos-room-h2--central-lisbon/684862" }
    ],
    coordinates: [38.70765573893287, -9.15951458006177]
  },
  loft: {
    name: "LOFT",
    subtitle: "Tiny Central & Cosy Loft",
    heroImage: "https://surfgasm.world/wp-content/uploads/2023/11/loft-cover.jpg",
    description: "Experience ultimate comfort in our private double bed and extra bed studio.",
    amenities: ["Private Studio", "Fast Wi-Fi", "Desk and Chair"],
    rooms: [
      { key: "loft", name: "LOFT", price: "from €52 / night", link: "https://surfgasm.bookeddirectly.com/g/lisboa/tiny-central-%2526-cosy-loft-in-multi-cultural-area/41139b" }
    ],
    coordinates: [38.717922382466064, -9.133941759865937]
  },
  torrao: {
    name: "TORRÃO",
    subtitle: "Rooftop Views Near the Lake",
    heroImage: "http://surfgasm.world/wp-content/uploads/2025/08/Torrao-carrousel-1.jpeg",
    description: "Experience the tranquility of Torrão with this full apartment booking. Perfect for a peaceful getaway.",
    amenities: ["Full Apartment", "Fast Wi-Fi", "Lake View"],
    rooms: [
      { key: "torrao", name: "TORRÃO", price: "from €52 / night", link: "https://surfgasm.bookeddirectly.com/g/torr%25C3%25A3o/vista-do-alentejo-rooftop-at-house-near-the-lake/0a7130" }
    ],
    coordinates: [38.72396692533869, -9.133889984288666]
  }
};


// Room page functionality
let roomMapInstance;

// Render rooms and attach title click handlers
function renderRooms(rooms) {
  const container = document.getElementById('room-list-container');
  container.innerHTML = rooms.map(room => `
    <div class="room-card flex flex-col sm:flex-row items-center justify-between p-4 mb-4">
      <div class="text-center sm:text-left mb-2 sm:mb-0">
        <p class="room-title font-semibold text-lg">${room.name}</p>
        <p class="text-gray-600 text-sm">${room.price}</p>
      </div>
      <a href="${room.link}" target="_blank" class="btn-custom text-center py-2 px-6 rounded-full w-full sm:w-auto text-sm font-medium">Book Now</a>
    </div>
  `).join('');

  document.querySelectorAll('#room-list-container .room-title').forEach((el, idx) => {
    el.addEventListener('click', () => openRoomModal(rooms[idx]));
  });
}

// Show apartment detail page
function showRoomPage(id) {
  const apt = apartmentData[id];
  if (!apt) return;

  // Toggle containers
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('room-details-page').classList.remove('hidden');
  // Toggle navbars
  document.getElementById('home-navbar').classList.add('hidden');
  document.getElementById('detail-navbar').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Breadcrumb & hero
  document.getElementById('breadcrumb-room-name').textContent = apt.name;
  document.getElementById('room-hero').style.backgroundImage = `url('${apt.heroImage}')`;
  document.getElementById('room-details-title').textContent = apt.name;
  document.getElementById('room-details-subtitle').textContent = apt.subtitle;
  document.getElementById('room-details-description').textContent = apt.description;

  // Amenities
  document.getElementById('amenities-list').innerHTML = apt.amenities.map(a => `<li><i class="fa-solid fa-check"></i> ${a}</li>`).join('');

  // Rooms
  renderRooms(apt.rooms);

  // Map
  setTimeout(() => {
    const mapEl = document.getElementById('room-map');
    if (mapEl && !roomMapInstance) {
      roomMapInstance = L.map('room-map').setView(apt.coordinates, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(roomMapInstance);
      L.marker(apt.coordinates).addTo(roomMapInstance);
    } else if (roomMapInstance) {
      roomMapInstance.setView(apt.coordinates, 15);
      roomMapInstance.eachLayer(l => { if (l instanceof L.Marker) roomMapInstance.removeLayer(l); });
      L.marker(apt.coordinates).addTo(roomMapInstance);
      roomMapInstance.invalidateSize();
    }
  }, 100);
}

// Return to home view
function showHomePage() {
  document.getElementById('home-page').classList.remove('hidden');
  document.getElementById('room-details-page').classList.add('hidden');
  document.getElementById('home-navbar').classList.remove('hidden');
  document.getElementById('detail-navbar').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (roomMapInstance) {
    roomMapInstance.remove();
    roomMapInstance = null;
  }
}

// Floating back-to-apartments arrow
const backBtn = document.getElementById('back-to-apts');
const footer = document.querySelector('footer');
window.addEventListener('scroll', () => {
  const top = footer.getBoundingClientRect().top;
  backBtn.classList.toggle('hidden', top >= window.innerHeight + 100);
});
backBtn.addEventListener('click', () => {
  document.querySelector('#winter-rooms').scrollIntoView({ behavior: 'smooth' });
});

function openRoomModal(room) {
  const details = roomDetails[room.key] || {};
  const title   = details.room_name || room.name;
  const imgSrc  = details.image || 'placeholder.jpg'; // add image URLs in JSON

  // Static includes
  const includes = details.includes || [];
  const shared   = details.shared_desk_office ? ['SHARED DESK OFFICE'] : [];

  // Build feature list with icons
  const features = [
    ...includes.map(i => ({ icon: 'fa-solid fa-check', text: i })),
    ...shared .map(i => ({ icon: 'fa-solid fa-table', text: i })),
    { icon: 'fa-solid fa-layer-group', text: `Category: ${details.category ?? '–'}` },
    { icon: 'fa-solid fa-bed',          text: `Bed: ${details.bed ?? '–'}` },
    { icon: 'fa-solid fa-eye',          text: `View: ${details.view ?? '–'}` },
    ...(details.plus ? [{ icon: 'fa-solid fa-gift', text: `Plus: ${details.plus}` }] : [])
  ];

  // Populate modal
  document.getElementById('modal-room-title').textContent  = title;
  document.getElementById('modal-room-price').textContent  = room.price;
  document.getElementById('modal-room-image').src          = imgSrc;
  document.getElementById('modal-room-link').href         = room.link;

  // Render features
  document.getElementById('modal-room-features').innerHTML =
    features.map(f => `<li><i class="${f.icon}"></i>${f.text}</li>`).join('');

  // Show modal
  const modal = document.getElementById('room-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
