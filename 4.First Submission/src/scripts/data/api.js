import CONFIG from '../config';
import { getAuthToken } from '../utils/auth';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN : `${CONFIG.BASE_URL}/login`,
  STORIES : `${CONFIG.BASE_URL}/stories`
};

export async function registerUser(userData){
  const response = await fetch(ENDPOINTS.REGISTER,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(userData)
  })
  return response.json();
}

export async function loginUser(userData) {
  const response = await fetch(ENDPOINTS.LOGIN,{
    method:"POST",
    headers:{
      "Content-Type" : "application/json"
    },
    body: JSON.stringify(userData)
  })
  return response.json();
}

export async function getAllStories() {
  const response = await fetch(ENDPOINTS.STORIES,{
    headers : {
      "Authorization" :`Bearer ${getAuthToken()}` 
    }
  })
  return response.json();
}


export async function postNewStory(formData){
  const response = await fetch(ENDPOINTS.STORIES,{
    method : "POST",
    headers : {
      "Authorization" : `Bearer ${getAuthToken()}`,
    },
    body : formData
  })
  return response.json();
}