// Project needs NODE.JS as the back-end server
// Express JS is the framework that will allow us to pass in variables / db

/* -- CONSTANTS ---------------------------------------------- */
// These are constant variables required to run the poject

const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const exp = require('constants');
const { Console } = require('console');
const fileUpload = require('express-fileUpload');
const exphbs = require('express-handlebars');


// this to parse JSON data that gets retrieve from the data base
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// templating engine (handlebars) instead of html
app.engine('hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');

// File upload - default option (explore documentation if we need larger files or photo quality)
app.use(fileUpload());

// kinda like session login token
app.use(session({
    secret: 'groupSix',
    resave: true,
    saveUnitialized: true
}));

// render static stylesheet "main.scss" (in pulic folder) and uploaded files (in upload folder) 
app.use(express.static('public'));
app.use(express.static('upload'));
app.use(express.static(__dirname));


// use hbs instead of html
// app.set('view engine', 'html');

// this will convert normal html to ejs files that Express Framework
// app.set('views', __dirname + '/pages');
// app.engine('html', require('ejs').renderFile);


// DEFINE THE SQL CONNECTION - given by our prof
var pool = mysql.createPool({
    host: "107.180.1.16",
    port: "3306",
    user: "fall2021group6",
    password: "group6fall2021",
    database: "cis440fall2021group6"
});

// Calling the variable above and connecting the db
// IF connect, terminal will say "Connection establish..."
pool.query('select 1+1', (err, results) => {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});

app.listen(3000);
console.log('Website Sever Is Running on Port 3000. Access via LOCALHOST:3000');
/* ----------------------CONNECTED------------------------------------- */

/* ----------------------------------------------------------- */
/* -- WEBSITE GLOBAL VARIABLES ------------------------------- */
// camelCase coding convention

let companyId;
let companyName;
let companyLogo;
let canAddNewMessage = true;
let canAddNewMessage1 = true;
let canAddNewMessage2 = true;
let roles = ["Admin", "Program Manager", "Mentor", "Mentee"];
let activeUserId;
let activeUserFName;
let activeUserLName;
let activeUserFullName;
let activeUserEmail;
let activeUserRole;
let activeUserFirstPW;
let newUserMessage = "";
let addPermission = false;
let imHome = true;
let todayDate = new Date().toLocaleString();
/*---------------------------------------------------------------*/

/* -- INVALID LOG IN SCREEN ---------------------------------- */
app.get('/invalidLogin', function (req, res) {
    res.render('invalidLoginScreen');
})

app.post('/goBackToLogin', function (req, res) {
    res.redirect('/');
})

/* -- LOGIN FUNCTIONS (LOGIN.HTML) --------------------------- */
// GET - Render Login Screen
// since this is main page upon loading website, we can just define '/' as the request / route
app.get('/', function (req, res) {
    // res.render('page') will render the html to localhost:3000
    res.render('login', { canAddNewMessage, canAddNewMessage1, canAddNewMessage2 });
});


