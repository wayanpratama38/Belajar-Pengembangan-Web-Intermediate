import { loginUser } from "../../data/api";
import { setAuthData } from "../../utils/auth.js";

export default class LoginPage{
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
                        <button class="confirm-button">Login</button>
                        <p>Belum punya akun? silahkan <a href="#/register">register disini</a></p>
                    </form>
                </section>
            </section>
        `;
    }
    async afterRender() {
        const formLogin = document.getElementById("formLogin");

        formLogin.addEventListener('submit', async(e)=>{
            e.preventDefault();
            
            const email = document.getElementById("email-input").value;
            const password = document.getElementById("password-input").value;
            try{
                const response = await loginUser({
                    email,password
                })
    
                if(response.error){
                    console.log(response.message);
                }else{
                    const loginResult = response.loginResult;
                    console.log("User ID :",loginResult.userId);
                    console.log("User Name :",loginResult.name);
                    console.log("User Token :",loginResult.token);

                    setAuthData({
                        token:loginResult.token
                    })

                    window.location.hash = "#/homepage"
                }
            }catch(error){
                console.log(error)
            }
        })
        

      }

}