import {openDB} from "idb";

const DATABASE_NAME = 'dicodingstory';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "saved-story";

const dbPromise = openDB(DATABASE_NAME,DATABASE_VERSION,{
    upgrade: (database) => {
        database.createObjectStore(OBJECT_STORE_NAME,{
            keyPath : "id",
        })
    }
})

const Database = {

    async putStory(story){
        return (await dbPromise).put(OBJECT_STORE_NAME,story);
    },


    async putAllStory(stories){
        const transaction = (await dbPromise).transaction(OBJECT_STORE_NAME,'readwrite');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        
        const putPromises = stories.map(story => {
            return store.put(story)
        })

        await Promise.all(putPromises);

        return await transaction.done();
    },


    async getAllStoriesFromDB(){
        return (await dbPromise).getAll(OBJECT_STORE_NAME);
    },

    async clearAllStories(){
        const transaction = (await dbPromise).transaction(OBJECT_STORE_NAME,"readwrite");
        await transaction.objectStore(OBJECT_STORE_NAME).clear();
        return transaction.done();
    }

}


export default Database;