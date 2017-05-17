
// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}


// SETUP RENDERER AND SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);


// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(-28,10,28);
camera.lookAt(scene.position);
scene.add(camera);


// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;


// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();


// FLOOR WITH CHECKERBOARD 
var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = 0;
floor.rotation.x = Math.PI / 2;
scene.add(floor);




// MATERIALS
var normalMaterial = new THREE.MeshNormalMaterial();

// OCTOPUS MATERIAL
//You must change this matrix in updateBody() if you want to animate the octopus head.
var octopusMatrix = {type: 'm4', value: new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,3.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  )};
var octopusMaterial = new THREE.ShaderMaterial({
  uniforms:{
    octopusMatrix: octopusMatrix,
  },
});

var shaderFiles = [
  'glsl/octopus.vs.glsl',
  'glsl/octopus.fs.glsl'
];
new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  octopusMaterial.vertexShader = shaders['glsl/octopus.vs.glsl'];
  octopusMaterial.fragmentShader = shaders['glsl/octopus.fs.glsl'];
})


// GEOMETRY

//Here we load the octopus geometry from a .obj file, just like the dragon
function loadOBJ(file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var onProgress = function(query) {
    if ( query.lengthComputable ) {
      var percentComplete = query.loaded / query.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  };

  var onError = function() {
    console.log('Failed to load ' + file);
  };

  var loader = new THREE.OBJLoader();
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
    object.position.set(xOff,yOff,zOff);
    object.rotation.x= xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale,scale,scale);
    scene.add(object);
  }, onProgress, onError);
  
}

//We keep the octopus at (0,0,0) and without any offset or scale factor, so we can change these values with transformation matrices.
loadOBJ('obj/Octopus_04_A.obj',octopusMaterial,1.0,0,0,0,0,0,0);


//Eyes

//We create a sphereGeometry for the eyes and the pupils
var eyeGeometry = new THREE.SphereGeometry(1.0,64,64);

var eye_R = new THREE.Mesh(eyeGeometry,normalMaterial);
//This Matrix for the right eye includes translation and scale
var eyeTSMatrix_R = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,-0.92, 
  0.0,0.0,0.0,1.0
  );
//Here we relate the eye with the octopus by multiplying their matrices
var octopusEye_RMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, eyeTSMatrix_R);
eye_R.setMatrix(octopusEye_RMatrix);
scene.add(eye_R);
//Right eye pupil translation and scale matrix
var pupilMatrix_R = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
  );
var cosTheta = Math.cos(Math.PI * (-50 /180.0));
var sinTheta = Math.sin(Math.PI * (-50 /180.0));
//This is a rotation matrix for the right pupil
var pupilRotMatrix_R = new THREE.Matrix4().set(
  cosTheta,0.0,-sinTheta,0.0, 
  0.0,1.0,0.0,0.0, 
  sinTheta,0.0,cosTheta,0.0, 
  0.0,0.0,0.0,1.0
  );
var pupilTSRMatrix_R = new THREE.Matrix4().multiplyMatrices(pupilRotMatrix_R, pupilMatrix_R);
var eyePupilMatrix_R = new THREE.Matrix4().multiplyMatrices(octopusEye_RMatrix, pupilTSRMatrix_R);
var pupil_R = new THREE.Mesh(eyeGeometry,normalMaterial);
pupil_R.setMatrix(eyePupilMatrix_R);
scene.add(pupil_R);

var eye_L = new THREE.Mesh(eyeGeometry,normalMaterial);
//Left eye translation and scale matrix
var eyeTSMatrix_L = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,0.92, 
  0.0,0.0,0.0,1.0
  );
var octopusEye_LMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, eyeTSMatrix_L);
eye_L.setMatrix(octopusEye_LMatrix);
scene.add(eye_L);
//Left eye pupil translation and scale matrix
var pupilMatrix_L = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
  );
cosTheta = Math.cos(Math.PI * (-130 /180.0));
sinTheta = Math.sin(Math.PI * (-130 /180.0));
var pupilRotMatrix_L = new THREE.Matrix4().set(
  cosTheta,0.0,-sinTheta,0.0, 
  0.0,1.0,0.0,0.0, 
  sinTheta,0.0,cosTheta,0.0, 
  0.0,0.0,0.0,1.0
  );
var pupilTSRMatrix_L = new THREE.Matrix4().multiplyMatrices(pupilRotMatrix_L, pupilMatrix_L);
var eyePupilMatrix_L = new THREE.Matrix4().multiplyMatrices(octopusEye_LMatrix, pupilTSRMatrix_L);
var pupil_L = new THREE.Mesh(eyeGeometry,normalMaterial);
pupil_L.setMatrix(eyePupilMatrix_L);
scene.add(pupil_L);


