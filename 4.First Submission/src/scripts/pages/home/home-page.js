import StoryCard from "../../components/story-card";
import { getAllStories } from "../../data/story-api";
import HomePresenter from "./home-presenter";
import { StoryModel } from "../../data/story-api";

export default class HomePage {
  #presenter;
  #storiesContainer;

  async render() {
    return `
      <section class="container">
        <div class="heading--container">
          <h1>Homepage</h1>
          <p>Disini tempat dimana kamu berbagi dan melihat story!</p>
        </div>
        <div class="stories-container">
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#storiesContainer = document.querySelector(".stories-container");
    if(this.#storiesContainer){
      this.#presenter = new HomePresenter({
        view: this,
      });
      await this.#presenter.init();
    } else {
      console.log("Element dengan class 'stories-container' tidak ditemukan di DOM.")
    }
  }

  showStories(stories){
    if (this.#storiesContainer) { 
      this.#storiesContainer.innerHTML = stories
        .map((story) => new StoryCard(story).render())
        .join('');
    } else {
      console.error("Element dengan class 'stories-container' tidak ditemukan di DOM.");
    }
  }

  showError(message){
    if (this.#storiesContainer) { 
      this.#storiesContainer.innerHTML = `<p class="error-message">${message}</p>`;
    } else {
      console.error("Element dengan class 'stories-container' tidak ditemukan di DOM.");
      
    }
  }
}
