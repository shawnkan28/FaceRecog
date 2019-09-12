'use strict'
global.Blob = require('blob');
const env = require(process.env.NODE_ENV),
      faceapi = require('face-api.js'),
      canvas = require('canvas'),
      path = require('path'),
      fetch = require('node-fetch'),
      fs = require('fs-extra'),
      MODELS_URL = path.join(__dirname, '/../public/models/');

function controller(){
  const { Canvas, Image, ImageData } = canvas;
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });
}

controller.prototype.detectFace = async function(recognitionData){
  try{
    const imageName = 'scarjo.jpg';
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
    const labeledFaceDescriptors = await recogData(recognitionData);
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    const img = await canvas.loadImage(env.images+imageName);
    const canvas1 = faceapi.createCanvasFromMedia(img);
    const displaySize = { width: img.width, height: img.height }
    faceapi.matchDimensions(canvas1, displaySize);
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString()});
      drawBox.draw(canvas1);
    });
    return { canvas: canvas1.toDataURL(), image: imageName };
  }catch(err){ throw 'Error in controllers/faceDetector.js (detectFace):\n'+err; }
}
controller.prototype.recognizeFace = async function(){
  try{
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
    const labels = await fs.readdir(env.faceDB);
    return Promise.all(labels.map(async label =>{
      const descriptions = [];
      const images = await fs.readdir(env.faceDB+label);
      for(let i=0;i<images.length;i++){
        const img = await canvas.loadImage(env.faceDB+label+'\\'+images[i]);
        // faceapi.fetchImage('https://raw.githubusercontent.com/shawnkan28/FaceDB/master/'+label.replace(/\s+/g,'%20')+'/'+images[i].replace(/\s+/g,'%20'));
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if(typeof detections != 'undefined'){
          descriptions.push(detections.descriptor);
          console.log('finished loading '+images[i]+ '\t\t detected');
        }else console.log('finished loading '+images[i]+ '\t\t undetected');
      }
      return { label: label, descriptors: descriptions };
      // return new faceapi.LabeledFaceDescriptors(label, descriptions);
    }));
  }catch(err){ throw 'Error in controller/faceDetector.js (recognizeFace):\n'+err; }
}

async function recogData(data){
  try{
    return Promise.all(data.map(d => {
      return new faceapi.LabeledFaceDescriptors(d.label, d.descriptors);
    }))
  }catch(err){ throw 'Error in faceDetector.js (recogData):\n'+err; }
}

module.exports = controller;
