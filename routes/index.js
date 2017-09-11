const express         = require("express");
const models          = require("../models/index")
const router          = express.Router();
const bcrypt          = require("bcrypt");
const passport        = require('passport');

let creator;
let message_arr;

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
  })
  .then(function(data) {

    data.forEach(function (data) {
      // console.log(message.Users.dataValues.username);
  //     message_arr= {
  //       creator:  message.Users.dataValues.username,
  //       createdAt: req.body.createdAt,
  //       id:        req.message.id,
  //       text:      req.body.text,
  //       likey:     req.body.likey,
  //       whoLiked:  false,
  //       whoViewed: false,
  //       delete:    false
  //    }
  //   messages.push(message_arr);
  //    });
  //  }).then(function(message_arr) {
  //    messages.forEach(function(data) {
  //      if (message.userId === userId) {
  //        message.delete = true;
  //      }
     })
    res.render("gabble", {username:req.user.username, messages:data, message_arr});
  });
});





















router.post("/newgab", isAuthenticated, function(req, res) {
  models.message.create({
    userId: req.user.id,
    text: req.body.messages,
    likey: 0
  })
  .then(function(data) {
    // console.log(req.body.messages)
    res.redirect("/gabble");
  })
});


//
// router.get("/like/:id", function(req, res) {
//   models.message.create({
//     userId: req.user.id,
//     messageId: req.params.messagesId
//   })
//   .then(function() {
//     req.message.likey +=1
//     req.save().then(function() {
//       res.redirect("gabble");
//     })
//   })
// });


router.post("/:messageId/wholiked", the_likes, function (req,res) {

 res.render("wholiked", {username: req.session.username,  likers: liker });
  liker = [];
} );

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
