const apiRequests = require("./apiRequests");

//Hardcoded testing variables
const myGRUserId = "19779962"
const jamGRUserId = "75771180"

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = `Hi there! I can tell you how many books you've <w role="amazon:VBD">read</w> in a given year. You can also ask which book you <w role="amazon:VBD">read</w> last. What would you like to do?`;

        const repromptText = 'So what would you like to do?'

        console.log(speechText)
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .getResponse();
    }
};


const BooksInYearHandler = {
    canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'BooksInYear';
    },
    async handle(handlerInput) {

        const year = handlerInput.requestEnvelope.request.intent.slots.year.value;

        console.log(`Getting books read in ${year}`);

        //Call goodreads API
        const numberOfBooks = await apiRequests.getNumberBooksReadByYear(myGRUserId, year);

        const speechText = `You <w role="amazon:VBD">read</w> ${numberOfBooks} books in ${year}`;

        console.log(speechText)
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const LastBookReadHandler = {
    canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'LastBookRead';
    },
    async handle(handlerInput) {

        //Call goodreads API
        const lastBookRead = await apiRequests.getLastBookRead(myGRUserId);

        const speechText = `The last book you <w role="amazon:VBD">read</w> was ${lastBookRead.title} by ${lastBookRead.author}`;

        console.log(speechText)
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const ReadMoreThanPersonHandler = {
    canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ReadMoreThanPerson';
    },
    async handle(handlerInput) {

        const otherPersonName = handlerInput.requestEnvelope.request.intent.slots.person.value || `<sub alias="jamilla">Jamila</sub>`;

        //Call goodreads API
        [numberBooksYouRead, numberBooksPersonRead] = await apiRequests.compareBooksReadForYear(myGRUserId, jamGRUserId, new Date().getFullYear());

        const winningPhrases = [
            "you ripper",
            "you beauty!",
            "yippee",
            "yay",
            "woo hoo",
            "well done",
            "way to go",
            "ripper",
            "onya",
            "oh snap",
            "kaching",
            "huzzah",
            "hurray",
            "hurrah",
            "howzat",
            "good onya",
            "dun dun dun",
            "checkmate",
            "bravo",
            "awesome",
        ]

        const losingPhrases = [
            "yuck",
            "yowza",
            "whoops a daisy",
            "whoops",
            "wah wah",
            "tsk tsk",
            "there there",
            "read 'em and weep",
            "phooey",
            "oops",
            "oh my",
            "oh dear",
            "oh brother",
            "oh boy",
            "now now",
            "mamma mia",
            "le sigh",
            "fancy that",
            "darn",
            "codswallop",
            "bummer",
            "blast",
            "bah humbug",
        ]


        const speechText = `You've <w role="amazon:VBD">read</w> ${numberBooksYouRead} book${numberBooksYouRead === 1?"":"s"}, and ${otherPersonName} has <w role="amazon:VBD">read</w> ${numberBooksPersonRead} book${numberBooksPersonRead === 1?"":"s"}. ` + (numberBooksYouRead > numberBooksPersonRead ? `You're winning. <say-as interpret-as="interjection">${winningPhrases[Math.floor(Math.random()*winningPhrases.length)]}</say-as>` :
                numberBooksYouRead === numberBooksPersonRead ? `It's a tie.` :
                `You're losing. <say-as interpret-as="interjection">${losingPhrases[Math.floor(Math.random()*losingPhrases.length)]}</say-as>`);

        console.log(speechText)
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};


module.exports = [
    LaunchRequestHandler,
    BooksInYearHandler,
    LastBookReadHandler,
    ReadMoreThanPersonHandler
]