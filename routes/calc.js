var express = require('express');
var router = express.Router();
var fs = require('fs');

/* get vanilla json */
router.get('/vanilla', function (req, res, next) {
  var json = fileToJson('./factorio-current.log', function(json, err){
    if(err){
      res.status(500);
      res.send('something went wrong');
    } else {
      res.status(200);
      res.send(json);
    }

  })
});


/* send post with currentlog returns json with all data */
router.post('/data', function (req, res, next) {
  var file;
  console.log(req.files);
  if (!req.files) {
    res.send('No file uploaded');
    return;
  }
  var filepath = './uploads/' + Date.now().toString() + req.files.sampleFile.name;
  req.files.sampleFile.mv(filepath, function (err) {
    if (err) {
      console.log(err);
      res.send('Could not upload your file');
    } else {
      var json = fileToJson(filepath, function (json, err) {
        if (err) {
          fs.unlink(filepath, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log('file removed');
            }
          });
          res.send(err);
        } else {
          fs.unlink(filepath, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log('file removed');
            }
          });
          res.send(json);
        }
      });
    }
  });

});

function fileToJson(filepath, callback) {
  readFile(filepath, function (data, err) {
    var array = data.toString().split('\n');
    console.log('length: ' + array.length);
    var newData = getDataString(array);
    //console.log(data.toString())
    var obj = JSON.parse(newData);
    var returnVal = updateTechs(obj);
    callback(obj, null);

  });

}

function readFile(filepath, callback) {
  fs.stat(filepath, function (err) {
    if (!err) {
      fs.readFile(filepath, 'utf8', function (err, data) {
        if (err) {
          console.log(err);
          callback(null, err);
        } else {
          callback(data, null);
        }
      })
    } else {
      console.log(err);
      callback(null, err);
    }
  })
}

function getDataString(data) {
  var r = 'Script data-final-fixes.lua:347: ';
  var match;
  for (var i = 0; i < data.length; i++) {
    match = data[i].split(r)[1];

    if (match != null) {
      //console.log('match found', match);
      //console.log(match);
      return match;
    }
  }
  return null;
}

function updateTechs(obj) {
  for (var i = 0; i < obj.technologies.length; i++) {
    var t = obj.technologies[i];
    if (t.effects !== undefined) {
      for (var j = 0; j < t.effects.length; j++) {
        var ef = t.effects[j];
        unlockRecipe(obj, ef.recipe);
      }
    }
  }
  obj.technologies = null;
}

function unlockRecipe(obj, recipeName) {
  for (var i = 0; i < obj.recipes.length; i++) {
    if (obj.recipes[i].name === recipeName) {
      obj.recipes[i].enabled = true
      break;
    }
  }
}

module.exports = router;
