const express = require('express');

const User = require('../Models/User');
const Buyer = require('../Models/Buyer');
const Service = require('../Models/Service');
const Process = require('../Models/Process');
const Service_rate = require('../Models/Service_rate');
const Service_taken_by_user = require('../Models/Service_taken_by_user');
// const UserFollower = require('../Models/UserFollower');
// const Murmur = require('../Models/Murmur');
// const MurmurLike = require('../Models/MurmurLike')
require('./../Models/associations');

const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');
const Authcontroller = express.Router();
const Auth = require('../middlewares/Auth');
const {extractUserId} = require('./AuthUtils');
const {Sequelize, where} = require('sequelize');
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

const upload = multer({storage});


Authcontroller.post('/api/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (user) {
            const isValidPassword = await bcript.compare(password, user.password);
            if (isValidPassword) {
                const token = jwt.sign({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    id: user.id,
                    account_type: user.account_type,
                    company_name: user.company_name,
                    created_at: user.created_at
                }, process.env.JWT_SECRET, {expiresIn: '365d'});
                res.status(200).json({
                    access_token: token,
                    message: "Login successful"
                });
            } else {
                res.status(401).json({message: "Invalid username or password"});
            }
        } else {
            res.status(401).json({message: "Invalid username or password"});
        }

    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
});

Authcontroller.post('/api/registration', async (req, res) => {
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
            return res.status(409).json({error: 'Validation Error', message: 'Email is already registered'});
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

            return res.status(400).json({error: 'Validation Error', validationErrors});
        }
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

Authcontroller.get('/api/get_user', Auth, async (req, res) => {
    const user_id = extractUserId(req);
    try {

        const user = await User.findOne({
            where: {
                id: user_id,
            }
        });
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
    }

});

Authcontroller.post('/api/create_buyer', Auth,async (req, res) =>  {

    try {
        const { name, short_code, country, is_active } = req.body;

        if (!name || !short_code || !country || !is_active) {
            return res.status(400).json({ error: 'Validation Error', message: 'All required fields must be provided' });
        }

        // Validate is_active field
        if (!['Yes', 'No'].includes(is_active)) {
            return res.status(400).json({ error: 'Validation Error', message: 'Invalid value for is_active field' });
        }

        // Perform other validations as needed

        // Create a new Buyer
        const newBuyer = await Buyer.create({
            name,
            short_code,
            country,
            is_active,
        });
        // Exclude sensitive information from the response
        const responseBuyer = {
            ...newBuyer.toJSON(),
        };

        return res.status(201).json(responseBuyer);
    } catch (error) {
        console.log(error);
        //res.json(error);return;
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({error: 'Validation Error', validationErrors});
        }
        res.json(error);return;
    }

});

