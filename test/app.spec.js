const app = require('../src/app')

describe('App', () => {
    it('GET / responds with 200 containing "Try the api/questions path!"', () => {
        return supertest(app)
        .get('/')
        .expect(200, 'Try the api/questions path!')
    })
})