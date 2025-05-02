import StoryCard from "../../components/story-card";
import HomePresenter from "./home-presenter";
import LightboxManager from "../../components/lightbox-manager";

export default class HomePage {
  #presenter;
  #storiesContainer;
  #loadingIndicator = null;
  #globalLoadingOverlay = null;
  #lightboxManager;

  async render() {
    return `
      <section class="container view-transition-content">
        <div id="globalLoadingOverlay" class="global-loading-overlay" aria-label="Loading content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Memuat konten...</div>
        </div>
        <div class="heading--container" aria-label="Heading container">
          <h1 aria-label="Homepage">Homepage</h1>
          <p aria-label="Deskripsi homepage" >Disini tempat dimana kamu berbagi dan melihat story!</p>
        </div>
        <div class="stories-container" aria-label="Container story pengguna">
          <div class="loading-indicator" aria-label="Loading memuat cerita">Memuat cerita...</div>
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

    this.hideLoading();
    this.#lightboxManager = new LightboxManager();
    this.#presenter = new HomePresenter({ view: this });
    try{
      this.showLoading();
      await this.#presenter.init();
    } catch (error) {
      console.error("Error initializing HomePresenter:", error);
      this.showError("GAGAl MEMUAT CERITA");
      this.hideLoading();
    }
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


  attachStoryCardListeners(stories) {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = card.dataset.storyId;
        const story = stories.find(s => s.id === storyId);
        if (story) {
          if (document.startViewTransition) {
            document.startViewTransition(() => {
              this.#lightboxManager.openLightbox(story);
            });
          } else {
            this.#lightboxManager.openLightbox(story);
          }
        }
      });
    });
  }


  showError(message) {
    this.hideLoading();
    console.log(message);
  }
}