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
    let displayedStoriesFromCache = false;
    try {
      this.#view.showLoading();

      // Attempt to load and display stories from cache for a quick initial view
      const cachedStories = await this.#dbModel.getAllStoriesFromDB();
      if (cachedStories && cachedStories.length > 0) {
        this.#storiesData = cachedStories;
        this.#prepareStoriesArray();
        this.#view.showStories(this.#storiesArray);
        // Note: Listeners will be attached after fresh data is processed.
        displayedStoriesFromCache = true;
      }

      // Always attempt to fetch fresh stories from the server.
      // This also updates the local DB cache via fetchAndCacheStoriesFromServer.
      const freshStories = await this.fetchAndCacheStoriesFromServer();

      // Determine what to display finally:
      if (freshStories && freshStories.length > 0) {
        this.#storiesData = freshStories; // Prioritize fresh data
      } else if (!displayedStoriesFromCache) {
        // Neither cache nor fresh data available (e.g., first load offline, API error)
        this.#storiesData = []; 
      }
      // If freshStories fetch failed but cache was already shown, this.#storiesData remains as cachedStories.

      this.#prepareStoriesArray(); // Prepare based on the final decision for this.#storiesData
      this.#view.showStories(this.#storiesArray);
      this.#view.attachStoryCardListeners(this.#storiesArray); // Attach listeners to the final rendered stories

    } catch (e) {
      console.error('Unexpected error in HomePresenter init:', e);
      this.#view.showError('Kesalahan tidak terduga saat memuat halaman.');
      this.#storiesData = []; // Reset
      this.#prepareStoriesArray();
      this.#view.showStories(this.#storiesArray); 
    } finally {
      this.#view.hideLoading();
    }
  }

  async clearCache(){
    await this.#dbModel.clearAllStories();
    // Optionally, you might want to refresh the view after clearing
    // For example, by calling init() again or a specific refresh method
    // await this.init(); // This would re-fetch from server if cache is now empty
    // Or show a message:
    this.#view.showStories([]); // Clear current stories from view
    this.#view.showError('Cache telah dihapus. Data akan dimuat dari server saat berikutnya.');
  }

  async fetchAndCacheStoriesFromServer() {
    try {
      const response = await this.#model.getAllStories(); // API call
      if (response && response.listStory) {
        // Even if listStory is empty, we should save it to reflect server state.
        await this.#dbModel.putAllStory(response.listStory); // Update DB
        if (response.listStory.length === 0) {
          console.log('Server returned no stories. Cache updated accordingly.');
        }
        return response.listStory; // Return fresh data (could be an empty array)
      }
      // API response was not in the expected format or was missing.
      this.#view.showError('Gagal memproses data cerita dari server.');
      console.warn('Unexpected API response structure or missing listStory:', response);
      return []; // Return empty array indicating failure to get valid data
    } catch (error) {
      // Network error or other error during API call.
      // Service worker (NetworkFirst) might have served stale from its cache if network truly failed.
      // This error implies either true network failure not covered by SW cache, or an API error status.
      this.#view.showError('Gagal mengambil data cerita terbaru dari server. Menampilkan data dari cache jika tersedia.');
      console.error('Error fetching stories from server (fetchAndCacheStoriesFromServer):', error);
      // Return empty array, init() will decide if to stick with previously loaded cached data.
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
