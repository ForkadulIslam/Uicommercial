const express = require('express');

const User = require('../Models/User');
const UserFollower = require('../Models/UserFollower');
const Murmur = require('../Models/Murmur');
const MurmurLike = require('../Models/MurmurLike')
require('./../Models/associations');

const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');
const Authcontroller = express.Router();
const Auth = require('../middlewares/Auth');
const {extractUserId} = require('./AuthUtils');
const { Sequelize, where } = require('sequelize');
const multer = require('multer');
const path = require('path');


// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images'); // Adjust the path as needed
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage });

Authcontroller.get('/api', (req, res) =>{
  res.json('Wellcome...');
});

Authcontroller.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({
        where:{
          email:email
        }
      });
      if (user) {
        const isValidPassword = await bcript.compare(password, user.password);
        if(isValidPassword){
          const token = jwt.sign({
            first_name:user.first_name,
            last_name: user.last_name,
            id:user.id,
            account_type: user.account_type,
            company_name: user.company_name,
            created_at: user.created_at
          },process.env.JWT_SECRET,{expiresIn:'365d'});
          res.status(200).json({
            access_token: token,
            message: "Login successful" 
          });
        }else{
          res.status(401).json({ message: "Invalid username or password" });
        }
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }

    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
});

Authcontroller.post('/api/registration', upload.single('image'), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      account_type,
      company_name,
      mobile_no,
      email,
      gender,
      password,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    // Check for duplicate email
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Validation Error', message: 'Email is already registered' });
    }

    // Create a new user
    const newUser = await User.create({
      first_name,
      last_name,
      account_type,
      company_name,
      mobile_no,
      email,
      gender,
      password,
      image,
    });

    // Exclude the password hash from the response
    const responseUser = {
      ...newUser.toJSON(),
      password: undefined,
    };

    return res.status(201).json(responseUser);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({ error: 'Validation Error', validationErrors });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

Authcontroller.get('/api/get_user', Auth,async (req, res) => {
  const user_id = extractUserId(req);
  try{
    
    const user = await User.findOne({
      where:{
        id:user_id,
      }
    });
    res.status(200).json(user); 
  }catch(error){
    console.log(error);
  }
  
});



