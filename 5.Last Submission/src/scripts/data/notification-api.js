import CONFIG from '../config';
import { getAuthToken } from '../utils/auth';
import { getVapidKey } from '../utils/notification';

const ENDPOINTS = {
  NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

const NotificationModel = {
  async pushSubscribeNotification({ endpoint, keys: { p256dh, auth } }) {
    const response = await fetch(ENDPOINTS.NOTIFICATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        endpoint,
        keys: { p256dh, auth },
      }),
    });
    const json = await response.json();
    return {
      ...json,
      ok: response.ok,
    };
  },

  async unsubscribePushNotification({ endpoint }) {
    const response = await fetch(ENDPOINTS.NOTIFICATION, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        endpoint,
      }),
    });

    const json = await response.json();

    return {
      ...json,
      ok: response.ok,
    };
  },
};

export default NotificationModel;
