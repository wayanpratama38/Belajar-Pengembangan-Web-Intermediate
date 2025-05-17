self.addEventListener("push",(event)=>{
    console.log("Service worker working!");


    async function chainPromies() {
        await self.registration.showNotification("Cek Notif",{
            body : "Terjadi notif"
        })
    }

    event.waitUntil(chainPromies());
})