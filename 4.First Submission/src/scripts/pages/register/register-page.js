import { registerUser } from "../../data/auth-api";
import RegisterPresenter from "./register-presenter";



export default class RegisterPage{
    #presenter;
    async render(){
        return `
            <section class="container">
                <section class="container-flex">
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
                </section>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new RegisterPresenter({view : this});
        const registerForm = document.getElementById("formRegister");

        registerForm.addEventListener("submit",async(e)=>{
            e.preventDefault();

            const name = document.getElementById("name-input").value;
            const email = document.getElementById("email-input").value;
            const password = document.getElementById("password-input").value;
            const userData = {name,email,password};

            this.#presenter.registerUser(userData);
        })
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