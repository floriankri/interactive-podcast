const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Start the server
const PORT = 5003;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
}); 