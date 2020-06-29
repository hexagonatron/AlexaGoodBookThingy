const API = require("./goodReadsApi.js");
const XmlToJson = require("./utils/xmlParse");

const GRApiKey = process.env.GR_KEY;
const GRUserToken = process.env.USER_TOKEN
const GRUserTokenSecret = process.env.USER_TOKEN_SECRET;

//Static variables for testing
const myGRUserId = "19779962"
const jamGRUserId = "75771180"

const queryAPI = (endpoint) => {

    const URL = `https://www.goodreads.com${endpoint}&key=${GRApiKey}`

    console.log(`Querying Goodreads at, ${URL}`);

    return new Promise((resolve, reject) => {
        API.get(
            URL,
            GRUserToken,
            GRUserTokenSecret,
            async (err, results) => {
                if (err) return reject(console.log(err));

                console.log("Recieved response")

                console.log("Converting to JSON")
                const resultJSON = await XmlToJson(results);


                return resolve(resultJSON);
            }
        )
    })
}

const parseReviews = (reviews) => {
    return reviews.GoodreadsResponse.reviews[0].review.map(review => {
        return {
            title: review.book[0].title_without_series[0],
            author: review.book[0].authors[0].author[0].name[0],
            description: review.book[0].description[0].replace(/<[^>]*>?/gm, ''),
            published: review.book[0].publication_year[0],
            pages: review.book[0].num_pages[0],
        }
    });
}

const apiRequests = {
    async getNumberBooksReadByYear(userId, year = new Date().getFullYear()) {

        console.log(`Getting books read by year for ${userId} in ${year}`);

        const shelfArray = await this.getUserShelves(userId);

        console.log(`Looking for shelf for ${year}`);

        //Find shelf by matching year to name
        const yearShelf = shelfArray.find(({ name }) => {
            return new RegExp(year).test(name)
        })

        //Throw error if no shelf found
        if (!yearShelf) {
            console.log(`User doesn't have a shelf for ${year}`);
            throw "Couldn't find shelf for provided year";
        }

        console.log(`Found shelf ${yearShelf.name} with id ${yearShelf.id}`);

        //Get books on shelf
        const booksOnShelf = await this.getBooksOnShelf(userId, yearShelf.name);
        const bookCount = booksOnShelf.length;
        console.log(`${bookCount} book(s) found on shelf ${yearShelf.name}`);

        return bookCount;
    },
    getUserShelves(userId = myGRUserId) {

        console.log(`Getting shelves for user ${userId}`);

        return queryAPI(`/shelf/list.xml?&user_id=${userId}`).then(results => {

            //Formatting
            const shelves = results.GoodreadsResponse.shelves[0].user_shelf.map(shelf => { return { name: shelf.name[0], books: shelf.book_count[0]._, id: shelf.id[0]._ } });

            //logging
            let shelfString = "Found the shelves: ";
            shelves.forEach(({ name }) => shelfString += `${name}, `);
            console.log(shelfString);

            return shelves;

        }).catch(err => {
            console.log(err)
            return err
        })
    },
    getBooksOnShelf(userId, shelfName) {
        console.log(`Getting books on shelf with name ${shelfName}`);

        return queryAPI(`/review/list/${userId}.xml?v=2&&shelf=${shelfName}`).then(results => {
            const bookArray = parseReviews(results);

            return bookArray;
        }).catch(err => {
            console.log(err);
            return err
        })
    },
    getLastBookRead(userId = myGRUserId) {
        console.log(`Getting last book read for user ${userId}`);

        return queryAPI(`/review/list/${userId}.xml?v=2&shelf=read&per_page=1&sort=date_added&order=d`).then(results => {

            const lastBookRead = parseReviews(results)[0];

            console.log(`Last book read was ${lastBookRead.title} by ${lastBookRead.author}`);

            return lastBookRead;

        }).catch(err => {
            console.log(err);
            return err;
        })
    },
    compareBooksReadForYear(user1Id, user2Id, year = 2020) {

        console.log(`Comparing books read for userID ${user1Id} userID and ${user2Id} in ${year}`);


        return Promise.all([
            this.getNumberBooksReadByYear(user1Id, year),
            this.getNumberBooksReadByYear(user2Id, year)
        ]).then(([
            user1BooksRead,
            user2BooksRead
        ]) => {

            console.log(`User1 has read ${user1BooksRead} book(s). User2 has read ${user2BooksRead} book(s).`);

            return [user1BooksRead, user2BooksRead];

        }).catch(err => {
            console.log(err);
            return err
        })
    }

}

module.exports = apiRequests;

//Testing

// apiRequests.getNumberBooksReadByYear(myGRUserId, "2019");
// apiRequests.getNumberBooksReadByYear(2018);
// apiRequests.getNumberBooksReadByYear("potato");
// apiRequests.getNumberBooksReadByYear();
// apiRequests.getLastBookRead();
// apiRequests.compareBooksReadForYear(myGRUserId, jamGRUserId, 2001);