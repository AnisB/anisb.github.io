
var lastx = 0,lasty =0;
var initDone = false;

function computeNormal(p1, p2, p3)
{
    var v1 = vec3.create();
    vec3.subtract(p1, p2, v1);
    var v2 =vec3.create();
    vec3.subtract(p1, p3,v2);
    var norm = vec3.create();
    vec3.cross(v1, v2,norm);
    vec3.normalize(norm);
    return norm;
}
function handleKeyDown(event) 
{
    currentlyPressedKeys[event.keyCode] = true;
    if (String.fromCharCode(event.keyCode) == "Z") 
    {
        mat4.translate(camera.viewMatrix, [0,0,5]),camera.viewMatrix;
    }
    else if (String.fromCharCode(event.keyCode) == "S") 
    {
        mat4.translate(camera.viewMatrix, [0,0,-5],camera.viewMatrix);
    }
    else if (String.fromCharCode(event.keyCode) == "Q") 
    {
        mat4.translate(camera.viewMatrix, [5,0,0]),camera.viewMatrix;
    }
    else if (String.fromCharCode(event.keyCode) == "D") 
    {
        mat4.translate(camera.viewMatrix, [-5,0,0],camera.viewMatrix);
    }
    camera.isOutDated =  true;
}

function handleKeyUp(event) 
{
    currentlyPressedKeys[event.keyCode] = false;
}

function handleMouseMove(event) 
{

}

// Initialisation du contexte GL
function initGL(parCanvas) 
{
    try 
    {
        // Contexte webgl
        gl = parCanvas.getContext("webgl");
        gl.viewportWidth = parCanvas.width;
        gl.viewportHeight = parCanvas.height;
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        document.onmousemove = handleMouseMove;
    } 
    catch (e) 
    {
        alert(e.message);
    }
    if (!gl) 
    {
        alert("Error lors de l'initialisation du contexte webgl.");
    }
}

// Fonction shader
// Vérification shader
function checkShader(parShader)
{
    if (!gl.getShaderParameter(parShader, gl.COMPILE_STATUS)) 
    {
        alert(gl.getShaderInfoLog(parShader));
    }
}
// Verification du programme
function checkProgram(parProgram)
{
    if (!gl.getProgramParameter(parProgram, gl.LINK_STATUS)) 
    {
        alert("Could not initialise shaders");
    }
}
// Compilation shader
function compileShader(gl, id, parShaderType) 
{
    // Récupération du shader dans la page html
    var shaderScript = document.getElementById(id);
    // ON vérifie qu'il a été trouvé
    if (!shaderScript) 
    {
        alert("Shader "+id+" non trouvé!");
        return null;
    }
    var str = "";
    var k = shaderScript.firstChild;
    while (k) 
    {
        if (k.nodeType == 3) 
        {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    //On crée le shader
    var shader = gl.createShader(parShaderType);
    // ON charge
    gl.shaderSource(shader, str);
    // On compile
    gl.compileShader(shader);
    // On vérifie
    checkShader(shader);
    return shader;
}   


// Inits
function generateProgram(parVertex, parFragment) 
{
    // Compilation fragment shader
    var fragmentShader = compileShader(gl, parVertex, gl.VERTEX_SHADER);
    // Compilation du vertex shader
    var vertexShader = compileShader(gl, parFragment, gl.FRAGMENT_SHADER);
    // On crée le programme
    var shaderProg = gl.createProgram();
    // On attache le vertex shader
    gl.attachShader(shaderProg, vertexShader);
    // On attache le fragment shader
    gl.attachShader(shaderProg, fragmentShader);
    // On link le programme
    gl.linkProgram(shaderProg);
    // On vérifie le programme
    checkProgram(shaderProg);
    //On utilise le programme
    // gl.useProgram(shaderProg);
    // retourn les données
    return shaderProg;
}

function bindProgram(parShader)
{
    gl.useProgram(parShader);
}

function unbindProgram()
{
    gl.useProgram(null);
}


function createBuffers(parObj, parVertexList, parTexCoordList, parIndexList)
{
   // Création du buffer de position
    var vertexPositionBuffer = gl.createBuffer();
    // On bind le buffer de position
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    //On copie les données sur ke GPU
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parVertexList), gl.STATIC_DRAW);
    // 3 données par position
    vertexPositionBuffer.itemSize = 3;
    // Nombre de points
    vertexPositionBuffer.numItems = parVertexList.length / 3;
    // Copie dans la structure l'objet
    parObj.vertexPositionBuffer = vertexPositionBuffer;

    // Création du de coordonnées texture
    var vertexTextureCoordBuffer = gl.createBuffer();
    // On bind le VBO uv mapping
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
    // On copie les données de texcoord sur le GPU
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parTexCoordList), gl.STATIC_DRAW);
    // 2 données par tex coord
    vertexTextureCoordBuffer.itemSize = 2;
    // Nombre de tex coord
    vertexTextureCoordBuffer.numItems = parTexCoordList.length / 2;
    // On le copie dans la strcture de l'objet
    parObj.vertexTextureCoordBuffer = vertexTextureCoordBuffer;
    
    // Création de l'IBO
    var vertexIndexBuffer = gl.createBuffer();
    // ON bind ke buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    // ON copie les données sur le GPU
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(parIndexList), gl.STREAM_DRAW);
    // 3 Données par triangle
    vertexIndexBuffer.itemSize = 3;
    // Nombre d'indexes
    vertexIndexBuffer.numItems = parIndexList.length;
    // On copie dans la structure l'objet
    parObj.vertexIndexBuffer = vertexIndexBuffer;
}


