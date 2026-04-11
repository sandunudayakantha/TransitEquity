import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import keepAwake from './utils/keepAwake.js';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    // Keep the server awake on Render/Heroku
    if (process.env.NODE_ENV === 'production') {
        keepAwake();
    }
});

export default app;
