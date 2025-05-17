import StoryCard from '../../components/story-card';
import HomePresenter from './home-presenter';
import LightboxManager from '../../components/lightbox-manager';
import Swal from "sweetalert2";

export default class HomePage {
  #presenter;
  #storiesContainer;
  #loadingIndicator = null;
  #globalLoadingOverlay = null;
  #lightboxManager;
  #skipLinkHandler = null;
  #clearCache = null;

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
        <div id="delete-cache-container">
          <button id="delete-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3-4q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17" />
            </svg>
            <span>
              Hapus Local Story!
            </span>
          </button>
        </div>
        <div class="stories-container" aria-label="Container story pengguna">
          <div class="loading-indicator" aria-label="Loading memuat cerita">Memuat cerita...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#storiesContainer = document.querySelector('.stories-container');
    this.#loadingIndicator = document.querySelector('.loading-indicator');
    this.#globalLoadingOverlay = document.getElementById(
      'globalLoadingOverlay'
    );

    if (!this.#storiesContainer) {
      console.error('DOM stories-container belum ada!');
      return;
    }

    this.#storiesContainer.setAttribute('tabindex', '-1');

    this.#setupSkipLink();

    this.hideLoading();
    this.#lightboxManager = new LightboxManager();
    this.#presenter = new HomePresenter({ view: this });
    try {
      this.showLoading();
      await this.#presenter.init();
    } catch (error) {
      console.error('Error initializing HomePresenter:', error);
      this.showError('GAGAl MEMUAT CERITA');
      this.hideLoading();
    }
    
    this.#clearCache = document.getElementById("delete-btn");
    this.#clearCache.addEventListener("click",()=>{
      // await this.#presenter.clearCache();
      Swal.fire({
        title:"Apakah ingin menghapus cache?",
        text : "Perlu koneksi internet kembali untuk mendapatkan asset yang terdownload!",
        icon: "warning",
        showCancelButton : true,
        confirmButtonColor : "#3085d6",
        cancelButtonColor : "#d33",
        confirmButtonText : "Iya, hapus cache",
        cancelButtonText: "Jangan hapus cache"
      }).then(async (result)=>{
        if(result.isConfirmed){
          // await this.#presenter.clearCache();
          Swal.fire({
            title : "Cache sudah terhapus",
            text : "File asset sudah terhapus",
            icon : "success"
          })
        }
      })
    })
  }

  #setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      if (this.#skipLinkHandler) {
        skipLink.removeEventListener('click', this.#skipLinkHandler);
      }

      this.#skipLinkHandler = (event) => {
        setTimeout(() => {
          if (this.#storiesContainer) {
            const firstStoryCard =
              this.#storiesContainer.querySelector('.story-card');
            const noStoriesMessage = this.#storiesContainer.querySelector('p');

            if (firstStoryCard) {
              firstStoryCard.focus({ preventScroll: true });
            } else if (noStoriesMessage) {
              if (!noStoriesMessage.hasAttribute('tabindex')) {
                noStoriesMessage.setAttribute('tabindex', '-1');
              }
              noStoriesMessage.focus({ preventScroll: true });
            } else {
              this.#storiesContainer.focus({ preventScroll: true });
            }
          }
        }, 0);
      };
      skipLink.addEventListener('click', this.#skipLinkHandler);
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
      this.#storiesContainer.innerHTML =
        '<p>Belum ada cerita untuk ditampilkan.</p>';
      return;
    }

    this.#storiesContainer.innerHTML = stories
      .map((story) => new StoryCard(story).render())
      .join('');
  }

  attachStoryCardListeners(stories) {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = card.dataset.storyId;
        const story = stories.find((s) => s.id === storyId);
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
