const express = require('express')
const router = express.Router()
const Database = require('../helpers/database')

/* GET home page. */
router.post('/', function(req, res) {
    const exerciseName = req.body.new !== '' ? req.body.new : req.body.existing

    if (req.body.new !== '') saveNewExercise(req.body.muscle, req.body.new)
    saveNewLog(req.body.muscle, exerciseName, req.body.weight, req.body.reps, req.body.difficulty)

    function saveNewLog(muscle, exercise, weight, reps, difficulty) {
        const onConnect = async function() {        
            const LogModel = Database.createLogModel()
            const logDocument = new LogModel({
                date: new Date,
                muscle: muscle,
                exercise: exercise,
                weight: weight,
                reps: reps,
                difficulty: difficulty
            })
    
            logDocument.save((err, logDocument) => {
                if (err) return console.error(err)
                console.log('saved to database', logDocument)            
            })
        }
        Database.connect(onConnect)
    }

    function saveNewExercise(muscle, name) {
        const onConnect = function() {
            const exerciseModel = Database.createExerciseModel()
            const exerciseDocument = new exerciseModel({
                muscle: muscle,
                name: name
            })

            exerciseDocument.save((err, exerciseDocument) => {
                if (err) return console.error(err)
                console.log('saved new exercise', exerciseDocument)                
            })
        }        
        Database.connect(onConnect)
    }    
    res.redirect('/')
})

module.exports = router
