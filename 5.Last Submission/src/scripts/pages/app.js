import { getActivePathname, resolveRoute } from '../routes/url-parser';
import { clearAuthData, isLoggedIn } from '../utils/auth';
import { isServiceAvailable } from '../utils';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
} from '../utils/notification';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;
  #subscribeListener = null;

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
    // this._setupSubscriptionEventListener();
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
      <li>
      <button id="notification-btn" aria-label="Tombol Notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <g fill="none">
              <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
              <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7v3.528a1 1 0 0 1-.105.447l-1.717 3.433A1.1 1.1 0 0 0 4.162 18h15.676a1.1 1.1 0 0 0 .984-1.592l-1.716-3.433a1 1 0 0 1-.106-.447V9a7 7 0 0 0-7-7m0 19a3 3 0 0 1-2.83-2h5.66A3 3 0 0 1 12 21" />
            </g>
          </svg>
          <span id="notify-txt">Notify Me</span>
      </button>
      </li>
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

  // _setupSubscriptionEventListener() {
  //   document.addEventListener('subcribe-complete', (event) => {
  //     console.log('App.js: Event "subcribe-complete" diterima!', event.detail);
  //     const { success } = event.detail;

  //     const notifyText = document.getElementById("notify-txt")
  //     if(success){
  //       notifyText.innerText = "Notified!"
  //     }
  //   });
  // }

  async #setUpPushNotification() {
    const notificationButton = document.getElementById('notification-btn');

    notificationButton.addEventListener('click', () => {
      subscribe();
    });

    const notifyTxt = document.getElementById('notify-txt');
    isCurrentPushSubscriptionAvailable().then((isSubscribe) => {
      if (isSubscribe) {
        notifyTxt.innerText = 'Notified!';
      } else {
        notifyTxt.innerText = 'Notify Me';
      }
    });
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

    if (isServiceAvailable()) {
      this.#setUpPushNotification();
    }

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
