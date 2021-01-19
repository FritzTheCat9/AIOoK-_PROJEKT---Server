import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

/* Zwrócenie prostej wiadomości */
app.get("/", (req, res) => {
  res.send("Server online");
});

/* Zwrócenie wszystkich filmów */
app.get("/movies", (req, res) => {
  fs.readFile("./movies.json", "utf8", (err, moviesJson) => {
    if (err) {
      console.log("File read failed in GET /movies: " + err);
      res.status(500).send("File read failed");
      return;
    }
    console.log("GET: /movies");
    res.send(moviesJson);
  });
});

/* Zwrócenie filmu o podanym id*/
app.get("/movies/:id", (req, res) => {
  fs.readFile("./movies.json", "utf8", (err, moviesJson) => {
    if (err) {
      console.log(
        "File read failed in GET /movies/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var movies = JSON.parse(moviesJson);
    var movie = movies.find((movieTmp) => movieTmp.id == req.params.id);
    if (!movie) {
      console.log("Can't find movie with id: " + req.params.id);
      res.status(500).send("Cant find movie with id: " + req.params.id);
      return;
    }
    var movieJson = JSON.stringify(movie);
    console.log("GET /movies/" + req.params.id);
    res.send(movieJson);
  });
});

/* Dodanie filmu o podanym id */
app.post("/movies", (req, res) => {
  fs.readFile("./movies.json", "utf8", (err, moviesJson) => {
    if (err) {
      console.log("File read failed in POST /movies: " + err);
      res.status(500).send("File read failed");
      return;
    }
    var movies = JSON.parse(moviesJson);
    var movie = movies.find((movieTmp) => movieTmp.id == req.body.id);
    if (!movie) {
      movies.push(req.body);
      var newList = JSON.stringify(movies);
      fs.writeFile("./movies.json", newList, (err) => {
        if (err) {
          console.log("Error writing file in POST /movies: " + err);
          res.status(500).send("Error writing file movies.json");
        } else {
          res.status(201).send(req.body);
          console.log(
            "Successfully wrote file movies.json and added new movie with id = " +
            req.body.id
          );
        }
      });
    } else {
      console.log("movie by id = " + req.body.id + " already exists");
      res.status(500).send("movie by id = " + req.body.id + " already exists");
      return;
    }
  });
});

/* Edycja filmu o podanym id */
app.put("/movies/:id", (req, res) => {
  fs.readFile("./movies.json", "utf8", (err, moviesJson) => {
    if (err) {
      console.log(
        "File read failed in PUT /movies/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var movies = JSON.parse(moviesJson);
    var movieBody = movies.find((movieTmp) => movieTmp.id == req.body.id);
    if (movieBody && movieBody.id != req.params.id) {
      console.log("movie by id = " + movieBody.id + " already exists");
      res.status(500).send("movie by id = " + movieBody.id + " already exists");
      return;
    }
    var movie = movies.find((movieTmp) => movieTmp.id == req.params.id);
    if (!movie) {
      movies.push(req.body);
      var newList = JSON.stringify(movies);
      fs.writeFile("./movies.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in PUT /movies/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file movies.json");
        } else {
          res.status(201).send(req.body);
          console.log(
            "Successfully wrote file movies.json and added new movie with id = " +
            req.body.id
          );
        }
      });
    } else {
      for (var i = 0; i < movies.length; i++) {
        if (movies[i].id == movie.id) {
          movies[i] = req.body;
        }
      }
      var newList = JSON.stringify(movies);
      fs.writeFile("./movies.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in PUT /movies/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file movies.json");
        } else {
          res.status(200).send(req.body);
          console.log(
            "Successfully wrote file movies.json and edit movie with old id = " +
            req.params.id
          );
        }
      });
    }
  });
});

