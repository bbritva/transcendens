import axios from "axios"

const API_URL = process.env.AUTH_URL;

class AuthService {
  login(username:string, password: string) {
    return  axios
      .post(API_URL + "signin", {username, password})
      .then((response) => {
        if (response.data.accessToken){
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
  }
  logout() {
    localStorage.removeItem("user");
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
