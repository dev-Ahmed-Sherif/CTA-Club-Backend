const express = require("express");
const router = express.Router();
const Club = require("../models/Clubs");
const User = require("../models/User");
const request = require("../models/Requests");
const { requireAuth } = require("../middleware/authMiddleware");

// Correct Photo Path

function correctPath(path) {
  let newPath = path.replace(/\\/gi, "/");
  return newPath;
}

// Define Multer

const multer = require("multer");
const mongoose = require("mongoose");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/club");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// Get All Clubs

router.get("/", (req, res) => {
  Club.find(function (err, data) {
    if (err) {
      res.send({ message: "Error ! Please check your query and try again." });
    } else {
      res.send(data);
    }
  });
});

// add Club

router.post(
  "/add",
  requireAuth,
  upload.single("photoURL"),
  function (req, res, next) {
    console.log(req.file);
    console.log(req.body);
    const club = new Club({
      playgroundname: req.body.playgroundname,
      address: req.body.location,
      phonenumber: req.body.phonenumber,
      vodafonnumber: req.body.vodafonnumber,
      createdDate: new Date(),
      photoURL: correctPath(req.file?.path),
    });

    club
      .save()
      .then((result) => {
        console.log(result);
        console.log(result._id);
        User.findOneAndUpdate(
          { email: req.body.email },
          {
            $push: {
              userplaygrounds: result._id,
            },
          },
          function (err, data) {
            if (err) {
              // console.log(err);
              res.send(err);
            } else {
              console.log(data);
              // res.send(data);
              res.send("تم أضافه ملعب بنجاح");
            }
          }
        );
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }
);

// Update Club

router.patch("/update", requireAuth, 
// upload.single("photoURL"), 
(req, res) => {
  // console.log(req.body);
  var id = req.body._id;
  // console.log(id);
  var playgroundname = req.body.playgroundname;
  var address = req.body.location;
  var phonenumber = req.body.phonenumber;
  var vodafonnumber = req.body.vodafonnumber;
  // var photoURL = req.file?.path;
  // console.log(photoURL);
  Club.findById(id, function (err, data) {
    console.log('this is data ' + data);
    data.playgroundname = playgroundname ? playgroundname : data.playgroundname;
    data.address = address ? address : data.address;
    data.phonenumber = phonenumber ? phonenumber : data.phonenumber;
    data.vodafonnumber = vodafonnumber ? vodafonnumber : data.vodafonnumber;
    // data.photoURL = photoURL ? photoURL : data.photoURL;
    // console.log(photoURL);
    data
      .save()
      .then((doc) => {
        console.log(doc);
        res.send({ message: "تم تعديل بيانات الملعب بنجاح" });
      })
      .catch((err) => {
        console.log(err.message);
        res.send({ message: "حدث خطأ أثناء التعديل" });
      });
  });
  });

// Update Club photo
router.patch("/update-club-photo", requireAuth, 
upload.single("photoURL"), 
(req, res) => {
  console.log(req.body);
  var id = req.body._id;
  console.log(id);
  var photoURL = correctPath(req.file?.path);
  console.log('this is photoURL ' +photoURL);

  Club.findById(id, function (err, data) {
    console.log('this is data ' + data);
    data.photoURL = photoURL ? photoURL : data.photoURL;
    console.log('this is photoURL ' +photoURL);
    data
      .save()
      .then((doc) => {
        console.log(doc);
        res.send({ message: "تم تعديل صوره الملعب بنجاح" });
      })
      .catch((err) => {
        console.log(err.message);
        res.send({ message: "حدث خطأ أثناء التعديل" });
      });
  });
  // Club.findOneAndUpdate(
  //   { _id: id },
  //   {
  //     photoURL: photoURL,
  //   },
  //   (err, data) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log(data);
  //       res.send({ message: "تم تعديل الصوره الشخصيه" });
  //     }
  // } );
  });

// Delete Club

router.delete("/delete", requireAuth, (req, res) => {
  console.log(req.body);
  Club.deleteOne({ _id: req.body._id }, (err, data) => {
    if (err) {
      console.log(err.message);
      res.send({ message: "حدث خطأ أثناء الحذف" });
    } else {
      console.log(data);
      User.findOneAndUpdate(
        { email: req.body.email },
        {
          $pull: { userplaygrounds: req.body._id },
        },
        (errUpdate, dataUpdate) => {
          if (err) {
            console.log(errUpdate);
          } else {
            console.log(dataUpdate);
          }
        }
      );
      res.send({ message: "تم حذف الملعب بنجاح" });
    }
  });
});

///////////////// Reservations ////////////////////////

//Add Reservation
router.patch("/add-Reservation", (req, res) => {
  console.log(req.body);
  const Request = new request({
    name: req.body.name,
    date: req.body.date,
    from: req.body.from,
    to: req.body.to,
    number: req.body.number,
    vodanumber: req.body.vodanumber,
    createdDate: new Date(),
  });

  Request.save().then((result) => {
    console.log(result);
    Club.findOneAndUpdate(
      { playgroundname: req.body.playgroundname },
      {
        $push: {
          requests: {
            id: result._id.toString(),
            name: result.name,
            date: result.date,
            from: result.from,
            to: result.to,
            number: result.number,
            vodanumber: result.vodanumber,
          },
        },
      },
      (err, data) => {
        if (err) {
          res.send({ message: "حصل خطأ أثناء تسجيل الحجز" });
        } else {
          console.log(data);
          res.send({ message: "تم تسجيل الحجز بنجاح" });
        }
      }
    );
  });
});


// Accept Request

router.patch("/accept-request", requireAuth, (req, res) => {
  console.log(req.body);
  console.log(req.body.from);
  console.log(req.body.from.slice(0, 5));
  console.log(req.body.to);
  console.log(req.body.to.slice(0, 5));
  Club.findOne(
    {
      $and: [
        { playgroundname: req.body.playgroundname },
        {
          table: {
            $elemMatch: {
              start: `${req.body.date}T${req.body.from.slice(0, 5)}:00`,
            },
          },
        },
        {
          table: {
            $elemMatch: {
              end: `${req.body.date}T${req.body.to.slice(0, 5)}:00`,
            },
          },
        },
      ],
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        if (data) {
          res.send({ message: " لم يتم قبول الحجز يوجد حجز اخر بهذا الميعاد" });
        } else {
          Club.findOneAndUpdate(
            { playgroundname: req.body.playgroundname },
            {
              $push: {
                table: {
                  id: req.body.id,
                  title: req.body.name,
                  start: `${req.body.date}T${req.body.from.slice(0, 5)}:00`,
                  end: `${req.body.date}T${req.body.to.slice(0, 5)}:00`,
                },
              },
            },
            (errUpdate, dataUpdate) => {
              if (errUpdate) {
                res.send("حدث خطأ اثناء قبول الحجز");
              } else {
                Club.findOneAndUpdate(
                  { playgroundname: req.body.playgroundname },
                  {
                    $pull: {
                      requests: {
                        id: { $eq: req.body.id },
                      },
                    },
                  },
                  (errUpdate, dataUpdate) => {
                    if (errUpdate) {
                      console.log(err);
                      res.send("حدث خطأ اثناء قبول الحجز");
                    } else {
                      console.log(dataUpdate);
                      res.send({ message: "تم قبول الحجز بنجاح" });
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
});

// Delete Request

router.delete("/delete-request", requireAuth, (req, res) => {
  console.log(req.body);
  Club.findOneAndUpdate(
    { playgroundname: req.body.playgroundname },
    {
      $pull: {
        requests: {
          id: { $eq: req.body.id } ,
        },
      },
    },
    (err, data) => {
      if (err) {
        res.send({ message: "لم يتم حذف الحجز" });
      } else {
        console.log(data);
        res.send({ message: "تم حذف الحجز بنجاح" });
      }
    }
  );
});

// add table Request
router.patch("/add-table-request", requireAuth, (req, res) => {
  console.log(req.body);
  Club.findOneAndUpdate(
    { _id: req.body.playgroundid },
    {
      $push: {
        table: {
          id: req.body.id,
          title: req.body.title,
          start: `${req.body.start.slice(0, req.body.start.length - 6)}`,
          end: `${req.body.end.slice(0, req.body.end.length - 6)}`,
        },
      },
    },
    (err, data) => {
      if (err) {
        res.send({ message: "لم يتم قبول الحجز" });
      } else {
        console.log(data);
        res.send({ message: "تم إضافة الحجز بنجاح" });
      }
    }
  );
});


// Delete Table Request

router.delete("/delete-Table-request", requireAuth, (req, res) => {
  console.log(req.body);
  Club.findOneAndUpdate(
    { _id: req.body.playgroundid  },
    {
      $pull: {
        table: {
          id: { $eq: req.body.id } ,
        },
      },
    },
    (err, data) => {
      if (err) {
        res.send({ message: "لم يتم حذف الحجز" });
      } else {
        console.log(data);
        res.send({ message: "تم حذف الحجز بنجاح" });
      }
    }
  );
});



module.exports = router;
