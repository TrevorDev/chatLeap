var bcrypt = require('bcrypt');

var crypto = require('crypto');

var algorithm = 'aes256'; // choose encryption algo type
var key = 'password';
var cipher = crypto.createCipher(algorithm, key);
var decipher = crypto.createDecipher(algorithm, key);

exports.encrypt = function(string){
    return cipher.update(string, 'utf8', 'hex') + cipher.final('hex');
}
exports.decrypt = function(string){
    return decipher.update(string, 'hex', 'utf8') + decipher.final('utf8');
}

exports.bcrypt = function(string, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(string, salt, function(err, hash) {
            callback(hash);
        });
    });
}
exports.bcryptCompareStringHash = function(string, hash, callback){
    bcrypt.compare(string, hash, function(err, res) {
        if (res) {
            callback(true);
        } else {
            callback(false);
        }
    });
}