import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();

// register a new user end point 
router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    // save the username and an irreversibly encrypted password
    // save the gilgamesh@gmail.com | ef.vvwv.w.vrwvwr.vw.vrwvw.rrb

    //encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    //console.log(username, password);
    //console.log(hashedPassword);

    try {
        //old db
        // const insertUser = db.prepare(`
        //     INSERT INTO users (username, password) 
        //     VALUES (?, ?)
        //     `);
        // const result = insertUser.run(username, hashedPassword);

        //new db
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });


        // now that we have a user, I want to add a first todo for them
         const defaultTodo = 'Hello :) Add your first todo';
        // const insertTodo = db.prepare(`
        //     INSERT INTO todos (user_id, task)
        //     VALUES (?, ?)
        //     `);
        // insertTodo.run(result.lastInsertRowid, defaultTodo);

        await prisma.todo.create({
            data: {
                task: defaultTodo,
                userId: user.id
            }
        })

        //create a token
        const token = jwt.sign(
            {id: result.lastInsertRowid},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        res.json({token})


    } catch (error) {
       console.log(error.message);
       res.sendStatus(503);
    }

    

    
    //res.sendStatus(201);
     
});

router.post('/login', async (req, res) => {
    // we get their email and we look up the password associated with that  email in the database.
    // but we get it back and see it's encrypted, which means that we cannot compare it to the one the user just used trying to login.
    // so what we can do, is again, one way encrypt the password the user just entered

    const {username, password} = req.body;

    try{ 
        // const getuser = db.prepare('SELECT * FROM users WHERE username = ?');
        // const user = getuser.get(username);

        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if(!user) {
            return res.status(404).send({
                message: "User Not Found"
            })
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        console.log(user);
        
        // if the password does not match return out of hte function
        if(!passwordIsValid) {
            return res.status(401).send({message: 'Invalid Password'});
        }

        // then we have a successful authentication
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'});

        res.json({token});




    } catch (err) {
        console.log(err.message);
        res.send(503);
    }

})

export default router;
