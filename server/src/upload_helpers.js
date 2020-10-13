const baseUploadPath = process.env.BASE_UPLOADS_PATH;
const _ = require('underscore.string');
const path = require('path');
const fs = require('fs');
const downloadUrl = (entry, fileName) => {
  const modelName = _.underscored(entry.constructor.name);
  return `http://localhost:4000/${path.join('uploads', modelName, String(entry.id), fileName)}`;
}
const modelUploadPath = (entry) => {
  const modelName = _.underscored(entry.constructor.name);
  const resultPath = path.join(baseUploadPath, modelName, String(entry.id));
  fs.mkdirSync(resultPath, {
    recursive: true
  });
  return resultPath;
}

module.exports.modelUploadPath = modelUploadPath;
module.exports.downloadUrl = downloadUrl;