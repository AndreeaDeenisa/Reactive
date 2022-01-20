const { ObjectId } = require("mongodb");

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      id_utilizator: ObjectId,
      punctPlecare: String,
      punctSosire: String,
      tipTransport: String,
      oraPlecarii: Date,
      durataCalatoriei: Number, //durata calatoriei in minute
      gradAglomerare: Number, //pe o scala de la 1 la 5
      observatii: String,
      nivelSatisfactie: Number, //pe o scala de la 1 la 5
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Experienta = mongoose.model("experiente", schema);
  return Experienta;
};
