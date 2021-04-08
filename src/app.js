require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const logger = require('./logger')
const questionsRouter = require('./questions/questions-router')

// const questions = [
//     {
//         "id": "9f483f4f-d718-485a-85e4-978808a99f8e",
//         "question": "Tell me about yourself.",
//         "guidance": "This is often the first of many interview questions, designed to ‘warm up’ the candidate. Many candidates choose to respond with an overview of their work and employment history. Whilst this is helpful – especially if a manager hasn’t read your CV in detail, it’s important you offer new information, such as what are your hobbies outside of work. It’s also easy to fall into the trap of waffling. Other candidates prefer to focus on a key aspect of their career, building a story around it with performance highlights. It’s important to ensure your answer is aligned with the job description and advertisement, to demonstrate how you can add value to the company and role at hand.",
//         "response": {}
//     }
// ]

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

// app.use(function validateBearerToken(req, res, next) {
//     const apiToken = process.env.API_TOKEN
//     const authToken = req.get('Authorization')

//     if (!authToken || authToken.split(' ')[1] !== apiToken) {
//         logger.error(`Unauthorized request to path: ${req.path}`);
//         return res.status(401).json({ error: 'Unauthorized request' })
//     }
//     //move to next middleware
//     next()
// })

app.use('/api/questions', questionsRouter)

app.get('/', (req, res, next) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app