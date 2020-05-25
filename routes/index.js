const express = require('express')
const router = express.Router()
const Database = require('../helpers/database')

/* GET home page. */
router.get('/', function(req, res) {
    const onConnect = async function() {
        const exerciseModel = Database.createExerciseModel()
        const exercises = await exerciseModel.find({})
        res.render('index', {exercises: exercises,})
    }
    Database.connect(onConnect)
})

module.exports = router
