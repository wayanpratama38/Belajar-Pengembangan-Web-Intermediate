import NotificationModel from '../data/notification-api';
import { convertBase64ToUint8Array } from './index';
import CONFIG from '../config';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API Unsupported!');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }

  console.log('Mulai berlangganan push notification...');

  const failureSubscribeMessage =
    'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage =
    'Langganan push notification berhasil diaktifkan.';

  let pushSubscription;

  let eventDetail = {
    success: false,
    alreadySubscribed: false,
  };

  document.dispatchEvent(
    new CustomEvent('subcribe-complete', {
      detail: eventDetail,
    })
  );
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
        console.error('Service worker not active or not found.');
        alert('Service worker not ready. Please try again in a moment.');
        return;
    }
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();

    // alert(successSubscribeMessage)

    const response = await NotificationModel.pushSubscribeNotification({
      endpoint,
      keys,
    });

    if (!response.ok) {
      console.error('subscribe : response ', response);
      alert(failureSubscribeMessage);
      await pushSubscription.unsubscribe();
      return;
    }
    eventDetail.success = true;
    eventDetail.alreadySubscribed = true;
    alert(successSubscribeMessage);
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureSubscribeMessage);

    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
  }
}
