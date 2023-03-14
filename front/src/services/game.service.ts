import axios from 'axios';

const API_URL = process.env.REACT_APP_AUTH_URL +'/game'

class GameService {
  getGames(userId: number){
    return axios.get(API_URL + '/byUser', {
      params: {userId: userId}
    });
  }
}

export default new GameService();