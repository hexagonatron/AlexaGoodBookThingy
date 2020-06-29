require("dotenv").config();
const OAuth = require('oauth');

const key = process.env.GR_KEY
const secret = process.env.GR_SECRET

const goodReadsAPI = new OAuth.OAuth(
    'http://www.goodreads.com/oauth/request_token',
    'http://www.goodreads.com/oauth/access_token',
    key,
    secret,
    '1.0',
    null,
    'HMAC-SHA1'
)

module.exports = goodReadsAPI;