self.addEventListener('push', (event) => {
  console.log('Service worker working!');

  async function chainPromies() {
    const data = await event.data.json();

    await self.registration.showNotification(data.title, {
      body: data.options.body,
    });
  }

  event.waitUntil(chainPromies());
});
