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