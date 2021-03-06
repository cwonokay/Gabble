const express         = require("express");
const models          = require("../models/index")
const router          = express.Router();
const bcrypt          = require("bcrypt");
const passport        = require('passport');

let creator;


const isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {

    return next()
  }
  req.flash('error', 'You have to be logged in to access the page.')
  res.redirect('/')
}

router.get("/", function(req, res) {
  res.render("login", {
    messages: res.locals.getMessages()
  });
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/gabble',
  failureRedirect: '/',
  failureFlash: true
}));

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post("/signup", function(req, res) {
  let name     = req.body.name
  let username = req.body.username
  let passwordNoHash = req.body.password
  let confirmPassword = req.body.confirmPassword

  // console.log(passwordNoHash);
  //
  // console.log(confirmPassword);

  if (!username || !passwordNoHash) {
    req.flash('error', "Please, fill in all the fields.")
    res.redirect('/signup')
  }else if(passwordNoHash != confirmPassword) {
    req.flash('error', "Passwords do not match.")
    res.redirect('/signup')
  }

  let salt = bcrypt.genSaltSync(10)
  let hashedPassword = bcrypt.hashSync(passwordNoHash, salt)

  let newUser = {
    name: name,
    username: username,
    salt: salt,
    password: hashedPassword
  }
  if(passwordNoHash === confirmPassword){
    console.log("matched");
    models.User.create(newUser)
    .then(function(newUser) {
      res.redirect('/')
    }).catch(function(error) {
      req.flash('error', "Please, choose a different username.")
      res.redirect('/signup')
    });
  }
});


router.get("/newgab", isAuthenticated, function(req, res) {
  res.render("newgab", {username: req.user.username});
})

router.get("/gabble", isAuthenticated, function(req, res) {
  models.message.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      {model: models.User, as: 'Users'},
      {model: models.like, as: 'likes'}
    ]
   }).then(function(messages) {
     messages.forEach(function(message) {
       console.log(message.dataValues.Users.dataValues.username);
       if (message.userId === req.user.id) {
         message.delete = true;
       }
       message.username = message.dataValues.Users.dataValues.username;
     })
    res.render("gabble", {message: messages});
  });
});


router.post("/newgab", isAuthenticated, function(req, res) {
  models.message.create({
    userId: req.user.id,
    text: req.body.messages,
  })
  .then(function(data) {
    // console.log(req.body.messages)
    res.redirect("/gabble");
  })
});

router.get("/like/:id", function(req, res) {
  models.message.findOne({
    where:{id: req.params.id},
    include:[
      {model: models.like, as: "likes"},
    ]
  })
  .then(function(message) {
  models.like.create({
    userId: req.user.id,
    messageId: req.params.messagesId
  })
})
});

router.post("/like/:id", function(req, res){
    models.like.create({
        userId: req.user.id,
        messageId: req.params.id
    })
    .then(function(like){
        res.redirect("/gabble");
    })
  });

router.get("/wholiked/:messageId", function(req, res) {

  models.message.findById(req.params.messageId)

  .then(function(message){
      res.render("wholiked", {message: message, user: req.user});
})
});



router.get('/destroy/:id', isAuthenticated, function(req, res, next) {
  models.message.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(function(data) {
    res.redirect('/gabble');
  })
});




router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
