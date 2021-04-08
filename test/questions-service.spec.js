const QuestionsService = require('../src/questions/questions-service')
const knex = require('knex')

describe(`Questions service object`, function() {
    let db

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_BD_URL,
        })
    })
})