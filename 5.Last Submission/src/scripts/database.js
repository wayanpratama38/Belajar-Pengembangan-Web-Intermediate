import {openDB} from "idb";

const DATABASE_NAME = 'dicodingstory';
const DATABASE_VERSION = 2;
const OBJECT_STORE_NAME = "saved-story";
const ADDED_AT_INDEX = "addedAt-index";
const MAX_STORIES = 10;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: (database, oldVersion, newVersion, transaction) => {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        let store;
        if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
            store = database.createObjectStore(OBJECT_STORE_NAME, {
                keyPath : "id",
            });
        } else {
            store = transaction.objectStore(OBJECT_STORE_NAME);
        }

        if (store && !store.indexNames.contains(ADDED_AT_INDEX)) {
            store.createIndex(ADDED_AT_INDEX, "addedAt");
            console.log(`Created index '${ADDED_AT_INDEX}' on store '${OBJECT_STORE_NAME}'.`);
        }
    }
})

const Database = {
    async _enforceStoryLimit() {
        const db = await dbPromise;
        const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
        const store = tx.objectStore(OBJECT_STORE_NAME);
        const index = store.index(ADDED_AT_INDEX);

        const count = await store.count();
        if (count <= MAX_STORIES) {
            await tx.done;
            return;
        }

        let cursor = await index.openCursor(); 
        let itemsToDelete = count - MAX_STORIES;

        while (cursor && itemsToDelete > 0) {
            await cursor.delete();
            
            cursor = await cursor.continue();
            itemsToDelete--;
        }
        await tx.done;
        return;
    },

    async putStory(story){
        if (!story || typeof story.id === 'undefined') {
            console.error('Story object must have an id', story);
            return Promise.reject(new Error('Story must have an id'));
        }
        const storyWithTimestamp = { ...story, addedAt: Date.now() };
        const db = await dbPromise;
        const result = await db.put(OBJECT_STORE_NAME, storyWithTimestamp);
        await this._enforceStoryLimit();
        return result;
    },

    async putAllStory(stories){
        if (!Array.isArray(stories)) {
            return Promise.reject(new Error('Input must be an array of stories'));
        }
        const db = await dbPromise;
        const transaction = db.transaction(OBJECT_STORE_NAME,'readwrite');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        
        const putPromises = stories.map(story => {
            if (!story || typeof story.id === 'undefined') {
                console.warn('Skipping story without id:', story);
                return Promise.resolve(); 
            }
            const storyWithTimestamp = { ...story, addedAt: Date.now() };
            return store.put(storyWithTimestamp);
        })

        await Promise.all(putPromises);
        await transaction.done;
        
        await this._enforceStoryLimit(); 
        return true;
    },

    async getAllStoriesFromDB(){
        return (await dbPromise).getAll(OBJECT_STORE_NAME);
    },

    async clearAllStories(){
        const db = await dbPromise;
        const transaction = db.transaction(OBJECT_STORE_NAME,"readwrite");
        await transaction.objectStore(OBJECT_STORE_NAME).clear();
        await transaction.done;
        return;
    }
}

export default Database;