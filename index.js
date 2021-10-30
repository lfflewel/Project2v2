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
let activeUserPhoto;
// let newUserPhoto;

let newUserFName;
let newUserLName;
let newUserEmail;
let newUserPW;
let newUserRole;
let newUserJob;
let newUserAbout;
let activeProgramId






/*---------------------------------------------------------------*/

/* -- INVALID LOG IN SCREEN ---------------------------------- */
app.get('/invalidLoginScreen', function (req, res) {
    res.render('invalidLoginScreen.hbs');
})

app.post('/goBackToLogin', function (req, res) {
    res.redirect('/');
})

/* -- LOGIN FUNCTIONS (LOGIN.HTML) --------------------------- */
// GET - Render Login Screen
// since this is main page upon loading website, we can just define '/' as the request / route
app.get('/', function (req, res) {
    // res.render('page') will render the html to localhost:3000
    res.render('login');
});




/*---------------------------------------------------------------*/

/* ------------------------------- SETUP COMPANY INFO------------------------------------ */

// display register
app.post('/getStarted', function (req, res) {
    res.render('company');
});

// create a company info
app.post('/initCompany', function (req, res) {
	companyName = req.body.companyName;
	companyLogo = req.files.file;
	adminFName = req.body.adminFName;
	adminLName = req.body.adminLName;
	adminJob = req.body.adminJob;
	adminEmail = req.body.adminEmail;
	adminPW = req.body.adminPW;


	pool.query(`SELECT * FROM User WHERE uEmail = ?`, [adminEmail], function (err, results, fields) {
		if (err) throw err;
        	if (results.length > 0) {
		   console.log('Email already exists');
		    }
		else {
		    let uploadPath;
            
            	   if (!req.files || Object.keys(req.files).length === 0) {
                      return res.status(400).send('No files were uploaded.')
                   }

            	   uploadPath = __dirname + '/public/upload/companyLogo/' + companyLogo.name;
                   console.log(companyLogo);
                   
                   // user mv(to place file on the server)
            	    companyLogo.mv(uploadPath, function (err) {
                        if (err) return res.status(500).send(err);
                        
                        // INSERT COMPANY INFO
                        pool.query(`INSERT INTO Company (cName, cLogo) VALUES ("${companyName}", "${companyLogo.name}")`, function (err, results) {
                            if (err) throw err;
                            companyId = results.insertId;
                            console.log("Created Account")
				
		
                            // INSERT ADMIN INFO
                            pool.query(`INSERT INTO User (uFName, uLName, uEmail, uPass, uRole, uJob, ucId) VALUES ("${adminFName}", "${adminLName}", "${adminEmail}", "${adminPW}", "Admin", "${adminJob}", "${companyId}")`, function(err, results) {
                                if (err) throw (err);
                                console.log("Added ADMIN INFO")
					
				            });
			            });
                    });
            res.redirect('/');
        };
	});
});

/*-------------------------------END COMPANY SETUP-----------------------------------------*/


/*----------------------------------------LOGIN ACCOUNT----------------------------------*/
app.post('/login', function(req, res) {
    var useremail = req.body.useremail;
    var password = req.body.password;

    console.log('Begin validating user...');
    console.log(`Useremail: ${useremail}`);
    console.log(`Password: ${password}`);

     // if (useremail == valid && password == valid)
    if (useremail && password) {

        // call to db --> pass in the useremail && passwod as the parameters [] for the QUERY string below
        // inside the query statement, we also define a function that will handle the error, results from the SQL query
        pool.query('SELECT * FROM User WHERE uEmail = ? AND uPass = ?', [useremail, password], function (err, results) {
            if (!err);

            if (results.length > 0) {
                // the query will return a result if parameters matched
                console.log('Found user record.');
                console.log(results);

                // now we set our session.loggedin to be true
                // set the session username to the signed in username --> in case of needing to reference it in other methods below
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
                companyId = results[0].ucId;
                
                activeUserFullName = activeUserFName + ' ' + activeUserLName;

                console.log(`User ID: ${activeUserId}`);
                console.log(`User Role: ${activeUserRole}`);
                
                

                
                
               
                // Establish permission to add users and programs
                if (activeUserRole == "Admin" || activeUserRole == "Program Manager") {
                    addPermission = true;
                }
                res.redirect('/homepage')
            }
            else {
                    res.redirect('/invalidLoginScreen');
            }
        })
              
    } else {
        res.redirect('/invalidLoginScreen');
    }
});

/*------------------------------END LOGIN--------------------------------------------*/


/*--------------------------------LOGOUT ACCOUNT----------------------------------*/

// LOG USER OUT REDIRECT TO LOGIN PAGE
app.get('/logout', function (req, res) {
    req.session.destroy();
    addPermission = false;
    res.redirect('/');
});

/*------------------------------END LOGOUT--------------------------------------------*/

/*------------------------------HOMEPAGE(USER'S PROFILE)--------------------------------------------*/
app.get('/homepage', function(req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [activeUserId], function(err, results) {
            console.log(results);
            if (err) throw err;
            res.render('homepage', {results, activeUserFullName, addPermission, imHome, companyName, companyLogo, todayDate});
        });
    };
});

        
/*------------------------------END HOMEPAGE(USER'S PROFILE)-------------------------------*/


