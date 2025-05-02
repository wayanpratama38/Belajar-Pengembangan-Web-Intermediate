export default class StoryCard {
  constructor(story) {
    this.story = story;
  }

  #formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  render() {
    const { id, name, description, photoUrl, createdAt } = this.story;

    return `
        <article class="story-card" data-story-id="${id}" aria-label="Sebuah container kartu">
          <div class="story-image-container" aria-label="Gambar story si ${name}">
            <img 
              src="${photoUrl}" 
              alt="story ${name} " 
              class="story-image"
              loading="lazy"
              style="view-transition-name: story-image-${id}"
            >
          </div>
          <div class="story-content" aria-label="Informasi tambahan story si ${name}">
            <h3 class="story-title" style="view-transition-name: story-title-${id}" aria-label="Nama pembuat story">${name}</h3>
            <p class="story-description" aria-label="Deskripsi story" >${description}</p>
            <time datetime="${createdAt}" class="story-date" aria-label="Tanggal dibuat story">
              ${this.#formatDate(createdAt)}
            </time>
          </div>
        </article>
      `;
  }
}