//Tentacle socket
//This point indicates the position for the first tentacle socket, you must figure out the other positions, (you get extra points if it is algorithmically)
var rotY01 = 135;
var rotY02 = 45;
var rotY03 = -45
var rotY04 = -135;

var rotationsY_Link01 = new THREE.Matrix4().set(
 Math.cos((Math.PI * rotY01)/180), 0.0, Math.sin((Math.PI * rotY01)/180), 0.0,
 0.0, 1.0, 0.0, 0.0,
 -Math.sin((Math.PI * rotY01)/180), 0.0, Math.cos((Math.PI * rotY01)/180), 0.0,
 0.0, 0.0, 0.0, 1.0
);

var rotationsY_Link02 = new THREE.Matrix4().set(
 Math.cos((Math.PI * rotY02)/180), 0.0, Math.sin((Math.PI * rotY02)/180), 0.0,
 0.0, 1.0, 0.0, 0.0,
 -Math.sin((Math.PI * rotY02)/180), 0.0, Math.cos((Math.PI * rotY02)/180), 0.0,
 0.0, 0.0, 0.0, 1.0
);

var rotationsY_Link03 = new THREE.Matrix4().set(
 Math.cos((Math.PI * rotY03)/180), 0.0, Math.sin((Math.PI * rotY03)/180), 0.0,
 0.0, 1.0, 0.0, 0.0,
 -Math.sin((Math.PI * rotY03)/180), 0.0, Math.cos((Math.PI * rotY03)/180), 0.0,
 0.0, 0.0, 0.0, 1.0
);

var rotationsY_Link04 = new THREE.Matrix4().set(
 Math.cos((Math.PI * rotY04)/180), 0.0, Math.sin((Math.PI * rotY04)/180), 0.0,
 0.0, 1.0, 0.0, 0.0,
 -Math.sin((Math.PI * rotY04)/180), 0.0, Math.cos((Math.PI * rotY04)/180), 0.0,
 0.0, 0.0, 0.0, 1.0
);

var tentacleSocketMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,-2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,2.4, 
  0.0,0.0,0.0,1.0
  );
var octopusSocketMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix);
octopusSocketMatrix.multiply(rotationsY_Link01);
var tentacleSocketGeometry = new THREE.Geometry();
tentacleSocketGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
var tentacleSocketMaterial = new THREE.PointCloudMaterial( { size: 10, sizeAttenuation: false, color:0xff0000} );
var tentacleSocket = new THREE.PointCloud( tentacleSocketGeometry, tentacleSocketMaterial );
tentacleSocket.setMatrix(octopusSocketMatrix);
scene.add(tentacleSocket);


var tentacleSocketMatrix02 = new THREE.Matrix4().set(
  1.0,0.0,0.0,-2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,-2.4, 
  0.0,0.0,0.0,1.0
  );
var octopusSocketMatrix02 = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix02);
octopusSocketMatrix02.multiply(rotationsY_Link02);
var tentacleSocketGeometry02 = new THREE.Geometry();
tentacleSocketGeometry02.vertices.push(new THREE.Vector3( 0, 0, 0));
var tentacleSocketMaterial02 = new THREE.PointCloudMaterial( { size: 10, sizeAttenuation: false, color:0xff0000} );
var tentacleSocket02 = new THREE.PointCloud( tentacleSocketGeometry02, tentacleSocketMaterial02 );
tentacleSocket02.setMatrix(octopusSocketMatrix02);
scene.add(tentacleSocket02);

var tentacleSocketMatrix03 = new THREE.Matrix4().set(
  1.0,0.0,0.0,2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,-2.4, 
  0.0,0.0,0.0,1.0
  );
var octopusSocketMatrix03 = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix03);
octopusSocketMatrix03.multiply(rotationsY_Link03);
var tentacleSocketGeometry03 = new THREE.Geometry();
tentacleSocketGeometry03.vertices.push(new THREE.Vector3( 0, 0, 0));
var tentacleSocketMaterial03 = new THREE.PointCloudMaterial( { size: 10, sizeAttenuation: false, color:0xff0000} );
var tentacleSocket03 = new THREE.PointCloud( tentacleSocketGeometry03, tentacleSocketMaterial03 );
tentacleSocket03.setMatrix(octopusSocketMatrix03);
scene.add(tentacleSocket03);

var tentacleSocketMatrix04 = new THREE.Matrix4().set(
  1.0,0.0,0.0,2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,2.4, 
  0.0,0.0,0.0,1.0
  );
var octopusSocketMatrix04 = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix04);
octopusSocketMatrix04.multiply(rotationsY_Link04);
var tentacleSocketGeometry04 = new THREE.Geometry();
tentacleSocketGeometry04.vertices.push(new THREE.Vector3( 0, 0, 0));
var tentacleSocketMaterial04 = new THREE.PointCloudMaterial( { size: 10, sizeAttenuation: false, color:0xff0000} );
var tentacleSocket04 = new THREE.PointCloud( tentacleSocketGeometry04, tentacleSocketMaterial04 );
tentacleSocket04.setMatrix(octopusSocketMatrix04);
scene.add(tentacleSocket04);


