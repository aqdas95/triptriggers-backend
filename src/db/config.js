if(process.env.NODE_ENV === 'production'){
  module.exports = {mongoURI: 'mongodb://admin:admin123@ds241298.mlab.com:41298/heroku_xqghbb26'}
}
else{
  module.exports = {mongoURI: "mongodb+srv://admin:admin@fyp-triptriggers-labbs.mongodb.net/test?retryWrites=true&w=majority"}
  // module.exports = {mongoURI:'mongodb://127.0.0.1:27017/trip-triggers-api'}
}