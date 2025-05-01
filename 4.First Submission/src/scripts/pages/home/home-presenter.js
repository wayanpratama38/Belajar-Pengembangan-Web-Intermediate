import StoryModel from "../../data/story-api";
export default class HomePresenter{
    #model;
    #view;
    
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
            this.#view.showStories(stories.listStory);
        } catch (error) {
            this.#view.showError("Gagal memuat cerita!");
            console.log(error)
        }
    }
}