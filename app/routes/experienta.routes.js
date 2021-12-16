module.exports = app => {
  const experiente = require("../controllers/experienta.controller.js");

  // Creeaza o Experienta
  app.post("/", experiente.creeazaExperienta);

  // Gaseste toate Experientele
  app.get("/getExp", experiente.gasesteToateExperientele);

  // Modifica o Experienta in functie de ID
  app.put("/id/:id", experiente.modificaExperienta);

  // Sterge Experienta in functie de ID
  app.delete("/id/:id", experiente.stergeExperienta);

  // Gaseste o singura Experienta in functie de ID
  app.get("/id/:id", experiente.gasesteExperienta);

  // Gaseste experiente aplicand filtru dupa punct plecare si/sau punct sosire si/sau tipTransport
  app.get("/filterBy", experiente.filterBy);
};