/*------------------------------SET NEW USER--------------------------------------------*/
// Render adduser.hbs
app.get('/addUser', function (req, res) {
    // newUserMessage = 'Please enter user information.';
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [activeUserId], function(err, results) {
            console.log(results);
            if (err) throw err;
            res.render('addUser', {results, activeUserFullName, addPermission, roles, imHome, companyName, companyLogo, todayDate});
        });
    }
})

// Create New User
app.post('/createUser', function (req, res) {

    newUserFName = req.body.userFName;
    newUserLName = req.body.userLName;
    newUserEmail = req.body.userEmail;
    newUserPW = req.body.userPW;
    newUserRole = req.body.userRole;
    newUserJob = req.body.userJob;
    newUserAbout= req.body.userAbout;
    let newUserPhoto;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.')
    };

    newUserPhoto = req.files.file;
    uploadPath = __dirname + '/public/upload/profilePhoto/' + newUserPhoto.name;
    console.log(newUserPhoto);

    // user mv(to place file on the server)
    newUserPhoto.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
    });

    console.log(newUserFName);
    console.log(newUserLName);
    console.log(newUserEmail);
    console.log(newUserPW);
    console.log(newUserRole);
    console.log(newUserJob);
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
            pool.query(`INSERT INTO User (uFName, uLName, uEmail, uPass, uRole, uJob, uAbout, uPhoto, ucId) VALUES 
                ("${newUserFName}", "${newUserLName}", "${newUserEmail}", "${newUserPW}", "${newUserRole}", "${newUserJob}", "${newUserAbout}","${newUserPhoto.name}", "${companyId}")`, function (err, results) {
                if (err) {
                    console.log(err);
                }
                else {
                    
                    var newUserId = results.insertId
                    console.log(`New User Id: ${newUserId}`);
                    
                }
                
                res.render('addUser', {results, activeUserFullName, companyName, companyLogo, roles, alert:'User added successfully.' });
            }); 
        }; 
    }); 
}); 

// update user photo
app.post('/updateProfilePhoto', function (req, res) {
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    };

    // name of the input is newPhoto
    photo = req.files.file;
    activeUserPhoto = photo.name
    uploadPath = __dirname + '/public/upload/profilePhoto/' + photo.name;
    console.log("activeUserPhoto:", activeUserPhoto);
    console.log("uploadPath: ", uploadPath);

    // Use mv() to place file on the server
    photo.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);

        pool.query('UPDATE User SET uPhoto = ? WHERE uId = ?', [activeUserPhoto, activeUserId], function (err, results) {


            if (!err) {

                res.redirect('/homepage')

            }
        });
    });
});


/*------------------------------END SET NEW USER-------------------------------*/


/*------------------------------EDIT USER-------------------------------*/
app.get('/editUser', function(req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [activeUserId], function(err, results) {
            if (!err) {
                console.log(res)
                res.render('editUser', {results, activeUserFullName, companyName, companyLogo, roles, todayDate});
            }
            else {
                console.log(err)
            }
            
        });
    };
});

  

app.post('/updateUser', function (req, res) {
    if (req.session.loggedin) {
        let updateUserFName = req.body.updateFN;
        let updateUserLName = req.body.updateLN;
        let updateUserPW = req.body.updatePassword;
        let updateUserRole = req.body.updateRole;
        let updateUserJob = req.body.updateJob;
        let updateUserAbout = req.body.updateAbout;

    
        pool.query(`UPDATE User SET uFName=?, uLName=?, uPass=?, uRole=?, uJob=?, uAbout=?  WHERE uId = ? `, [updateUserFName, updateUserLName, updateUserPW, updateUserRole, updateUserJob, updateUserAbout, activeUserId], function(err, results) {
            if(!err) {
                pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [activeUserId], function(err, results) {
                    if(!err) {
                       
                        res.render('editUser', {results, activeUserFullName, companyName, companyLogo, roles, todayDate, alert: 'User Updated Successfully'});
            
                    }
                    else {
                        console.log(err)
                    }
                    
                    console.log('The data from user table : \n', results)
                })
            }
            else {
                console.log(err)
            }
    
         })
        }
})



/*------------------------------END EDIT USER-------------------------------*/

/* -- Programs PAGE ------------------------------------------- */
app.get('/newProgram', function(req, res) {
    if (req.session.loggedin) {
        res.render('newProgram');
    }
});

// CREATE A NEW Program
app.post('/newProgram', function(req, res) {
    if (req.session.loggedin) {
        let programName =  req.body.programName;
        let programDesc = req.body.programDesc;

                pool.query(`INSERT INTO Program (pName, pDesc, cId) VALUES ("${programName}", "${programDesc}", ${companyId})`, function (err, results) {
                    if (err) {
                    console.log(err);
                    }
                    else {
                        console.log("Program Inserted");
                        activeProgramId = results.Id;
                        res.redirect('/newProgram');
                    }
                })
            

    }
});