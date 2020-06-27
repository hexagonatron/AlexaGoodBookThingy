require("ask-sdk-model");
const express = require("express");
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const Alexa = require('ask-sdk-core');

const app = express();

const skillBuilder = Alexa.SkillBuilders.custom()

const requestHandlers = require("./controllers/requestHandlers");

skillBuilder.addRequestHandlers(
    ...requestHandlers
)

const skill = skillBuilder.create();

const adapter = new ExpressAdapter(skill, true, true);

app.post('/',adapter.getRequestHandlers());

app.listen(3003);