Authcontroller.get('/api/my_timeline', Auth,async (req, res) => {
  const user_id = extractUserId(req);
  try{
    
    const followers = await User.findOne({
      where:{
        id:user_id
      },
      include:{
        model: UserFollower,
        required: false,
        include:[
          {
            model: User,
            attributes: ['id', 'name', 'password', 'created_at', 'updated_at'],
            foreignKey: 'followed_by',
            targetKey: 'id',
            as: 'follower',
          },
        ],
      }, 
    });
    let follower_ids = [user_id];
    if (followers && followers.UserFollowers) {
      followers.UserFollowers.forEach((follower) => {
        follower_ids.push(follower.followed_by);
      });
    }
    const murmurs = await Murmur.findAll({
      where: {
        user_id: {
          [Sequelize.Op.in]: follower_ids,
        },
      },
      include: [
        {
          model: MurmurLike,
          as: 'likes',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const modifiedMurmurs = murmurs.map((murmur) => {
      return {
        ...murmur.get(),
        is_deletable: murmur.user_id == user_id,
      };
    });
    
    


    res.status(200).json({
      user_details:followers,
      murmurs:modifiedMurmurs
    });

    
  }catch(error){
    console.log(error);
  }
  
});

Authcontroller.delete('/api/murmur/:id', Auth, async (req, res)=>{
  try{
    const murmurId = req.params.id;
    await Murmur.destroy({
      where: {
        id: murmurId,
      },
    });
    res.status(200).json({
      message: 'Murmur deleted successfully',
    });
  }catch(error){
    console.log(error);
  }

});

Authcontroller.get('/api/murmurs/:murmurId/like', async (req, res) => {
  const { murmurId } = req.params;
  const user_id = extractUserId(req);
  try {
    // Check if the user has already liked the murmur
    const existingLike = await MurmurLike.findOne({
      where: {
        murmur_id: murmurId,
        user_id: user_id,
      },
    });

    if (existingLike) {
      // User has already liked the murmur, you can handle this scenario as needed
      return res.status(400).json({ message: 'You have already liked this murmur.' });
    }

    // If the user hasn't liked the murmur, create a new like
    const like = await MurmurLike.create({
      murmur_id: murmurId,
      user_id: user_id,
    });

    

    res.status(200).json({ like: like });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

Authcontroller.get('/api/get_user_list', Auth,async (req, res) => {
  const user_id = extractUserId(req);
  try{
    
    const followers = await User.findOne({
      where:{
        id:user_id
      },
      include:{
        model: UserFollower,
        required: false,
      }, 
    });
    let follower_ids = [user_id];
    
    if (followers && followers.UserFollowers) {
      followers.UserFollowers.forEach((follower) => {
        follower_ids.push(follower.followed_by);
      });
    }
    
    const users = await User.findAll({
      where: {
        id: {
          [Sequelize.Op.not]: follower_ids,
        },
      },
    });
    
    res.json(users);
    
  }catch(error){
    console.log(error);
  }
  
});

Authcontroller.post('/api/add_follower', Auth, async (req, res) => {
  const user_id = extractUserId(req);
  const  followerId  = req.body.user_id;
  try {
    // Check if the user is trying to follow themselves
    if (user_id === followerId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    // Check if the followerId is a valid user
    const follower = await User.findOne({
      where: {
        id: followerId,
      },
    });

    if (!follower) {
      return res.status(404).json({ message: "Follower not found" });
    }

    // Check if the user is already following the given follower
    const existingFollower = await UserFollower.findOne({
      where: {
        user_id,
        followed_by: followerId,
      },
    });

    if (existingFollower) {
      return res.status(400).json({ message: "User is already following the given follower" });
    }

    // Add the follower
    await UserFollower.create({
      user_id: user_id,
      followed_by: followerId,
    });

    res.status(200).json({ message: "Follower added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

Authcontroller.post('/api/add_murmur', Auth, async (req, res) => {
  const user_id = extractUserId(req);
  const { content } = req.body;
  try {
    
    const newMurmur = await Murmur.create({
      user_id: user_id,
      content: content,
    });

    const followers = await User.findOne({
      where:{
        id:user_id
      },
      include:{
        model: UserFollower,
        required: false,
        include:[
          {
            model: User,
            attributes: ['id', 'name', 'password', 'created_at', 'updated_at'],
            foreignKey: 'followed_by',
            targetKey: 'id',
            as: 'follower',
          },
        ],
      }, 
    });
    let follower_ids = [user_id];

    if (followers && followers.UserFollowers) {
      followers.UserFollowers.forEach((follower) => {
        follower_ids.push(follower.followed_by);
      });
    }
    const murmurs = await Murmur.findAll({
      where: {
        user_id: {
          [Sequelize.Op.in]: follower_ids,
        },
      },
      include: [
        {
          model: MurmurLike,
          as: 'likes',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const modifiedMurmurs = murmurs.map((murmur) => {
      return {
        ...murmur.get(),
        is_deletable: murmur.user_id == user_id,
      };
    });

    res.status(201).json({
      murmurs:modifiedMurmurs
    });


  } catch (error) {
    console.error('Error creating murmur:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

Authcontroller.get('/api/follower_stats', Auth, async (req, res)=> {
  const user_id = extractUserId(req);
  try {
    const followerCount = await UserFollower.count({
      where: { followed_by: user_id },
    });

    const followingCount = await UserFollower.count({
      where: { user_id: user_id },
    });

    res.json({
      followerCount: followerCount,
      followingCount: followingCount,
    });
  } catch (error) {
    console.error("Error getting follower stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = Authcontroller;