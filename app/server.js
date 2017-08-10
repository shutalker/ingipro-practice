const express = require('express');

const PORT = 3000;
const app = express();


app.listen(PORT, () => {
    // eslint-disable-next-line
    console.log(`Server started on localhost:${PORT}`);
});
