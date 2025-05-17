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

export function isServiceAvailable() {
  return 'serviceWorker' in navigator;
}

export async function reigsterServiceWorker() {
  if (!isServiceAvailable()) {
    console.log('Unsupported Service Worker');
    return;
  }

  try {
    const registration =
      await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Registration success', registration);
  } catch (error) {
    console.log('Registration failed', error);
  }
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
