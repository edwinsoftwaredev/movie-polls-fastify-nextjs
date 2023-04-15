import axios from 'axios';

const getSecrets = async () => {
  const response = await axios.get(`${process.env.DOPPLER_URL}`);
  return response.data;
};

export default getSecrets;
