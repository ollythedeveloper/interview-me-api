const express = require('express')
const logger = require('../logger')
const QuestionsService = require('./questions-service')

const questionsRouter = express.Router()
const bodyParser = express.json()

const questions = [
    {
        "id": "9f483f4f-d718-485a-85e4-978808a99f8e",
        "question": "Tell me about yourself.",
        "guidance": "This is often the first of many interview questions, designed to ‘warm up’ the candidate. Many candidates choose to respond with an overview of their work and employment history. Whilst this is helpful – especially if a manager hasn’t read your CV in detail, it’s important you offer new information, such as what are your hobbies outside of work. It’s also easy to fall into the trap of waffling. Other candidates prefer to focus on a key aspect of their career, building a story around it with performance highlights. It’s important to ensure your answer is aligned with the job description and advertisement, to demonstrate how you can add value to the company and role at hand.",
        "response": {}
    }
] 

questionsRouter
    .route('/')
    .get((req, res)  => {
        res.json(questions);
    })

module.exports = questionsRouter