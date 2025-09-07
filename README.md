# 🏠 Templlo - Lisbon Accommodation Platform

A modern, responsive web platform for booking unique accommodations in Lisbon, Portugal. Built for travelers seeking authentic experiences with culture, sustainability, and community connection.

## 🌟 About

**Templlo** is more than just accommodation booking - it's a platform for adventurers who want to blend travel with culture, sustainability, and spirituality. Created by Tin Barbo (DJ, surf instructor, and cultural enthusiast), Templlo offers carefully curated spaces across Lisbon's most vibrant neighborhoods.

### 🏆 Host Stats
- **9,893** Reviews
- **4.33** Rating
- **11** Years of Experience

## ✨ Features

### 🏠 Properties
- **8 Unique Locations** across Lisbon and Alcácer do Sal
- **35 Individual Rooms** with different configurations
- **Diverse Neighborhoods**: Alcântara, Lapa, Santos, Intendente, Martim Moniz

### 🎯 Key Features
- **Interactive Map** with all property locations
- **Advanced Filtering** by price, room type, and amenities
- **Image Carousels** for each property and room
- **Real-time Booking** integration
- **Responsive Design** for all devices
- **Room Details Modal** with comprehensive information
- **Flexible Pricing** (15-day and monthly rates)

### 🏘️ Property Portfolio

| Property | Location | Rooms | Price Range (15 Days) | Special Features |
|----------|----------|-------|----------------------|------------------|
| **ARRIAGA** | Alcântara | 7 rooms | €435-630 | Port views, Weekly linens service |
| **PATIO** | Alcântara | 4 rooms | €465-553 | Private internal patio |
| **OLYMPO** | Lapa | 4 rooms | €541-634 | Private rooftop, Tejo views |
| **SANTOS** | Santos | 8 rooms | €401-528 | Backpacker community hub |
| **PALMIRA** | Intendente | 5 rooms | €384-566 | Historical center location |
| **MARIA** | Intendente | 3 rooms | €566-604 | Bohemian atmosphere |
| **LOFT** | Martim Moniz | 1 studio | €755 | Private studio with TV |
| **TORRÃO** | Alcácer do Sal | 1 apartment | €661 | Lake views, Full apartment |

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styles with responsive design
- **Vanilla JavaScript** - Dynamic interactions and data loading
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icons
- **Google Fonts** (Inter) - Typography

### Data Management
- **JSON** - Property and room data storage
- **RESTful API** - Booking system integration

### External Services
- **Booking Platform** - `book.templlo.com`
- **SoundCloud** - DJ mixes integration
- **Image Hosting** - Property and room galleries

## 📁 File Structure