///////////////////////////////////
// Tentacle Joints////////////////



var sphere01_01 = new THREE.SphereGeometry(0.56, 64, 64);
var spheres = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  );


var sphere01_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix, spheres);
var sphere01_01M = new THREE.Mesh(sphere01_01, normalMaterial);
sphere01_01M.setMatrix(sphere01_01Pos);
scene.add(sphere01_01M);

var sphere02_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix02, spheres);
var sphere02_01M = new THREE.Mesh(sphere01_01, normalMaterial);
sphere02_01M.setMatrix(sphere02_01Pos);
scene.add(sphere02_01M);


var sphere03_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix03, spheres);
var sphere03_01M = new THREE.Mesh(sphere01_01, normalMaterial);
sphere03_01M.setMatrix(sphere03_01Pos);
scene.add(sphere03_01M);

var sphere04_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix04, spheres);
var sphere04_01M = new THREE.Mesh(sphere01_01, normalMaterial);
sphere04_01M.setMatrix(sphere04_01Pos);
scene.add(sphere04_01M);

//create tentacles and add them to the scene here (at least two cylinders per tentacle):

//Example of tentacle's links
var rotX_Link01 = 90;
var rotZ_Link01 = 0;
var tentacle_01Link_01G = new THREE.CylinderGeometry(0.5,0.30,1.8,64);
var tentacle_01Link_02G = new THREE.CylinderGeometry(0.5,0.30,1.8,64);
var tentacle_01Link_03G = new THREE.CylinderGeometry(0.5,0.30,1.8,64);
var tentacle_01Link_04G = new THREE.CylinderGeometry(0.5,0.30,1.8,64);

var tentacle01 = new THREE.Matrix4().set(
 1.0, 0.0, 0.0, 0.0,
 0.0, 1.0, 0.0, 0.0,
 0.0, 0.0, 1.0, 0.0,
 0.0, 0.0, 0.0, 1.0
);

var rotationsZ_Link01 = new THREE.Matrix4().set(
 Math.cos((Math.PI * rotZ_Link01)/180), -Math.sin((Math.PI * rotZ_Link01)/180), 0.0, 0.0,
 Math.sin((Math.PI * rotZ_Link01)/180), Math.cos((Math.PI * rotZ_Link01)/180), 0.0, 0.0,
 0.0, 0.0, 1.0, 0.0,
 0.0, 0.0, 0.0, 1.0
);


var rotationsX_Link01 = new THREE.Matrix4().set(
  1.0, 0.0, 0.0, 0.0,
  0.0, Math.cos((Math.PI * rotX_Link01)/180), -Math.sin((Math.PI * rotX_Link01)/180), 0.0,
  0.0, Math.sin((Math.PI * rotX_Link01)/180),  Math.cos((Math.PI * rotX_Link01)/180), 0.0,
  0.0, 0.0, 0.0, 1.0
);


var translations_Link01 = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,-0.9, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);

 var tentacle01_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix);
 tentacle01_Link01Matrix.multiply(rotationsX_Link01);
 tentacle01_Link01Matrix.multiply(rotationsZ_Link01);
 tentacle01_Link01Matrix.multiply(translations_Link01);
 var tentacle_01Link_01 = new THREE.Mesh(tentacle_01Link_01G,normalMaterial);
 tentacle_01Link_01.setMatrix(tentacle01_Link01Matrix);
 scene.add(tentacle_01Link_01);

 var tentacle02_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix02);
 tentacle02_Link01Matrix.multiply(rotationsX_Link01);
 tentacle02_Link01Matrix.multiply(rotationsZ_Link01);
 tentacle02_Link01Matrix.multiply(translations_Link01);
 var tentacle_02Link_01 = new THREE.Mesh(tentacle_01Link_02G,normalMaterial);
 tentacle_02Link_01.setMatrix(tentacle02_Link01Matrix);
 scene.add(tentacle_02Link_01);

 var tentacle03_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix03);
 tentacle03_Link01Matrix.multiply(rotationsX_Link01);
 tentacle03_Link01Matrix.multiply(rotationsZ_Link01);
 tentacle03_Link01Matrix.multiply(translations_Link01);
 var tentacle_03Link_01 = new THREE.Mesh(tentacle_01Link_03G,normalMaterial);
 tentacle_03Link_01.setMatrix(tentacle03_Link01Matrix);
 scene.add(tentacle_03Link_01);

 var tentacle04_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix04);
 tentacle04_Link01Matrix.multiply(rotationsX_Link01);
 tentacle04_Link01Matrix.multiply(rotationsZ_Link01);
 tentacle04_Link01Matrix.multiply(translations_Link01);
 var tentacle_04Link_01 = new THREE.Mesh(tentacle_01Link_04G,normalMaterial);
 tentacle_04Link_01.setMatrix(tentacle04_Link01Matrix);
 scene.add(tentacle_04Link_01);





