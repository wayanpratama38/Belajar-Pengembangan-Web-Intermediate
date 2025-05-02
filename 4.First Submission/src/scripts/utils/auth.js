export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthData = (data) => {
  localStorage.setItem('token', data.token);
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
};
