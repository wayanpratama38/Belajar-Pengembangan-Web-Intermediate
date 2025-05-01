import StoryCard from "../../components/story-card";
import HomePresenter from "./home-presenter";
import L from "leaflet"
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';


export default class HomePage {
  #presenter;
  #storiesContainer;
  #map;
  #mapInitialized = false;
  #mapInitializationAttempts = 0;
  #maxInitAttempts = 3;
  #locations = [];

  async render() {
    return `
      <section class="container">
        <div class="heading--container">
          <h1>Homepage</h1>
          <p>Disini tempat dimana kamu berbagi dan melihat story! Klik <a href="#mapContainer">disini</a> untuk melihat map</p>
        </div>
        <div class="stories-container">
        </div>
        <div class="heading--container">
          <h1>Map</h1>
          <p>Disini lokasi kamu jika di map! Silahkan klik marker!</p>
        </div>
        <div id="mapContainer"></div>
      </section>
    `;
  }

  // async afterRender() {
  //   this.#storiesContainer = document.querySelector(".stories-container");
  //   const mapElement = document.getElementById("mapContainer");

  //   if (!this.#storiesContainer || !mapElement) {
  //     console.error("Required elements not found in DOM.");
  //     return;
  //   }
  //   // Inisialisasi presenter sebelum map
  //   this.#presenter = new HomePresenter({ view: this });
    
  //   // Mulai inisialisasi map dengan sistem retry
  //   this.#initMapWithRetry();
    
  //   // Fetch data stories dan lokasi
  //   await this.#presenter.init();

  //   // Setup smooth scroll link
  //   const mapLink = document.querySelector('a[href="#mapContainer"]');
  //   if (mapLink) {
  //     mapLink.addEventListener('click', (event) => {
  //       event.preventDefault();
  //       mapElement.scrollIntoView({ behavior: 'smooth' });
  //     });

  //     // Tambahkan event listener untuk memastikan map terrender dengan benar
  //   // saat tab atau halaman menjadi visible
  //   document.addEventListener('visibilitychange', () => {
  //     if (!document.hidden && this.#map) {
  //       this.#map.invalidateSize();
        
  //       // Rerender markers jika sudah ada data lokasi
  //       if (this.#locations.length > 0) {
  //         this.renderMapMarkers(this.#locations);
  //       }
  //     }
  //   });

  //   // Jika halaman diresize, update ukuran map
  //   window.addEventListener('resize', () => {
  //     if (this.#map) {
  //       this.#map.invalidateSize();
  //     }
  //   });
  // }

