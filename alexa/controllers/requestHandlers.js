//Handles requests and intents

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = `Hi there! I can tell you how many books you've <w role="amazon:VBD">read</w> in a given year. You can also ask which book you <w role="amazon:VBD">read</w> last. What would you like to do?`;

        const repromptText = 'So what would you like to do?'

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
    handle(handlerInput) {
        
        const year = handlerInput.requestEnvelope.request.intent.slots.year.value;

        //Call goodreads API
        const numberOfBooks = 10;

        const speechText = `You <w role="amazon:VBD">read</w> ${numberOfBooks} books in ${year}`;

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
    handle(handlerInput) {

        //Call goodreads API
        const lastBookRead = `War and Peace by Leo Tolstoy`

        const speechText = `The last book you <w role="amazon:VBD">read</w> was ${lastBookRead}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};


module.exports = [
    LaunchRequestHandler,
    BooksInYearHandler,
    LastBookReadHandler
]