```
templlo/
├── index.html              # Main application file
├── styles.css             # Custom CSS styles
├── script.js              # Application logic
├── apartments.json        # Property data with 15-day/monthly pricing
├── rooms.json            # Room details and amenities
├── renamed_images/       # Property and room images
│   ├── ARRIAGA/
│   ├── PATIO/
│   ├── OLYMPO/
│   ├── SANTOS/
│   ├── PALMIRA/
│   ├── MARIA/
│   ├── LOFT/
│   └── TORRAO/
└── README.md            # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/templlo.git
   cd templlo
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📊 Data Structure

### Apartments JSON
```json
{
  "apartment_id": {
    "name": "Property Name",
    "subtitle": "Brief Description",
    "heroImage": "path/to/image.webp",
    "carouselImages": ["image1.webp", "image2.webp"],
    "description": "Detailed description",
    "amenities": ["River View", "Weekly change of linens and towels", "Central office support during work hours"],
    "coordinates": [latitude, longitude],
    "rooms": [
      {
        "key": "room_id",
        "name": "Room Name", 
        "price": "from €XXX / 15 Days from €YYY / Month",
        "link": "booking_url"
      }
    ]
  }
}
```

### Rooms JSON
```json
{
  "room_id": {
    "room_name": "Room Name",
    "category": 1 | 2,
    "bed": "SINGLE | DOUBLE | QUEEN | KING | ELEVATED DOUBLE BED",
    "view": "STREET VIEW | OCEAN PORT VIEW | INTERIOR | LAKE VIEW | ATTIC ROOM CEILING WINDOWS",
    "plus": "Special features like HAMMOCK, PRIVATE SMALL BALCONY, TV",
    "includes": ["DUVE", "PORTABLE HEATER", "HANGERS", "DESK AND CHAIR"],
    "shared_desk_office": boolean,
    "amenities": ["Oven", "Microwave", "Coffee Maker", "Kitchen", "Free wifi"],
    "images": ["room_images"]
  }
}
```

## 🏨 Accommodation Features

### 🛏️ Room Types
- **Category 1**: Single occupancy rooms
- **Category 2**: Double occupancy rooms
- **Bed Options**: Single, Double, Queen, King, Elevated Double
- **Views**: Street, Ocean Port, Interior, Lake, Attic with ceiling windows

### 🎯 Standard Inclusions
All rooms include:
- Duvet and linens
- Portable heater
- Hangers
- Desk and chair
- Weekly linen change service
- Twice weekly common area cleaning
- Central office support during work hours (Alcântara location)

### 🍳 Amenities
- **Kitchen Facilities**: Oven, microwave, coffee maker, refrigerator, stove
- **Connectivity**: Free Wi-Fi, high-speed internet
- **Safety**: Fire extinguisher
- **Personal Care**: Hair dryer
- **Special Features**: Some rooms include hammocks, private balconies, TVs

## 🎨 Customization

### Styling
- Edit `styles.css` for visual customizations
- Color scheme: Warm earth tones (`#e4d6cc`, `#2b1102`)
- Font: Inter (Google Fonts)

### Adding New Properties
1. Add property data to `apartments.json`
2. Add room details to `rooms.json`
3. Upload images to `renamed_images/PROPERTY_NAME/`
4. Update coordinates for map display

### Pricing Updates
- Modify pricing in both JSON files using 15-day and monthly format
- Ensure consistency across booking links
- Update `index.html` if display format changes

## 🔗 Integration

### Booking System
- External booking platform: `book.templlo.com`
- Each room has a unique booking URL
- Pricing displayed in 15-day and monthly increments

### Maps Integration
- Leaflet.js for interactive maps
- Custom markers for each property
- Coordinate-based positioning

## 🌐 Deployment

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (main/master)

### Custom Domain
1. Add CNAME file with domain name
2. Configure DNS settings
3. Enable HTTPS in GitHub Pages settings

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Development Guidelines
- Maintain existing code style
- Test on multiple browsers
- Ensure mobile responsiveness
- Optimize images before adding (WebP format preferred)
- Update documentation for new features
- Follow 15-day/monthly pricing format for consistency

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Issues

- Image loading may be slow on first visit
- Some older browsers may not support all CSS features
- Map requires internet connection for functionality

## 📈 Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, SEO)
- **Image Optimization**: WebP format used throughout
- **Lazy Loading**: Implemented for property images
- **Responsive Design**: Optimized for all device sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Tin Barbo** - Host & Developer
- 🎵 SoundCloud: [soundcloud.com/barbo_official](https://soundcloud.com/barbo_official)
- 🌐 Website: [templlo.com](https://templlo.com)
- 📧 Email:

***

**⭐ Star this repository if you found it helpful!**

> *Building a tribe of adventurers who want to blend travel with culture, sustainability, and spirituality.*

## 🔄 Recent Updates

- **Pricing Model**: Updated to display 15-day and monthly rates instead of nightly rates
- **Enhanced Amenities**: Added weekly linen service and bi-weekly common area cleaning
- **Central Support**: Added office support during work hours for better guest experience
- **Improved Data Structure**: Streamlined room amenities and property information

