import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* Zwrócenie prostej wiadomości */
app.get('/', (req, res) => {
    res.send('Server online');
});

/* Zwrócenie wszystkich filmów */
app.get('/movies', (req, res) => {
    fs.readFile('./movies.json', 'utf8', (err, moviesJson) => {
        if (err) {                                                              // BŁĄD - brak pliku movies.json - 500 - Internal Server Error
            console.log("File read failed in GET /movies: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        console.log("GET: /movies");
        res.send(moviesJson);                                                   // zwrócenie listy filmów z pliku movies.json - 200 - OK
    });
});

/* Zwrócenie filmu o podanym id*/
app.get('/movies/:id', (req, res) => {
    fs.readFile('./movies.json', 'utf8', (err, moviesJson) => {
        if (err) {                                                                              // BŁĄD - brak pliku movies.json - 500 - Internal Server Error
            console.log("File read failed in GET /movies/" + req.params.id + ": "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var movies = JSON.parse(moviesJson);                                                    // pobranie pliku JSON do obiektu (lista filmów)
        var movie = movies.find(movieTmp => movieTmp.id == req.params.id);                      // wyszukanie filmu o określonym id
        if (!movie) {                                                                           // BŁĄD - brak filmu o id pobranym w URL
            console.log("Can't find movie with id: " + req.params.id);
            res.status(500).send('Cant find movie with id: ' + req.params.id);
            return;
        }
        var movieJson = JSON.stringify(movie);                                                  // zapis pobranego obiektu movie w postaci JSON
        console.log("GET /movies/" + req.params.id);
        res.send(movieJson);                                                                    // zwrócenie pobranego filmu
    });
});

/* Dodanie filmu o podanym id */
app.post('/movies', (req, res) => {
    fs.readFile('./movies.json', 'utf8', (err, moviesJson) => {
        if (err) {                                                                              // BŁĄD - brak pliku movies.json
            console.log("File read failed in POST /movies: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var movies = JSON.parse(moviesJson);                                                    // pobranie pliku JSON do obiektu (lista filmów)
        var movie = movies.find(movieTmp => movieTmp.id == req.body.id);                        // wyszukanie filmu o określonym id w body
        if (!movie) {                                                                           // jeśli nie ma filmu o podanym id w pliku JSON, to go dodajemy
            movies.push(req.body);
            var newList = JSON.stringify(movies);                                               // zapis nowej listy filmów w postaci JSON
            fs.writeFile('./movies.json', newList, err => {
                if (err) {                                                                      // BŁĄD - nie można zapisać do pliku movies.json
                    console.log("Error writing file in POST /movies: "+ err);
                    res.status(500).send('Error writing file movies.json');
                } else {                                                                        // pomyślnie zapisano nową liste filmów do pliku movies.json
                    res.status(201).send(req.body);                                             // 201 - Created
                    console.log("Successfully wrote file movies.json and added new movie with id = " + req.body.id);
                }
            });
        } else {
            console.log("movie by id = " + req.body.id + " already exists");               // BŁĄD - podany film już istnieje
            res.status(500).send('movie by id = ' + req.body.id + ' already exists');
            return;
        }
    });
});

/* Edycja filmu o podanym id */
app.put('/movies/:id', (req, res) => {
    fs.readFile('./movies.json', 'utf8', (err, moviesJson) => {
        if (err) {                                                                                                          // BŁĄD - brak pliku movies.json
            console.log("File read failed in PUT /movies/" + req.params.id+": "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var movies = JSON.parse(moviesJson);
        var movieBody = movies.find(movieTmp => movieTmp.id == req.body.id);
        if (movieBody && movieBody.id != req.params.id) {                                                              // BŁĄD - istnieje juz film o id podanym w body jest on w pliku JSON
            console.log("movie by id = " + movieBody.id + " already exists");                                          // id w URL jest inne od id w body, nie możemy zmienić filmu
            res.status(500).send('movie by id = ' + movieBody.id + ' already exists');                                 // sprzeczne odwołanie do obiektu poprzez podanie innego id w url i body
            return;
        }
        var movie = movies.find(movieTmp => movieTmp.id == req.params.id);
        if (!movie) {                                                                                                           // Dodanie filmu gdy nie ma go jeszcze na liście w pliku JSON
            movies.push(req.body);                                                                                              // (gdy nie ma filmu o id przekazanym w URL (i body), to go dodajemy)
            var newList = JSON.stringify(movies);
            fs.writeFile('./movies.json', newList, err => {
                if (err) {
                    console.log("Error writing file in PUT /movies/" + req.params.id+": "+err);                                 // BŁĄD - nie można zapisać do pliku movies.json
                    res.status(500).send('Error writing file movies.json');
                } else {
                    res.status(201).send(req.body);                                                                             // 201 - Created
                    console.log("Successfully wrote file movies.json and added new movie with id = " + req.body.id);            // pomyślne dodanie nowego filmu
                }
            });
        } else {                                                                                                                // Zmiana istniejącego filmu na liście w pliku JSON
            for (var i = 0; i < movies.length; i++) {                                                                           // (gdy istnieje film o id przekazanym w URL, to go edytujemy)
                if (movies[i].id == movie.id) {
                    movies[i] = req.body;
                }
            }
            var newList = JSON.stringify(movies);
            fs.writeFile('./movies.json', newList, err => {
                if (err) {
                    console.log("Error writing file in PUT /movies/" + req.params.id+": "+ err);                                // BŁĄD - nie można zapisać do pliku movies.json
                    res.status(500).send('Error writing file movies.json');
                } else {
                    res.status(200).send(req.body);                                                                             // 200 - OK
                    console.log("Successfully wrote file movies.json and edit movie with old id = " + req.params.id);           // pomyślna edycja starego filmu
                }
            });
        }
    });
});

/* Usunięcie filmu o podanym id */
app.delete('/movies/:id', (req, res) => {
    fs.readFile('./movies.json', 'utf8', (err, moviesJson) => {
        if (err) {                                                                                          // BŁĄD - brak pliku movies.json
            console.log("File read failed in DELETE /movies: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var movies = JSON.parse(moviesJson);                                                                // pobranie pliku JSON do obiektu (lista filmów)
        var movieIndex = movies.findIndex(movieTmp => movieTmp.id == req.params.id);                        // wyszukanie filmu o określonym id
        if (movieIndex != -1) {                                                                             // jeżeli znaleziono id filmu w liście filmów to należy go usunąć
            movies.splice(movieIndex, 1);
            var newList = JSON.stringify(movies);                                                           // zapis nowej listy filmów w postaci JSON
            fs.writeFile('./movies.json', newList, err => {
                if (err) {
                    console.log("Error writing file in DELETE /movies/" + req.params.id+": "+ err);         // BŁĄD - nie można zapisać do pliku movies.json
                    res.status(500).send('Error writing file movies.json');
                } else {
                    res.status(204).send();                                                                 // pomyślnie zapisano nową liste filmów do pliku movies.json
                    console.log("Successfully deleted movie with id = " + req.params.id);                   // 204 - No content
                }
            });
        } else {
            console.log("movie by id = " + req.params.id + " does not exists");                             // BŁĄD - brak filmu o podanym id, więc nie trzeba nic usuwać
            res.status(500).send('movie by id = ' + req.params.id + ' does not exists');
            return;
        }
    });
});

/* Zwrócenie wszystkich sal */
app.get('/halls', (req, res) => {
    fs.readFile('./halls.json', 'utf8', (err, hallsJson) => {
        if (err) {
            console.log("File read failed in GET /halls: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        console.log("GET: /halls");
        res.send(hallsJson);
    });
});

/* Zwrócenie sali o podanym id*/
app.get('/halls/:id', (req, res) => {
    fs.readFile('./halls.json', 'utf8', (err, hallsJson) => {
        if (err) {
            console.log("File read failed in GET /halls/" + req.params.id + ": "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var halls = JSON.parse(hallsJson);
        var hall = halls.find(hallTmp => hallTmp.number == req.params.id);
        if (!hall) {
            console.log("Can't find hall with id: " + req.params.id);
            res.status(500).send('Cant find hall with id: ' + req.params.id);
            return;
        }
        var hallJson = JSON.stringify(hall);
        console.log("GET /halls/" + req.params.id);
        res.send(hallJson);
    });
});

/* Dodanie sali o podanym id */
app.post('/halls', (req, res) => {
    fs.readFile('./halls.json', 'utf8', (err, hallsJson) => {
        if (err) {
            console.log("File read failed in POST /halls: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var halls = JSON.parse(hallsJson);
        var hall = halls.find(hallTmp => hallTmp.number == req.body.id);
        if (!hall) {
            halls.push(req.body);
            var newList = JSON.stringify(halls);
            fs.writeFile('./halls.json', newList, err => {
                if (err) {
                    console.log("Error writing file in POST /halls: "+ err);
                    res.status(500).send('Error writing file halls.json');
                } else {
                    res.status(201).send(req.body);
                    console.log("Successfully wrote file halls.json and added new hall with id = " + req.body.id);
                }
            });
        } else {
            console.log("hall by id = " + req.body.id + " already exists");
            res.status(500).send('hall by id = ' + req.body.id + ' already exists');
            return;
        }
    });
});

/* Edycja sali o podanym id */
app.put('/halls/:id', (req, res) => {
    fs.readFile('./halls.json', 'utf8', (err, hallsJson) => {
        if (err) {
            console.log("File read failed in PUT /halls/" + req.params.id+": "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var halls = JSON.parse(hallsJson);
        var hallBody = halls.find(hallTmp => hallTmp.number == req.body.id);
        if (hallBody && hallBody.id != req.params.id) {
            console.log("hall by id = " + hallBody.id + " already exists");
            res.status(500).send('hall by id = ' + hallBody.id + ' already exists');
            return;
        }
        var hall = halls.find(hallTmp => hallTmp.number == req.params.id);
        if (!hall) {
            halls.push(req.body);
            var newList = JSON.stringify(halls);
            fs.writeFile('./halls.json', newList, err => {
                if (err) {
                    console.log("Error writing file in PUT /halls/" + req.params.id+": "+err);
                    res.status(500).send('Error writing file halls.json');
                } else {
                    res.status(201).send(req.body);
                    console.log("Successfully wrote file halls.json and added new hall with id = " + req.body.id);
                }
            });
        } else {
            for (var i = 0; i < halls.length; i++) {
                if (halls[i].id == hall.id) {
                    halls[i] = req.body;
                }
            }
            var newList = JSON.stringify(halls);
            fs.writeFile('./halls.json', newList, err => {
                if (err) {
                    console.log("Error writing file in PUT /halls/" + req.params.id+": "+ err);
                    res.status(500).send('Error writing file halls.json');
                } else {
                    res.status(200).send(req.body);
                    console.log("Successfully wrote file halls.json and edit hall with old id = " + req.params.id);
                }
            });
        }
    });
});

/* Usunięcie sali o podanym id */
app.delete('/halls/:id', (req, res) => {
    fs.readFile('./halls.json', 'utf8', (err, hallsJson) => {
        if (err) {
            console.log("File read failed in DELETE /halls: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var halls = JSON.parse(hallsJson);
        var hallIndex = halls.findIndex(hallTmp => hallTmp.number == req.params.id);
        if (hallIndex != -1) {
            halls.splice(hallIndex, 1);
            var newList = JSON.stringify(halls);
            fs.writeFile('./halls.json', newList, err => {
                if (err) {
                    console.log("Error writing file in DELETE /halls/" + req.params.id+": "+ err);
                    res.status(500).send('Error writing file halls.json');
                } else {
                    res.status(204).send();
                    console.log("Successfully deleted hall with id = " + req.params.id);
                }
            });
        } else {
            console.log("hall by id = " + req.params.id + " does not exists");
            res.status(500).send('hall by id = ' + req.params.id + ' does not exists');
            return;
        }
    });
});

/* Zwrócenie wszystkich seansów */
app.get('/seances', (req, res) => {
    fs.readFile('./seances.json', 'utf8', (err, seancesJson) => {
        if (err) {
            console.log("File read failed in GET /seances: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        console.log("GET: /seances");
        res.send(seancesJson);
    });
});

/* Zwrócenie seansu o podanym id*/
app.get('/seances/:id', (req, res) => {
    fs.readFile('./seances.json', 'utf8', (err, seancesJson) => {
        if (err) {
            console.log("File read failed in GET /seances/" + req.params.id + ": "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var seances = JSON.parse(seancesJson);
        var seance = seances.find(seanceTmp => seanceTmp.id == req.params.id);
        if (!seance) {
            console.log("Can't find seance with id: " + req.params.id);
            res.status(500).send('Cant find seance with id: ' + req.params.id);
            return;
        }
        var seanceJson = JSON.stringify(seance);
        console.log("GET /seances/" + req.params.id);
        res.send(seanceJson);
    });
});

/* Dodanie seansu o podanym id */
app.post('/seances', (req, res) => {
    fs.readFile('./seances.json', 'utf8', (err, seancesJson) => {
        if (err) {
            console.log("File read failed in POST /seances: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var seances = JSON.parse(seancesJson);
        var seance = seances.find(seanceTmp => seanceTmp.id == req.body.id);
        if (!seance) {
            seances.push(req.body);
            var newList = JSON.stringify(seances);
            fs.writeFile('./seances.json', newList, err => {
                if (err) {
                    console.log("Error writing file in POST /seances: "+ err);
                    res.status(500).send('Error writing file seances.json');
                } else {
                    res.status(201).send(req.body);
                    console.log("Successfully wrote file seances.json and added new seance with id = " + req.body.id);
                }
            });
        } else {
            console.log("seance by id = " + req.body.id + " already exists");
            res.status(500).send('seance by id = ' + req.body.id + ' already exists');
            return;
        }
    });
});

/* Edycja seansu o podanym id */
app.put('/seances/:id', (req, res) => {
    fs.readFile('./seances.json', 'utf8', (err, seancesJson) => {
        if (err) {
            console.log("File read failed in PUT /seances/" + req.params.id+": "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var seances = JSON.parse(seancesJson);
        var seanceBody = seances.find(seanceTmp => seanceTmp.id == req.body.id);
        if (seanceBody && seanceBody.id != req.params.id) {
            console.log("seance by id = " + seanceBody.id + " already exists");
            res.status(500).send('seance by id = ' + seanceBody.id + ' already exists');
            return;
        }
        var seance = seances.find(seanceTmp => seanceTmp.id == req.params.id);
        if (!seance) {
            seances.push(req.body);
            var newList = JSON.stringify(seances);
            fs.writeFile('./seances.json', newList, err => {
                if (err) {
                    console.log("Error writing file in PUT /seances/" + req.params.id+": "+err);
                    res.status(500).send('Error writing file seances.json');
                } else {
                    res.status(201).send(req.body);
                    console.log("Successfully wrote file seances.json and added new seance with id = " + req.body.id);
                }
            });
        } else {
            for (var i = 0; i < seances.length; i++) {
                if (seances[i].id == seance.id) {
                    seances[i] = req.body;
                }
            }
            var newList = JSON.stringify(seances);
            fs.writeFile('./seances.json', newList, err => {
                if (err) {
                    console.log("Error writing file in PUT /seances/" + req.params.id+": "+ err);
                    res.status(500).send('Error writing file seances.json');
                } else {
                    res.status(200).send(req.body);
                    console.log("Successfully wrote file seances.json and edit seance with old id = " + req.params.id);
                }
            });
        }
    });
});

/* Usunięcie seansu o podanym id */
app.delete('/seances/:id', (req, res) => {
    fs.readFile('./seances.json', 'utf8', (err, seancesJson) => {
        if (err) {
            console.log("File read failed in DELETE /seances: "+ err);
            res.status(500).send('File read failed');
            return;
        }
        var seances = JSON.parse(seancesJson);
        var seanceIndex = seances.findIndex(seanceTmp => seanceTmp.id == req.params.id);
        if (seanceIndex != -1) {
            seances.splice(seanceIndex, 1);
            var newList = JSON.stringify(seances);
            fs.writeFile('./seances.json', newList, err => {
                if (err) {
                    console.log("Error writing file in DELETE /seances/" + req.params.id+": "+ err);
                    res.status(500).send('Error writing file seances.json');
                } else {
                    res.status(204).send();
                    console.log("Successfully deleted seance with id = " + req.params.id);
                }
            });
        } else {
            console.log("seance by id = " + req.params.id + " does not exists");
            res.status(500).send('seance by id = ' + req.params.id + ' does not exists');
            return;
        }
    });
});

app.listen(7777, () => console.log("Server address http://localhost:7777"));