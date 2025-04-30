import AboutPage from "../pages/about-page";
import HomePage from "../pages/home-page";

const routes = {
  '/': () => new HomePage(),
  '/about': () => new AboutPage(),
};

export default routes;
