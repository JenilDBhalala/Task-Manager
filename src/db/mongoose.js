const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify : false,
    useCreateIndex: true
})
.then(() => {
    console.log('connected to database!')
})
.catch(() => {
    console.log("some error occured!")
})