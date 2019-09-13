module.exports = {

  /* Basic Config */
  status: "deploy",
  port: "3000",
  models: __dirname+'\\public\\models',

  /* FaceDetector Config */
  minConfidence: 0.5,
  inputSize: 408,
  scoreThreshold: 0.5,
  minFaceSize: 50,
  scaleFactor: 0.8,

  /* Controllers */
  detector: __dirname+'\\controllers\\faceDetector.js',
  recData: __dirname+'\\RecData.json',

  /* Directories */
  images: __dirname+'\\public\\images\\',
  faceDB: __dirname+'\\FaceDB\\'
}
