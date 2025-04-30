import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
};

export default routes;
