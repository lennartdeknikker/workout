var express = require('express')
const Database = require('../helpers/database')
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
    const onConnect = async function() {
        const logModel = Database.createLogModel()
        const logs = await logModel.find({})
        res.json(logs)
    }
    Database.connect(onConnect)
})

module.exports = router
