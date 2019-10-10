'use strict'

const express = require('express'),
      router = express.Router(),
      env = require(process.env.NODE_ENV),
      jsonfile = require('jsonfile'),
      fs = require('fs-extra'),
      controller = require(env.detector);

/* GET home page. */
router.get('/', function(req, res, next) {
  const cont = new controller();
  const labeledDescriptor = [];
  const data = jsonfile.readFileSync(env.recData);
  data.forEach(d => {
    const obj = {label: d.label};
    let array = [];
    d.descriptors.forEach(descriptor => {
      const dat = new Float32Array(descriptor);
      array.push(dat);
    });
    obj.descriptors = array;
    labeledDescriptor.push(obj);
  });

  cont.detectFace(labeledDescriptor, "scarjolookalike.jpg").then(function(data){
    const image = '/images/'+data.image;
    res.render('index', { title: 'Express', box: data.canvas, image: image });
  }).catch(function(err){
    console.log(err);
    res.send(err);
  });
});

router.get('/recdata', function(req,res){
  const cont = new  controller();
  cont.recognizeFace().then(function(data){
    // descriptions.forEach(description => {
    //   array.push(Array.prototype.slice.call(description));
    // });
    const array = [];
    data.forEach(d => {
      const obj = { label: d.label }
      obj.descriptors = [];
      d.descriptors.forEach(descriptor => {
        const des = Array.prototype.slice.call(descriptor);
        obj.descriptors.push(des);
      });
      array.push(obj);
    });
    const json = JSON.stringify(array, null, 4);
    fs.writeFileSync(env.recData, json, 'utf8');
    res.send('Finished Loading recognition Data.');
  });
});

router.get('/test', function(req,res){
  const data = [{
    label: 'Shawn',
    descriptors: [[1,2,3,4,5],[10,12,17,13,14,15]]
  },{
    label: 'Shawn23',
    descriptors: [[5,12,53,85,75],[154,14,123,123,154,175]]
  }];
  const newDat = data.map(dat => {
    return dat.descriptors.map(d =>{
      return d.map(f => {
        return f+2;
      })
    });
  });
  console.log(newDat);
  res.send('ok');
})

module.exports = router;
