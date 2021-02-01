# Realtime Stock Market Tracker

> NOTE: this project is currently broken oweing to an API update. A fix is currently being worked on.

A data visualisation application to display historical and live stock data for subscribed (selected) stocks. Subscription data is shared in realtime with all other users.

Node / express app using socket.io, built with MongoDB / Mongoose for data persistance

Stock data provided by [IEX Trading](https://iextrading.com/)

# Live Demo
[https://crimson-bandana.glitch.me/](https://crimson-bandana.glitch.me/)

# Installation
```
$ git clone https://github.com/Oddert/stock-market-tracker.git
$ cd stock-market-tracker
$ npm i
```
### For development
```
$ npm run dev
```
### For a production build
```
$ npm start
```

## Scripts
| script | command                                        | action
|--------|------------------------------------------------|------------------------------------------------|
| start  | node app.js                                    | runs the server                                |
| dev | nodemon app.js                                 | runs the server with auto restart              |