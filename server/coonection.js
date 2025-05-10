const mongoose = require("mongoose")

async function connection_db(url) {
    return mongoose.connect(url)
}
module.exports={
    connection_db,
}