const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to Ani-Frame base url');
})

app.listen(3000, () => {
    console.log('server is listening on port 3000');
});