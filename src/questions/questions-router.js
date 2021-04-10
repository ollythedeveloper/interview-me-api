const path = require('path')
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
    .post(bodyParser, (req, res, next) => {
        for (const field of ['question', 'guidance']) {
            if (!req.body[field]) {
                logger.error(`'${field}' is required`)
                return res.status(400).send({
                    error: { message: `'${field}' is required` }  
                })
            }
        }

        const { question, guidance, response } = req.body;

        const newQuestion = { question, guidance, response }

        QuestionsService.insertQuestion(
            req.app.get('db'),
            newQuestion
        )
            .then(question => {
                logger.info(`Bookmark with id ${question.id} created`)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${question.id}`))
                    .json(serializeQuestion(question))
            })
            .catch(next)
    })

questionsRouter
    .route('/:question_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { question_id } = req.params
        QuestionsService.getById(knexInstance, question_id)
            .then(question => {
                //make sure question is found
                if (!question) {
                    logger.error(`Question with id ${question_id} not found.`);
                    return res.status(404).json({
                        error: { message: `Question Not Found` }
                    })
                }
                res.question = question //save the question for the next middleware
                next() //call next so the next middleware happens
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.question.id,
            question: xss(res.question.question), //sanitize question
            guidance: xss(res.question.guidance), //sanitize guidance
            response: xss(res.question.response), //sanitize response
        })
    })

module.exports = questionsRouter