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
let isMentee = false; 
let isMentor = false;
// let newUserPhoto;

let newUserFName;
let newUserLName;
let newUserEmail;
let newUserPW;
let newUserRole;
let newUserJob;
let newUserAbout;
let updatePhoto;
let activeProgramId;
let selectedUserId;

// program variable
let programName;
let programDesc;
let milestoneName;
let milestoneDesc;
let milestoneOrd;


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
        pool.query('SELECT * FROM User JOIN Company On cId=ucId WHERE uEmail = ? AND uPass = ?', [useremail, password], function (err, results) {
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
                companyName = results[0].cName;
                companyLogo = results[0].cLogo;
                activeUserMentorId = results[0].mentorId;
                activeUserFullName = activeUserFName + ' ' + activeUserLName;

                console.log(`User ID: ${activeUserId}`);
                console.log(`User Role: ${activeUserRole}`);
                

                // Establish permission to add users and programs
                imHome = true;

                if (activeUserRole == "Admin" || activeUserRole == "Program Manager") {
                    addPermission = true;
                    isMentee = false; 
                    isMentor = false;
                }
                if (activeUserRole == "Mentee") {
                    addPermission = false;
                    isMentee = true; 
                    isMentor = false;
                }
                if (activeUserRole == "Mentor") {
                    addPermission = false;
                    isMentee = false; 
                    isMentor = true;
                }

                // res.redirect('/homepage');
                res.render('homepage', {results, todayDate, companyName, companyLogo, activeUserFullName, addPermission, isMentee, isMentor, imHome })
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
    isMentor = false;
    isMentee = false;
    res.redirect('/');
});

/*------------------------------END LOGOUT--------------------------------------------*/

/*------------------------------HOMEPAGE(USER'S PROFILE)--------------------------------------------*/
app.get('/homepage', function(req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [activeUserId], function(err, results) {
            console.log(results);
            if (err) throw err;

            imHome = true;
           
            res.render('homepage', {results, activeUserFullName, isMentor, isMentee, addPermission, imHome, companyName, companyLogo, todayDate});
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

    // Handle File Upload
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
    // End File Section



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

// update user photo from edituser page
///****IMPORTANT- NEED TO COME BACK TO THIS NEEDS TO KNOW IDENTIFY IF ACTIVEUSER OR SELECTED USER*/
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
            console.log

        });
    });
});


/*------------------------------END SET NEW USER-------------------------------*/


/*------------------------------EDIT USER-------------------------------*/
// direct user to edituser page after gathering all user info
app.get('/editUser', function(req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [activeUserId], function(err, results) {
            if (!err) {
                console.log('results', results) 

                    // get list of Mentors for the roles dropdown 
                    pool.query('SELECT * FROM User WHERE uRole = "Mentor"',  function (err, mentors) {
                        if (!err);
                        console.log(mentors);

                        res.render('editUser', {results, mentors, isMentee, isMentor, addPermission, activeUserFullName, companyName, companyLogo, roles, todayDate});
                    });            }
            else {
                console.log(err)
            }            
        });
    };
});

  
// Update user based on data sent from edituser.hbs
app.post('/updateUser', function (req, res) {
    if (req.session.loggedin) {
        let updateUserFName = req.body.updateFN;
        let updateUserLName = req.body.updateLN;
        let updateUserPW = req.body.updatePassword;
        let updateUserRole = req.body.updateRole;
        let updateUserJob = req.body.updateJob;
        let updateUserAbout = req.body.updateAbout;
        let updateUserMentor = req.body.updateMentor;
        let updateUserId = req.body.updateId;

     if (req.files) {
            updatePhoto = req.files.file;
        }

        let uploadPath;

        // if (!req.files || Object.keys(req.files).length === 0) {
        //     return res.status(400).send('No files were uploaded.');
        // };
       
        uploadPath = __dirname + '/public/upload/profilePhoto/' + updatePhoto.name;

        updatePhoto.mv(uploadPath, function (err) {
            if (err) return res.status(500).send(err);
            pool.query(`UPDATE User SET uPhoto = ? WHERE uId = ? `, [updatePhoto.name, updateUserId], function (err, results) {
                console.log("Update")
            });
        });
           


        pool.query(`UPDATE User SET uFName=?, uLName=?, uPass=?, uRole=?, uJob=?, uAbout=?, mentorId=? WHERE uId = ? `, [updateUserFName, updateUserLName, updateUserPW, updateUserRole, updateUserJob, updateUserAbout, updateUserMentor, updateUserId], function (err, results) {
            if (!err) {
                pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [updateUserId], function (err, results) {
                    if (!err) {
                        // Use mv() to place file on the server

                        // if the user is a mentee, get their mentor'sId. 
                        // We only want to make the update the activeUserMentorId if we are editing the active user's file - not if addPermission user is editing.
                        if (updateUserRole == "Mentee" && activeUserId == updateUserId) {
                            activeUserMentorId = mentors[0].mentorId;
                            console.log(activeUserMentorId)
                            res.redirect('/homepage')

                        }; // end if Mentee
                        res.render('edituser', { results, activeUserRole, addPermission, isMentee, activeUserFullName, updatePhoto, companyName, companyLogo, roles, todayDate, alert: 'User Updated Successfully' });
                    }// end !err

                    else {
                        console.log(err)
                    }// end select
                })
            }
            else {
                console.log(err)
            };

        });
 
}
});


