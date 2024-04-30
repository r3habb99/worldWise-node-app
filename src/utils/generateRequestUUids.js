const { v4: uuidv4 } = require("uuid");

const generateRequestId = () => {
  return uuidv4();
};

module.exports = generateRequestId;
