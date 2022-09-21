export const authUser = async () => {
  const API_HOST = process.env.API_HOST;
  if (!API_HOST) return Promise.reject(new Error('API_HOST not defined!'));
  const res = await fetch(`${API_HOST}/`, {
    credentials: 'same-origin',
    mode: 'cors',
  }).then((res) => res.json());
  return res;
};
