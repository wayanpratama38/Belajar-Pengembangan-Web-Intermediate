import HomePage from '../pages/home/home-page.js';
import RegisterPage from '../pages/register/register-page.js';
import LoginPage from '../pages/login/login-page.js';
import AddStoryPage from '../pages/add-story/add-story-page.js';
import MapPage from '../pages/map/map-page.js';

const routes = {
  '/homepage': {
    component: new HomePage(),
    authRequired: true,
    title: 'Home',
  },
  '/map': {
    component: new MapPage(),
    authRequired: true,
    title: 'Map',
  },
  '/add-story': {
    component: new AddStoryPage(),
    authRequired: true,
    title: 'Add Story',
  },
  '/login': {
    component: new LoginPage(),
    authRequired: false,
    redirectIfAuth: true,
    title: 'Login',
  },
  '/register': {
    component: new RegisterPage(),
    authRequired: false,
    redirectIfAuth: true,
    title: 'Register',
  },
};

export default routes;
