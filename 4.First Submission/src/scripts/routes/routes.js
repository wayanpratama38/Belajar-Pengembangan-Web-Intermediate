import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import RegisterPage from '../pages/register/register-page.js';
import LoginPage from '../pages/login/login-page.js';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login' : new LoginPage(),
  '/register' : new RegisterPage()
};

export default routes;
