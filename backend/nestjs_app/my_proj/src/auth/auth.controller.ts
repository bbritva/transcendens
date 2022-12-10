import { Controller, Get, Param } from '@nestjs/common';

const REACT_APP_42_CLIENT_ID="u-s4t2ud-3d609a1ccb04574c782ba42fa85f9c1476aeb899c5ae40bcc2f773775175f86b"
const REACT_APP_REDIRECT_URI="http://localhost:3000"
const REACT_APP_SECRET="s-s5t2ud-4296d348823cf6b51633f5dd0e23712b00eb6b00c743dd0b263cee36ca40922f"
const tokenEndpoint = 'https://api.intra.42.fr/v2/oauth/token';

@Controller('auth')
export class AuthController {

    @Get(':authCode')
        getAuth(@Param('authCode') authCode: string) : string {
        let accessToken;
        // console.log('before promise');
        // Promise.resolve(getToken(authCode))
        // .then((string) => {
        //         setTimeout(() => {
        //             console.log(string);
        //         }, 1);
        //         return string;
        //     }
        // )
        const promise = Promise.resolve(getToken(authCode));
        promise.then((accessToken) => {
            console.log('resolve', accessToken);
        })
        .catch(error => {
          console.log('ERROR', error)
        });
       
        console.log(accessToken);
        return "Token to return" ;
    }


}

    const getToken = async (accessCode: string): Promise<string> => {
    const data = {
      grant_type: 'authorization_code',
      client_id: REACT_APP_42_CLIENT_ID,
      client_secret: REACT_APP_SECRET,
      code: accessCode,
      redirect_uri: REACT_APP_REDIRECT_URI,
    }
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        data
      )
    })
    return response.json();
  }


//   function fetchCurrentData() {
//     // The fetch() API returns a Promise. This function
//     // exposes a similar API, except the fulfillment
//     // value of this function's Promise has had more
//     // work done on it.
//     return fetch("current-data.json").then((response) => {
//       if (response.headers.get("content-type") !== "application/json") {
//         throw new TypeError();
//       }
//       const j = response.json();
//       // maybe do something with j
  
//       // fulfillment value given to user of
//       // fetchCurrentData().then()
//       return j;
//     });
//   }