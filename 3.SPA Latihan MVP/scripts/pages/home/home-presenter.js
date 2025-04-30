export default class HomePresenter{
    #model;
    #view;
    
    constructor({ model, view }){
        this.#model = model;
        this.#view = view;
    }

    async showCats(){
        const cats = await this.#model.getAllCats();
        this.#view.showCats(cats);
    }
}