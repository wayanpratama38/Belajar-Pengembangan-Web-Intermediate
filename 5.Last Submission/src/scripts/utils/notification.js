export function getVapidKey(){
    return process.env.VAPID_KEY;
}

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted(){
    return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
    if(!isNotificationAvailable()){
        console.error("Notification API Unsupported!");
        return false;
    }

    if (isNotificationGranted()){
        return true;
    }

    const status = await Notification.requestPermission();

    if(status === 'denied'){
        alert("Izin notifikasi ditolak");
        return false;
    } 

    if(status === 'default') { 
        alert("Izin notifikasi ditutup atau diabaikan")
        return false;
    }

    return true;
}


export async function getPushSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    return await registration.pushManager.getSubscription()
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
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
}