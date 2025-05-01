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

  async afterRender() {
    this.#storiesContainer = document.querySelector(".stories-container");
    const mapElement = document.getElementById("mapContainer");

    if (!this.#storiesContainer || !mapElement) {
      console.error("Required elements not found in DOM.");
      return; 
    }


    if(this.#storiesContainer){
      this.#presenter = new HomePresenter({
        view: this,
      });
      await this.#presenter.init();
      const mapLink = document.querySelector('a[href="#mapContainer"]');
      if (mapLink) {
          mapLink.addEventListener('click', (event) => {
              event.preventDefault();
              mapElement.scrollIntoView({ behavior: 'smooth' });
          });
      }
    } else {
      console.log("Element dengan class 'stories-container' tidak ditemukan di DOM.")
    }
  }

  showStories(stories){
    if (this.#storiesContainer) { 
      this.#storiesContainer.innerHTML = stories
        .map((story) => new StoryCard(story).render())
        .join('');
        this.#initMap();
    } else {
      console.error("Element dengan class 'stories-container' tidak ditemukan di DOM.");
    }
  }

  #initMap(){
    const mapContainer = document.getElementById("mapContainer");
    if(!mapContainer) return;
    if (!this.#map) {
      try{
          this.#map = L.map("mapContainer").setView([-3.0, 118.0], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
      } catch (error) {
        console.log("INIT MAP",error)
      }
    
    }
  }

  renderMapMarkers(locations) {
    if (!this.#map) {
        console.error("Map not initialized when trying to render markers.");
        return;
    }
    this.#map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            this.#map.removeLayer(layer);
        }
    });
    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lon]).addTo(this.#map);
        marker.bindPopup(`<b>${location.name}</b><br>${location.description}`);
    });
  }

  showError(message){
    if (this.#storiesContainer) { 
      this.#storiesContainer.innerHTML = `<p class="error-message">${message}</p>`;
    } else {
      console.error("Element dengan class 'stories-container' tidak ditemukan di DOM.");
      
    }
  }
}