Authcontroller.get('/api/buyers', async (req, res) => {
    try {
        // Fetch all buyers
        const allBuyers = await Buyer.findAll();

        // Exclude sensitive information from the response
        const responseBuyers = allBuyers.map(buyer => {
            const { password, ...buyerWithoutPassword } = buyer.toJSON();
            return buyerWithoutPassword;
        });

        return res.status(200).json(responseBuyers);
    } catch (error) {
        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

Authcontroller.post('/api/create_service', Auth, async (req, res) => {
    try {
        //res.json('Test');return;
        // Extract data from the request body
        const { name, caption, service_type, is_active, remarks } = req.body;

        // Create a new Service
        const newService = await Service.create({
            name,
            caption,
            service_type,
            is_active,
            remarks,
        });

        // Exclude sensitive information from the response
        const responseService = {
            ...newService.toJSON(),
            // Add any other fields you want to exclude
        };

        return res.status(201).json(responseService);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ error: 'Validation Error', validationErrors });
        }

        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

Authcontroller.get('/api/services', Auth,async (req, res) => {
    try {
        // Find all services excluding the timestamp column
        const services = await Service.findAll({
            attributes: { exclude: ['created_at', 'updated_at'] },
        });

        return res.status(200).json(services);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

Authcontroller.put('/api/service/:id', Auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, caption, service_type, is_active, remarks } = req.body;

        // Find the service by ID
        const serviceToUpdate = await Service.findByPk(id);

        if (!serviceToUpdate) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Update the service attributes
        serviceToUpdate.name = name;
        serviceToUpdate.caption = caption;
        serviceToUpdate.service_type = service_type;
        serviceToUpdate.is_active = is_active;
        serviceToUpdate.remarks = remarks;

        try {
            // Save the updated service
            await serviceToUpdate.save();

            // Return the updated service
            return res.status(200).json(serviceToUpdate);
        } catch (validationError) {
            // Handle Sequelize validation errors
            if (validationError.name === 'SequelizeValidationError') {
                const validationErrors = validationError.errors.map(err => ({
                    field: err.path,
                    message: err.message,
                }));
                return res.status(400).json({ error: 'Validation Error', validationErrors });
            }

            // Handle other errors
            console.error(validationError);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

Authcontroller.post('/api/process_create', Auth, async (req, res) => {
    try {
        const { service_id, name, domain_link, default_quantity, is_active, remarks } = req.body;

        // Create a new process
        const newProcess = await Process.create({
            service_id,
            name,
            domain_link,
            default_quantity,
            is_active,
            remarks,
        });

        // Exclude sensitive information from the response
        const responseProcess = {
            ...newProcess.toJSON(),
            // Add any other fields you want to exclude
        };

        return res.status(201).json(responseProcess);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ error: 'Validation Error', validationErrors });
        }

        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

Authcontroller.put('/api/process/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { service_id, name, domain_link, default_quantity, is_active, remarks } = req.body;

        // Find the process by ID
        const processToUpdate = await Process.findByPk(id);

        if (!processToUpdate) {
            return res.status(404).json({ error: 'Process not found' });
        }

        // Update the process attributes
        processToUpdate.service_id = service_id;
        processToUpdate.name = name;
        processToUpdate.domain_link = domain_link;
        processToUpdate.default_quantity = default_quantity;
        processToUpdate.is_active = is_active;
        processToUpdate.remarks = remarks;

        // Save the updated process
        await processToUpdate.save();

        // Return the updated process
        return res.status(200).json(processToUpdate);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ error: 'Validation Error', validationErrors });
        }

        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to get all processes
Authcontroller.get('/api/processes', async (req, res) => {
    try {
        // Retrieve all processes from the database
        const allProcesses = await Process.findAll();

        // Return the list of processes
        return res.status(200).json(allProcesses);
    } catch (error) {
        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to create a new service rate
Authcontroller.post('/api/create_service_rate', async (req, res) => {
    try {
        const {
            service_id,
            buyer_id,
            process_id,
            effective_date,
            process_price,
            extended_price,
        } = req.body;

        // Create a new service rate
        const newServiceRate = await Service_rate.create({
            service_id,
            buyer_id,
            process_id,
            effective_date,
            process_price,
            extended_price,
        });

        // Exclude sensitive information from the response
        const responseServiceRate = {
            ...newServiceRate.toJSON(),
            // Add any other fields you want to exclude
        };

        return res.status(201).json(responseServiceRate);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ error: 'Validation Error', validationErrors });
        }

        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to update a service rate by ID
Authcontroller.put('/api/services_rates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            service_id,
            buyer_id,
            process_id,
            effective_date,
            process_price,
            extended_price,
        } = req.body;

        // Find the service rate by ID
        const serviceRateToUpdate = await Service_rate.findByPk(id);

        if (!serviceRateToUpdate) {
            return res.status(404).json({ error: 'Service Rate not found' });
        }

        // Update the service rate attributes
        serviceRateToUpdate.service_id = service_id;
        serviceRateToUpdate.buyer_id = buyer_id;
        serviceRateToUpdate.process_id = process_id;
        serviceRateToUpdate.effective_date = effective_date;
        serviceRateToUpdate.process_price = process_price;
        serviceRateToUpdate.extended_price = extended_price;

        // Save the updated service rate
        await serviceRateToUpdate.save();

        // Return the updated service rate
        return res.status(200).json(serviceRateToUpdate);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ error: 'Validation Error', validationErrors });
        }

        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to get all service rates with associated data
Authcontroller.get('/api/service_rates', async (req, res) => {
    try {
        const serviceRates = await Service_rate.findAll({
            include: [
                { model: Service, as: 'service', attributes: ['name','id'] },
                { model: Process, as: 'process', attributes: ['name','id'] },
            ],
        });

        return res.status(200).json(serviceRates);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to save a service taken by a user
Authcontroller.post('/api/service_taken_by_users', async (req, res) => {
    try {
        const {
            user_id,
            service_id,
            buyer_id,
            process_id,
            period_as_day,
            rate,
            total,
        } = req.body;

        // Create a new Service_taken_by_user
        const newServiceTakenByUser = await Service_taken_by_user.create({
            user_id,
            service_id,
            buyer_id,
            process_id,
            period_as_day,
            rate,
            total,
        });

        // Exclude sensitive information from the response
        const responseServiceTakenByUser = {
            ...newServiceTakenByUser.toJSON(),
        };

        return res.status(201).json(responseServiceTakenByUser);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ error: 'Validation Error', validationErrors });
        }

        // Handle other errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


Authcontroller.get('/api/my_timeline', Auth, async (req, res) => {
    const user_id = extractUserId(req);
    try {

        const followers = await User.findOne({
            where: {
                id: user_id
            },
            include: {
                model: UserFollower,
                required: false,
                include: [
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
            user_details: followers,
            murmurs: modifiedMurmurs
        });


    } catch (error) {
        console.log(error);
    }

});

Authcontroller.delete('/api/murmur/:id', Auth, async (req, res) => {
    try {
        const murmurId = req.params.id;
        await Murmur.destroy({
            where: {
                id: murmurId,
            },
        });
        res.status(200).json({
            message: 'Murmur deleted successfully',
        });
    } catch (error) {
        console.log(error);
    }

});

Authcontroller.get('/api/murmurs/:murmurId/like', async (req, res) => {
    const {murmurId} = req.params;
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
            return res.status(400).json({message: 'You have already liked this murmur.'});
        }

        // If the user hasn't liked the murmur, create a new like
        const like = await MurmurLike.create({
            murmur_id: murmurId,
            user_id: user_id,
        });


        res.status(200).json({like: like});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

Authcontroller.get('/api/get_user_list', Auth, async (req, res) => {
    const user_id = extractUserId(req);
    try {

        const followers = await User.findOne({
            where: {
                id: user_id
            },
            include: {
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

    } catch (error) {
        console.log(error);
    }

});

Authcontroller.post('/api/add_follower', Auth, async (req, res) => {
    const user_id = extractUserId(req);
    const followerId = req.body.user_id;
    try {
        // Check if the user is trying to follow themselves
        if (user_id === followerId) {
            return res.status(400).json({message: "Cannot follow yourself"});
        }

        // Check if the followerId is a valid user
        const follower = await User.findOne({
            where: {
                id: followerId,
            },
        });

        if (!follower) {
            return res.status(404).json({message: "Follower not found"});
        }

        // Check if the user is already following the given follower
        const existingFollower = await UserFollower.findOne({
            where: {
                user_id,
                followed_by: followerId,
            },
        });

        if (existingFollower) {
            return res.status(400).json({message: "User is already following the given follower"});
        }

        // Add the follower
        await UserFollower.create({
            user_id: user_id,
            followed_by: followerId,
        });

        res.status(200).json({message: "Follower added successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
});

Authcontroller.post('/api/add_murmur', Auth, async (req, res) => {
    const user_id = extractUserId(req);
    const {content} = req.body;
    try {

        const newMurmur = await Murmur.create({
            user_id: user_id,
            content: content,
        });

        const followers = await User.findOne({
            where: {
                id: user_id
            },
            include: {
                model: UserFollower,
                required: false,
                include: [
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
            murmurs: modifiedMurmurs
        });


    } catch (error) {
        console.error('Error creating murmur:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

Authcontroller.get('/api/follower_stats', Auth, async (req, res) => {
    const user_id = extractUserId(req);
    try {
        const followerCount = await UserFollower.count({
            where: {followed_by: user_id},
        });

        const followingCount = await UserFollower.count({
            where: {user_id: user_id},
        });

        res.json({
            followerCount: followerCount,
            followingCount: followingCount,
        });
    } catch (error) {
        console.error("Error getting follower stats:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
});


module.exports = Authcontroller;