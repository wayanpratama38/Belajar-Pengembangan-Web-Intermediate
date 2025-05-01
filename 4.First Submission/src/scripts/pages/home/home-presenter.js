import StoryModel from "../../data/story-api";
export default class HomePresenter{
    #model;
    #view;
    #storiesData;
    
    constructor({view}){
        this.#model = StoryModel;
        this.#view = view;
    }

    async init(){
        await this.getAllStories();
    }

    async getAllStories(){
        try{
            const stories = await this.#model.getAllStories();
            this.#storiesData = stories.listStory;
            this.#view.showStories(stories.listStory);

             // Extract location data for the map
             const locations = this.#storiesData
             .filter(story => story.lat && story.lon && story.name && story.description)
             .map(story => ({
                 lat: story.lat,
                 lon: story.lon,
                 name: story.name,
                 description: story.description,
             }));

            // Tell the view to render map markers
            this.#view.renderMapMarkers(locations);
        } catch (error) {
            this.#view.showError("Gagal memuat cerita!");
            console.log(error)
        }
    }
}