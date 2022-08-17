var knex = require("../database/connection");
var bcrypt = require("bcrypt");
// var PasswordToken = require("../models/PasswordToken");
const e = require("express");

// Service
class User{
    async new(email,password,name){
        try{
            var hash = await bcrypt.hash(password,10);
            await knex.insert({email,password: hash,name,role:0}).table("users");
        } catch(err) {
            console.log(err);
        }
    }

    async findEmail(email){
        try{
            var result = await knex.select().table("users").where({email: email});

            if(result.length > 0){
                return true;
            } else 
            return false;
            console.log(result);
        } catch(err){
            console.log(err);
            return false;
        }
    }

    async findAll(){
        try {
            var result = await knex.select(['id','name','email','role']).table("users");
            return result;
        } catch(err){
            console.log(err);
            return [];
        }
    }

    async findById(id){
        try {
            var result = await knex.select(['id','name','email','role']).table("users").where({id:id});
            if(result.length > 0){
                return result;
            } else {
                return undefined;
            }
            return result;
        } catch(err){
            console.log(err);
            return undefined
        }
    }

    async findByName(name){
        try {
            var result = await knex.select(['id','name','email','role']).table("users").where({name:name});
            return result;
        } catch(err){
            console.log(err);
            return undefined;
        }
    }

    async findByEmail(email){
        try{
            var result = await knex.select(["id","email","password","role","name"]).where({email:email}).table("users");
            
            if(result.length > 0){
                return result[0];
            }else{
                return undefined;
            }

        }catch(err){
            console.log(err);
            return undefined;
        }
    }

    async update(id,email,name,role){
        var user = await this.findById(id);
        
        if(user == undefined){
            return {status:false,err:"O usuáro não existe"};
        } else {
            var editUser = {};
            if(email != undefined){
                if (email  != user.email){
                    var result = await this.findByEmail(email);
                    if (result == false){
                        editUser.email = email;
                    }
                } else {
                    return {status:false,err:"O e-mail já está cadastrado"};
                }
            }
            if(name != undefined){
                editUser.name = name;
            }

            if(role != undefined){
                editUser.role = role;
            }
            try{
                await knex.update(editUser).table("users").where({id:id});
                return {status:true};
            } catch(err){
                return {status:false,err: err};
            }
        }

    }

    async delete(id){
        var user = await this.findById(id);
        if (user != undefined){
            try{
                await knex.delete().where({id:id}).table("users");
                return {status:true};

            } catch(err){
                return {status:false,err:err};
            }

        } else {
            return {status:false,err:"O usuário não existe, não podendo ser excluído. "};
        }
        
    }

    
}

module.exports = new User();