////////// Second Joint

var rotX_Link02 = 180;
var rotZ_Link02 = 0;
var sphere01_02 = new THREE.SphereGeometry(0.35, 64, 64);
var tentacle_02Link_02G = new THREE.CylinderGeometry(0.23,0.30,1.4,64);

var translations_Sphere01_02 = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,-0.72, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);

var rotationsZ_Link02 = new THREE.Matrix4().set(
 Math.cos((Math.PI * rotZ_Link02)/180), -Math.sin((Math.PI * rotZ_Link02)/180), 0.0, 0.0,
 Math.sin((Math.PI * rotZ_Link02)/180), Math.cos((Math.PI * rotZ_Link02)/180), 0.0, 0.0,
 0.0, 0.0, 1.0, 0.0,
 0.0, 0.0, 0.0, 1.0
);

var rotationsX_Link02 = new THREE.Matrix4().set(
  1.0, 0.0, 0.0, 0.0,
  0.0, Math.cos((Math.PI * rotX_Link02)/180), -Math.sin((Math.PI * rotX_Link02)/180), 0.0,
  0.0, Math.sin((Math.PI * rotX_Link02)/180),  Math.cos((Math.PI * rotX_Link02)/180), 0.0,
  0.0, 0.0, 0.0, 1.0
);



var translations_Link02 = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.8, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);




/////////////// Second joints
var sphere01_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle01_Link01Matrix);
sphere01_02Pos.multiply(translations_Sphere01_02);
var sphere01_02M = new THREE.Mesh(sphere01_02, normalMaterial);
sphere01_02M.setMatrix(sphere01_02Pos);
scene.add(sphere01_02M);

var sphere02_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle02_Link01Matrix);
sphere02_02Pos.multiply(translations_Sphere01_02);
var sphere02_02M = new THREE.Mesh(sphere01_02, normalMaterial);
sphere02_02M.setMatrix(sphere02_02Pos);
scene.add(sphere02_02M);

var sphere03_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle03_Link01Matrix);
sphere03_02Pos.multiply(translations_Sphere01_02);
var sphere03_02M = new THREE.Mesh(sphere01_02, normalMaterial);
sphere03_02M.setMatrix(sphere03_02Pos);
scene.add(sphere03_02M);

var sphere04_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle04_Link01Matrix);
sphere04_02Pos.multiply(translations_Sphere01_02);
var sphere04_02M = new THREE.Mesh(sphere01_02, normalMaterial);
sphere04_02M.setMatrix(sphere04_02Pos);
scene.add(sphere04_02M);
/////////////////



///////////////// Second tentacles
var tentacle_02Link_01GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere01_02Pos);
tentacle_02Link_01GMatrix.multiply(rotationsX_Link02);
tentacle_02Link_01GMatrix.multiply(rotationsZ_Link02);
tentacle_02Link_01GMatrix.multiply(translations_Link02);
var tentacle_01Link_02 = new THREE.Mesh(tentacle_02Link_02G,normalMaterial);
tentacle_01Link_02.setMatrix(tentacle_02Link_01GMatrix);
scene.add(tentacle_01Link_02);


var tentacle_02Link_02GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere02_02Pos);
tentacle_02Link_02GMatrix.multiply(rotationsX_Link02);
tentacle_02Link_02GMatrix.multiply(rotationsZ_Link02);
tentacle_02Link_02GMatrix.multiply(translations_Link02);
var tentacle_02Link_02 = new THREE.Mesh(tentacle_02Link_02G,normalMaterial);
tentacle_02Link_02.setMatrix(tentacle_02Link_02GMatrix);
scene.add(tentacle_02Link_02);

var tentacle_02Link_03GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere03_02Pos);
tentacle_02Link_03GMatrix.multiply(rotationsX_Link02);
tentacle_02Link_03GMatrix.multiply(rotationsZ_Link02);
tentacle_02Link_03GMatrix.multiply(translations_Link02);
var tentacle_03Link_02 = new THREE.Mesh(tentacle_02Link_02G,normalMaterial);
tentacle_03Link_02.setMatrix(tentacle_02Link_03GMatrix);
scene.add(tentacle_03Link_02);

