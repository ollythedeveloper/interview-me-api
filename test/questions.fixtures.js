function makeQuestionsArray() {
    return [
        {
            id: 1,
            question: 'First interview question.',
            guidance: 'Guidance for the first interview question.',
            response: ''
        },
        {
            id: 2,
            question: 'Second interview question.',
            guidance: 'Guidance for the second interview question.',
            response: ''
        },
        {
            id: 3,
            question: 'Third interview question.',
            guidance: 'Guidance for the third interview question.',
            response: ''
        },
    ];
}

function makeMaliciousQuestion() {
    const maliciousQuestion = {
        id: 911,
        question: 'Naughty naughty very naughty <script>alert("xss");</script>',
        guidance: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        response: ''
    }
    const expectedQuestion = {
        ...maliciousQuestion,
        question: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        guidance: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousQuestion,
        expectedQuestion,
    }
}

module.exports = {
    makeQuestionsArray,
    makeMaliciousQuestion,
}