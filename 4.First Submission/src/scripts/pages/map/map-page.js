import MapPresenter from './map-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default class MapPage {
  #presenter;
  #map;
  #storiesLayer;
  #loadingOverlay;
  #errorMessageElement;

  async render() {
    return `
      <section class="container view-transition-content">
        <div id="globalLoadingOverlay" class="global-loading-overlay">
          <div class="loading-spinner"></div>
          <div class="loading-text">Memuat konten...</div>
        </div>
        <div class="heading--container" aria-label="Heading Container">
          <h1 aria-label="Map page">Map Page</h1>
          <p aria-label="Deskripsi map page">Disini kamu terlihat di peta!</p>
        </div>
        <div id="mapContainer">
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#loadingOverlay = document.getElementById('globalLoadingOverlay');
    this.#errorMessageElement = document.getElementById('storyError');

    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
      console.error('View: Map container element not found!');
      this.showError('Gagal menampilkan peta: Elemen peta tidak ditemukan.');
      this.hideLoading();
      return;
    }

    this.#initMap();

    this.#presenter = new MapPresenter({ view: this });
    await this.#presenter.init();
  }

  #initMap() {
    this.#map = L.map('mapContainer').setView([-3.0, 118.0], 5);

    const osmStandard = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    const openTopoMap = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 17,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      }
    );

    const cartoDbPositron = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
      }
    );

    const cartoDbDarkMatter = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
      }
    );

    const baseLayers = {
      'OpenStreetMap Standard': osmStandard,
      OpenTopoMap: openTopoMap,
      'Carto DB Positron': cartoDbPositron,
      'Carto DB Dark Matter': cartoDbDarkMatter,
    };

    this.#storiesLayer = L.featureGroup();

    const overlayLayers = {
      'Lokasi Cerita': this.#storiesLayer,
    };

    L.control.layers(baseLayers, overlayLayers).addTo(this.#map);

    osmStandard.addTo(this.#map);

    this.#storiesLayer.addTo(this.#map);

    this.#map.invalidateSize();
  }

  renderMapMarkers(locations) {
    if (!this.#map || !this.#storiesLayer) {
      console.error('Belum terinisialisasi');
      return;
    }

    this.#storiesLayer.clearLayers();

    locations.forEach((location) => {
      if (location && location.lat !== null && location.lon !== null) {
        const marker = L.marker([location.lat, location.lon]);

        let popupContent = `<b>${location.name || 'Tanpa Nama'}</b>`;
        if (location.description) {
          const shortDescription =
            location.description.substring(0, 20) +
            (location.description.length > 20 ? '...' : '');
          popupContent += `<br>${shortDescription}`;
        }
        if (location.photoUrl) {
          popupContent += `<br><img src="${location.photoUrl}" alt="Gambar story ${location.nama}" aria-label="Lokasi cerita: Nama lokasi" class="image-popup">`;
        }

        if (location.createdAt) {
          const date = new Date(location.createdAt).toLocaleDateString('id-ID');
          popupContent += `<br><small>${date}</small>`;
        }
        marker.bindPopup(popupContent);
        marker.addTo(this.#storiesLayer);
      } else {
        console.warn('skip, karena tidak valid', location);
      }
    });

    if (this.#storiesLayer.getLayers().length > 0) {
      try {
        const bounds = this.#storiesLayer.getBounds();
        if (bounds.isValid()) {
          this.#map.fitBounds(bounds, { padding: [50, 50] });
        } else if (this.#storiesLayer.getLayers().length === 1) {
          this.#map.setView(this.#storiesLayer.getLayers()[0].getLatLng(), 10);
        } else {
          this.#map.setView([-3.0, 118.0], 5);
        }
      } catch (error) {
        console.error('Error waktu bound : ', error);
        this.#map.setView([-3.0, 118.0], 5);
      }
    } else {
      this.#map.setView([-3.0, 118.0], 5);
    }
  }

  showLoading() {
    if (this.#loadingOverlay) {
      this.#loadingOverlay.style.display = 'flex';
    }
    this.hideError();
  }

  hideLoading() {
    if (this.#loadingOverlay) {
      this.#loadingOverlay.style.display = 'none';
    }
  }

  showError(message) {
    console.error('Pesan error', message);
    if (this.#errorMessageElement) {
      this.#errorMessageElement.textContent = message;
      this.#errorMessageElement.style.display = 'block';
    }

    this.hideLoading();

    if (this.#storiesLayer) this.#storiesLayer.clearLayers();
    if (this.#map) this.#map.setView([-3.0, 118.0], 5);
  }

  hideError() {
    if (this.#errorMessageElement) {
      this.#errorMessageElement.textContent = '';
      this.#errorMessageElement.style.display = 'none';
    }
  }
}