var tentacle_02Link_04GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere04_02Pos);
tentacle_02Link_04GMatrix.multiply(rotationsX_Link02);
tentacle_02Link_04GMatrix.multiply(rotationsZ_Link02);
tentacle_02Link_04GMatrix.multiply(translations_Link02);
var tentacle_02Link_04 = new THREE.Mesh(tentacle_02Link_02G,normalMaterial);
tentacle_02Link_04.setMatrix(tentacle_02Link_04GMatrix);
scene.add(tentacle_02Link_04);



////////////////////////// Third Joints
var sphere01_03 = new THREE.SphereGeometry(0.28, 64, 64);

var translations_Sphere01_03 = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.80, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);

var sphere01_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_01GMatrix);
sphere01_03Pos.multiply(translations_Sphere01_03);
var sphere01_03M = new THREE.Mesh(sphere01_03, normalMaterial);
sphere01_03M.setMatrix(sphere01_03Pos);
scene.add(sphere01_03M);

var sphere02_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_02GMatrix);
sphere02_03Pos.multiply(translations_Sphere01_03);
var sphere02_03M = new THREE.Mesh(sphere01_03, normalMaterial);
sphere02_03M.setMatrix(sphere02_03Pos);
scene.add(sphere02_03M);

var sphere03_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_03GMatrix);
sphere03_03Pos.multiply(translations_Sphere01_03);
var sphere03_03M = new THREE.Mesh(sphere01_03, normalMaterial);
sphere03_03M.setMatrix(sphere03_03Pos);
scene.add(sphere03_03M);

var sphere04_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_04GMatrix);
sphere04_03Pos.multiply(translations_Sphere01_03);
var sphere04_03M = new THREE.Mesh(sphere01_03, normalMaterial);
sphere04_03M.setMatrix(sphere04_03Pos);
scene.add(sphere04_03M);



////////////////////// Third tentacles
var rotX_Link03 = 0;
var rotZ_Link03 = 0;

var rotationsZ_Link03 = new THREE.Matrix4().set(
 Math.cos((Math.PI * rotZ_Link03)/180), -Math.sin((Math.PI * rotZ_Link03)/180), 0.0, 0.0,
 Math.sin((Math.PI * rotZ_Link03)/180), Math.cos((Math.PI * rotZ_Link03)/180), 0.0, 0.0,
 0.0, 0.0, 1.0, 0.0,
 0.0, 0.0, 0.0, 1.0
);

var tentacle_03Link_01G = new THREE.CylinderGeometry(0.10,0.23,1.4,64);

var rotationsX_Link03 = new THREE.Matrix4().set(
  1.0, 0.0, 0.0, 0.0,
  0.0, Math.cos((Math.PI * rotX_Link03)/180), -Math.sin((Math.PI * rotX_Link03)/180), 0.0,
  0.0, Math.sin((Math.PI * rotX_Link03)/180),  Math.cos((Math.PI * rotX_Link03)/180), 0.0,
  0.0, 0.0, 0.0, 1.0
);

var translations_Link03 = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.7, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);

var tentacle_03Link_01GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere01_03Pos);
tentacle_03Link_01GMatrix.multiply(rotationsX_Link03);
tentacle_03Link_01GMatrix.multiply(rotationsZ_Link03);
tentacle_03Link_01GMatrix.multiply(translations_Link03);
var tentacle_03Link_05 = new THREE.Mesh(tentacle_03Link_01G,normalMaterial);
tentacle_03Link_05.setMatrix(tentacle_03Link_01GMatrix);
scene.add(tentacle_03Link_05);

var tentacle_03Link_02GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere02_03Pos);
tentacle_03Link_02GMatrix.multiply(rotationsX_Link03);
tentacle_03Link_02GMatrix.multiply(rotationsZ_Link03);
tentacle_03Link_02GMatrix.multiply(translations_Link03);
var tentacle_04Link_02 = new THREE.Mesh(tentacle_03Link_01G,normalMaterial);
tentacle_04Link_02.setMatrix(tentacle_03Link_02GMatrix);
scene.add(tentacle_04Link_02);

var tentacle_03Link_03GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere03_03Pos);
tentacle_03Link_03GMatrix.multiply(rotationsX_Link03);
tentacle_03Link_03GMatrix.multiply(rotationsZ_Link03);
tentacle_03Link_03GMatrix.multiply(translations_Link03);
var tentacle_03Link_03 = new THREE.Mesh(tentacle_03Link_01G,normalMaterial);
tentacle_03Link_03.setMatrix(tentacle_03Link_03GMatrix);
scene.add(tentacle_03Link_03);

var tentacle_03Link_04GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere04_03Pos);
tentacle_03Link_04GMatrix.multiply(rotationsX_Link03);
tentacle_03Link_04GMatrix.multiply(rotationsZ_Link03);
tentacle_03Link_04GMatrix.multiply(translations_Link03);
var tentacle_03Link_04 = new THREE.Mesh(tentacle_03Link_01G,normalMaterial);
tentacle_03Link_04.setMatrix(tentacle_03Link_04GMatrix);
scene.add(tentacle_03Link_04);

