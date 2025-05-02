import StoryModel from '../../data/story-api';

export default class MapPresenter {
  #model;
  #view;

  constructor({ view }) {
    this.#model = StoryModel;
    this.#view = view;
  }

  async init() {
    this.#view.showLoading();
    try {
      const stories = await this.getAllStoriesLocation();

      const locations = stories
        .filter(
          (story) =>
            story.lat !== null &&
            story.lat !== undefined &&
            story.lon !== null &&
            story.lon !== undefined
        )
        .map((story) => ({
          id: story.id,
          name: story.name,
          description: story.description,
          lat: story.lat,
          lon: story.lon,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
        }));

      this.#view.renderMapMarkers(locations);
    } catch (error) {
      console.log('ERROR :', error);
      this.#view.showError(error);
    } finally {
      this.#view.hideLoading();
    }
  }

  async getAllStoriesLocation() {
    try {
      const stories = await this.#model.getAllStoriesLocation();
      return stories.listStory || [];
    } catch (error) {
      this.#view.showError('Gagal memuat cerita!');
      console.error('Error fetching stories:', error);
      return [];
    }
  }
}
