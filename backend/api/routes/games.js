// API /games route
const games = require('express').Router();

//DateFormat
const dateFormat = require('dateformat');
const Sequelize = require('sequelize');
const uuid = require('uuid/v4');

// Custom Response Handler
const {sendCustomResponse, sendCustomErrorResponse} = require('../handlers/customResponse');

// // Database models
const User = require('../models').User;
const Game = require('../models').Game;
const Team = require('../models').Team;
const Location = require('../models').Location;


// Get games
games.get('/', async (req, res) => {
    try {
        const games = await Game.findAll({
            include: [
                {
                    model: Location,
                    attributes: {
                        exclude: ['id', 'latitude', 'longitude', 'createdAt', 'updatedAt']
                    }
                }
            ],
            attributes: {
                exclude: ['locationId', 'createdAt', 'updatedAt', 'opponents', 'description', 'firstTeamId', 'secondTeamId']
            }
            
        });

        // Send response - HTTP 200 OK
        sendCustomResponse(res, 200, games);
    } catch (error) {
        // TODO: Log errors
        // Send error response - HTTP 500 Internal Server Error
        sendCustomErrorResponse(res, 500, "Couldn't get games.");
        console.log(error);
        
    }
});

// Get game details
games.get('/:id', async (req, res) => {
    try {
        // Get game details based on its id
        const game = await Game.findOne({
            where: {
                id: req.params.id
            },
            include: [
                {
                model: Location,
                attributes: {
                        exclude: ['id', 'createdAt', 'updatedAt']
                    }
                },
                {
                    model: User,
                    through: 'userGames',
                    through: {
                        attributes: []
                    },
                    attributes: ['id', 'firstName', 'lastName']
                } ,     
            ],
            attributes: {
                exclude: ['locationId', 'createdAt', 'updatedAt']
            }
        });

        // Rename Location attribute to location
        game.dataValues.location = game.Location; 
        delete game.dataValues.Location;
        
        // Copy the user data into the createdBy attribute
        game.dataValues.createdBy = game.Users[0];
        delete game.dataValues.Users;

        // Get players of the first team       
        const firstTeam = await game.getFirstTeam({
            include: {
                model: User,
                as: 'Player',
                through: 'teamPlayers',
                through: {
                    attributes: []
                },
                attributes: ['id', 'firstName', 'lastName']
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });

        // get players of the second team
        const secondTeam = await game.getSecondTeam({
            include: {
                model: User,
                as: 'Player',
                through: 'teamPlayers',
                through: {
                    attributes: []
                },
                attributes: ['id', 'firstName', 'lastName']
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });

        // Include teams
        game.dataValues.teams = [firstTeam.Player];
        game.dataValues.teams[1] = secondTeam.Player;
        
        
        // Send response - HTTP 200 OK
        sendCustomResponse(res, 200, [game]);
    } catch (error) {
        // TODO: Log error
        console.log(error);
        
        // Send error response - HTTP 500 Internal Server Error
        sendCustomErrorResponse(res, 500, "Couldn't get game details.");
    }
});

// Get game teams
games.get('/:id/teams', async (req, res) => {
    try {
            // Find game
            const game = await Game.findOne({
                where: {
                    id: req.params.id
                }
            });

            // Get players of the first team       
            const firstTeam = await game.getFirstTeam({
                include: {
                    model: User,
                    as: 'Player',
                    through: 'teamPlayers',
                    through: {
                        attributes: []
                    },
                    attributes: ['id', 'firstName', 'lastName']
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            });

            // get players of the second team
            const secondTeam = await game.getSecondTeam({
                include: {
                    model: User,
                    as: 'Player',
                    through: 'teamPlayers',
                    through: {
                        attributes: []
                    },
                    attributes: ['id', 'firstName', 'lastName']
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }); 

            // Send response - HTTP 200 OK
            sendCustomResponse(res, 200, [firstTeam.Player, secondTeam.Player]);
    } catch (error) {
        //TODO: Log error
        // Send error response - HTTP 500 Internal Server Error      
        sendCustomErrorResponse(res, 500, "Couldn't get teams.")
    }
});

// Create new game
games.post('/', async (req, res) => {
    try {
        // Find the user(id) that wants to create this game
        // TODO: Use authorization and authentication to find out who the user really is.
        const user = await User.findOne({
            where: {
                authToken: req.headers["auth-token"]
            }
        });  
        
        // Create location via another endpoint (/locations)

        const loc = await Location.create({
            city: "Thessaloniki",
            countryCode: "GR",
            latitude: 12.0,
            longitude: 23.1
        });

        // Build Game instance
        const game = await Game.create({
            createdBy: user.id,
            name: req.body.data[0].name,
            type: req.body.data[0].type,
            size: req.body.data[0].size,
            opponents: req.body.data[0].opponents,
            description: req.body.data[0].description,
            eventDate: Date.now(),
            locationId: loc.id
        });

        const tm1 = await Team.create({
        });
        const tm2 = await Team.create({
        });



        // Guard
        // Validate the data against the Game model
        await game.validate();

        // Create game
        await game.save();

        await game.setFirstTeam(tm1);
        await game.setSecondTeam(tm2);
        await user.addGame(game, { through: 'userGames' });

        // Send response - HTTP 201 Created
        sendCustomResponse(res, 201);
    } catch (error) {
        //TODO: Log error
        // Send error response - HTTP 500 Internal Server Error
        sendCustomErrorResponse(res, 500, "Couldn't create game.");

        console.log(error);
        
    }
});

// Join a Game Team
games.post('/:gameId/teams/:teamId', async (req, res) => {
    try {

        // Find user
        const user = await User.findOne({
            where: {
                authToken: req.headers['auth-token']
            }
        });

        if(user !== null){
            // Find game
            const game = await Game.findOne({
                where: {
                    id: req.params.gameId
                }
            });
                
            // Game found
            if(game !== null){
                // Get first and second team
                // TODO: Check if the user is already part of the team 
                if(req.params.teamId == game.firstTeamId){
                    const firstTeam = await game.getFirstTeam();
                    firstTeam.addPlayer(user, { through: 'teamPlayers' });
                } else {
                    const secondTeam = await game.getSecondTeam();
                    secondTeam.addPlayer(user, { through: 'teamPlayers' });
                }

                sendCustomResponse(res, 200, null);
            } else sendCustomResponse(res, 404, "Couldn't find the specified game.");
        } else sendCustomErrorResponse(res, 401, "You are unauthorized to perform this action. Unrecognized User.")

        
    } catch (error) {
        console.log(error);
        sendCustomErrorResponse(res, 500, "Couldn't join team")
        
    }
});

// Update game Details
games.patch('/:id', async (req, res) => {
    try {
        // TODO: First you need to check if the user that tries to edit this game is also authorized to perform this action.
        // TODO: Check if the user is the one who created this game. If so, then authorize the action

        // Find the specified game
        const game = await Game.findOne({
            where: {
                id: req.params.id
            }
        });

        // Found the game
        if(game !== null){
            const tmpGame = await game.update({
                name: req.body.data[0].name,
                type: req.body.data[0].type,
                size: req.body.data[0].size,
                opponents: req.body.data[0].opponents,
                eventDate: Date.now(),
                description: req.body.data[0].description
            });

            // Guard
            // Validate the data against the Game model
            await tmpGame.validate();

            // Update game details
            await tmpGame.save();

            // Send response - HTTP 200 OK
            sendCustomResponse(res, 200, null);
        }else{
            // We don't have to expose that the game doesn't exist in our database.
            // Send error response - HTTP 401 Unauthorized
            sendCustomErrorResponse(res, 401, "You are unauthorized to perform this action. - DEBUG: Game doesn't exist");
        }
        
    } catch (error) {
        // TODO: Log error
        // Send error response - HTTP 500 Internal Server Error
        sendCustomErrorResponse(res, 500, "Couldn't update game details.");
    }
});

// Change Game Team
games.patch('/:gameId/teams/:teamId', (req, res) => {
    res.json({msg: "Change team"});
});

// Delete Game
games.delete('/', (req, res) => {
    res.json({msg: "Delete a game"});
});

// Remove User from Game Team
games.delete('/:gameId/teams/:teamId', (req, res) => {
    res.json({msg: "Remove a player from the team"});
});

module.exports = games;