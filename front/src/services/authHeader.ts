export default function authHeader() {
  const storageData = localStorage.getItem('token') || '{}';
  const token = JSON.parse(storageData);
  const headers = {'x-access-token': '', 'authorization': ''};

  if (token && token.token) {
    // for Node.js Express back-end
    headers['x-access-token'] = token.token;
    // another types
    headers['authorization'] = `Bearer ${token.token}`;
  }
  return headers;
}