  async afterRender() {
    this.#storiesContainer = document.querySelector(".stories-container");
    const mapElement = document.getElementById("mapContainer");

    if (!this.#storiesContainer || !mapElement) {
      console.error("Required elements not found in DOM.");
      return;
    }

    // Inisialisasi presenter sebelum map
    this.#presenter = new HomePresenter({ view: this });
    
    // Mulai inisialisasi map dengan sistem retry
    this.#initMapWithRetry();
    
    // Fetch data stories dan lokasi
    await this.#presenter.init();

    // Setup smooth scroll link
    const mapLink = document.querySelector('a[href="#mapContainer"]');
    if (mapLink) {
      mapLink.addEventListener('click', (event) => {
        event.preventDefault();
        mapElement.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Tambahkan event listener untuk memastikan map terrender dengan benar
    // saat tab atau halaman menjadi visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.#map) {
        this.#map.invalidateSize();
        
        // Rerender markers jika sudah ada data lokasi
        if (this.#locations.length > 0) {
          this.renderMapMarkers(this.#locations);
        }
      }
    });

    // Jika halaman diresize, update ukuran map
    window.addEventListener('resize', () => {
      if (this.#map) {
        this.#map.invalidateSize();
      }
    });
  }

  showStories(stories) {
    if (!this.#storiesContainer) {
      console.error("Element 'stories-container' not found.");
      return;
    }
    if (!stories || stories.length === 0) {
      this.#storiesContainer.innerHTML = "<p>Belum ada cerita untuk ditampilkan.</p>";
      return;
    }
    this.#storiesContainer.innerHTML = stories
      .map((story) => new StoryCard(story).render())
      .join('');
  }

  async #initMapWithRetry() {
    if (this.#mapInitialized) return true;
    
    // Jika sudah mencapai batas percobaan, hentikan
    if (this.#mapInitializationAttempts >= this.#maxInitAttempts) {
      console.error(`Failed to initialize map after ${this.#maxInitAttempts} attempts`);
      const mapContainer = document.getElementById("mapContainer");
      if (mapContainer) {
        mapContainer.innerHTML = '<p class="error-message">Gagal memuat peta. Silakan refresh halaman.</p>';
      }
      return false;
    }
    
    this.#mapInitializationAttempts++;
    console.log(`Map initialization attempt ${this.#mapInitializationAttempts}`);
    
    try {
      const success = await this.#initMap();
      if (success) {
        // Rerender markers jika sudah ada data lokasi
        if (this.#locations.length > 0) {
          this.renderMapMarkers(this.#locations);
        }
        return true;
      }
    } catch (error) {
      console.warn(`Map initialization attempt ${this.#mapInitializationAttempts} failed:`, error);
    }
    
    // Jika gagal, tunggu sebentar dan coba lagi
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.#initMapWithRetry();
  }
  async #initMap() {
    // Cek jika sudah diinisialisasi
    if (this.#mapInitialized) return true;
    
    const mapContainer = document.getElementById("mapContainer");
    if (!mapContainer) {
      console.warn("Map container not found during init attempt.");
      return false;
    }
    
    // Set explicit dimensions jika belum diset
    if (!mapContainer.style.height) {
      mapContainer.style.height = "400px";
    }
    if (!mapContainer.style.width) {
      mapContainer.style.width = "100%";
    }
    
    // Pastikan container terlihat sebelum init Leaflet
    if (mapContainer.clientHeight === 0 || mapContainer.clientWidth === 0) {
      console.warn("Map container has no dimensions yet.");
      return false;
    }

    console.log("Initializing Leaflet map...");
    try {
      // Hapus konten error sebelumnya jika ada
      mapContainer.innerHTML = '';
      
      this.#map = L.map("mapContainer").setView([-3.0, 118.0], 5); // Koordinat tengah Indonesia

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.#map);

      // Set flag bahwa map sudah OK
      this.#mapInitialized = true;
      console.log("Leaflet map initialized successfully.");

      // Force invalidateSize setelah inisialisasi
      setTimeout(() => {
        if (this.#map) {
          this.#map.invalidateSize();
        }
      }, 100);

      return true;
    } catch (error) {
      console.error("Error initializing Leaflet map:", error);
      this.#mapInitialized = false;
      mapContainer.innerHTML = '<p class="error-message">Terjadi kesalahan saat memuat peta.</p>';
      return false;
    }
  }
  

  // async #initMap(){
  //   // Cek jika sudah diinisialisasi atau elemen tidak ada
  //   if (this.#mapInitialized) return;
  //   const mapContainer = document.getElementById("mapContainer");
  //   if (!mapContainer) {
  //       console.warn("Map container not found during init attempt.");
  //       return; // Tidak bisa init jika container tidak ada
  //   }
  //    // Pastikan container terlihat (punya dimensi) sebelum init Leaflet
  //   if (mapContainer.clientHeight === 0 || mapContainer.clientWidth === 0) {
  //      console.warn("Map container has no dimensions yet. Retrying initialization slightly later.");
  //      // Beri sedikit waktu agar CSS/layout diterapkan
  //      await new Promise(resolve => setTimeout(resolve, 100));
  //      // Coba cek lagi setelah delay
  //      if (mapContainer.clientHeight === 0 || mapContainer.clientWidth === 0) {
  //          console.error("Map container still has no dimensions. Map initialization failed.");
  //          mapContainer.innerHTML = '<p class="error-message">Gagal menginisialisasi area peta.</p>';
  //          return; // Gagal permanen jika masih 0
  //      }
  //   }

  //   console.log("Initializing Leaflet map...");
  //   try {
  //       this.#map = L.map("mapContainer").setView([-3.0, 118.0], 5); // Koordinat tengah Indonesia

  //       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //           attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //       }).addTo(this.#map);

  //       this.#mapInitialized = true; // Set flag bahwa map sudah OK
  //       console.log("Leaflet map initialized successfully.");

  //       // Penting: InvalidateSize setelah tile layer ditambahkan,
  //       // terutama jika map diinisialisasi saat container mungkin belum visible sepenuhnya
  //       // atau ukurannya berubah setelah inisialisasi.
  //        this.#map.invalidateSize();

  //   } catch (error) {
  //       console.error("Error initializing Leaflet map:", error);
  //       this.#mapInitialized = false; // Gagal init
  //       mapContainer.innerHTML = '<p class="error-message">Terjadi kesalahan saat memuat peta.</p>';
  //       throw error; // Rethrow agar bisa ditangkap jika perlu
  //   }
  // }

  renderMapMarkers(locations) {
    // Simpan lokasi untuk keperluan re-render
    this.#locations = locations;
    
    // Coba inisialisasi map jika belum terinisialisasi
    if (!this.#map) {
      if (!this.#mapInitialized) {
        console.log("Map not yet initialized, trying to initialize now...");
        this.#initMapWithRetry();
      }
      return;
    }
    
    // Hapus marker yang sudah ada
    this.#map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        this.#map.removeLayer(layer);
      }
    });
    