/* Usunięcie filmu o podanym id */
app.delete("/movies/:id", (req, res) => {
  fs.readFile("./movies.json", "utf8", (err, moviesJson) => {
    if (err) {
      console.log("File read failed in DELETE /movies: " + err);
      res.status(500).send("File read failed");
      return;
    }
    var movies = JSON.parse(moviesJson);
    var movieIndex = movies.findIndex(
      (movieTmp) => movieTmp.id == req.params.id
    );
    if (movieIndex != -1) {
      movies.splice(movieIndex, 1);
      var newList = JSON.stringify(movies);
      fs.writeFile("./movies.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in DELETE /movies/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file movies.json");
        } else {
          res.status(204).send();
          console.log("Successfully deleted movie with id = " + req.params.id);
        }
      });
    } else {
      console.log("movie by id = " + req.params.id + " does not exists");
      res
        .status(500)
        .send("movie by id = " + req.params.id + " does not exists");
      return;
    }
  });
});

/* Zwrócenie wszystkich sal */
app.get("/halls", (req, res) => {
  fs.readFile("./halls.json", "utf8", (err, hallsJson) => {
    if (err) {
      console.log("File read failed in GET /halls: " + err);
      res.status(500).send("File read failed");
      return;
    }
    console.log("GET: /halls");
    res.send(hallsJson);
  });
});

/* Zwrócenie sali o podanym id*/
app.get("/halls/:id", (req, res) => {
  fs.readFile("./halls.json", "utf8", (err, hallsJson) => {
    if (err) {
      console.log(
        "File read failed in GET /halls/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var halls = JSON.parse(hallsJson);
    var hall = halls.find((hallTmp) => hallTmp.number == req.params.id);
    if (!hall) {
      console.log("Can't find hall with id: " + req.params.id);
      res.status(500).send("Cant find hall with id: " + req.params.id);
      return;
    }
    var hallJson = JSON.stringify(hall);
    console.log("GET /halls/" + req.params.id);
    res.send(hallJson);
  });
});

/* Dodanie sali o podanym id */
app.post("/halls", (req, res) => {
  fs.readFile("./halls.json", "utf8", (err, hallsJson) => {
    if (err) {
      console.log("File read failed in POST /halls: " + err);
      res.status(500).send("File read failed");
      return;
    }
    var halls = JSON.parse(hallsJson);
    var hall = halls.find((hallTmp) => hallTmp.number == req.body.id);
    if (!hall) {
      halls.push(req.body);
      var newList = JSON.stringify(halls);
      fs.writeFile("./halls.json", newList, (err) => {
        if (err) {
          console.log("Error writing file in POST /halls: " + err);
          res.status(500).send("Error writing file halls.json");
        } else {
          res.status(201).send(req.body);
          console.log(
            "Successfully wrote file halls.json and added new hall with id = " +
            req.body.id
          );
        }
      });
    } else {
      console.log("hall by id = " + req.body.id + " already exists");
      res.status(500).send("hall by id = " + req.body.id + " already exists");
      return;
    }
  });
});

/* Edycja sali o podanym id */
app.put("/halls/:id", (req, res) => {
  fs.readFile("./halls.json", "utf8", (err, hallsJson) => {
    if (err) {
      console.log(
        "File read failed in PUT /halls/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var halls = JSON.parse(hallsJson);
    var hallBody = halls.find((hallTmp) => hallTmp.number == req.body.id);
    if (hallBody && hallBody.id != req.params.id) {
      console.log("hall by id = " + hallBody.id + " already exists");
      res.status(500).send("hall by id = " + hallBody.id + " already exists");
      return;
    }
    var hall = halls.find((hallTmp) => hallTmp.number == req.params.id);
    if (!hall) {
      halls.push(req.body);
      var newList = JSON.stringify(halls);
      fs.writeFile("./halls.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in PUT /halls/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file halls.json");
        } else {
          res.status(201).send(req.body);
          console.log(
            "Successfully wrote file halls.json and added new hall with id = " +
            req.body.id
          );
        }
      });
    } else {
      for (var i = 0; i < halls.length; i++) {
        if (halls[i].id == hall.id) {
          halls[i] = req.body;
        }
      }
      var newList = JSON.stringify(halls);
      fs.writeFile("./halls.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in PUT /halls/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file halls.json");
        } else {
          res.status(200).send(req.body);
          console.log(
            "Successfully wrote file halls.json and edit hall with old id = " +
            req.params.id
          );
        }
      });
    }
  });
});

