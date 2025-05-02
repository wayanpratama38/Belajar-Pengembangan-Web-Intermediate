export default class LightboxManager {
  constructor() {
    this.lightbox = null;
    this.lightboxContainer = null;
    this.lightboxImage = null;
    this.lightboxContent = null;
    this.isOpen = false;
    this.currentStory = null;
    this.originalCard = null;
  }

  openLightbox(story) {
    this.currentStory = story;

    if (!this.lightbox) {
      this.createLightbox();
    }

    this.originalCard = document.querySelector(
      `.story-card[data-story-id="${story.id}"]`
    );

    this.updateLightboxContent(story);

    document.body.appendChild(this.lightbox);
    document.body.style.overflow = 'hidden';

    this.isOpen = true;
  }

  updateLightboxContent(story) {
    if (!this.lightboxImage || !this.lightboxContent) return;

    this.lightboxImage.src = story.photoUrl;
    this.lightboxImage.alt = story.title;

    const titleEl = this.lightboxContent.querySelector('.lightbox-title');
    const descriptionEl = this.lightboxContent.querySelector(
      '.lightbox-description'
    );
    const dateEl = this.lightboxContent.querySelector('.lightbox-date');

    if (titleEl) titleEl.textContent = story.name;
    if (descriptionEl) descriptionEl.textContent = story.description;
    if (dateEl)
      dateEl.textContent = new Date(story.createdAt).toLocaleDateString();
  }

  closeLightbox() {
    if (!this.isOpen || !this.lightbox || !this.lightboxContainer) return;

    if (document.startViewTransition) {
      return this.closeLightboxWithViewTransition();
    } else {
      this.removeFromDOM();
    }
  }

  closeLightboxWithViewTransition() {
    return document.startViewTransition(() => {
      this.removeFromDOM();
    }).finished;
  }

  removeFromDOM() {
    if (this.lightbox && this.lightbox.parentNode) {
      this.lightbox.parentNode.removeChild(this.lightbox);
    }
    document.body.style.overflow = '';
    this.isOpen = false;
  }

  createLightbox() {
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'lightbox';

    this.lightbox.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-container">
        <button class="lightbox-close-btn">&times;</button>
        <div class="lightbox-content">
          <div class="lightbox-image-container">
            <img class="lightbox-image" src="" alt="Story image">
          </div>
          <div class="lightbox-info">
            <h2 class="lightbox-title"></h2>
            <p class="lightbox-description"></p>
            <span class="lightbox-date"></span>
          </div>
        </div>
      </div>
    `;

    this.lightboxContainer = this.lightbox.querySelector('.lightbox-container');
    this.lightboxImage = this.lightbox.querySelector('.lightbox-image');
    this.lightboxContent = this.lightbox.querySelector('.lightbox-content');

    const overlay = this.lightbox.querySelector('.lightbox-overlay');
    const closeBtn = this.lightbox.querySelector('.lightbox-close-btn');

    const closeHandler = (e) => {
      e.stopPropagation();
      this.closeLightbox();
    };

    if (overlay) overlay.addEventListener('click', closeHandler);
    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
  }
}
