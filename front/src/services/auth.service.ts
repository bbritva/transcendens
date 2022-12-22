import axios from "axios"
import authHeader from "./authHeader";

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
            // localStorage.setItem("user", JSON.stringify(response.data.userData));
            // localStorage.setItem("token", JSON.stringify(response.data.tokenData));
            // localStorage.setItem("newUser", JSON.stringify(response.data.newUser));
        }
        else {
          alert('Not authorized!')
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
    // localStorage.removeItem("user");
    // localStorage.removeItem("newUser");
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