function injectModelMatrix(parProgam, parModel)
{
    gl.uniformMatrix4fv(parProgam.modelMatrix , false, parModel);
}

function injectProjectionMatrix(parProgam, parProjection)
{
    gl.uniformMatrix4fv(parProgam.projMatrix , false, parProjection);
}

function injectView(parProgam, parView)
{
    gl.uniformMatrix4fv(parProgam.viewMatrix , false, parView);
}

function injectNormalMatrix(parProgam, parNormalMatrix)
{
    gl.uniformMatrix4fv(parProgam.normalMatrix , false, parNormalMatrix);
}

function injectMatrix(parProgam, parMatrixName, parMatrix)
{
    // Recuperation de l'id
    var matrixID =  gl.getUniformLocation(parProgam, parMatrixName);
    // Injection de la matrix
    gl.uniformMatrix4fv(matrixID, false, parMatrix);
}

function injectVec3(parProgam, parVec3Name, parVec3)
{
    // Recuperation de l'id
    var vecID =  gl.getUniformLocation(parProgam, parVec3Name);
    // Injection du vec3
    gl.uniform3fv(vecID, false, parVec3);
}

function injectVec3(parProgam, parVec4Name, parVec4)
{
    // Recuperation de l'id
    var vecID =  gl.getUniformLocation(parProgam, parVec4Name);
    // Injection du vec4
    gl.uniform3fv(vecID, false, parVec4);
}

function CreateTexture(parWidth, parHeight) 
{
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, parWidth, parHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return texture;
  }

function CreateFrameBufferObject(parWidth, parHeight)
{
   
    var colorTex = CreateTexture(parWidth, parHeight);
   
    // // Create the depth texture
    var depthbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, parWidth, parHeight);
    
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    fbo.width = parWidth;
    fbo.height = parHeight;
    
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthbuffer);

    // fbo.depthTex = depthbuffer;
    fbo.depthTex = depthbuffer;
    fbo.colorTex = colorTex;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return fbo;
}

function bindFBO(fbo)
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
}

function unbindFBO()
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}
function readTextFile(parFilePath)
{
    var file = fopen(parFilePath, 0);
    if(file!=-1) 
    { 
        length = flength(file);
        str = fread(file, length);
        fclose(file);
        return str;
    }
    alert("Couldn't read file");
}   

