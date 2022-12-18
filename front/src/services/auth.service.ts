import axios from "axios"
import authHeader from "./authHeader";

const API_URL = process.env.REACT_APP_AUTH_URL;

class AuthService {
  login(accessCode: string, accessState: string) {
    let urlAuth = API_URL + "/auth";
    const response = axios
      .post(urlAuth, { accessCode, accessState})
      .then((response) => {
        if (response.status === 201){
            console.log(response);
            localStorage.setItem("user", JSON.stringify(response.data.userData));
            localStorage.setItem("token", JSON.stringify(response.data.tokenData));
            localStorage.setItem("newUser", JSON.stringify(response.data.newUser));
        }
        else {
          alert('Not authorized!')
        }
        return response.data;
      })
    return response;
  }

  logout() {
    const inter = localStorage.getItem("interceptor");
    axios.interceptors.request.eject(parseInt(inter || ''));
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("newUser");
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
