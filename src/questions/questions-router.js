const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const QuestionsService = require('./questions-service')

const questionsRouter = express.Router()
const bodyParser = express.json()

const serializeQuestion = question => ({
    id: question.id,
    question: xss(question.question),
    guidance: xss(question.guidance),
    response: xss(question.response),
})

questionsRouter
    .route('/')
    .get((req, res, next)  => {
        const knexInstance = req.app.get('db')
        QuestionsService.getAllQuestions(knexInstance)
            .then(questions => {
                res.json(questions.map(serializeQuestion))
            })
            .catch(next)
    })

module.exports = questionsRouter