import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN : `${CONFIG.BASE_URL}/login`,
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