/*------------------------------END EDIT USER-------------------------------*/



/*----------------My Mentee Button------------*/

app.get('/myMentor', function(req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM User WHERE uId = ?`, [activeUserMentorId], function(err, results) {
            console.log(results);
            if (err) throw err;
            
            imHome = false;
            res.render('homepage', {results, activeUserFullName, isMentor, isMentee, addPermission, imHome, companyName, companyLogo, todayDate});
        });
    };
});

// take mentor to their list of mentees
app.get('/myMentees', function(req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM User WHERE mentorId = ?`, [activeUserId], function(err, results) {
            console.log(results);
            if (err) throw err;
   
            imHome = false;
            res.render('userList', {results, activeUserFullName, isMentor, isMentee, addPermission, imHome, companyName, companyLogo, todayDate});
        });
    };
});

// display list of users to be filtered on userList.hbs by permissions
app.get('/userList', function(req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM User WHERE ucId = ?`, [companyId], function(err, results) {
            console.log(results);
            if (err) throw err;
            
            console.log('addPermission: ', addPermission)
            res.render('userList', {results, activeUserFullName, isMentor, isMentee, addPermission, imHome, companyName, companyLogo, todayDate});
        });
    };
});


// view profile of a selected user on userList page, as a guest. Upon click of Veiw button user is taken to homepage but shown profile of person they are visiting
app.post('/viewSelectedUser', function(req, res) {
    if (req.session.loggedin) {
        selectedUserId = req.body.userId;
        console.log('selected user: ', selectedUserId);
        pool.query(`SELECT * FROM User WHERE uId = ?`, [selectedUserId], function(err, results) {
            console.log(results);
            if (err) throw err;
            
            imHome = false;
            res.render('homepage', {results, activeUserFullName, isMentor, isMentee, addPermission, imHome, companyName, companyLogo, todayDate});
        });
    };
});

// delete a user from the userList.hbs
app.post('/deleteSelectedUser', function(req, res) {
    if (req.session.loggedin) {
        selectedUserId = req.body.userId;
        console.log('selected user: ', selectedUserId);
        pool.query(`DELETE FROM User WHERE uId = ?`, [selectedUserId], function(err, results) {
            console.log(results);
            if (err) throw err;
            
            // refresh page after deletion
            res.redirect('userList');
        });
    };
});

// view profile of a selected user, as a guest. Upon click of Veiw button user is taken to homepage but shown profile of person they are visiting
app.post('/editSelectedUser', function(req, res) {
    if (req.session.loggedin) {

        // establish selected user
        selectedUserId = req.body.userId;
        let selectedUserIsMentee = false;
        console.log('Selected User Id: ', selectedUserId);

        // get selected user's current info
        pool.query(`SELECT * FROM Company JOIN User ON Company.cId = User.ucId WHERE uId = ?`, [selectedUserId], function(err, results) {
            if (!err) { 
                console.log('results', results) 

                imHome = false;

                // need to see if user is a mentee
                if (results[0].uRole == "Mentee") {
                    selectedUserIsMentee = true;
                }else {
                    console.log("Not a Mentee");
                }; // end if Mentee

                // get list of Mentors for the roles dropdown - tried to add it to if, but mentors lost scope
                pool.query('SELECT * FROM User WHERE uRole = "Mentor"',  function (err, mentors) {
                    if (!err) {
                        console.log('mentors: ',mentors);
                        res.render('editUser', {results, mentors, isMentee, selectedUserIsMentee, isMentor, imHome, addPermission, activeUserFullName, companyName, companyLogo, roles, todayDate});
                    } else 
                    {
                        console.log(err);                            }
                    }); // end mentor query
            } else {
                    console.log(err)};// No errors
        }); // end outer Select query  
    }; // end if loggin 
}); // end /editSelectedUser


/*--------------------------------END USER LIST PAGE---------------------------------------*/


/*--------------------------------PROGRAM LIST PAGE---------------------------------------*/

// display list of programs to be filtered on .hbs by permissions -- NOTE programList.hbs is not created yet. Create it once userList is perfected
app.get('/programList', function (req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM Program WHERE cId = ?`, [companyId], function (err, results) {
            console.log(results);
            if (err) throw err;

            res.render('programList', { results, activeUserFullName, isMentor, isMentee, addPermission, imHome, companyName, companyLogo, todayDate });
        });
    };
});


