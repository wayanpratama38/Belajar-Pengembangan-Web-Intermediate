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
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    }
  
    render() {
      const { name, description, photoUrl, createdAt } = this.story;
      
      return `
        <article class="story-card">
          <div class="story-image-container">
            <img 
              src="${photoUrl}" 
              alt="${name}'s story" 
              class="story-image"
              loading="lazy"
            >
          </div>
          <div class="story-content">
            <h3 class="story-title">${name}</h3>
            <p class="story-description">${description}</p>
            <time datetime="${createdAt}" class="story-date">
              ${this.#formatDate(createdAt)}
            </time>
          </div>
        </article>
      `;
    }
  }