/////////////////////////////////////
/////////////////////////////////////

function updateEyes(){
  var octopusEye_RMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, eyeTSMatrix_R);
  eye_R.setMatrix(octopusEye_RMatrix);
  var eyePupilMatrix_R = new THREE.Matrix4().multiplyMatrices(octopusEye_RMatrix, pupilTSRMatrix_R);
  pupil_R.setMatrix(eyePupilMatrix_R);
  var octopusEye_LMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, eyeTSMatrix_L);
  eye_L.setMatrix(octopusEye_LMatrix);
  var eyePupilMatrix_L = new THREE.Matrix4().multiplyMatrices(octopusEye_LMatrix, pupilTSRMatrix_L);
  pupil_L.setMatrix(eyePupilMatrix_L);
}

function updateTentaclesJoints(t){

  var rotationsX_Link01 = new THREE.Matrix4().set(
  1.0, 0.0, 0.0, 0.0,
  0.0, Math.cos((Math.PI * rotX_Link01)/180), -Math.sin((Math.PI * rotX_Link01)/180), 0.0,
  0.0, Math.sin((Math.PI * rotX_Link01)/180),  Math.cos((Math.PI * rotX_Link01)/180), 0.0,
  0.0, 0.0, 0.0, 1.0
  );

  var rotationsX_Link02 = new THREE.Matrix4().set(
  1.0, 0.0, 0.0, 0.0,
  0.0, Math.cos((Math.PI * rotX_Link02)/180), -Math.sin((Math.PI * rotX_Link02)/180), 0.0,
  0.0, Math.sin((Math.PI * rotX_Link02)/180),  Math.cos((Math.PI * rotX_Link02)/180), 0.0,
  0.0, 0.0, 0.0, 1.0
  );

  var rotationsX_Link03 = new THREE.Matrix4().set(
  1.0, 0.0, 0.0, 0.0,
  0.0, Math.cos((Math.PI * rotX_Link03)/180), -Math.sin((Math.PI * rotX_Link03)/180), 0.0,
  0.0, Math.sin((Math.PI * rotX_Link03)/180),  Math.cos((Math.PI * rotX_Link03)/180), 0.0,
  0.0, 0.0, 0.0, 1.0
  );

  var rotationsZ_Link01 = new THREE.Matrix4().set(
  Math.cos((Math.PI * rotZ_Link01)/180), -Math.sin((Math.PI * rotZ_Link01)/180), 0.0, 0.0,
  Math.sin((Math.PI * rotZ_Link01)/180), Math.cos((Math.PI * rotZ_Link01)/180), 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0
  );

  var rotationsZ_Link02 = new THREE.Matrix4().set(
  Math.cos((Math.PI * rotZ_Link02)/180), -Math.sin((Math.PI * rotZ_Link02)/180), 0.0, 0.0,
  Math.sin((Math.PI * rotZ_Link02)/180), Math.cos((Math.PI * rotZ_Link02)/180), 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0
  );

  var rotationsZ_Link03 = new THREE.Matrix4().set(
  Math.cos((Math.PI * rotZ_Link03)/180), -Math.sin((Math.PI * rotZ_Link03)/180), 0.0, 0.0,
  Math.sin((Math.PI * rotZ_Link03)/180), Math.cos((Math.PI * rotZ_Link03)/180), 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0
  );

  var octopusSocketMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix);
  octopusSocketMatrix.multiply(rotationsY_Link01);
  tentacleSocket.setMatrix(octopusSocketMatrix);

  var octopusSocketMatrix02 = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix02);
  octopusSocketMatrix02.multiply(rotationsY_Link02);
  tentacleSocket02.setMatrix(octopusSocketMatrix02);

  var octopusSocketMatrix03 = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix03);
  octopusSocketMatrix03.multiply(rotationsY_Link03);
  tentacleSocket03.setMatrix(octopusSocketMatrix03);

  var octopusSocketMatrix04 = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocketMatrix04);
  octopusSocketMatrix04.multiply(rotationsY_Link04);
  tentacleSocket04.setMatrix(octopusSocketMatrix04);

  ///// First set of joints
  var sphere01_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix, spheres);
  sphere01_01M.setMatrix(sphere01_01Pos);
  var sphere02_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix02, spheres);
  sphere02_01M.setMatrix(sphere02_01Pos);
  var sphere03_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix03, spheres);
  sphere03_01M.setMatrix(sphere03_01Pos);
  var sphere04_01Pos = new THREE.Matrix4().multiplyMatrices(octopusSocketMatrix04, spheres);
  sphere04_01M.setMatrix(sphere04_01Pos);

  ///// First set of tentacles
    var tentacle01_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix);
    tentacle01_Link01Matrix.multiply(rotationsX_Link01);
    tentacle01_Link01Matrix.multiply(rotationsZ_Link01);
    tentacle01_Link01Matrix.multiply(translations_Link01);
    tentacle_01Link_01.setMatrix(tentacle01_Link01Matrix);

    var tentacle02_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix02);
    tentacle02_Link01Matrix.multiply(rotationsX_Link01);
    tentacle02_Link01Matrix.multiply(rotationsZ_Link01);
    tentacle02_Link01Matrix.multiply(translations_Link01);
    tentacle_02Link_01.setMatrix(tentacle02_Link01Matrix);

    var tentacle03_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix03);
    tentacle03_Link01Matrix.multiply(rotationsX_Link01);
    tentacle03_Link01Matrix.multiply(rotationsZ_Link01);
    tentacle03_Link01Matrix.multiply(translations_Link01);
    tentacle_03Link_01.setMatrix(tentacle03_Link01Matrix);

    var tentacle04_Link01Matrix = new THREE.Matrix4().multiplyMatrices(tentacle01, octopusSocketMatrix04);
    tentacle04_Link01Matrix.multiply(rotationsX_Link01);
    tentacle04_Link01Matrix.multiply(rotationsZ_Link01);
    tentacle04_Link01Matrix.multiply(translations_Link01);
    tentacle_04Link_01.setMatrix(tentacle04_Link01Matrix);

    ////// Second set of joints
    var sphere01_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle01_Link01Matrix);
    sphere01_02Pos.multiply(translations_Sphere01_02);
    sphere01_02M.setMatrix(sphere01_02Pos);

    var sphere02_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle02_Link01Matrix);
    sphere02_02Pos.multiply(translations_Sphere01_02);
    sphere02_02M.setMatrix(sphere02_02Pos);

    var sphere03_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle03_Link01Matrix);
    sphere03_02Pos.multiply(translations_Sphere01_02);
    sphere03_02M.setMatrix(sphere03_02Pos);

    var sphere04_02Pos =  new THREE.Matrix4().multiplyMatrices(spheres, tentacle04_Link01Matrix);
    sphere04_02Pos.multiply(translations_Sphere01_02);
    sphere04_02M.setMatrix(sphere04_02Pos);

    ////// Second set of tentacles
    var tentacle_02Link_01GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere01_02Pos);
    tentacle_02Link_01GMatrix.multiply(rotationsX_Link02);
    tentacle_02Link_01GMatrix.multiply(rotationsZ_Link02);
    tentacle_02Link_01GMatrix.multiply(translations_Link02);
    tentacle_01Link_02.setMatrix(tentacle_02Link_01GMatrix);


    var tentacle_02Link_02GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere02_02Pos);
    tentacle_02Link_02GMatrix.multiply(rotationsX_Link02);
    tentacle_02Link_02GMatrix.multiply(rotationsZ_Link02);
    tentacle_02Link_02GMatrix.multiply(translations_Link02);
    tentacle_02Link_02.setMatrix(tentacle_02Link_02GMatrix);

    var tentacle_02Link_03GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere03_02Pos);
    tentacle_02Link_03GMatrix.multiply(rotationsX_Link02);
    tentacle_02Link_03GMatrix.multiply(rotationsZ_Link02);
    tentacle_02Link_03GMatrix.multiply(translations_Link02);
    tentacle_03Link_02.setMatrix(tentacle_02Link_03GMatrix);

    var tentacle_02Link_04GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere04_02Pos);
    tentacle_02Link_04GMatrix.multiply(rotationsX_Link02);
    tentacle_02Link_04GMatrix.multiply(rotationsZ_Link02);
    tentacle_02Link_04GMatrix.multiply(translations_Link02);
    tentacle_02Link_04.setMatrix(tentacle_02Link_04GMatrix);

    /////// Third set of joints
    var sphere01_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_01GMatrix);
    sphere01_03Pos.multiply(translations_Sphere01_03);
    sphere01_03M.setMatrix(sphere01_03Pos);

    var sphere02_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_02GMatrix);
    sphere02_03Pos.multiply(translations_Sphere01_03);
    sphere02_03M.setMatrix(sphere02_03Pos);

    var sphere03_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_03GMatrix);
    sphere03_03Pos.multiply(translations_Sphere01_03);
    sphere03_03M.setMatrix(sphere03_03Pos);

    var sphere04_03Pos = new THREE.Matrix4().multiplyMatrices(spheres, tentacle_02Link_04GMatrix);
    sphere04_03Pos.multiply(translations_Sphere01_03);
    sphere04_03M.setMatrix(sphere04_03Pos);



    //// Last set of tentacles
    var tentacle_03Link_01GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere01_03Pos);
    tentacle_03Link_01GMatrix.multiply(rotationsX_Link03);
    tentacle_03Link_01GMatrix.multiply(rotationsZ_Link03);
    tentacle_03Link_01GMatrix.multiply(translations_Link03);
    tentacle_03Link_05.setMatrix(tentacle_03Link_01GMatrix);

    var tentacle_03Link_02GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere02_03Pos);
    tentacle_03Link_02GMatrix.multiply(rotationsX_Link03);
    tentacle_03Link_02GMatrix.multiply(rotationsZ_Link03);
    tentacle_03Link_02GMatrix.multiply(translations_Link03);
    tentacle_04Link_02.setMatrix(tentacle_03Link_02GMatrix);

    var tentacle_03Link_03GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere03_03Pos);
    tentacle_03Link_03GMatrix.multiply(rotationsX_Link03);
    tentacle_03Link_03GMatrix.multiply(rotationsZ_Link03);
    tentacle_03Link_03GMatrix.multiply(translations_Link03);
    tentacle_03Link_03.setMatrix(tentacle_03Link_03GMatrix);

    var tentacle_03Link_04GMatrix = new THREE.Matrix4().multiplyMatrices(spheres, sphere04_03Pos);
    tentacle_03Link_04GMatrix.multiply(rotationsX_Link03);
    tentacle_03Link_04GMatrix.multiply(rotationsZ_Link03);
    tentacle_03Link_04GMatrix.multiply(translations_Link03);
    tentacle_03Link_04.setMatrix(tentacle_03Link_04GMatrix);

}