/* Usunięcie sali o podanym id */
app.delete("/halls/:id", (req, res) => {
  fs.readFile("./halls.json", "utf8", (err, hallsJson) => {
    if (err) {
      console.log("File read failed in DELETE /halls: " + err);
      res.status(500).send("File read failed");
      return;
    }
    var halls = JSON.parse(hallsJson);
    var hallIndex = halls.findIndex(
      (hallTmp) => hallTmp.number == req.params.id
    );
    if (hallIndex != -1) {
      halls.splice(hallIndex, 1);
      var newList = JSON.stringify(halls);
      fs.writeFile("./halls.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in DELETE /halls/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file halls.json");
        } else {
          res.status(204).send();
          console.log("Successfully deleted hall with id = " + req.params.id);
        }
      });
    } else {
      console.log("hall by id = " + req.params.id + " does not exists");
      res
        .status(500)
        .send("hall by id = " + req.params.id + " does not exists");
      return;
    }
  });
});

/* Zwrócenie wszystkich seansów */
app.get("/seances", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log("File read failed in GET /seances: " + err);
      res.status(500).send("File read failed");
      return;
    }
    console.log("GET: /seances");
    res.send(seancesJson);
  });
});

/* Zwrócenie seansów w podanym dniu */
app.get("/seancesDate/:date", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in GET /seances/" + req.params.date + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seance = seances.filter(
      (seanceTmp) =>
        new Date(seanceTmp.date).getDate() ==
        new Date(req.params.date).getDate() &&
        new Date(seanceTmp.date).getMonth() ==
        new Date(req.params.date).getMonth() &&
        new Date(seanceTmp.date).getFullYear() ==
        new Date(req.params.date).getFullYear()
    );
    if (!seance) {
      console.log("Can't find seance with date: " + req.params.date);
      res
        .status(500)
        .send("Cant find seance with date: " + req.params.date + 1);
      return;
    }
    var seanceJson = JSON.stringify(seance);
    console.log("GET /seances/" + req.params.date);
    res.send(seanceJson);
  });
});

/* Zwrócenie seansów w podanym dniu i godzinie */
app.get("/seancesCur/:date", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in GET /seancesCur/" + req.params.date + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    console.log("DATA: " + req.params.date);
    var seances = JSON.parse(seancesJson);
    var seance = seances.filter(
      (seanceTmp) =>
        //new Date(seanceTmp.date).getTime() > new Date(req.params.date).getTime()
        new Date(
          new Date(seanceTmp.date).getTime() + seanceTmp.movie.duration * 60000
        ).getTime() > new Date(req.params.date).getTime()
    );

    if (!seance) {
      console.log("Can't find seance with date: " + req.params.date);
      res
        .status(500)
        .send("Cant find seance with date: " + req.params.date + 1);
      return;
    }
    var seanceJson = JSON.stringify(seance);
    console.log("GET /seancesCur/" + req.params.date);
    res.send(seanceJson);
  });
});

/* Zwrócenie seansów w podanym dniu i o podanym id filmu */
app.get("/seances/:date/:id", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in GET /seances/" +
        req.params.date +
        "/" +
        req.params.id +
        ": " +
        err
      );
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seance = seances.filter(
      (seanceTmp) =>
        seanceTmp.movie.id === parseInt(req.params.id) &&
        new Date(seanceTmp.date).getDate() ==
        new Date(req.params.date).getDate() &&
        new Date(seanceTmp.date).getMonth() ==
        new Date(req.params.date).getMonth() &&
        new Date(seanceTmp.date).getFullYear() ==
        new Date(req.params.date).getFullYear()
    );
    if (!seance) {
      console.log("Can't find seance with date: " + req.params.date);
      res
        .status(500)
        .send("Cant find seance with date: " + req.params.date + 1);
      return;
    }
    var seanceJson = JSON.stringify(seance);
    console.log("GET /seances/" + req.params.date);
    res.send(seanceJson);
  });
});

