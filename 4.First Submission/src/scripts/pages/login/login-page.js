export default class LoginPage{
    async render(){
        return `
            <section class="container">
                <section class="container-flex">
                    <form action="post" class="container-flex-form">
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
        // Do your job here
      }

}