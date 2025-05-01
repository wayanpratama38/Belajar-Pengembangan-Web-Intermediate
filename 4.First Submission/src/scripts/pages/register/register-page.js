import { registerUser } from "../../data/auth-api";
import RegisterPresenter from "./register-presenter";



export default class RegisterPage{
    #presenter;
    #loadingIndicator = null;
    #globalLoadingOverlay = null;
    async render(){
        return `
            <div class="container">
                <div id="globalLoadingOverlay" class="global-loading-overlay">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Proses Register...</div>
                </div>
                <div class="container-flex">
                    <form class="container-flex-form" id="formRegister">
                        <h1>Register Page</h1>
                        <p>Silahkan daftarkan untuk bergabung ke dalam web</p>
                        <div class="form-group">
                            <label for="name-input">Nama</label>
                                <input
                                    type="name"
                                    id="name-input"
                                    name="name"
                                    autocomplete="name"
                                    placeholder="Dicoding Indonesia"
                                    required
                            />
                        </div>
                        <div class="form-group">
                            <label for="email-input">Email</label>
                            <input
                                type="email"
                                id="email-input"
                                name="email"
                                autocomplete="email"
                                placeholder="email@domain.com"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="password-input">Password</label>
                            <input
                                type="password"
                                id="password-input"
                                name="password"
                                autocomplete="password"
                                placeholder="password"
                                required
                            />
                        </div>
                        <p class="error-message" id="registerError" hidden></p>
                        <button class="confirm-button">Register</button>
                        <p>Sudah punya akun? silahkan <a href="#/login">login disini</a></p>
                    </form>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.#loadingIndicator = document.querySelector(".loading-indicator");
        this.#globalLoadingOverlay = document.getElementById("globalLoadingOverlay");

        this.#presenter = new RegisterPresenter({view : this});
        const registerForm = document.getElementById("formRegister");
        
        this.hideLoading();

        registerForm.addEventListener("submit",async(e)=>{
            e.preventDefault();

            const name = document.getElementById("name-input").value;
            const email = document.getElementById("email-input").value;
            const password = document.getElementById("password-input").value;
            const userData = {name,email,password};
        
            this.showLoading();
        
            await this.#presenter.registerUser(userData);
        })
    }


    showLoading() {
        if (this.#globalLoadingOverlay) {
          this.#globalLoadingOverlay.style.display = 'flex';
        }
        
        if (this.#loadingIndicator) {
          this.#loadingIndicator.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.#globalLoadingOverlay) {
          this.#globalLoadingOverlay.style.display = 'none';
        }
        
        if (this.#loadingIndicator) {
          this.#loadingIndicator.style.display = 'none';
        }
    }

    showRegisterError(message){
        const errorMessage = document.getElementById("errorRegister");
        if(errorMessage){
            errorMessage.hidden = false;
            errorMessage.textContent = message;
        } else {
            console.log("errorMessage ID tidak ditemukan!");
        }
    }

    navigateToLogin(){
        window.location.hash = "#/login";
    }
}