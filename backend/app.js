const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();
const OAuth = require('oauth');
const nodeUrl = require('url');
const { parseString } = require("xml2js");
const { connect } = require("http2");

const PORT = process.env.PORT || 3004


const app = express();
const key = process.env.GR_KEY
const secret = process.env.GR_SECRET

const goodReadsAPI = new OAuth.OAuth(
    'http://www.goodreads.com/oauth/request_token',
    'http://www.goodreads.com/oauth/access_token',
    process.env.GR_KEY,
    process.env.GR_SECRET,
    '1.0',
    null,
    'HMAC-SHA1'
)

const getToken = () => {
    goodReadsAPI.getOAuthRequestToken((err, token, tokenSecret, results) => {
        console.log(err);
        console.log(token);
        console.log(tokenSecret);
        console.log(results);


        const authUrl = `http://goodreads.com/oauth/authorize?oauth_token=${token}`

        console.log(authUrl);
        //CCr7U4CJPycZtMvGzdLB0g

        app.get("/token", (req, res) => {
            const { oauth_token, authorize } = req.query;

            console.log(`Token: ${oauth_token}`);
            console.log(`Auth: ${authorize}`);
            console.log(req.query);
            res.send();

            goodReadsAPI.getOAuthAccessToken(oauth_token, tokenSecret, 1, (err, token, token_secret) => {
                if (err) return console.log(err);

                console.log(`Token: ${token}`);
                console.log(`Token secret: ${token_secret}`);


                goodReadsAPI.get(`https://www.goodreads.com/review/list/19779962.xml?v=2&&shelf=read&key=${key}&per_page=10`, token, token_secret, (err, results, response) => {
                    if (err) return console.log(err);



                    parseString(results, (err, results) => {
                        console.log(results);

                        console.log(JSON.stringify(results));
                    })
                    // console.log(response)


                })


            });



        })

    })
}

// app.listen(PORT, (err) => {
//     if (err) return console.log(err);

//     console.log(`App listening on port ${PORT}`);

// });

const token = "IaE450ZwrFTa6CI2MReKQw";
const token_secret = "zzpp0mHF749fzkwf8yuEzDcl0qIdGl9UTR9DlMenSes";

goodReadsAPI.get(`https://www.goodreads.com/review/list/19779962.xml?v=2&&shelf=read&key=${key}&per_page=20`, token, token_secret, (err, results, response) => {
    if (err) return console.log(err);



    parseString(results, (err, results) => {
        console.log(results);

        // console.log(JSON.stringify(results));

        const bookTitles = results.GoodreadsResponse.reviews[0].review.map(review => review.book[0].title[0]);

        console.log(bookTitles);


    })
    // console.log(response)


})