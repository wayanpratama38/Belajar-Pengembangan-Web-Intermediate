export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function isServiceAvailable(){
  return 'serviceWorker' in navigator;
}

export async function reigsterServiceWorker() {
  if(!isServiceAvailable()){
    console.log("Unsupported Service Worker");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.bundle.js");
    console.log("Registration success",registration);
  } catch (error) {
    console.log("Registration failed",error);
  }
  
}