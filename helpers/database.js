const mongoose = require('mongoose')

const Database = {
    connect: (callback) => {
        mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true })
        const db = mongoose.connection
        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', function() {
            callback()
        })
    },
    exerciseSchema: new mongoose.Schema({
        muscle: String,
        name: String
    }),
    logSchema: new mongoose.Schema({
        date: Date,
        muscle: String,
        exercise: String,
        weight: Number,
        reps: Number,
        difficulty: Number
    }),
    createLogModel: () => {
        return mongoose.model('log', Database.logSchema)
    },
    createExerciseModel: () => {
        return mongoose.model('exercise', Database.exerciseSchema)
    }
}

module.exports = Database