const express = require('express')
const app = express()
const path = require('path')

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))

const PORT = process.env.PORT || 3000

app.route('/basicline').get((req, res) => res.render('basicline'))
app.route('/example').get((req, res) => res.render('example'))
app.route('/index').get((req, res) => res.render('index'))
app.route('/indexCopy').get((req, res) => res.render('indexCopy'))

app.listen(PORT, () => console.log(new Date().toLocaleTimeString()))