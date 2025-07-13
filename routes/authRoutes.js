import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../db/prisma.js'

const router = express.Router();


const createToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? 'None' : 'Lax' 
    });


};

router.post('/signup', async (req, res) =>{
    try {
        const {email, password} = req.body;
        const checkExisting = await prisma.user.findUnique({ where : {email}});
        if (checkExisting){
            return res.status(400).json({message : "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data : {email, password : hashedPassword},
        });
        createToken(res, user.id);
        return res.status(201).json({message : "New User created"});
        
    } catch (error) {
        res.status(400).json({error : error.message});
    }
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await prisma.user.findUnique({ where : {email}});
        if (!user) return res.status(400).json({message : "No such user exists"});
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) return res.status(400).json({message : "Invalid Password"});
        createToken(res, user.id);
        return res.status(200).json({message : "Logged In"});
    } catch (error) {
        res.status(400).json({error : error.message});
    }
});

export default router;