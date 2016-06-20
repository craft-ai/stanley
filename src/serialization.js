import fs from 'fs';

export function save(state, path) {
  const stateStr = JSON.stringify(state, undefined, '  ');

  return new Promise((resolve, reject) => {
    fs.writeFile(path, stateStr, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

export function load(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        try {
          resolve(JSON.parse(data));
        }
        catch (jsonErr) {
          reject(jsonErr);
        }
      }
    });
  });
}
