const Sequelize = require('sequelize');
const dateFormat  = require('dateformat');
// Models
const Rating = require('./rating');
const userRating = require('./userRating');

const Location = require('./location');
const userGame = require('./userGame');
const Game = require('./game');

const Team = require('./team');
const userTeam = require('./userTeam');

// DB connection
const db = require('../db');

// Mock data to insert into the db
const userdata  = require('../data/user.json');

const User = db.define('user', {
    id: {
        type: Sequelize.STRING,
        isNull: false,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.STRING(25)
    },
    lastName:  {
        type: Sequelize.STRING(25)
    },
    createdAt: {
        type: Sequelize.STRING
    },
    updatedAt: {
        type: Sequelize.STRING
    },
    phoneNumber: {
        type: Sequelize.STRING(20)
    },
    deviceToken: {
        type: Sequelize.STRING
    },
    authToken: {
        type: Sequelize.STRING
    }
  });

// Model associations
User.belongsToMany(Rating, {through: userRating, constraints: false});
Rating.belongsToMany(User, {through: userRating});

Game.belongsToMany(User, {through: userGame, constraints: false});

Game.belongsToMany(Location, {through: userGame});

// userGame.belongsTo(Game);

Game.belongsToMany(Team, {through: userGame, constraints: false});

User.belongsToMany(Team, {through: userTeam, constraints: false});
Team.belongsToMany(User, {through: userTeam, constraints: false});

userTeam.belongsTo(User);


// Create and populate the database tables with mock data
db.sync({force: true}).then(async () => {
    try {
        await User.bulkCreate([
            {
                id: userdata.user.id,
                firstName: userdata.user.firstName,
                lastName: userdata.user.lastName,
                phoneNumber: userdata.user.phoneNumber,
                createdAt: dateFormat("dd-mm-yyyy HH:MM"),
                deviceToken: "11111111",
                authToken: "MzQ2MjhlOTE2ZTZmYTQ4ZDhiYjVlNWYyY2M4NDRmOTk2ZmViNWQ2NDA0OGJiZDQzNGRjODFiMjNlN2ZhYzU2ZA=="
            },
            {
                id: "100000273908940",
                firstName: "Johny",
                createdAt: dateFormat("dd-mm-yyyy HH:MM"),
                lastName: "Doe",
                phoneNumber: "6981000000",
                deviceToken: "22222222",
                authToken: "aldi-authToken"
            }
        ]);
    
        await Rating.bulkCreate([
            {
                id: 10,
                createdBy: "100000273908940",
                createdAt: dateFormat("dd-mm-yyyy HH:MM"),
                comment: "The best on top of the rest",
                onTime: 5,
                skills: 2,
                behavior: 1
            },
            {
                id: 11,
                createdBy: "100000273908940",
                createdAt: dateFormat("dd-mm-yyyy HH:MM"),
                comment: "Very good player",
                onTime: 4,
                skills: 4,
                behavior: 5
            },
            {
                id: 22,
                createdBy: "100000273908932",
                createdAt: dateFormat("dd-mm-yyyy HH:MM"),
                comment: "John was a very fast pl_ayer",
                onTime: 5,
                skills: 3,
                behavior: 4
            }
        ]);
    
        await userRating.bulkCreate([
            {
                userId: "100000273908932",
                ratingId: 10
            },
            {
                userId: "100000273908932",
                ratingId: 11
            },
            {
                userId: "100000273908940",
                ratingId: 22
            }
        ]);
    
        await Location.bulkCreate([
                {
                    id: "1",
                    city: "Thessaloniki",
                    countryCode: "GR",
                    latitude: 32.7295749,
                    longitude: -17.022417
                },
                {
                    id: 2,
                    city: "Kalamaria",
                    countryCode: "GR",
                    latitude: 30.289195,
                    longitude: 110.224358
                },
                {
                    id: "3",
                    city: "Kamara",
                    countryCode: "GR",
                    latitude: 1.5156,
                    longitude: -77.49498
                },
                {
                    id: "4",
                    city: "Nea Krini",
                    countryCode: "GR",
                    latitude: 41.6020598,
                    longitude: -87.4108352
                },
                {
                    id: "5",
                    name: "Eyosmos",
                    countryCode: "GR",
                    latitude: 36.307064,
                    longitude: 120.39631
                }
        ])
        
        await Game.bulkCreate([
            {
               id: 1,
               createdBy: "100000273908932",
               createdAt: dateFormat("dd-mm-yyyy HH:MM"),
               name: "Rafaello's Game",
               description: "Back in town to play football.",
               type: 0,
               size: 11,
               opponents: true,
               eventDate: dateFormat("dd-mm-yyyy HH:MM"),
            },
            {
                id: 2,
                createdBy: "100000273908940",
                createdAt: dateFormat("dd-mm-yyyy HH:MM"),
                name: "Aldi's Game",
                description: "Get your team up 'n runnin'.",
                type: 1,
                size: 5,
                opponents: true,
                eventDate: dateFormat("dd-mm-yyyy HH:MM")
             }
         ]);

         await userGame.bulkCreate([
             {
                 userId: "100000273908932",
                 gameId: 1,
                 locationId: 3,
                 teamId: "777"
             },
             {
                userId: "100000273908940",
                gameId: 2,
                locationId: 1,
                teamId: "999"
            }
         ]);

         await Team.bulkCreate([
            {
                id: 777,
                firstTeamId: "5555",
                secondTeamId: "1111"
            },
            {
                id: 999,
                firstTeamId: "2222",
                secondTeamId: "3333"
            }
        ]);

        await userTeam.bulkCreate([
            {
                teamId: "5555",
                userId: "100000273908940"
            },
            {
                teamId: "1111",
                userId: "100000273908932"
            }
        ])

    } catch (error) {
        console.log(error);
    }
    
});

  module.exports = User;