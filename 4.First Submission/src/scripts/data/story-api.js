import CONFIG from '../config';
import { getAuthToken } from '../utils/auth';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

const StoryModel = {
  async getAllStories() {
    const size = 12;
    const response = await fetch(`${ENDPOINTS.STORIES}?size=${size}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      cache: 'reload',
    });
    return response.json();
  },

  async postNewStory(formData) {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return response.json();
  },

  async getAllStoriesLocation() {
    const locationEnable = 1;
    const size = 5;
    const response = await fetch(
      `${ENDPOINTS.STORIES}?location=${locationEnable}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        cache: 'reload',
      }
    );
    return response.json();
  },
};

export default StoryModel;
