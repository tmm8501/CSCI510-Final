  'use strict';

  // Global variables that are set and used
  // across the application
  let gl;

  // GLSL programs
  let lightSaberProgram;
  let texturesProgram;

  // VAOs for the objects
  var mySphere = null;
  var myCone = null;
  var myCube = null;
  var myCylinder = null;
  var hexagon = null;
  var phongSphere = null;
  var myPyramid = null;

  // textures
  let tatooineTexture;
  let nabooTexture;
  let hothTexture;
  let deathstarTexture;
  let starsTexture;
 
  // camera movement
  var cameraX = 0;

  // current planet texture
  let curPlanet;

  // lightsaber colors
  var red = [.921,.129,.180];
  var blue = [.082,.949,.992];
  var green = [.184,.976,.141];
  var purple = [1,0,1];

  // current color
  let curColor = red;

  // is the laser on?
  let fire = false;

  // is the planet destroyed?
  let destroyed = false;

//
// create shapes and VAOs for objects.
// Note that you will need to bindVAO separately for each object / program based
// upon the vertex attributes found in each program
//
function createShapes() {

  mySphere = new Sphere(100,100);
  mySphere.VAO = bindVAO(mySphere, texturesProgram);

  myCone = new Cone(20,20);
  myCone.VAO = bindVAO(myCone, lightSaberProgram);

  myCube = new Cube(4);
  myCube.VAO = bindVAO(myCube, lightSaberProgram);

  myCylinder = new Cylinder(10,10);
  myCylinder.VAO = bindVAO(myCylinder, lightSaberProgram);

  hexagon = new Cylinder(6,10);
  hexagon.VAO = bindVAO(hexagon, lightSaberProgram);

  phongSphere = new Sphere(20,20);
  phongSphere.VAO = bindVAO(phongSphere, lightSaberProgram);

  myPyramid = new Cone(4, 20);
  myPyramid.VAO = bindVAO(myPyramid, lightSaberProgram);
}


