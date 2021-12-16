const { request } = require("express");
const db = require("../models");
const Experienta = db.experiente;

// Creeaza si Salveaza o noua Experienta
exports.creeazaExperienta = (req, res) => {
  // Valideaza cererea
  if (!req.body.punctPlecare && !req.body.punctSosire
    && !req.body.tipTransport && !req.body.oraPlecarii
    && !req.body.durataCalatoriei && !req.body.gradAglomerare) {
    res.status(400).send({ message: "Continutul campurilor nu poate fi gol!" });
    return;
  }

  if (req.body.durataCalatoriei <= 0) {
    res.status(400).send({ message: "Durata calatoriei nu poate fi mai mica sau egala cu 0." })
    return;
  }

  if (req.body.gradAglomerare < 1 || req.body.gradAglomerare > 10) {
    res.status(400).send({ message: "Gradul de aglomerare trebuie sa fie cuprins intre 1 si 10." })
    return;
  }

  if (req.body.nivelSatisfactie < 1 || req.body.nivelSatisfactie > 5) {
    res.status(400).send({ message: "Nivelul de satisfactie trebuie sa fie cuprins intre 1 si 5." })
    return;
  }

  // Creeaza o Experienta
  const experienta = new Experienta({
    id_utilizator: req.body.id_utilizator,
    punctPlecare: req.body.punctPlecare,
    punctSosire: req.body.punctSosire,
    tipTransport: req.body.tipTransport,
    oraPlecarii: req.body.oraPlecarii,
    durataCalatoriei: req.body.durataCalatoriei,
    gradAglomerare: req.body.gradAglomerare,
    observatii: req.body.observatii,
    nivelSatisfactie: req.body.nivelSatisfactie
  });

  // Salveaza Experienta in Baza de Date
  experienta.save(experienta).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "S-a produs o eroare la momentul creari Experientei."
    });
  });
};

// Extrage toate Experientele din BD
exports.gasesteToateExperientele = (req, res) => {
  var query = req.query;

  if (query.hasOwnProperty("id_utilizator")) query["id_utilizator"] = query.id_utilizator;
  if (query.hasOwnProperty("punctPlecare")) query["punctPlecare"] = query.punctPlecare;
  if (query.hasOwnProperty("punctSosire")) query["punctSosire"] = query.punctSosire;
  if (query.hasOwnProperty("tipTransport")) query["tipTransport"] = query.tipTransport;
  if (query.hasOwnProperty("oraPlecarii")) query["oraPlecarii"] = query.oraPlecarii.toDate();
  if (query.hasOwnProperty("durataCalatoriei")) query["durataCalatoriei"] = parseInt(query.durataCalatoriei);
  if (query.hasOwnProperty("gradAglomerare")) query["gradAglomerare"] = parseInt(query.gradAglomerare);
  if (query.hasOwnProperty("observatii")) query["observatii"] = query.observatii;
  if (query.hasOwnProperty("nivelSatisfactie")) query["nivelSatisfactie"] = parseInt(query.nivelSatisfactie);

  Experienta.find(query)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "S-a produs o eroare la extragerea datelor..."
      });
    });
};

// Extrage o singura Experienta in functie de ID
exports.gasesteExperienta = (req, res) => {
  const id = req.params.id;

  Experienta.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Nu s-a gasit experienta cu id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Eroare la extragerea Experientei cu id=" + id });
    });
};

// Modifica o Experienta in functie de ID
exports.modificaExperienta = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Datele care trebuie modificate nu pot fi goale!"
    });
  }

  const id = req.params.id;

  Experienta.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Nu se poate modifica Experienta cu id=${id}. Posibil Experienta sa nu fi fost gasita.`
        });
      } else res.send({ message: "Experienta a fost modificata cu succes!" });
    })
    .catch(err => {
      res.status(500).send({
        message: "Eroare la modificarea Experientei cu id=" + id
      });
    });
};

// Sterge o Experienta in functie de ID
exports.stergeExperienta = (req, res) => {
  const id = req.params.id;

  Experienta.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Nu se poate sterge Experienta cu id=${id}. Experienta poate sa nu existe!`
        });
      } else {
        res.send({
          message: "Experienta a fost stearsa cu succes!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Nu s-a putut sterge Experienta cu id=" + id
      });
    });
};

// Extrage toate experientele in functie de ID-ul utilizatorului 
exports.extrageExperienteUtilizator = (req, res) => {
  const id_utilizator = req.params.id_utilizator;
  Experienta.find({ id_utilizator: id_utilizator })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "S-a produs o eroare la extragerea Experientelor.."
      });
    });
};


// CAUTARE

