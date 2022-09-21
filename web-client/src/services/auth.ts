import { Session } from 'types';

export default class Auth {
  static async authenticateSession(props: { headers?: HeadersInit }) {
    const { headers } = props;
    const API_HOST_URL = process.env.API_HOST_URL;
    if (!API_HOST_URL)
      return Promise.reject(new Error('API_HOST not defined!'));

    const res = await fetch(`${API_HOST_URL}/`, {
      headers,
    }).then<Session>((res) => res.json());

    return res;
  }
}
