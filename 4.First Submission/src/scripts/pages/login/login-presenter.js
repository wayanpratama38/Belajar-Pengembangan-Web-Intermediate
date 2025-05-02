import { loginUser } from '../../data/auth-api';
import AuthModel from '../../data/auth-api';
import { setAuthData } from '../../utils/auth';
export default class LoginPresenter {
  #model;
  #view;

  constructor({ view }) {
    this.#model = AuthModel;
    this.#view = view;
  }

  async loginUser(userData) {
    try {
      const response = await this.#model.loginUser(userData);
      if (response.error) {
        this.#view.showLoginError(response.message);
      } else {
        const loginResult = response.loginResult;
        setAuthData({
          token: loginResult.token,
        });
        console.log('LOGIN BERHASIL!');
        this.#view.navigateToHomepage();
      }
    } catch (error) {
      console.log(error);
      this.#view.showLoginError('Terjadi kesalahan saat login!');
    }
  }
}
