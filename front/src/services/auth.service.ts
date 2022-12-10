import axios from "axios"

const API_URL = process.env.REACT_APP_AUTH_URL;

class AuthService {
  login(accessCode: string, accessState: string) {
    let urlAuth = API_URL + "/auth";
    console.log('print urlAuth ', urlAuth);
    const response = axios
      .get(urlAuth, { params: {accessCode, accessState}})
      .then((response) => {
        if (response.data.accessToken){
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        else {
          alert('Not authorized!')
        }
        return response.data;
      })
    const promise = Promise.resolve(response);
    promise.then((response) => {
      console.log('AuthService!', promise);
    })
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
