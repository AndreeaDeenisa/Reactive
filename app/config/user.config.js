module.exports = {
    saltOrRounds: 10,
    tokenLength: 30,
    newPasswordLength: 10,
    passwordRegex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    transport: {
        service: "gmail",
        auth: {
            user: "testTechWeb.dee@gmail.com",
            pass: "testtw123"
        },
        tls: {
            rejectUnauthorized: false
        }
    }
}

// tokenLength - lungimea token-ului trimis pe mail pentru activarea contului sau prmirea noii parole
// newPasswordLength - lungimea noii parole trimise pe mail utilizatorului in cazul in care acesta nu isi mai aminteste parola si doreste resetarea acesteia