import { resolveRoute } from '../routes/url-parser';
import { clearAuthData, isLoggedIn } from '../utils/auth';


class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer; 

    if(window.location.hash === "#/" || window.location.hash === "" || window.location.hash==="/#"){
      window.location.hash = "#/homepage";
    }
    this._setupDrawer();
    this.renderPage()
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  _updateNavigation(){
    const authLinks = isLoggedIn() ? `
      <li><a href="#/homepage">Homepage</a></li>
      <li><a href="#/about">About</a></li>
      <li><button id="logoutBtn" >Logout</button></li>
    ` : `
      <li><a href="#/login">Login</a></li>
      <li><a href="#/register">Register</a></li>
    `;
    const navList = this.#navigationDrawer.querySelector('.nav-list');
    navList.innerHTML = authLinks;

    const logoutBtn = this.#navigationDrawer.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearAuthData();
        window.location.hash = '#/login';
        console.log("LOGOUT SUCCESS!")
      });
    }
  }

  async renderPage() {
    const routeInfo = resolveRoute();

    const { component } = routeInfo;

    this._updateNavigation();

    this.#content.innerHTML = await component.render();
    await component.afterRender();

    document.title = routeInfo.title
  }
}

export default App;
