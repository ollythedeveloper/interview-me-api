const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeQuestionsArray, makeMaliciousQuestion } = require('./questions.fixtures')

describe(`Questions Endpoints`, function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconect from db', () => db.destroy())

    before('clean the table', () => db('questions').truncate())

    afterEach('cleanup', () => db('questions').truncate())

    describe(`GET /api/questions`, () => {
        context(`Given no questions`, () => {
            it(`responds with 200 and a empty list`, () => {
                return supertest(app)
                    .get('/api/questions')
                    .expect(200, [])
            })
        })

        context('Given there are questions in the database', () => {
            const testQuestions = makeQuestionsArray()

            beforeEach('insert questions', () => {
                return db
                    .into('questions')
                    .insert(testQuestions)
            })

            it('GET /api/questions responds with 200 and all of the questions', () => {
                return supertest(app)
                    .get('/api/questions')
                    .expect(200, testQuestions)
            })
        })

        context(`Given an XSS attack question`, () => {
            const { maliciousQuestion, expectedQuestion } = makeMaliciousQuestion()

            beforeEach('insert malicious question', () => {
                return db
                    .into('questions')
                    .insert([maliciousQuestion])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/questions')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].question).to.eql(expectedQuestion.question)
                        expect(res.body[0].guidance).to.eql(expectedQuestion.guidance)
                    })
            })
        })
    })

    describe(`GET /api/questions/:question_id`, () => {
        context(`Given no questions`, () => {
            it(`responds with 404`, () => {
                const questionId = 123456
                return supertest(app)
                    .get(`/api/questions/${questionId}`)
                    .expect(404, { error: { message: `Question Not Found` } })
            })
        })

        context('Given there are questions in the database', () => {
            const testQuestions = makeQuestionsArray()

            beforeEach('insert questions', () => {
                return db
                    .into('questions')
                    .insert(testQuestions)
            })

            it('responds with 200 and the specified question', () => {
                const questionId = 2
                const expectedQuestion = testQuestions[questionId - 1]
                return supertest(app)
                    .get(`/api/questions/${questionId}`)
                    .expect(200, expectedQuestion)
            })
        })
    })

    describe(`POST /api/questions`, () => {
        it(`creates a question, responding with 201 and the new question`, function() {
            const newQuestion = {
                question: 'Test new question',
                guidance: 'Test new guidance',
                response: 'Test new response',
            }
            return supertest(app)
                .post(`/api/questions`)
                .send(newQuestion)
                .expect(201)
                .expect(res => {
                    expect(res.body.question).to.eql(newQuestion.question)
                    expect(res.body.guidance).to.eql(newQuestion.guidance)
                    expect(res.body.response).to.eql(newQuestion.response)
                    expect(res.headers.location).to.eql(`/api/questions/${res.body.id}`)
                    expect(res.body).to.have.property('id')
                })
                .then(res => 
                    supertest(app)
                    .get(`/api/questions/${res.body.id}`)
                    .expect(res.body)
                )
        })
        const requiredFields = ['question', 'guidance']

        requiredFields.forEach(field => {
            const newQuestion = {
                question: 'Test new question',
                guidance: 'Test new guidance'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newQuestion[field]

                return supertest(app)
                    .post('/api/questions')
                    .send(newQuestion)
                    .expect(400, {
                        error: { message: `'${field}' is required` }
                    })
            })
        })

        it(`removes XSS attack content from the response`, () => {
            const { maliciousQuestion, expectedQuestion } = makeMaliciousQuestion()
            return supertest(app)
                .post('/api/questions')
                .send(maliciousQuestion)
                .expect(201)
                .expect(res => {
                    expect(res.body.question).to.eql(expectedQuestion.question)
                    expect(res.body.guidance).to.eql(expectedQuestion.guidance)
                })
        })

    })

    describe(`DELETE /api/questions/:question_id`, () => {
        context(`Given no questions`, () => {
            it(`responds with 404`, () => {
                const questionId = 123456
                return supertest(app)
                    .delete(`/api/questions/${questionId}`)
                    .expect(404, { error: { message: `Question Not Found`}})
            })
        })
        context('Given there are questions in the database', () => {
            const testQuestions = makeQuestionsArray()

            beforeEach('insert questions', () => {
                return db
                    .into('questions')
                    .insert(testQuestions)
            })

            it('responds with 204 and removes the question', () => {
                const idToRemove = 2
                const expectedQuestions = testQuestions.filter(question => question.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/questions/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/questions`)
                        .expect(expectedQuestions)
                        )
            })
        })
    })
    describe.only(`PATCH /api/questions/:question_id`, () => {
        context(`Given no questions`, () => {
            it(`responds with 404`, () => {
                const questionId = 123456
                return supertest(app)
                    .patch(`/api/questions/${questionId}`)
                    .expect(404, { error: { message: `Question Not Found` } })
            })
        })
        context('Given there are questions in the database', () => {
            const testQuestions = makeQuestionsArray()

            beforeEach('insert questions', () => {
                return db
                    .into('questions')
                    .insert(testQuestions)
            })

            it('responds with 204 and updates the question', () => {
                const idToUpdate = 2
                const updateQuestion = {
                    question: 'updated question',
                    guidance: 'updted guidance'
                }
                const expectedQuestion = {
                    ...testQuestions[idToUpdate - 1],
                    ...updateQuestion
                }
                return supertest(app)
                    .patch(`/api/questions`)
            })
        } )
    })
})