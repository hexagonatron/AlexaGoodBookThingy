const API = require("./goodReadsApi.js");
const XmlToJson = require("./utils/xmlParse");

const GRUserId = "19779962"
const GRApiKey = process.env.GR_KEY;
const GRUserToken = process.env.USER_TOKEN
const GRUserTokenSecret = process.env.USER_TOKEN_SECRET;

const queryAPI = (endpoint) => {

    const URL = `https://www.goodreads.com${endpoint}&key=${GRApiKey}`

    console.log(`Querying Goodreads at, ${URL}`);

    return new Promise((resolve, reject) => {
        API.get(
            URL,
            GRUserToken,
            GRUserTokenSecret,
            async (err, results) => {
                if (err) return reject(err);

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
            title: review.book[0].title[0],
            author: review.book[0].authors[0].author[0].name[0],
            description: review.book[0].description[0].replace(/<[^>]*>?/gm, ''),
            published: review.book[0].publication_year[0],
            pages: review.book[0].num_pages[0],
        }
    });
}

const apiRequests = {
    async getNumberBooksReadByYear(year = new Date().getFullYear()) {

        const shelfArray = await this.getUserShelves()

        console.log(`Looking for shelf for ${year}`);
        
        //Find shelf by matching year to name
        const yearShelf = shelfArray.find(({name}) => {
            return new RegExp(year).test(name)
        })

        //Throw error if no shelf found
        if(!yearShelf) {
            console.log(`User doesn't have a shelf for ${year}`);
            throw "Couldn't find shelf for provided year";
        }
        
        console.log(`Found shelf ${yearShelf.name} with id ${yearShelf.id}`);

        //Get books on shelf
        const booksOnShelf = await this.getBooksOnShelf(yearShelf.name);
    },
    getUserShelves() {

        console.log(`Getting shelves for user ${GRUserId}`);

        return queryAPI(`/shelf/list.xml?&user_id=${GRUserId}`).then(results => {

            //Formatting
            const shelves = results.GoodreadsResponse.shelves[0].user_shelf.map(shelf => { return { name: shelf.name[0], books: shelf.book_count[0]._, id: shelf.id[0]._ } });

            //logging
            let shelfString = "Found the shelves: ";
            shelves.forEach(({name}) => shelfString += `${name}, `);
            console.log(shelfString);

            return shelves;

        }).catch(err => {
            console.log(err)
            return err
        })
    },
    getBooksOnShelf(userID, shelfName){
        console.log(`Getting books on shelf with name ${shelfName}`);

        return queryAPI(`/review/list/${userID}.xml?v=2&&shelf=${shelfName}`).then(results => {
            const bookArray = parseReviews(results);

        }).catch(err => {
            console.log(err);
            return err
        })
    }

}

module.exports = apiRequests;

//Testing

apiRequests.getNumberBooksReadByYear(2020);
apiRequests.getNumberBooksReadByYear(2018);
apiRequests.getNumberBooksReadByYear("potato");
apiRequests.getNumberBooksReadByYear();