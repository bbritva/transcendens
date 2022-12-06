const authEndpoint = 'https://api.intra.42.fr/v2/oauth/authorize';
const tokenEndpoint = 'https://api.intra.42.fr/v2/oauth/token';

const scopes = [
  'public',
];

export const getAuthorizeHref = (stateArray: Uint32Array): string => {
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;
  return `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&state=${stateArray.join('_')}&response_type=code`;
}

export const getToken = async (accessCode: string): Promise<string> => {
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;
  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
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

// curl -F grant_type=authorization_code \
// -F client_id=9b36d8c0db59eff5038aea7a417d73e69aea75b41aac771816d2ef1b3109cc2f \
// -F client_secret=d6ea27703957b69939b8104ed4524595e210cd2e79af587744a7eb6e58f5b3d2 \
// -F code=fd0847dbb559752d932dd3c1ac34ff98d27b11fe2fea5a864f44740cd7919ad0 \
// -F redirect_uri=https://myawesomeweb.site/callback \
// -X POST https://api.intra.42.fr/oauth/token