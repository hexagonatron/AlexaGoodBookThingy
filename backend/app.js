const express = require("express");
require("dotenv").config();
const OAuth = require('oauth');
const XmlToJson = require('./utils/xmlParse.js');
const fs = require("fs");


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

goodReadsAPI.get(`https://www.goodreads.com/review/list/19779962.xml?v=2&&shelf=read&key=${key}`, token, token_secret, async (err, results, response) => {
    if (err) return console.log(err);


    // fs.writeFile("output.xml", results, "utf8", (err) => {if(err) console.log(err)});

    const responseJson = await XmlToJson(results)
    console.log(responseJson);

    const books = responseJson.GoodreadsResponse.reviews[0].review.map(review => {
        return {
            title: review.book[0].title[0],
            author: review.book[0].authors[0].author[0].name[0],
            description: review.book[0].description[0].replace(/<[^>]*>?/gm, ''),
            published: review.book[0].publication_year[0],
            pages: review.book[0].num_pages[0],
        }
    });

    console.log(books);
    console.log(JSON.stringify(responseJson.GoodreadsResponse.reviews[0].review[29]))
    const totalPages = books.reduce((total, book) => total + book.pages, 0);

    console.log(`Total pages this year: ${totalPages}`);
    console.log(`Total books this year: ${books.length}`);

})

goodReadsAPI.get(`https://www.goodreads.com/shelf/list.xml?key=${key}&user_id=19779962`, token, token_secret, async (err, results, response) => {
    if(err) return console.log(err);


    const json = await XmlToJson(results);


    const shelves = json.GoodreadsResponse.shelves[0].user_shelf.map(shelf => { return {name:shelf.name[0], books: shelf.book_count[0]._, id: shelf.id[0]._}});

    console.log(shelves);
})