import { getActivePathname, resolveRoute } from '../routes/url-parser';
import { clearAuthData, isLoggedIn } from '../utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    if (
      window.location.hash === '#/' ||
      window.location.hash === '' ||
      window.location.hash === '/#'
    ) {
      window.location.hash = '#/homepage';
    }

    this._setupDrawer();
    this.renderPage();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const path = event.composedPath();
      const isClickInsideDrawer = path.some(
        (el) => el === this.#navigationDrawer
      );
      const isClickOnButton = path.some((el) => el === this.#drawerButton);

      if (!isClickInsideDrawer && !isClickOnButton) {
        this.#navigationDrawer.classList.remove('open');
      }

      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _updateNavigation() {
    const authLinks = isLoggedIn()
      ? `
      <li><a href="#/homepage" aria-label="Tombol ke Homepage" >Homepage</a></li>
      <li><a href="#/map" aria-label="Tombol ke Map Page">Map</a></li>
      <li><a href="#/add-story" aria-label="Tombol ke Add Story Page">Add Story</a><li>
      <li><button id="logoutBtn" aria-label="Tombol Log Out">Logout</button></li>
    `
      : `
      <li><a href="#/login" aria-label="Tombol Ke Login Page">Login</a></li>
      <li><a href="#/register" aria-label="Tombol ke Register Page">Register</a></li>
    `;
    const navList = this.#navigationDrawer.querySelector('.nav-list');
    navList.innerHTML = authLinks;

    const logoutBtn = this.#navigationDrawer.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearAuthData();
        window.location.hash = '#/login';
        console.log('LOGOUT SUCCESS!');
      });
    }
  }

  async renderPage() {
    const routeInfo = resolveRoute();

    this._updateNavigation();

    if (routeInfo.redirect) {
      window.location.hash = routeInfo.redirect;
    }

    if (this.#currentPage && typeof this.#currentPage.destroy === 'function') {
      try {
        this.#currentPage.destroy();
      } catch (error) {
        console.error('Erro dalam destroy sebelumnya:', error);
      }
    }

    this.#currentPage = null;

    if (routeInfo.component) {
      this.#currentPage = routeInfo.component;

      this.#content.innerHTML = await this.#currentPage.render();
      await this.#currentPage.afterRender();
      document.title = routeInfo.title || 'App';
    } else {
      this.#content.innerHTML = '<p>Page not found</p>';
      document.title = 'Not Found';
      this.#currentPage = null;
    }
  }
}

export default App;