//
// Here you set up your camera position, orientation, and projection
// Remember that your projection and view matrices are sent to the vertex shader
// as uniforms, using whatever name you supply in the shaders
//
function setUpCamera() {
    var program = lightSaberProgram;

    gl.useProgram (program);
    
    // set up your projection
    let projMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projMatrix, 45, 1, 1, 300);
    gl.uniformMatrix4fv(program.uProjT, false, projMatrix);
    
    // set up your view
    let viewMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(viewMatrix, [-5*Math.sin(cameraX), 0, -5*Math.cos(cameraX)], [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv (program.uViewT, false, viewMatrix);

    program = texturesProgram;
    gl.useProgram(program);

    gl.uniformMatrix4fv(program.uProjT, false, projMatrix);
    gl.uniformMatrix4fv (program.uViewT, false, viewMatrix);
}


//
// load up the textures you will use in the shader(s)
//
function setUpTextures(){
    
    // flip Y for WebGL
    gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
    
    // get some texture space from the gpu
    tatooineTexture = gl.createTexture();
    nabooTexture = gl.createTexture();
    hothTexture = gl.createTexture();
    deathstarTexture = gl.createTexture();
    starsTexture = gl.createTexture();
    
    // load the actual image
    var tatooineImage = document.getElementById ('tatooine-texture');
    var nabooImage = document.getElementById ('naboo-texture');
    var hothImage = document.getElementById ('hoth-texture');
    var deathstarImage = document.getElementById ('deathstar-texture');
    var starsImage = document.getElementById('stars-texture');
        
    // setup stars texture
    gl.bindTexture (gl.TEXTURE_2D, starsTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, starsImage.width, starsImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, starsImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // setup deathstar texture
    gl.bindTexture (gl.TEXTURE_2D, deathstarTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, deathstarImage.width, deathstarImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, deathstarImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // setup tatooine texture
    gl.bindTexture (gl.TEXTURE_2D, tatooineTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tatooineImage.width, tatooineImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tatooineImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // setup naboo texture
    gl.bindTexture (gl.TEXTURE_2D, nabooTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nabooImage.width, nabooImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, nabooImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // setup hoth texture
    gl.bindTexture (gl.TEXTURE_2D, hothTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, hothImage.width, hothImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, hothImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // set default planet texture
    curPlanet = tatooineTexture;
}

//
//  This function draws all of the shapes required for your scene
//
    function drawShapes() {
        var program = lightSaberProgram;
        gl.useProgram (program);

        // set uniforms
        gl.uniform3fv(program.ambientLight, [0, 0, 0]);
        gl.uniform3fv(program.lightPosition, [3, 2, -3]);
        gl.uniform3fv(program.lightColor, [1, 1, 1]);
        gl.uniform3fv(program.baseColor, [.9, .91, .98]);
        gl.uniform3fv(program.specHighlightColor, curColor);
        gl.uniform1f(program.ka, 1);
        gl.uniform1f(program.kd, 1);
        gl.uniform1f(program.ks, 1.0);
        gl.uniform1f(program.ke, 1);

        // light saber base
        let base = glMatrix.mat4.create();
        glMatrix.mat4.translate(base, base, [0,-2,0]);
        glMatrix.mat4.scale(base, base, [.273,1,.273]);
        gl.uniformMatrix4fv(program.uModelT, false, base);
        gl.bindVertexArray(myCylinder.VAO);
        gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);

        // light saber bottom
        let bottom = glMatrix.mat4.create();
        glMatrix.mat4.translate(bottom, bottom, [0,-2.35,0]);
        glMatrix.mat4.scale(bottom, bottom, [.3549,.181,.3549]);
        gl.uniformMatrix4fv(program.uModelT, false, bottom);
        gl.bindVertexArray(myCylinder.VAO);
        gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);

        // light saber rings
        for (var i = 0; i < 6; i++) {
          let ring = glMatrix.mat4.create();
          glMatrix.mat4.translate(ring, ring, [0,-1.45+(i*.08),0]);
          glMatrix.mat4.scale(ring, ring, [.2548,.02182,.2548]);
          gl.uniformMatrix4fv(program.uModelT, false, ring);
          gl.bindVertexArray(myCylinder.VAO);
          gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);

        }

        // light saber neck
        let neck = glMatrix.mat4.create();
        glMatrix.mat4.translate(neck, neck, [0,-.93,0]);
        glMatrix.mat4.scale(neck, neck, [.1911,.0909,.1911]);
        gl.uniformMatrix4fv(program.uModelT, false, neck);
        gl.bindVertexArray(myCylinder.VAO);
        gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);

        // light saber top
        let top = glMatrix.mat4.create();
        glMatrix.mat4.rotateX(top, top, radians(180))
        glMatrix.mat4.translate(top, top, [0,.9,0]);
        glMatrix.mat4.scale(top, top, [.273,.2,.273]);
        gl.uniformMatrix4fv(program.uModelT, false, top);
        gl.bindVertexArray(myCone.VAO);
        gl.drawElements(gl.TRIANGLES, myCone.indices.length, gl.UNSIGNED_SHORT, 0);

        // light saber button
        let button = glMatrix.mat4.create();
        glMatrix.mat4.translate(button, button, [-.15,-1.65,0]);
        glMatrix.mat4.scale(button, button, [.1,.2,.1]);
        gl.uniformMatrix4fv(program.uModelT, false, button);
        gl.bindVertexArray(myCube.VAO);
        gl.drawElements(gl.TRIANGLES, myCube.indices.length, gl.UNSIGNED_SHORT, 0);

        // tie fighter settings
        var tieRotation = 300;
        var tieLocation = [40,13,8];

        for(var i = 0; i < 3; i++) {
          if(i == 1) tieLocation = [50,13,8];
          if(i == 2) tieLocation = [50,13,12];
          // tie fighter wings
          let wing = glMatrix.mat4.create();
          glMatrix.mat4.rotateY(wing, wing, radians(tieRotation));
          glMatrix.mat4.translate(wing, wing, tieLocation);
          glMatrix.mat4.scale(wing, wing, [1,1.5,.05]);
          glMatrix.mat4.rotateX(wing, wing, radians(90));
          gl.uniformMatrix4fv(program.uModelT, false, wing);
          gl.bindVertexArray(hexagon.VAO);
          gl.drawElements(gl.TRIANGLES, hexagon.indices.length, gl.UNSIGNED_SHORT, 0);

          let wing2 = glMatrix.mat4.create();
          glMatrix.mat4.rotateY(wing2, wing2, radians(tieRotation))
          glMatrix.mat4.translate(wing2, wing2, ([0,0,1].map((a, i) => a + tieLocation[i])));
          glMatrix.mat4.scale(wing2, wing2, [1,1.5,.05]);
          glMatrix.mat4.rotateX(wing2, wing2, radians(90))
          gl.uniformMatrix4fv(program.uModelT, false, wing2);
          gl.bindVertexArray(hexagon.VAO);
          gl.drawElements(gl.TRIANGLES, hexagon.indices.length, gl.UNSIGNED_SHORT, 0);

          // tie fighter pod
          let pod = glMatrix.mat4.create();
          glMatrix.mat4.rotateY(pod, pod, radians(tieRotation))
          glMatrix.mat4.translate(pod, pod, ([0,0,.5].map((a, i) => a + tieLocation[i])));
          glMatrix.mat4.scale(pod, pod, [.5,.5,.5]);
          gl.uniformMatrix4fv(program.uModelT, false, pod);
          gl.bindVertexArray(phongSphere.VAO);
          gl.drawElements(gl.TRIANGLES, phongSphere.indices.length, gl.UNSIGNED_SHORT, 0);

          // tie fighter body
          let body = glMatrix.mat4.create();
          glMatrix.mat4.rotateY(body, body, radians(tieRotation))
          glMatrix.mat4.translate(body, body, ([0,0,.5].map((a, i) => a + tieLocation[i])));
          glMatrix.mat4.rotateX(body, body, radians(90))
          glMatrix.mat4.scale(body, body, [.25,1,.25]);
          gl.uniformMatrix4fv(program.uModelT, false, body);
          gl.bindVertexArray(myCylinder.VAO);
          gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        // star destroyer
        var destroyerColor = [.3,.3,.3];
        gl.uniform3fv(program.lightColor, destroyerColor);
        gl.uniform3fv(program.specHighlightColor, destroyerColor);
        gl.uniform3fv(program.ambientLight, destroyerColor);

        let destroyer = glMatrix.mat4.create();
        glMatrix.mat4.translate(destroyer, destroyer, [-4,-1,6]);
        glMatrix.mat4.rotateY(destroyer, destroyer, radians(130))
        glMatrix.mat4.rotateX(destroyer, destroyer, radians(90))
        glMatrix.mat4.scale(destroyer, destroyer, [1,1.5,.25]);
        gl.uniformMatrix4fv(program.uModelT, false, destroyer);
        gl.bindVertexArray(myPyramid.VAO);
        gl.drawElements(gl.TRIANGLES, myPyramid.indices.length, gl.UNSIGNED_SHORT, 0);

        // change color for black pieces
        gl.uniform3fv(program.baseColor, [0.3, 0.3, 0.3]);

        // light saber grip
        let grip = glMatrix.mat4.create();
        glMatrix.mat4.translate(grip, grip, [0,-2,0]);
        glMatrix.mat4.scale(grip, grip, [.2735,.273,.2735]);
        gl.uniformMatrix4fv(program.uModelT, false, grip);
        gl.bindVertexArray(myCylinder.VAO);
        gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);

        // light saber middle
        let middle = glMatrix.mat4.create();
        glMatrix.mat4.translate(middle, middle, [0,-1.25,0]);
        glMatrix.mat4.scale(middle, middle, [.2366,.5455,.2366]);
        gl.uniformMatrix4fv(program.uModelT, false, middle);
        gl.bindVertexArray(myCylinder.VAO);
        gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);        

        // light saber blade
        gl.uniform3fv(program.ambientLight, curColor);
        gl.uniform3fv(program.baseColor, curColor);
        gl.uniform3fv(program.lightColor, curColor);
        gl.uniform3fv(program.lightPosition, [0, 0, 0]);

        let blade = glMatrix.mat4.create();
        glMatrix.mat4.translate(blade, blade, [0,.85,0]);
        glMatrix.mat4.scale(blade, blade, [.164,3.3,.164]);
        gl.uniformMatrix4fv(program.uModelT, false, blade);
        gl.bindVertexArray(myCylinder.VAO);
        gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);

        // deathstar laser
        if (fire) {
          gl.uniform3fv(program.ambientLight, green);
          gl.uniform3fv(program.baseColor, green);
          gl.uniform3fv(program.lightColor, green);
          let laser = glMatrix.mat4.create();
          glMatrix.mat4.translate(laser, laser, [0,-1,16]);
          glMatrix.mat4.rotateY(laser, laser, radians(-57));
          glMatrix.mat4.rotateZ(laser, laser, radians(70));
          glMatrix.mat4.scale(laser, laser, [.164,18.5,.164]);
          gl.uniformMatrix4fv(program.uModelT, false, laser);
          gl.bindVertexArray(myCylinder.VAO);
          gl.drawElements(gl.TRIANGLES, myCylinder.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        // textured shapes
        program = texturesProgram;
        gl.useProgram(program);

        // stars background
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture (gl.TEXTURE_2D, starsTexture);
        gl.uniform1i(program.uTheTexture, 0);
        let stars = glMatrix.mat4.create();
        glMatrix.mat4.rotateY(stars, stars, radians(180));
        glMatrix.mat4.scale(stars, stars, [250,250,250]);
        gl.uniformMatrix4fv(program.uModelT, false, stars);
        gl.bindVertexArray(mySphere.VAO);
        gl.drawElements(gl.TRIANGLES, mySphere.indices.length, gl.UNSIGNED_SHORT, 0);

        // deathstar
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture (gl.TEXTURE_2D, deathstarTexture);
        gl.uniform1i(program.uTheTexture, 0);
        let deathstar = glMatrix.mat4.create();
        glMatrix.mat4.rotateY(deathstar, deathstar, radians(45));
        glMatrix.mat4.scale(deathstar, deathstar, [1,1,1]);
        glMatrix.mat4.translate(deathstar, deathstar, [-10,2,3]);
        gl.uniformMatrix4fv(program.uModelT, false, deathstar);
        gl.bindVertexArray(mySphere.VAO);
        gl.drawElements(gl.TRIANGLES, mySphere.indices.length, gl.UNSIGNED_SHORT, 0);

        // planet
        if (!destroyed) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture (gl.TEXTURE_2D, curPlanet);
          gl.uniform1i(program.uTheTexture, 0);
          let planet = glMatrix.mat4.create();
          glMatrix.mat4.scale(planet, planet, [50,50,50]);
          glMatrix.mat4.translate(planet, planet, [.3,-.5,.5]);
          gl.uniformMatrix4fv(program.uModelT, false, planet);
          gl.bindVertexArray(mySphere.VAO);
          gl.drawElements(gl.TRIANGLES, mySphere.indices.length, gl.UNSIGNED_SHORT, 0);
        }
    }


  //
  // Use this function to create all the programs that you need
  // You can make use of the auxillary function initProgram
  // which takes the name of a vertex shader and fragment shader
  //
  // Note that after successfully obtaining a program using the initProgram
  // function, you will need to assign locations of attribute and unifirm variable
  // based on the in variables to the shaders.   This will vary from program
  // to program.
  //
  function initPrograms() {

      // create the program
      lightSaberProgram = initProgram("wireframe-V", "wireframe-F");
      texturesProgram = initProgram("sphereMap-V", "sphereMap-F");

      // lightsaber program
      var program = lightSaberProgram;
      gl.useProgram(program);

      program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
      program.aNormal = gl.getAttribLocation(program, 'aNormal');
        
      // uniforms
      program.uModelT = gl.getUniformLocation (program, 'modelT');
      program.uViewT = gl.getUniformLocation (program, 'viewT');
      program.uProjT = gl.getUniformLocation (program, 'projT');
      program.ambientLight = gl.getUniformLocation (program, 'ambientLight');
      program.lightPosition = gl.getUniformLocation (program, 'lightPosition');
      program.lightColor = gl.getUniformLocation (program, 'lightColor');
      program.baseColor = gl.getUniformLocation (program, 'baseColor');
      program.specHighlightColor = gl.getUniformLocation (program, 'specHighlightColor');
      program.ka = gl.getUniformLocation (program, 'ka');
      program.kd = gl.getUniformLocation (program, 'kd');
      program.ks = gl.getUniformLocation (program, 'ks');
      program.ke = gl.getUniformLocation (program, 'ke');

      // textures program
      program = texturesProgram;
      gl.useProgram(program);

      // uniforms
      program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
      program.aUV = gl.getAttribLocation(program, 'aUV');
      program.uTheTexture = gl.getUniformLocation (program, 'theTexture');
      program.uModelT = gl.getUniformLocation (program, 'modelT');
      program.uViewT = gl.getUniformLocation (program, 'viewT');
      program.uProjT = gl.getUniformLocation (program, 'projT');

      setUpTextures();
      setUpCamera();
  }


  // creates a VAO and returns its ID
  function bindVAO (shape, program) {
      //create and bind VAO
      let theVAO = gl.createVertexArray();
      gl.bindVertexArray(theVAO);
      
      // create and bind vertex buffer
      let myVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.points), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      
      if (program == lightSaberProgram) {
        // add code for any additional vertex attribute
        let myNormalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, myNormalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.aNormal);
        gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);
      } else {
        // create and bind uv buffer
        let uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.uv), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.aUV);
        gl.vertexAttribPointer(program.aUV, 2, gl.FLOAT, false, 0, 0);
      }
        
      // Setting up the IBO
      let myIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

      // Clean
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      
      return theVAO;
  }


