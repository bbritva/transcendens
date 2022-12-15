const authEndpoint = 'https://api.intra.42.fr/v2/oauth/authorize';
const tokenEndpoint = 'https://api.intra.42.fr/v2/oauth/token';

const scopes = [
  'public',
];

export const getAuthorizeHref = (stateArray: Uint32Array): string => {
  const clientId = process.env.REACT_APP_42_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;
  console.log(stateArray);
  return `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&state=${stateArray.join('_')}&response_type=code`;
}

export const getToken = async (accessCode: string): Promise<string> => {
  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.REACT_APP_42_CLIENT_ID,
    client_secret: process.env.REACT_APP_SECRET,
    code: accessCode,
    redirect_uri: process.env.REACT_APP_REDIRECT_URI,
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

// {
//     "access_token": "14c288ca0bee92e5125e39468104caebb3389fdad38f42dcaff03734ac346838",
//     "token_type": "bearer",
//     "expires_in": 7200,
//     "refresh_token": "7906d5006948ce61aa8698ec972f8e68cee4a852c48a06b0584722b7ef9c3514",
//     "scope": "public",
//     "created_at": 1670408656
// }

// access_token The access token.
// token_type The type of the access token, set to Bearer, DPoP or N_A.
// [ issued_token_type ] Identifier for the type of the issued token in a OAuth 2.0 token exchange.
// expires_in The lifetime of the access token, in seconds.
// scope The scope of the access token.
// [ refresh_token ] Optional refresh token, which can be used to obtain new access tokens.
// [ id_token ] Optional OpenID Connect identity token.

// curl -F grant_type=authorization_code \
// -F client_id=9b36d8c0db59eff5038aea7a417d73e69aea75b41aac771816d2ef1b3109cc2f \
// -F client_secret=d6ea27703957b69939b8104ed4524595e210cd2e79af587744a7eb6e58f5b3d2 \
// -F code=fd0847dbb559752d932dd3c1ac34ff98d27b11fe2fea5a864f44740cd7919ad0 \
// -F redirect_uri=https://myawesomeweb.site/callback \
// -X POST https://api.intra.42.fr/oauth/token