
import StoryModel from "../../data/story-api";

export default class HomePresenter {
  #model;
  #view;
  #storiesData;
  #dataLoaded = false;
  
  constructor({ view }) {
    this.#model = StoryModel;
    this.#view = view;
  }

  async init() {
    try {
      // Show loading state
      this.#view.showLoading();
      
      // Fetch stories data
      await this.getAllStories();
      
      // Mark data as loaded
      this.#dataLoaded = true;
      
      // Display stories and hide loading
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
  
  // Refresh data and update stories
  async refreshData() {
    try {
      this.#view.showLoading();
      this.#dataLoaded = false;
      
      await this.getAllStories();
      this.#dataLoaded = true;
      
      this.#view.showStories(this.#storiesData);
      this.#view.hideLoading();
    } catch (error) {
      console.error("Error refreshing data:", error);
      this.#view.showError("Gagal memperbarui data!");
    }
  }
}