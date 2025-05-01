import routes from "./routes";
import { isLoggedIn } from "../utils/auth";

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

  return pathname || '/';
}

export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
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

  // Auth check logic
  if (route?.authRequired && !isLoggedIn()) {
    return { redirect: '#/login' };
  }
  
  if (route?.redirectIfAuth && isLoggedIn()) {
    return { redirect: '#/' };
  }

  return route || routes["/"];
}
