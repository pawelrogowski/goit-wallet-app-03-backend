const moment = require('moment');

function convertToDDMMYYYY(dateString) {
  const formats = [
    'YYYY-MM-DD',
    'MM/DD/YYYY',
    'D MMMM YYYY',
    'YYYY/MM/DD',
    'MMMM D, YYYY',
    'D MMMM YYYY',
    'DD MMM, YYYY',
    'YYYY, MMM DD',
    'DD/MM/YY',
    'DD/MM/YYYY',
    'MMMM DD, YYYY',
    'DD MMMM YYYY',
    'YYYY/MM/DD',
    'DD.MM.YYYY',
  ];

  const date = moment(dateString, formats, true);
  return date.isValid() ? date.format('DD-MM-YYYY') : 'Invalid date';
}

function formatDate(date) {
  if (!date) return null;

  const formatted = moment(date).format('DD-MM-YYYY');

  return formatted;
}
module.exports = {
  convertToDDMMYYYY,
  formatDate,
};
