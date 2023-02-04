import axios from "axios"
import { userI } from "src/store/userSlice";

const API_URL = process.env.REACT_APP_AUTH_URL;

class AuthService {
  refresh() {
    const storageData = localStorage.getItem('refreshToken') || undefined;
    if (! storageData)
      throw "no Token!";
    const refreshToken = JSON.parse(storageData);
    let urlAuth = API_URL + "/auth/refresh";
    const response = axios.get(
      urlAuth,
      {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'REFRESH': `${refreshToken}`
        }
      }
    );
    return response;
  }

  login(accessCode: string, accessState: string) {
    let urlAuth = API_URL + "/auth";
    const responseData = axios
      .post(urlAuth, {accessCode, accessState})
      .then((response) => {
        if (response.status === 201){
            localStorage.setItem("access_token", JSON.stringify(response.data.access_token));
            localStorage.setItem("refreshToken", JSON.stringify(response.data.refreshToken));
        }
        else {
          throw "Not authorized!";
        }
        return response.data;
      })
    return responseData;
  }

  otpGenerateQR() {
    let urlAuth = API_URL + "/auth/2fa/generate";
    const responseData = axios
      .post(urlAuth, {})
      .then((response) => {
        if (response.status !== 201){
          throw "Not authorized!";
        }
        return response.data;
      })
    return responseData;
  }

  otpTurnOn(twoFaCode: string): Promise<userI> {

    let urlAuth = API_URL + "/auth/2fa/turn-on";
    const responseData = axios
      .post(urlAuth, { twoFaCode })
      .then((response) => {
        if (response.status !== 201){
          throw "Not authorized!";
        }
        return response.data;
      })
      .catch((error) => {
        return error;
      })
    return responseData;
  }

  otpTurnOff(twoFaCode: string): Promise<userI> {
    let urlAuth = API_URL + "/auth/2fa/turn-off";
    const responseData = axios
      .post(urlAuth, { twoFaCode })
      .then((response) => {
        if (response.status !== 201){
          throw "Not authorized!";
        }
        return response.data;
      })
      .catch((error) => {
        return error;
      })
    return responseData;
  }

  otpAuth(twoFaCode: string, user: string) {
    let urlAuth = API_URL + "/auth/2fa/auth";
    const responseData = axios
      .post(urlAuth, { twoFaCode, user })
      .then((response) => {
        if (response.status === 201){
            localStorage.setItem("access_token", JSON.stringify(response.data.access_token));
            localStorage.setItem("refreshToken", JSON.stringify(response.data.refreshToken));
        }
        else {
          throw "Not authorized!";
        }
        return response.data;
      })
    return responseData;
  }

  logout() {
    const inter = localStorage.getItem("interceptor");
    axios.interceptors.request.eject(parseInt(inter || ''));
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("interceptor");
  }

  register(username:string, email:string, password:string) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password,
    });
  }
}

export default new AuthService();