// TODO: STILL NEED TO DO THIS PART. NOT SURE WHAT FUNCTION WE NEED FOR THIS
app.post('/programsList', function (req, res) {
    if (req.session.loggedin) {
        pool.query(`SELECT * FROM Program WHERE pcId = ?`, [companyId], function (err, results) {
            console.log(results);
            if (err) throw err;

            // programList.hbs is not created yet. Create it once userList is perfected
            res.render('programList', { results, activeUserFullName, isMentor, isMentee, addPermission, imHome, companyName, companyLogo, todayDate });
        });
    };
});



/*--------------------------------END PROGRAM LIST PAGE---------------------------------------*/





/* -- ----------------------CREATE A PROGRAM------------------------------------------- */

// display program page
app.get('/newProgram', function (req, res) {
    if (req.session.loggedin) {
        pool.query('SELECT * FROM Program where cId=?', [companyId], function (err, results) {
            console.log(results);
            if (err) throw err;
            res.render('newProgram', { results, activeUserFullName, companyName, companyLogo, todayDate });
        })
    };
});

// create a new program
app.post('/newProgram', function (req, res) {
    if (req.session.loggedin) {
        programName = req.body.programName;
        programDesc = req.body.programDesc;

        pool.query(`INSERT INTO Program (pName, pDesc, cId) VALUES ("${programName}", "${programDesc}", ${companyId})`, function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Program Inserted");
                
                res.redirect('/addMilestone');
            }
        })
    }
});
/*----------------------------END CREATE PROGRAM ------------------------------------------*/


/*----------------------------ADD MILESTONE FOR PROGRAM ------------------------------------------*/

// dispplay milestone page
app.get('/addMilestone', function (req, res) {
    if (req.session.loggedin) {
        pool.query('SELECT * FROM Program WHERE cId=?', [companyId], function (err, results) {
            console.log(results);
            activeProgramId = results[0].pId;
            if (err) throw err;
            res.render('addMilestone', { results, activeUserFullName, companyName, companyLogo, todayDate });
        })
    };
});


// create new milestone
app.post('/newMilestone', function (req, res) {
    if (req.session.loggedin) {
        milestoneName = req.body.milestoneName;
        milestoneDesc = req.body.milestoneDesc;
        milestoneOrd  = req.body.milestoneOrd;  

        pool.query(`INSERT INTO Milestone (mName, mDesc, mOrdinal, mpId) VALUES ("${milestoneName}", "${milestoneDesc}", "${milestoneOrd}", "${activeProgramId}")`, function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Milestone Inserted");
                activeProgramId = results.Id;
                res.redirect('/addMilestone');
            }
        })
    }
});

/*----------------------------END MILESTONE FOR PROGRAM ------------------------------------------*/