    // Tambahkan marker baru
    locations.forEach(location => {
      const marker = L.marker([location.lat, location.lon]).addTo(this.#map);
      marker.bindPopup(`<b>${location.name}</b><br>${location.description}`);
    });
    
    // Refresh map setelah menambahkan marker
    this.#map.invalidateSize();
  }

  // renderMapMarkers(locations) {
  //   if (!this.#map) {
  //       console.error("Map not initialized when trying to render markers.");
  //       return;
  //   }
  //   this.#map.eachLayer(layer => {
  //       if (layer instanceof L.Marker) {
  //           this.#map.removeLayer(layer);
  //       }
  //   });
  //   locations.forEach(location => {
  //       const marker = L.marker([location.lat, location.lon]).addTo(this.#map);
  //       marker.bindPopup(`<b>${location.name}</b><br>${location.description}`);
  //   });
   
  // }

  // showError(message){
  //   if (this.#storiesContainer) {
  //     this.#storiesContainer.innerHTML = `<p class="error-message">${message}</p>`;
  //   } else {
  //      // Fallback jika container cerita tidak ada
  //     const body = document.querySelector('body');
  //     if(body) {
  //         const errorDiv = document.createElement('div');
  //         errorDiv.className = 'error-message global-error';
  //         errorDiv.textContent = message;
  //         body.prepend(errorDiv); // Tampilkan di paling atas body
  //     }
  //      console.error("Element 'stories-container' not found, showing error globally. Message:", message);
  //   }
  //    // Mungkin juga tampilkan error di area map jika relevan
  //    const mapContainer = document.getElementById("mapContainer");
  //    if (mapContainer && !this.#mapInitialized) {
  //        mapContainer.innerHTML = `<p class="error-message">Gagal memuat cerita: ${message}</p>`;
  //    }
  // }

  showError(message) {
    if (this.#storiesContainer) {
      this.#storiesContainer.innerHTML = `<p class="error-message">${message}</p>`;
    } else {
      // Fallback jika container cerita tidak ada
      const body = document.querySelector('body');
      if (body) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message global-error';
        errorDiv.textContent = message;
        body.prepend(errorDiv); // Tampilkan di paling atas body
      }
      console.error("Element 'stories-container' not found, showing error globally. Message:", message);
    }
    
    // Tampilkan error di area map jika relevan
    const mapContainer = document.getElementById("mapContainer");
    if (mapContainer && !this.#mapInitialized) {
      mapContainer.innerHTML = `<p class="error-message">Gagal memuat peta: ${message}</p>`;
    }
  }
}