/* Zwrócenie seansu o podanym id */
app.get("/seances/:id", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in GET /seances/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seance = seances.find((seanceTmp) => seanceTmp.id == req.params.id);
    if (!seance) {
      console.log("Can't find seance with id: " + req.params.id);
      res.status(500).send("Cant find seance with id: " + req.params.id);
      return;
    }
    var seanceJson = JSON.stringify(seance);
    console.log("GET /seances/" + req.params.id);
    res.send(seanceJson);
  });
});

/* Zwrócenie seansÓW o podanym movie id */
app.get("/seances1/:id", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in GET /seances/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seance = seances.filter(
      (seanceTmp) => seanceTmp.movie.id == req.params.id
    );
    if (!seance) {
      console.log("Can't find seance with movie id: " + req.params.id);
      res.status(500).send("Cant find seance with movie id: " + req.params.id);
      return;
    }
    var seanceJson = JSON.stringify(seance);
    console.log("GET /seances/" + req.params.id);
    console.log("Seanse: " + seanceJson);
    res.send(seanceJson);
  });
});

/* Zwrócenie oglądalności filmu o podanym id */
app.get("/seancesView/:id", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in GET /seancesView/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seance = seances.filter(
      (seanceTmp) => seanceTmp.movie.id == req.params.id
    );

    if (!seance) {
      console.log("Can't find seance with movie id: " + req.params.id);
      res.status(500).send("Cant find seance with movie id: " + req.params.id);
      return;
    }
    var views = [0, 0, 0, 0, 0, 0, 0];
    seance.forEach((element) => {
      if (new Date(element.date).getDay() === 0) {
        views[0] += element.ticketsSold;
      } else if (new Date(element.date).getDay() === 1) {
        views[1] += element.ticketsSold;
      } else if (new Date(element.date).getDay() === 2) {
        views[2] += element.ticketsSold;
      } else if (new Date(element.date).getDay() === 3) {
        views[3] += element.ticketsSold;
      } else if (new Date(element.date).getDay() === 4) {
        views[4] += element.ticketsSold;
      } else if (new Date(element.date).getDay() === 5) {
        views[5] += element.ticketsSold;
      } else if (new Date(element.date).getDay() === 6) {
        views[6] += element.ticketsSold;
      }
    });
    var seanceJson = JSON.stringify(views);
    console.log("GET /seancesView/" + req.params.id);
    res.send(seanceJson);
  });
});

/* Dodanie seansu o podanym id */
app.post("/seances", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log("File read failed in POST /seances: " + err);
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seance = seances.find((seanceTmp) => seanceTmp.id == req.body.id);
    if (!seance) {
      seances.push(req.body);
      var newList = JSON.stringify(seances);
      fs.writeFile("./seances.json", newList, (err) => {
        if (err) {
          console.log("Error writing file in POST /seances: " + err);
          res.status(500).send("Error writing file seances.json");
        } else {
          res.status(201).send(req.body);
          console.log(
            "Successfully wrote file seances.json and added new seance with id = " +
            req.body.id
          );
        }
      });
    } else {
      console.log("seance by id = " + req.body.id + " already exists");
      res.status(500).send("seance by id = " + req.body.id + " already exists");
      return;
    }
  });
});

/* Edycja seansu o podanym id */
app.put("/seances/:id", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in PUT /seances/" + req.params.id + ": " + err
      );
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seanceBody = seances.find((seanceTmp) => seanceTmp.id == req.body.id);
    if (seanceBody && seanceBody.id != req.params.id) {
      console.log("seance by id = " + seanceBody.id + " already exists");
      res
        .status(500)
        .send("seance by id = " + seanceBody.id + " already exists");
      return;
    }
    var seance = seances.find((seanceTmp) => seanceTmp.id == req.params.id);
    if (!seance) {
      seances.push(req.body);
      var newList = JSON.stringify(seances);
      fs.writeFile("./seances.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in PUT /seances/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file seances.json");
        } else {
          res.status(201).send(req.body);
          console.log(
            "Successfully wrote file seances.json and added new seance with id = " +
            req.body.id
          );
        }
      });
    } else {
      for (var i = 0; i < seances.length; i++) {
        if (seances[i].id == seance.id) {
          seances[i] = req.body;
        }
      }
      var newList = JSON.stringify(seances);
      fs.writeFile("./seances.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in PUT /seances/" + req.params.id + ": " + err
          );
          res.status(500).send("Error writing file seances.json");
        } else {
          res.status(200).send(req.body);
          console.log(
            "Successfully wrote file seances.json and edit seance with old id = " +
            req.params.id
          );
        }
      });
    }
  });
});

