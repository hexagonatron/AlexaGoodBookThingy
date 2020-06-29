const { parseString } = require("xml2js");

module.exports = function(xml){
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) return reject(err);

            return resolve(result);
        })
    })
}