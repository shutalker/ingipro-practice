const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname, '..', 'build')));

app.listen(port, () => {
    // eslint-disable-next-line
    console.log(`Server started on localhost:${port}`);
});