/* Usunięcie seansu o podanym id */
app.delete("/seances/:id", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log("File read failed in DELETE /seances: " + err);
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seanceIndex = seances.findIndex(
      (seanceTmp) => seanceTmp.id == req.params.id
    );
    if (seanceIndex != -1) {
      seances.splice(seanceIndex, 1);
      var newList = JSON.stringify(seances);
      fs.writeFile("./seances.json", newList, (err) => {
        if (err) {
          console.log(
            "Error writing file in DELETE /seances/" +
            req.params.id +
            ": " +
            err
          );
          res.status(500).send("Error writing file seances.json");
        } else {
          res.status(204).send();
          console.log("Successfully deleted seance with id = " + req.params.id);
        }
      });
    } else {
      console.log("seance by id = " + req.params.id + " does not exists");
      res
        .status(500)
        .send("seance by id = " + req.params.id + " does not exists");
      return;
    }
  });
});

/* Usunięcie seansów będących na liscie */
app.delete("/seancesList/:id", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log("File read failed in DELETE /seances: " + err);
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    var seanceIndexList = seances.filter(
      (seanceTmp) => seanceTmp.movie.id != req.params.id
    );
    var newList = JSON.stringify(seanceIndexList);
    if (newList != undefined) {
      fs.writeFile("./seances.json", newList, (err) => {
        if (err) {
          /*console.log("File read failed in DELETE /seancesList: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var seances = JSON.parse(seancesJson);
        var seanceIndexList = seances.filter(seanceTmp => seanceTmp.movie.id != req.params.id);
        var newList = JSON.stringify(seanceIndexList);
        if (newList != undefined) {
            fs.writeFile('./seances.json', newList, err => {
                if (err) {
                    console.log("Error writing file in DELETE /seancesList/" + req.params.id+": "+ err);
                    res.status(500).send('Error writing file seances.json');
                } else {
                    res.status(204).send();
                    console.log("Successfully deleted seances with movie id = " + req.params.id);
                }
            });*/

          console.log(
            "Error writing file in DELETE /seancesList/" +
            req.params.id +
            ": " +
            err
          );
          res.status(500).send("Error writing file seances.json");
        } else {
          res.status(204).send();
          console.log(
            "Successfully deleted seance with movie id = " + req.params.id
          );
        }
      });
    } else {
      console.log("seance by movie id = " + req.params.id + " does not exists");
      res
        .status(500)
        .send("seance by movie id = " + req.params.id + " does not exists");
      return;
    }
  });
});

/* Edycja seansów po edycji filmów (update filmów w seansach) */
app.put("/seancesListEditMovies", (req, res) => {
  fs.readFile("./seances.json", "utf8", (err, seancesJson) => {
    if (err) {
      console.log(
        "File read failed in PUT /seancesListEditMovies/" +
        req.body.id +
        ": " +
        err
      );
      res.status(500).send("File read failed");
      return;
    }
    var seances = JSON.parse(seancesJson);
    seances.forEach((seance) => {
      if (
        seance.movie.id === req.body.id &&
        (seance.movie.title != req.body.title ||
          seance.movie.duration != req.body.duration)
      ) {
        seance.movie.title = req.body.title;
        seance.movie.duration = req.body.duration;
      }
    });
    var newList = JSON.stringify(seances);
    fs.writeFile("./seances.json", newList, (err) => {
      if (err) {
        console.log(
          "Error writing file in PUT /seancesListEditMovies/" +
          req.body.id +
          ": " +
          err
        );
        res.status(500).send("Error writing file seances.json");
      } else {
        res.status(200).send(req.body);
        console.log(
          "Successfully wrote file seances.json and edit seance with old id = " +
          req.body.id
        );
      }
    });
  });
});

app.listen(7777, () => console.log("Server address http://localhost:7777"));
