import NotificationModel from '../../data/notification-api';
import StoryModel from '../../data/story-api';
import Database from '../../database';

export default class HomePresenter {
  #model;
  #dbModel;
  #view;
  #storiesData;
  #storiesArray = [];

  constructor({ view }) {
    this.#model = StoryModel;
    this.#view = view;
    this.#dbModel = Database;
  }

  async init() {
    try {
      this.#view.showLoading();

      await this.getAllStories();
      const dbStories = await this.#dbModel.getAllStoriesFromDB();
      if(dbStories && dbStories.length>0){
        this.#storiesData = dbStories;
      }


      this.#prepareStoriesArray();
      this.#view.showStories(this.#storiesData);
      this.#view.attachStoryCardListeners(this.#storiesArray);
      this.#view.hideLoading();
    } catch (error) {
      console.error('Error during initialization:', error);
      this.#view.showError('Terjadi kesalahan saat memuat data.');
    }
  }

  async clearCache(){
    await this.#dbModel.clearAllStories();
  }
  async getAllStories() {
    try {
      const stories = await this.#model.getAllStories();
      // const storiesFromDB = await this.#dbModel.getAllStoriesFromDB();
      // if(storiesFromDB && storiesFromDB.length > 0){
      //   this.#storiesData = storiesFromDB || [];
      //   return this.#storiesData;
      // }else{
      await this.#dbModel.putAllStory(stories.listStory);
      this.#storiesData = stories.listStory || [];
      return this.#storiesData;
    } catch (error) {
      this.#view.showError('Gagal memuat cerita!');
      console.error('Error fetching stories:', error);
      return [];
    }
  }


  #prepareStoriesArray() {
    if (Array.isArray(this.#storiesData)) {
      this.#storiesArray = this.#storiesData;
    } else if (this.#storiesData && typeof this.#storiesData === 'object') {
      if (
        this.#storiesData.listStory &&
        Array.isArray(this.#storiesData.listStory)
      ) {
        this.#storiesArray = this.#storiesData.listStory;
      } else if (Object.values(this.#storiesData).some(Array.isArray)) {
        for (const key in this.#storiesData) {
          if (Array.isArray(this.#storiesData[key])) {
            this.#storiesArray = this.#storiesData[key];
            break;
          }
        }
      } else {
        this.#storiesArray = Object.values(this.#storiesData).filter(
          (item) => item && typeof item === 'object'
        );
      }
    } else {
      this.#storiesArray = [];
      console.warn('Data stories bukan array atau object:', this.#storiesData);
    }
  }
}
