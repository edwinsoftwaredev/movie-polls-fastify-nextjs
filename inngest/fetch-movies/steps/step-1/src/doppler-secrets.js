const axios = require('axios');

module.exports.getSecrets = async () => {
  const response = await axios.get(`${process.env.DOPPLER_URL}`);
  return response.data;
};
