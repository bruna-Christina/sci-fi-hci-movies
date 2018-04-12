var https = require("https");
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var pg = require('pg');
var app = express();

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Local environment variable setup
// Get databse_url
// $ heroku config
// -- for Mac and Linux
// $ export DATABASE_URL=postgres:...
// -- for Windows
// $ set DATABASE_URL=postgres:...
const dbPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

var endpointPrefix = '/api/';

app.get(endpointPrefix+'categories', function (request, response) {
  dbPool.connect(function(err, client, done) {
    if(err){
      var msg = 'Not able to get a database connection.';
      console.error(msg, err);
      response.status(400).json({msg:msg});
      return;
    }
    client.query('select id, name from category order by name', function(err, result) {
      done();
      if (err){ 
        var msg = 'Error getting categories from database.';
        console.error(msg, err);
        response.status(400).json({msg:msg});
        return;
      }
      response.json(result.rows);
    });
  });
});

app.post(endpointPrefix+'categories', function (request, response) {
  var catName = request.body.name;
  console.log('Adding category: ', request.body);
  dbPool.connect(function(err, client, done) {
    if(err){
      var msg = 'Not able to get a database connection.';
      console.error(msg, err);
      response.status(400).json({msg:msg});
      return;
    }
    client.query('INSERT INTO CATEGORY (NAME) VALUES ($1) RETURNING ID', [catName], function(err, result) {
      done();
      if (err){ 
        var msg = 'Error creating category ' + catName;
        console.error(msg, err);
        response.status(400).json({msg:msg});
        return;
      }
      var catId = result.rows[0].id;
      response.json({
        id: catId,
        name: catName
      });
    });
  });
});

app.get(endpointPrefix+'movies', function (request, response) {
  dbPool.connect(function(err, client, done) {
    if(err){
      var msg = 'Not able to get a database connection.';
      console.error(msg, err);
      response.status(400).json({msg:msg});
      return;
    }
    var sql = ` select m.id as movid, m.name as movname,
      m.plot, m.poster, m.imdb, m.year,
      c.id as catid, c.name as catname
      from movie m
      inner join mov_ctg mc on m.id = mc.movie_id
      inner join category c on c.id = mc.category_id
      order by movid, catname `;
    client.query(sql, function(err, result) {
      done();
      if (err){ 
        var msg = 'Error getting movies from database.';
        console.error(msg, err);
        response.status(400).json({msg:msg});
        return;
      }
      var rows = result.rows;
      var movieIdIndexmap = {};
      var movies = [];
      rows.forEach((row)=>{
        var category = {
          id: row.catid,
          name: row.catname
        };
        if(movieIdIndexmap[row.movid] === undefined){
          movies.push({
            id:row.movid,
            name:row.movname,
            plot:row.plot,
            poster:row.poster,
            imdb: row.imdb,
            year: row.year,
            categories:[category]
          });
          var index = movies.length -1;
          movieIdIndexmap[row.movid] = index;
        } else{
          var index = movieIdIndexmap[row.movid];
          movies[index].categories.push(category)
        }
      });
      movies.sort(function(a,b){
        var movA = a.name.toLowerCase();
        var movB = b.name.toLowerCase();
        if(movA < movB) return -1;
        if(movA > movB) return 1;
        return 0;
      });
      response.json(movies);
    });
  });
});

app.post(endpointPrefix+'movies', function (request, response) {
  var movie = request.body;
  // console.log('Adding Movie: ', movie);
  dbPool.connect(function(err, client, done) {
    if(err){
      var msg = 'Not able to get a database connection.';
      console.error(msg, err);
      response.status(400).json({msg:msg});
      return;
    }
    var values = [movie.name, movie.plot, movie.poster, movie.year, 'teste'];
    client.query('INSERT INTO MOVIE (NAME, PLOT, POSTER, YEAR, IMDB) VALUES ($1,$2,$3,$4,$5) RETURNING ID', values, function(err, result) {
      if (err){ 
        done();
        var msg = 'Error creating movie ' + movie.name;
        console.error(msg, err);
        response.status(400).json({msg:msg});
        return;
      }
      var id = result.rows[0].id;
      movie.id = id;
      
      var sql = 'INSERT INTO MOV_CTG (MOVIE_ID,CATEGORY_ID) VALUES ';
      movie.categories.forEach((cat, i)=>{
        sql += `(${id},${cat.id})`;
        if(i + 1 < movie.categories.length){
          sql +=',';
        }
      });
      sql+=';';
      client.query(sql, function(err, result) {
        done();
        if (err){ 
          var msg = 'Error associating movie with categories ' + movie.name;
          console.error(msg, err);
          response.status(400).json({msg:msg});
          return;
        }
        response.json(movie);
      });
    });
  });
});

// set MOVIE_DB_API=
var theMovieDbOrgImageBasePath = 'https://image.tmdb.org/t/p/';
var theMovieDbOrgImageSize = 'w200';
app.get(endpointPrefix+'movies/search', function (request, response) {
  var movieName = request.query.name;
  var url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_DB_API}&page=1&query=${movieName}`;
  https.get(url, function(res){
    var body = '';
    res.on('data', function(chunk){
        body += chunk;
    });
    res.on('end', function(){
        var movieResponse = JSON.parse(body);
        var movies = [];
        movieResponse.results.forEach((result)=>{
          var year = new Date(result.release_date).getFullYear();
          var poster = null;
          if(result.poster_path !== null){
            poster = theMovieDbOrgImageBasePath + theMovieDbOrgImageSize + result.poster_path;
          }
          movies.push({
            name: result.title,
            plot: result.overview,
            poster: poster,
            TMDbID:result.id,
            // imdb: result.imdb,
            year: year,
          });
        });
        response.json(movies);
    });
  }).on('error', function(e){
    var msg = 'Not able to search movie:' + movieName;
    console.error(msg, err);
    response.status(400).json({msg:msg});
  });
});

// prevent heroku app from sleeping
setInterval(function() {
  console.log('Https request to avoid sleeping mode.', new Date());
  https.get("https://sci-fi-hci-movies.herokuapp.com/");
}, 3300000); // every 55 minutes (300000)

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});