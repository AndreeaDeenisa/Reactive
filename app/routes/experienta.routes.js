module.exports = (app) => {
  const experiente = require("../controllers/experienta.controller.js");

  var router = require("express").Router();

  // Creeaza o Experienta
  router.post("/", experiente.creeazaExperienta);

  // Gaseste toate Experientele
  router.get("/", experiente.gasesteToateExperientele);

  // Modifica o Experienta in functie de ID
  router.put("/id/:id", experiente.modificaExperienta);

  // Sterge Experienta in functie de ID
  router.delete("/id/:id", experiente.stergeExperienta);

  // Gaseste o singura Experienta in functie de ID
  router.get("/id/:id", experiente.gasesteExperienta);

  // Gaseste experiente aplicand filtru dupa punct plecare si/sau punct sosire si/sau tipTransport
  router.get("/filterBy", experiente.filterBy);

  app.use("/experiente", router);
};
