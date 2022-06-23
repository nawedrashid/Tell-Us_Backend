const express = require('express');
const App = express();
const { ConnectionDB } = require('./Connection');
const fileupload = require('express-fileupload')

const port = process.env.PORT || 6000;

ConnectionDB();

const bodyParser = require('body-parser');

App.use(fileupload({
    useTempFiles: true
}))
App.use(bodyParser.json())


App.get('/',(req,res)=>res.send("hello people"))

const userRoutes = require('./Routes/userRoutes')
App.use('/user',userRoutes)
const userActionRoutes = require('./Routes/userActionRoute')
App.use('/userActions',userActionRoutes)

App.listen(port,()=>console.log("Successfully connected to PORT",port));
