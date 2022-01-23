const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const config = require("../config/user.config")
const db = require("../models")
const User = db.users

//se ocupa cu trimiterea pe email utilizatorilor a token-ului de validare a contului
class Mail {
    static transporter = nodemailer.createTransport(config.transport)
    static async send(to, url) {
        try {
            await this.transporter.sendMail({
                from: this.transporter.options.auth.user,
                to: to,
                subject: "Validare email",
                text: `Te rog acceseaza acest link pentru a verifica adresa de email: ${url}`
            })
            return true
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

//sterge toti utilizatorii din baza de date - am facut-o pentru partea de testare, in acest moment nu este apelata
deleteAll = () => User.find().then(data => data.forEach(async user => await User.findByIdAndRemove(user.id)))

//generaza token-ul care va fi trimis pe email pentru activarea contului
function generate_token(length) {
    let a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("")
    let b = []
    for (let i = 0; i < length; i++)
        b[i] = a[(Math.random() * (a.length - 1)).toFixed(0)]
    return b.join("")
}

//verific daca exista utilizatorul si daca parola data se potriveste cu cea din baza de date (pentru a se putea loga). Este folosita in functia deleteUser si changeUser.
async function check(username, password) {
    let user = await User.findOne({ "username": username })
    if (!user)
        return false
    return bcrypt.compareSync(password, user.password) && await activated(username)
}

async function activated(username) {
    let user = await User.findOne({ "username": username })
    return user.active != false
}

exports.login = async (req, res) => {
    if (!req.body.username || !req.body.password)
        res.status(500).send("Invalid request")
    let x = await check(req.body.username, req.body.password)
    if (x)
        res.status(200).send(x)
    else
        res.status(401).send(x)
}

//dupa ce verifica daca toate campurile sunt completate, daca username-ul nu este deja existent, iar parola respecta conditiile, se incearca trimiterea pe email a token-ului de activare al contului si se creeaza contul
exports.createUser = async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.email)
        res.status(500).send("Cerere invalida.")
    else if ((await User.find({ "username": req.body.username })).length > 0)
        res.status(500).send("Username deja existent.")
    else if (!config.passwordRegex.test(req.body.password))
        res.status(500).send("Parola trebuie sa contina minimum 8 caractere, cel putin o litera, o cifra si un caracter special.")
    else {
        let token = generate_token(config.tokenLength)
        if (await Mail.send(req.body.email, "reactive-backend/activate/" + token)) {
            let user = new User({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, config.saltOrRounds),
                email: req.body.email,
                active: false,
                activationToken: token,
                passwordToken: ""
            })
            user.save(user).then(data => res.send(data)).catch(err => res.status(500).send({ message: err.message || "Contul nu poate fi creat." }))
        }
        else
            res.status(500).send("Email-ul nu s-a putut trimite.")
    }
}

//verifica daca token-ul este valid, astfel se va activa contul punand variabila bool active pe true, iar activationToken va disparea
exports.activateUser = async (req, res) => {
    const token = req.params.token
    if (!token.length || token.length != config.tokenLength)
        res.status(500).send("Token invalid")
    const user = await User.findOne({ activationToken: token })
    if (!user)
        res.status(500).send("Token invalid")
    else {
        await User.findByIdAndUpdate(user.id, { active: true, activationToken: "" })
        res.status(201).send(`Contul utilizatorului ${user.username} a fost activat.`)
    }
}

//cauta utilizatorul dupa username in baza de date
//daca in cerere nu specific username-ul, imi intoarce toti utilizatorii 
exports.findUser = (req, res) => {
    let query = {}
    if (req.body.username)
        query["username"] = req.body.username
    User.find(query).then(data => res.send(data)).catch(err => console.log(err))
}

//sterge contul utilizatorului daca username-ul si parola sunt corecte
exports.deleteUser = async (req, res) => {
    if (!req.body.username || !req.body.password)
        res.status(500).send("Cerere invalida.")
    else if (!await check(req.body.username, req.body.password))
        res.status(401).send("Username sau parola invalida.")
    else
        User.deleteOne({ "username": req.body.username }).then(_ => res.status(200).send({ message: `Contul utilizatorului ${req.body.username} a fost sters.` }))
            .catch(_ => { res.status(500).send({ message: `Utilizatorul ${req.body.username} nu a putut fi sters (internal error).` }) })
}

//actualizeaza contul utilizatorului daca username-ul si parola sunt corecte
//daca utilizatorul doreste sa isi schimbe parola, va completa si campul newPassword
//daca utilizatorul doreste sa isi schimbe email-ul, va completa campul email cu noul noua adresa de email, astfel se va trimite ca si la creare, un token pentru a valida ca email-ul ii apartine 
exports.changeUser = async (req, res) => {
    if (!req.body.username || !req.body.password)
        res.status(500).send("Cerere invalida.")
    else if (!await check(req.body.username, req.body.password))
        res.status(401).send("Username sau parola invalida.")
    else {
        querry = {}
        if (req.body.newPassword)
            querry["password"] = bcrypt.hashSync(req.body.newPassword, config.saltOrRounds)
        if (req.body.email) {
            querry["email"] = req.body.email
            querry["active"] = false
            const token = generate_token(config.tokenLength)
            if (await Mail.send(req.body.email, "reactive-backend/activate/" + token))
                querry["activationToken"] = token
            else {
                res.status(500).send("Email-ul nu s-a putut trimite.")
                return
            }
        }
        const user = await User.findOne({ username: req.body.username })
        await User.findByIdAndUpdate(user.id, querry)
        res.status(201).send("Cont actualizat.")
    }
}

//pentru a reseta parola, utilizatorul trebuie sa isi introduca username-ul, astfel se genereaza un token pentru primirea parolei care se va trimite pe email 
exports.resetPassword = async (req, res) => {
    if (!req.body.username)
        res.status(500).send("Cerere invalida.")
    else {
        const user = await User.findOne({ username: req.body.username })
        if (!user)
            res.status(500).send("Utilizatorul nu exista.")
        else {
            const token = generate_token(config.tokenLength)
            if (await Mail.send(user.email, "reactive-backend/reset/" + token)) {
                await User.findByIdAndUpdate(user.id, { passwordToken: token })
                res.status(200).send("Verifica email-ul.")
            }
            else
                res.status(500).send("Email-ul nu s-a putut trimite.")
        }
    }
}

//daca link-ul primit pe mail ce contine token-ul este valid, dupa ce il acceseaza, utilizatorul va primi pe email noua parola
exports.reset = async (req, res) => {
    const token = req.params.token
    if (!token.length || token.length != config.tokenLength)
        res.status(500).send("Token invalid.")
    const user = await User.findOne({ passwordToken: token })
    if (!user)
        res.status(500).send("Token invalid.")
    else {
        newPassword = generate_token(config.newPasswordLength)
        await User.findByIdAndUpdate(user.id, {
            password: bcrypt.hashSync(newPassword, config.saltOrRounds),
            active: true,
            activationToken: "",
            passwordToken: ""
        })
        Mail.send(user.email, `New password: ${newPassword}`)
        res.status(201).send(`Contul utilizatorului ${user.username} a fost activat.`)
    }
}