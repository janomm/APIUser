var User = require("../models/User");
var PasswordToken = require("../models/PasswordToken");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var secret = "9793719213212002348208402934u029343454";

class UserController{
    async index(req,res){
        try{
            var users = await User.findAll();
            res.json(users);
        } catch(err){

        }
    }

    async findUser(req,res){
        var id = req.params.id;
        var user = await User.findById(id);
        if(user == undefined){
            res.status(404);
            res.json({});
        } else {
            res.status(200);
            res.json(user);
        }
    }

    async create(req,res){
        var {email,name,password} = req.body;
        
        if(email == undefined || email.trim().length == 0) {
            res.status(400);
            res.json({err: "O email é inválido"});
            return;
        }
        
        if(name == undefined || name.trim().length == 0) {
            res.status(400);
            res.json({err: "O nome é inválido"});
            return;
        }

        if(password == undefined || password.trim().length == 0) {
            res.status(400);
            res.json({err: "A senha é inválida"});
            return;
        }

        var emailExists = await User.findEmail(email);
        if (emailExists) {
            res.status(406);
            res.json({err: "O email já está cadastrado"});
            return;
        }

        await User.new(email,password,name);
        res.status(200);
        res.send("Tudo Ok");
    }

    async edit(req,res){
        var {id, name, role, email } = req.body;
        var result = await User.update(id,email,name,role);
        if (result != undefined){
            if(result.status){
                res.status(200);
                res.send("Tudo Ok");
            } else {
                res.status(406);
                // res.send(res.err);
                res.send("Ocorreu um erro no servidor");
            }
        }
    }

    async remove(req,res){
        var id = req.params.id;
        var result = await User.delete(id);
        if (result.status) {
            res.status(200);
            res.send("Tudo OK");
        } else {
            res.status(406);
            res.send(result.err);
        }
    }

    async recoverPassword(req,res){
        var email = req.body.email;

        var result = await PasswordToken.create(email);
        
        if(result.status){
            res.status(200);
            res.send("" + result.token);    
        } else {
            res.status(406);
            res.send(result.err);
        }
    }

    async changePassword(req,res){
        var token = req.body.token;
        var password = req.body.password;

        var isTokenValid = await PasswordToken.validate(token);
        if (isTokenValid.status){
            await PasswordToken.changePassword(password,isTokenValid.token.user_id,isTokenValid.token.token);
            res.status(200);
            res.send("Senha Alterada");

        } else {
            res.status(406);
            res.send("Token Inválido");
        }
    }

    async login(req,res){
        var {email,password} = req.body;

        if (email == undefined || password == undefined) {
            res.status(406);
            res.send("Parâmetros Inválidos");
            return;
        }

        var user = await User.findByEmail(email);
        if(user != undefined){ 
            var result = await bcrypt.compare(password, user.password);
            if(result){
                var token = jwt.sign({ email: email, role: user.role }, secret);
                res.status(200);
                res.json({token: token});
            } else {
                res.status(406);
                res.json( {err: "Senha incorreta!"});
            }
            
        } else {
            res.status(406);
            res.json({status:false, err: "Usuário não encontrado!"})
            // res.send("Usuário inválido");
        }

    }
}

module.exports = new UserController();