//APPLY DIFFERENT EFFECTS TO DIFFERNET CHANNELS

var clock = new THREE.Clock(true);
function updateBody() {

  switch(channel)
  {
    //add poses here:
    case 0:  
        rotX_Link01 = 90;
        rotX_Link02 = 180;
        rotX_Link03 = 0;
        rotZ_Link01 = 0;
        rotZ_Link02 = 0;
        rotZ_Link03 = 0;
        octopusMatrix.value.set(
              1.0,0.0,0.0,0.0, 
              0.0,1.0,0.0,3, 
              0.0,0.0,1.0,0.0, 
              0.0,0.0,0.0,1.0
        );
              updateEyes();
              updateTentaclesJoints();
      break;

    case 1:
    rotX_Link01 = 60;
    rotX_Link02 = 200;
    rotX_Link03 = 15;
    rotZ_Link01 = 0;
    rotZ_Link02 = 0;
    rotZ_Link03 = 0;
    octopusMatrix.value.set(
          1.0,0.0,0.0,0.0, 
          0.0,1.0,0.0,3, 
          0.0,0.0,1.0,0.0, 
          0.0,0.0,0.0,1.0
    );
          updateEyes();
          updateTentaclesJoints();
          
      break;

    case 2:
        rotX_Link01 = 60;
        rotX_Link02 = 210;
        rotX_Link03 = 30;
        rotZ_Link01 = -45;
        rotZ_Link02 = 45;
        rotZ_Link03 = 45;
        octopusMatrix.value.set(
              1.0,0.0,0.0,0.0, 
              0.0,1.0,0.0,3, 
              0.0,0.0,1.0,0.0, 
              0.0,0.0,0.0,1.0
        );
              updateEyes();
              updateTentaclesJoints();
      break;

    //animation
    case 3:
      {
        //animate octopus here:
        var t = clock.getElapsedTime();
        octopusMatrix.value.set(
          1.0,0.0,0.0,0.0, 
          0.0,1.0,0.0,13 -(rotX_Link01)/10, 
          0.0,0.0,1.0,0.0, 
          0.0,0.0,0.0,1.0
          );
        
        rotX_Link01 = ((1/2)*(1-Math.cos(1.5*t+2*(Math.PI/3))) + (2/2)*(1+Math.cos(1.5*t+2*(Math.PI/3))))*180/Math.PI;
        rotX_Link02 = 90+ ((1/2)*(1-Math.cos(1.5*t+2*(Math.PI/3))) + (2.5/2)*(1+Math.cos(1.5*t+2*(Math.PI/3))))*180/Math.PI;
        rotX_Link03 = 250+ ((1/2)*(1-Math.cos(1.5*t+2*(Math.PI/3))) + (3/2)*(1+Math.cos(1.5*t+2*(Math.PI/3))))*180/Math.PI;
        updateEyes();
        updateTentaclesJoints(t);
        
      }
      break;

    case 4:
      break;

    default:
      break;
  }
}


// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
var channel = 0;
function checkKeyboard() {
  for (var i=0; i<6; i++)
  {
    if (keyboard.pressed(i.toString()))
    {
      channel = i;
      break;
    }
  }
}


// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  updateBody();
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();