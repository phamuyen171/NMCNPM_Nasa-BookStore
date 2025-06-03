const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('DEBUG: Value of process.env.MONGODB_URI:', process.env.MONGODB_URI);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Remove useCreateIndex and useFindAndModify if using Mongoose 6+
            // useCreateIndex: true,
            // useFindAndModify: false,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB; 