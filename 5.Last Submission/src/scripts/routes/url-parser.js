import routes from './routes';
import { isLoggedIn } from '../utils/auth';

let activeComponent = null;

function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/homepage';
}

export function getActivePathname() {
  const rawHash = location.hash.replace('#', '');
  if (rawHash === '/' || rawHash === '') {
    return '/homepage';
  }
  return rawHash;
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}

export function resolveRoute() {
  const path = getActivePathname();
  const routePattern = getActiveRoute();
  const route = routes[routePattern];

  if (activeComponent && typeof activeComponent.destroy === 'function') {
    activeComponent.destroy();
  }

  if (route?.authRequired && !isLoggedIn()) {
    return { redirect: '#/login' };
  }

  if (route?.redirectIfAuth && isLoggedIn()) {
    return { redirect: '#/homepage' };
  }

  return route || routes['#/homepage'];
}
