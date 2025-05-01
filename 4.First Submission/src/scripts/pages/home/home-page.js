import StoryCard from "../../components/story-card";
import HomePresenter from "./home-presenter";

export default class HomePage {
  #presenter;
  #storiesContainer;
  #loadingIndicator = null;
  #globalLoadingOverlay = null;
  async render() {
    return `
      <section class="container">
        <div id="globalLoadingOverlay" class="global-loading-overlay">
          <div class="loading-spinner"></div>
          <div class="loading-text">Memuat konten...</div>
        </div>
        <div class="heading--container">
          <h1>Homepage</h1>
          <p>Disini tempat dimana kamu berbagi dan melihat story!</p>
        </div>
        <div class="stories-container">
          <div class="loading-indicator">Memuat cerita...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#storiesContainer = document.querySelector(".stories-container");
    this.#loadingIndicator = document.querySelector(".loading-indicator");
    this.#globalLoadingOverlay = document.getElementById("globalLoadingOverlay");

    if (!this.#storiesContainer) {
      console.error("DOM stories-container belum ada!");
      return;
    }

    this.#presenter = new HomePresenter({ view: this });
    
    await this.#presenter.init();
  }
  
  

  showLoading() {
    if (this.#globalLoadingOverlay) {
      this.#globalLoadingOverlay.style.display = 'flex';
    }
    
    if (this.#loadingIndicator) {
      this.#loadingIndicator.style.display = 'block';
    }
  }

  hideLoading() {
    if (this.#globalLoadingOverlay) {
      this.#globalLoadingOverlay.style.display = 'none';
    }
    
    if (this.#loadingIndicator) {
      this.#loadingIndicator.style.display = 'none';
    }
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

  showError(message) {
    this.hideLoading();
    console.log(message);
  }
}