exports.filterBy = (req, res) => {
  var keys = Object.keys(req.query);
  var nrKeys = keys.length;
  if (nrKeys == 1) {
    var firstKey = keys[0];
    if (firstKey === "punctPlecare") {
      var punctPlecare = req.query[keys[0]];
      Experienta.find({ punctPlecare: punctPlecare })
        .then(data => {
          if (Object.keys(data).length == 0) {
            res.status(404).send({ message: "Nu s-a gasit nicio experienta cu punctul de plecare  " + punctPlecare });
          } else res.send(data);
        })
        .catch(err => {
          res
            .status(500)
            .send({ message: "Eroare la afisarea experientelor cu punctul de plecare " + punctPlecare });
        });
    }
    else if (firstKey === "punctSosire") {
      var punctSosire = req.query[keys[0]];
      Experienta.find({ punctSosire: punctSosire })
        .then(data => {
          if (Object.keys(data).length == 0) {
            res.status(404).send({ message: "Nu s-a gasit nicio experienta cu punctul de sosire  " + punctSosire });
          } else res.send(data);
        })
        .catch(err => {
          res
            .status(500)
            .send({ message: "Eroare la afisarea experientelor cu punctul de sosire " + punctSosire });
        });
    }
    else if (firstKey === "tipTransport") {
      var tipTransport = req.query[keys[0]];
      Experienta.find({ tipTransport: tipTransport })
        .then(data => {
          if (Object.keys(data).length == 0) {
            res.status(404).send({ message: "Nu s-a gasit nicio experienta cu mijlocul de transport  de tip " + tipTransport });
          } else res.send(data);
        })
        .catch(err => {
          res
            .status(500)
            .send({ message: "Eroare la afisarea experientelor cu mijlocul de transport  de tip " + tipTransport });
        });
    }
  }
  else if (nrKeys == 2) {
    var firstKey = keys[0];
    var secondKey = keys[1];
    if (firstKey == "punctPlecare" && secondKey == "punctSosire") {
      var punctPlecare = req.query[keys[0]];
      var punctSosire = req.query[keys[1]];

      Experienta.find({ punctPlecare: punctPlecare, punctSosire: punctSosire })
        .then(data => {
          if (Object.keys(data).length == 0) {
            res.status(404).send({ message: "Nu s-a gasit nicio experienta cu punctul de plecare " + punctPlecare + " si cu punctul de sosire " + punctSosire });
          } else res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "S-a produs o eroare la extragerea Experientelor dupa punctul de plecare si punctul de sosire"
          });
        });
    }
    else if (firstKey == "punctPlecare" && secondKey == "tipTransport") {
      var punctPlecare = req.query[keys[0]];
      var tipTransport = req.query[keys[1]];

      Experienta.find({ punctPlecare: punctPlecare, tipTransport: tipTransport })
        .then(data => {
          if (Object.keys(data).length == 0) {
            res.status(404).send({ message: "Nu s-a gasit nicio experienta cu punctul de plecare " + punctPlecare + " utilizand mijlocul de transport de tip " + tipTransport });
          } else res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "S-a produs o eroare la extragerea Experientelor dupa punctul de plecare si dupa tipul mijlocului de transport"
          });
        });
    }
    else if (firstKey == "punctSosire" && secondKey == "tipTransport") {
      var punctSosire = req.query[keys[0]];
      var tipTransport = req.query[keys[1]];

      Experienta.find({ punctSosire: punctSosire, tipTransport: tipTransport })
        .then(data => {
          if (Object.keys(data).length == 0) {
            res.status(404).send({ message: "Nu s-a gasit nicio experienta cu punctul de sosire " + punctSosire + " utilizand mijlocul de transport de tip " + tipTransport });
          } else res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "S-a produs o eroare la extragerea Experientelor dupa punctul de sosire si dupa tipul de transport"
          });
        });
    }
  }
  else if (nrKeys == 3) {
    var firstKey = keys[0];
    var secondKey = keys[1];
    var thirdKey = keys[2];
    if (firstKey == "punctPlecare" && secondKey == "punctSosire" && thirdKey == "tipTransport") {
      var punctPlecare = req.query[keys[0]];
      var punctSosire = req.query[keys[1]];
      var tipTransport = req.query[keys[2]];
      Experienta.find({ punctPlecare: punctPlecare, punctSosire: punctSosire, tipTransport: tipTransport })
        .then(data => {
          if (Object.keys(data).length == 0) {
            res.status(404).send({
              message: "Nu s-a gasit nicio experienta cu punctul de plecare " + punctPlecare + " , cu punctul de sosire " + punctSosire +
                " utilizand mijlocul de transport de tip " + tipTransport
            });
          } else res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "S-a produs o eroare la extragerea Experientelor dupa punctul de plecare, punctul de sosire si dupa tipul mijlocului de transport"
          });
        });
    }
  }
  else if (nrKeys == 0) {
    res.status(400).send({ message: " Nu a fost introdus niciun parametru de filtrare" });
  }
};





