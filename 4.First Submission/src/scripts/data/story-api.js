import CONFIG from '../config';
import { getAuthToken } from '../utils/auth';

const ENDPOINTS = {
  STORIES : `${CONFIG.BASE_URL}/stories`
};

const StoryModel = {
  async getAllStories() {
    const response = await fetch(ENDPOINTS.STORIES,{
      headers : {
        "Authorization" :`Bearer ${getAuthToken()}` 
      },
      cache: "reload"
    })
    return response.json();
  },

  async postNewStory(formData){
    const response = await fetch(ENDPOINTS.STORIES,{
      method : "POST",
      headers : {
        "Authorization" : `Bearer ${getAuthToken()}`,
      },
      body : formData
    })
    return response.json();
  }
}

export default StoryModel;