// The actual method that will get the sign in values typed in and then validate it
// compare to db record - validate --> then redirect as needed.
app.post('/login', (req, res) => {

    // use req.body.varName when we want to retrieve the value entered on the HTML textboxes...etc
    var useremail = req.body.useremail;
    var password = req.body.password;

    console.log('Begin validating user...');
    console.log(`Useremail: ${useremail}`);
    console.log(`Password: ${password}`);

    // if (useremail == valid && password == valid)
    if (useremail && password) {

        // call to db --> pass in the useremail && passwod as the parameters [] for the QUERY string below
        // inside the query statement, we also define a function that will handle the error, results from the SQL query
        pool.query('SELECT * FROM User JOIN Company on ucId = cId WHERE uEmail = ? AND uPass = ?', [useremail, password], (err, results) => {
            if (!err);

            if (results.length > 0) {
                // the query will return a result if parameters matched
                console.log('Found user record.');
                console.log(results);

                // now we set our session.loggedin to be true
                // set the session useremail to the signed in useremail --> in case of needing to reference it in other methods below
                req.session.loggedin = true;
                req.session.useremail = useremail;

                // we will also assign that to a global variable above ---> in also case of needing to reference it in other methods below
                activeUserId = results[0].uId;
                activeUserFName = results[0].uFName;
                activeUserLName = results[0].uLName;
                activeUserEmail = results[0].uEmail;
                activeUserRole = results[0].uRole;
                activeUserFirstPW = results[0].uFirstPass;
                activeUserAbout = results[0].uAbout;
                activeUserJob = results[0].userJob
                activeUserphoto = results[0].uPhoto
                companyId = results[0].ucId;
                activeUserFullName = activeUserFName + ' ' + activeUserLName;

                // Establish permission to add users and programs
                if (activeUserRole == "Admin" || activeUserRole == "Program Manager") {
                    addPermission = 'true';
                }

                // we will also assign that to a global variable above ---> in also case of needing to reference it in other methods below
                companyId = results[0].cId;
                companyName = results[0].cName;
                companyLogo = results[0].uLogo;

                // pass object from select statement (results) plus other global vars
                res.render('homepage', { results, companyName, companyLogo, activeUserFullName, addPermission, imHome, todayDate: todayDate })
            }
            else {
                res.redirect('/invalidLogin');
            }
        });
    } else {
        res.redirect('/invalidLogin');
    }
}); //End /login
/* ----------------------------------------------------------- */

// LOG USER OUT REDIRECT TO LOGIN PAGE
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
}); // End /logout

/* ----------------------------------------------------------- */

// RENDER COMPANY PAGE
// app.post('/getStarted', function(req, res) {
//     res.render('company');
// })

/* ----------------------------------------------------------- */

/* -------------------------------------------- BEGIN COMPANY SETUP------------------------------------ */

// Render company.html (getstarted button)
app.post('/getStarted', function (req, res) {
    res.render('company');
});

app.post('/initCompany', function (req, res) {

    companyName = req.body.companyName;
    companyLogo = req.files.photo;
    var adminFName = req.body.adminFName;
    var adminLName = req.body.adminLName;
    var adminEmail = req.body.adminEmail;
    var adminPW = req.body.adminPW;
    var adminJob = req.body.adminJob;

    

    console.log(companyName);
    console.log(companyLogo);
    console.log(adminFName);
    console.log(adminLName);
    console.log(adminEmail);
    console.log(adminPW);
    console.log(adminJob);

    pool.query('SELECT * FROM User WHERE uEmail = ?', [adminEmail], function (err, results, fields) {
        if (err) throw err;

        if (results.length > 0) {
            canAddNewMessage = false;
            newUserMessage = 'Email already exists, enter a different email.';
            // res.redirect('/getStarted');            
            console.log('Email already exists');
        }
        else {
            //Create New Company
            let uploadPath;
    
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded.')
            }

            uploadPath = __dirname + '/public/upload/profilePhoto/' + companyLogo.name;
            console.log(companyLogo);

            // user mv(to place file on the server)
            companyLogo.mv(uploadPath, function (err) {
                if (err) return res.status(500).send(err);
                    pool.query(`INSERT INTO Company (cName, cLogo) VALUES ("${companyName}", "${companyLogo.name}")`, function (err, results) {
                        if (err) throw err;
                        companyId = results.insertId
                        console.log('Company Account Inserted');
                        console.log(`Company ID : ${companyId}`)
                        res.redirect('/');

                        //Create Company's Sys Admin
                        pool.query(`INSERT INTO User (uFName, uLName, uEmail, uPass, uRole, uJob, ucId) VALUES ("${adminFName}", "${adminLName}", "${adminEmail}", "${adminPW}", "Admin", "${adminJob}", "${companyId}")`, function (err, results) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                var sysAdminId = results.insertId
                                console.log(`System Admin Id: ${sysAdminId}`);
                                canAddNewMessage = true;
                            }
                        }); //End Insert User (child)
                    }); // End Insert Company (parent) 
                });
            }; // End Select
});
}); //End /initCompany
/* ---------------------------------------------END COMPAY SETUP----------------------------------------------- */