/////////////////////////////////////////////////////////////////////////////
//
//  You shouldn't have to edit anything below this line...but you can
//  if you find the need
//
/////////////////////////////////////////////////////////////////////////////

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(id) {
  const script = document.getElementById(id);
  const shaderString = script.text.trim();

  // Assign shader depending on the type of shader
  let shader;
  if (script.type === 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else if (script.type === 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else {
    return null;
  }

  // Compile the shader using the supplied shader code
  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  // Ensure the shader is valid
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


  //
  // compiles, loads, links and returns a program (vertex/fragment shader pair)
  //
  // takes in the id of the vertex and fragment shaders (as given in the HTML file)
  // and returns a program object.
  //
  // will return null if something went wrong
  //
  function initProgram(vertex_id, fragment_id) {
    const vertexShader = getShader(vertex_id);
    const fragmentShader = getShader(fragment_id);

    // Create a program
    let program = gl.createProgram();
      
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Could not initialize shaders');
      return null;
    }
      
    return program;
  }


  //
  // We call draw to render to our canvas
  //
  function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      
    // draw your shapes
    drawShapes();

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  // Entry point to our application
  function init() {
      
    // Retrieve the canvas
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
      console.error(`There is no canvas with id ${'webgl-canvas'} on this page.`);
      return null;
    }

    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);

    // Retrieve a WebGL context
    gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error(`There is no WebGL 2.0 context`);
        return null;
      }
      
    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);
      
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);
      
    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.depthFunc(gl.LEQUAL)
    gl.clearDepth(1.0)

    // Read, compile, and link your shaders
    initPrograms();
    
    // create and bind your current object
    createShapes();
    
    // do a draw
    draw();
  }