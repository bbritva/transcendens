import axios from "axios"

const API_URL = process.env.REACT_APP_AUTH_URL;

class AuthService {
  login(accessCode: string, accessState: string) {
    let urlAuth = API_URL + "/auth";
    // console.log('print urlAuth ', urlAuth);
    const response = axios
      .get(urlAuth, { params: {accessCode, accessState}})
      .then((response) => {
        if (response.status == 200){
            localStorage.setItem("user", JSON.stringify(response.data.userData));
            localStorage.setItem("token", JSON.stringify(response.data.tokenData));
            localStorage.setItem("newUser", JSON.stringify(response.data.newUser));
        }
        else {
          alert('Not authorized!')
        }
        return response.data;
      })
    // const promise = Promise.resolve(response);
    // promise.then((response) => {
    //   console.log('AuthService!', response);
    // })
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