/* -- To View someone else's profile NOT DONE----------------------------------------------- */
app.get('/profile', function (req, res) {
    if (req.session.loggedin) {
        pool.query('SELECT * FROM User WHERE uId = ?', [activeUserId], (err, results) => {

            if (!err) {
                res.redirect('/homepage', { formVars });
            }

        });
    }
}); //End /Homepage

/* ----------------------------------------------------------- */



/*--------NEW USER**********************************************/

// Render adduser.html (adduser button)
app.get('/addUser', function (req, res) {
    // newUserMessage = 'Please enter user information.';
    res.render('adduser', { roles, companyName, companyLogo, activeUserFullName, newUserMessage });
});

// Create New User
app.post('/createUser', function (req, res) {

    var newUserFName = req.body.userFName;
    var newUserLName = req.body.userLName;
    var newUserEmail = req.body.userEmail;
    var newUserPW = req.body.userPW;
    var newUserRole = req.body.userRole;
    var newUserJob = req.body.userJob
    // var newUserPhoto;

    // Photo upload
    
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.')
    }

    let newUserPhoto = req.files.filename;
    uploadPath = __dirname + '/public/upload/profilePhoto/' + newUserPhoto.name;
    console.log(newUserPhoto);

    // user mv(to place file on the server)
    newUserPhoto.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);

        pool.query('UPDATE User SET uPhoto = ? WHERE iId = & ', [photo.name, activeUserId], (err, results) => {
 
            if(!err) {
                res.render('homepage', {results, companyName, companyLogo, activeUserFullName, addPermission, imHome, todayDate: todayDate })
            }
    
        });

        console.log(newUserFName);
        console.log(newUserLName);
        console.log(newUserEmail);
        console.log(newUserPW);
        console.log(newUserRole);
        console.log(newUserJob)
        console.log(newUserPhoto);

        pool.query('SELECT * FROM User WHERE uEmail = ?', [newUserEmail], function (err, results, fields) {
            if (err) throw err;

            if (results.length > 0) {
                canAddNewMessage = false;
                newUserMessage = 'Email already exists, enter a different email.';
                res.redirect('/addUser');
                console.log('Email already exists');
            }
            else {
                //save dato into the database
                pool.query(`INSERT INTO User (uFName, uLName, uEmail, uPass, uRole, uJob, uPhoto, ucId) VALUES 
                    ("${newUserFName}", "${newUserLName}", "${newUserEmail}", "${newUserPW}", "${newUserRole}", "${newUserJob}", "${newUserPhoto.name}", "${companyId}")`, function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        newUserMessage = 'User added.';
                        var newUserId = results.insertId
                        console.log(`New User Id: ${newUserId}`);
                        canAddNewMessage = true;

                    }
            
                    res.redirect('/addUser', {activeUserFullName, companyName, companyLogo, roles});

                }); //end Insert 

            };
        }); // End Select

    }); //End /createUser
});
/* ----------------------------------------------------------- */

//


// call TO  profile.hbs
app.get('', (req, res) => {
    res.render('login');
})

// upload profile pic, and return to homepage
app.post('/updateProfilePhoto', (req, res) => {

    // Photo upload
    let photo;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.')
    }

    // name of the input it photo.
    photo = req.files.photo;
    uploadPath = __dirname + '/public/upload/profilePhoto/' + photo.name;
    console.log(uploadPath);
    console.log(photo.name)

    // user mv(to place file on the server)
    photo.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err)        
    }); 

    pool.query('UPDATE User SET uPhoto = ? WHERE uId = ? ', [photo.name, activeUserId], (err, results) => {
        if (err) {
            console.log(err);
        }
        if(!err) {
            console.log(results[0]);
            res.redirect('/');
        }

    }); //end Insert 
});

//--------------------------------------------------------------------------------
// STILL NEEDED
app.post('/userProgram', (req, res) => {
    res.render('userProgram');

    // See notes in userProgram.hsb

});

// 
app.post('/visitProfile', (req, res) => {
    res.render('userProgram');

    // User this to visit some's profile. Need to change imHome to False.

});


app.post('/userProfile', (req, res) => {

    // this will be used when a user if viewing someone else profile.


    res.render('homepage');



});
