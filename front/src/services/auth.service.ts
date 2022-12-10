import axios from "axios"

const API_URL = process.env.REACT_APP_AUTH_URL;

class AuthService {
  login(accessCode: string) {
    const response = axios
      .post(API_URL + "signin", {accessCode})
      .then((response) => {
        if (response.data.accessToken){
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        else {
          alert('Not authorized!')
        }
        return response.data;
      })
    console.log('AuthService!', response);
    return response;
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
