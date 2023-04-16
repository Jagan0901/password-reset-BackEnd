import express from 'express';
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';
import  uniqueString from 'unique-string';
import {getUserByMail, genPassword, createUser, createCode, getCode} from '../helper.js'

const router = express.Router();

router.post("/signup",async(req,res)=> {
    const {email,password} = req.body;
    console.log(email,password);

    //To set Email Pattern
    if(!/^[\w]{1,}[\w.+-]{0,}@[\w-]{2,}([.][a-zA-Z]{2,}|[.][\w-]{2,}[.][a-zA-Z]{2,})$/g.test(email)){
        res.status(400).send({error: "Invalid Email Pattern"})
        return;
    }

    const isUserExist = await getUserByMail(email)
    console.log(isUserExist);
    if(isUserExist){
        res.status(400).send({error: "Email already exists"})
        return;
    }

    //To set Password Pattern
    if(!/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/g.test(password)){
        res.status(400).send({error: "Invalid Password Pattern"})
        return;
    }
    const hashedPassword = await genPassword(password);
    const create = await createUser(email,hashedPassword);
    res.send({message: "Created Successfully"});
});


//Login
router.post("/email", async(req,res)=> {
    const{email} = req.body;
    // console.log(email);
    
    const userFromDB = await getUserByMail(email);
    // console.log(userFromDB);
    if(!userFromDB){
        res.status(400).send({error: "Invalid Email or Password"})
        return;
    }
    const EMAIL    = process.env.EMAIL;
    const PASSWORD = process.env.PASSWORD

    // const storedDBPassword = userFromDB.password;
    // //To compare entered password and DB password are same
    // const isPasswordMatch = await bcrypt.compare(password,storedDBPassword);
    // if(!isPasswordMatch){
    //     res.status(400).send({error: "Invalid Email or Password"})
    //     return;
    // }
    const uniqueCode = uniqueString();
    const code = await createCode(uniqueCode);
    

    let config = {
        service : 'gmail',
        auth : {
            user: EMAIL,
            pass: PASSWORD
        }
    }

    let transporter = nodemailer.createTransport(config);

    let message = {
        from : EMAIL,
        to : email,
        subject: "Password Reset",
        text : `CODE: ${uniqueCode}`
    }

    transporter.sendMail(message).then(() => {
        return res.status(201).send({
            message: "We've send the Code to your email. Please check and Enter correctly"
        })
    }).catch(error => {
        return res.status(500).send({ error:error })
    })
})

router.post("/verify", async(req,res)=>{
    const{code} = req.body;
    const isCodeExists = await getCode(code);
    if(!isCodeExists){
        res.status(400).send({error:"Invalid Code .Please check it once and enter"});
        return;
    }
    res.send({message: 'Verified Successfully'})
})




export const userRouter = router;