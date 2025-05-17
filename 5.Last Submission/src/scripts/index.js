// CSS imports
import '../styles/main.css';
import App from './pages/app'; // Pastikan path ini benar
import { reigsterServiceWorker } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  await reigsterServiceWorker();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
