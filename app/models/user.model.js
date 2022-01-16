module.exports = mongoose => {
	var schema = mongoose.Schema({
		username: String,
		password: String,
		email: String,
		active: Boolean,
		activationToken: String,
		passwordToken: String
	});
	return mongoose.model("users", schema);
};

//active - este o variabila devine true atunci cand utilizatorul isi activeaza contul

//activationToken - token-ul pe care il primeste utilizatorul pe email pentru activarea contului este generat automat si in momentul in care este accesat URL-ul ce contine acel token (app.post("/activate/:token", users.activateUser)), variabila booleana active va deveni true, ceea ce inseamna ca utilizatorul si-a activat contul

//passwordToken - este o parola generata random daca utilizatorul nu isi mai aminteste parola si doreste sa o reseteze, aceasta va fi trimisa pe email-ul utilizatorului