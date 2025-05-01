import StoryCard from "../../components/story-card";
import { getAllStories } from "../../data/api";

export default class HomePage {
  async render() {
    const stories = await getAllStories();
    return `
      <section class="container">
        <div class="heading--container">
          <h1>Homepage</h1>
          <p>Disini tempat dimana kamu berbagi dan melihat story!</p>
        </div>
        <div class="stories-container">
          ${stories.listStory.map(story => `
            ${new StoryCard(story).render()}
          `).join('')}
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
