
import StoryModel from "../../data/story-api";

export default class HomePresenter {
  #model;
  #view;
  #storiesData;
  
  constructor({ view }) {
    this.#model = StoryModel;
    this.#view = view;
  }

  async init() {
    try {
      this.#view.showLoading();
      
      await this.getAllStories();

      this.#view.showStories(this.#storiesData);
      this.#view.hideLoading();
      
    } catch (error) {
      console.error("Error during initialization:", error);
      this.#view.showError("Terjadi kesalahan saat memuat data.");
    }
  }

  async getAllStories() {
    try {
      const stories = await this.#model.getAllStories();
      this.#storiesData = stories.listStory || [];
      return this.#storiesData;
    } catch (error) {
      this.#view.showError("Gagal memuat cerita!");
      console.error("Error fetching stories:", error);
      return [];
    }
  }

}