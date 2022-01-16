module.exports = app => {
    const users = require("../controllers/user.controller.js")
    app.post("/user", users.createUser)
    app.post("/login", users.login)
    app.get("/user", users.findUser)
    app.delete("/user", users.deleteUser)
    app.put("/user", users.changeUser)
    app.get("/activate/:token", users.activateUser)
    app.post("/resetpassword", users.resetPassword)
    app.get("/reset/:token", users.reset)
}   