import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import RegisterPage from '../pages/register/register-page.js';
import LoginPage from '../pages/login/login-page.js';
import AddStoryPage from '../pages/add-story/add-story-page.js';

const routes = {
  '/homepage': {
    component : new HomePage(),
    authRequired : true,
    title : "Home"
  },
  '/about':{
    component : new AboutPage(),
    authRequired : true,
    title : "About"
  },
  '/add-story':{
    component : new AddStoryPage(),
    authRequired : true,
    title : "Add Story"
  },
  '/login' :{
    component : new LoginPage(),
    authRequired : false,
    redirectIfAuth: true,
    title : "Login"
  },
  '/register' : {
    component : new RegisterPage(),
    authRequired : false,
    redirectIfAuth: true,
    title : "Register"
  }
};

export default routes;
