export default class RegisterPage{
    async render(){
        return `
            <section class="container">
                <section class="container-flex">
                    <form action="post" class="container-flex-form">
                        <h1>Register Page</h1>
                        <p>Silahkan daftarkan email dan password untuk bergabung ke dalam web</p>
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
                        <button class="confirm-button">Register</button>
                        <p>Sudah punya akun? silahkan <a href="#/login">login disini</a></p>
                    </form>
                </section>
            </section>
        `;
    }

    async afterRender() {
        // Do your job here
      }
}