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
})