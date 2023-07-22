const axios = require('axios');

const selfPing = port => {
  axios
    .get(`http://localhost:${port}`)
    .then(() => {
      console.log('Self-ping successful!');
    })
    .catch(error => {
      console.error('Self-ping error:', error.message);
    });
};

module.exports = selfPing;
