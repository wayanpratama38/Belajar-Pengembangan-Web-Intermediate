import AboutPage from "../pages/about/about-page.js";
import HomePage from "../pages/home/home-page.js";

const routes = {
  '/': () => new HomePage(),
  '/about': () => new AboutPage(),
};

export default routes;
