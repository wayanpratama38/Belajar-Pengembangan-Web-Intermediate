
import { loginUser } from "../../data/auth-api.js";
import { setAuthData } from "../../utils/auth.js";
import LoginPresenter from "./login-presenter.js";

export default class LoginPage{
    #presenter; 

    async render(){
        return `
            <section class="container">
                <section class="container-flex">
                    <form class="container-flex-form" id="formLogin">
                        <h1>Login Page</h1>
                        <p>Silahkan masukkan email dan password untuk masuk ke dalam web</p>
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
                        <p class="error-message" id="loginError" hidden></p>
                        <button class="confirm-button">Login</button>
                        <p>Belum punya akun? silahkan <a href="#/register">register disini</a></p>
                    </form>
                </section>
            </section>
        `;
    }
    async afterRender() {
        this.#presenter = new LoginPresenter({ view : this});
        const formLogin = document.getElementById("formLogin");


        formLogin.addEventListener('submit', async(e)=>{
            e.preventDefault();
            
            const email = document.getElementById("email-input").value;
            const password = document.getElementById("password-input").value;
            const userData = {email,password};
            
            await this.#presenter.loginUser(userData);
        })
    }

    showLoginError(message){
        const errorElement = document.getElementById("loginError");
        if(errorElement){
            errorElement.hidden = false;
            errorElement.textContent = message;
        }else{
            console.log("Error dengan id loginError tidak ditemukan");
        }
    }

    navigateToHomepage(){
        window.location.hash = "#/homepage";
    }

}