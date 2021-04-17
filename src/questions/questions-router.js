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
    .delete((req, res, next) => {
        const { question_id } = req.params
        QuestionsService.deleteQuestion(
            req.app.get('db'),
            req.params.question_id
        )
            .then(() => {
                logger.info(`Question with id ${question_id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { question, guidance } = req.body
        const questionToUpdate = { question, guidance }

        const numberOfValues = Object.values(questionToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'question' or 'guidance'`
                }
            })
        }

        QuestionsService.updateQuestion(
            req.app.get('db'),
            req.params.question_id,
            questionToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = questionsRouter