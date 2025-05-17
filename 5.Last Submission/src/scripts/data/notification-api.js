import CONFIG from '../config';
import { getAuthToken } from '../utils/auth';
import {getVapidKey} from "../utils/notification"

const ENDPOINTS = {
  NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};


const NotificationModel  = {
    async pushSubscribeNotification(){
        const response = await fetch(ENDPOINTS.NOTIFICATION,{
            method:"POST",
            headers: {
                "Authorization" : `Bearer ${getAuthToken()}`,
                "Content-Type" : 'application/json'
            },
            body : {
                "endpoint" : ENDPOINTS.NOTIFICATION,
                
            }
        })
    }
}