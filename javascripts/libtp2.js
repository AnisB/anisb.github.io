
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
    gl.useProgram(shaderProg);
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


function createBuffersVINT(parObj, parVertexList, parIndexList, parNormalList, parTexCoordList)
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

    var vertexNormalBuffer = gl.createBuffer();
    // On bind le VBO de normale
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    // On copie les données de normales sur le GPU
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parNormalList), gl.STATIC_DRAW);
    // 3 Données par normale
    vertexNormalBuffer.itemSize = 3;
    // Nombre de normales
    vertexNormalBuffer.numItems = parNormalList.length / 3;
    // On le copie dans la structure l'objet
    parObj.vertexNormalBuffer = vertexNormalBuffer;

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

function CreateTexture() 
{
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    return texture;
  }

function CreateFrameBufferObject(parWidth, parHeight)
{
   
    var colorTex = CreateTexture();
    gl.bindTexture(gl.TEXTURE_2D, colorTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, parWidth, parHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

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
function loadObj( objectData )
{
    /*
        With the given elementID or string of the OBJ, this parses the
        OBJ and creates the mesh.
    */
    var model =[];

    var verts = [];
    var vertNormals = [];
    var textures = [];
    
    // unpacking stuff
    var packed = {};
    packed.verts = [];
    packed.norms = [];
    packed.textures = [];
    packed.hashindices = {};
    packed.indices = [];
    packed.index = 0;
    // array of lines separated by the newline
    var lines = objectData.split( 'YUL' )

    for( var i=0; i<lines.length; i++ ){
      // if this is a vertex
      if( lines[ i ].startsWith( 'v ' ) )
      {
        line = lines[ i ].slice( 2 ).split( " " )
        verts.push( line[ 0 ] );
        verts.push( line[ 1 ] );
        verts.push( line[ 2 ] );
        // document.write(line[0],' ',line[1],' ',line[2], ' END ')
      }
      // if this is a vertex normal
      else if( lines[ i ].startsWith( 'vn ' ) ){
        line = lines[ i ].slice( 3 ).split( " " )
        vertNormals.push( line[ 0 ] );
        vertNormals.push( line[ 1 ] );
        vertNormals.push( line[ 2 ] );
        // document.write(lines[i]," normal", line[0],' ',line[1],' ',line[2], ' END ')

      }
      // if this is a texture
      else if( lines[ i ].startsWith( 'vt' ) ){
        line = lines[ i ].slice( 3 ).split( " " )
        textures.push( line[ 0 ] );
        textures.push( line[ 1 ] );
      }
      // if this is a face
      else if( lines[ i ].startsWith( 'f ' ) )
      {

        var linetmp = lines[ i ];
        var lineslice = linetmp.slice( 2 );
        line = lineslice.split( " " );
        var quad = false;
        for(var j=0; j<line.length ; j++)
        {
            face = line[ j ].split( '/' );
            // document.write(face[0],' ');
            packed.indices.push( face[0]-1);

            packed.textures.push( textures[ (face[ 1 ] - 1) * 2 + 0 ] );
            packed.textures.push( textures[ (face[ 1 ] - 1) * 2 + 1 ] );
            // vertex normals
            packed.norms.push( vertNormals[ (face[ 2 ] - 1) * 3 + 0 ] );
            packed.norms.push( vertNormals[ (face[ 2 ] - 1) * 3 + 1 ] );
            packed.norms.push( vertNormals[ (face[ 2 ] - 1) * 3 + 2 ] );

            // add the newly created vertex to the list of indices

            // packed.hashindices[ face[0]] = packed.index;
        }
      }
    }

    model.positions = verts;
    model.normals =  vertNormals;
    model.textures = packed.textures;
    model.indices = packed.indices;
    return model;
}

    // Inspiré de l'implémentation de 
    // http://learningwebgl.com/cookbook/index.php/How_to_draw_a_sphere
    function createSphere(parRadius, parPosition, parColorVal, parTesselation)
    {
        // Données de sphere
        var sphere = [];
        // Données  attribute
        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];

        // Pour chacun des somemts
        for (var latNumber = 0; latNumber <= parTesselation; latNumber++) 
        {
            var theta = latNumber * Math.PI / parTesselation;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            for (var longNumber = 0; longNumber <= parTesselation; longNumber++) 
            {
                var phi = longNumber * 2 * Math.PI / parTesselation;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1- (longNumber / parTesselation);
                var v = latNumber / parTesselation;
                // Si la sphère est gérée de manière interne (necessité d'éclairage)
                normalData.push(x);
                normalData.push(y);
                normalData.push(z);                   
                // données de texture
                textureCoordData.push(u);
                textureCoordData.push(v);
                // Donnée de positrion
                vertexPositionData.push(parRadius * x);
                vertexPositionData.push(parRadius * y);
                vertexPositionData.push(parRadius * z);
            }
        }
        // Tableau d'indexes
        var indexData = [];
        for (var latNumber = 0; latNumber < parTesselation; latNumber++) 
        {
            for (var longNumber = 0; longNumber < parTesselation; longNumber++) 
            {
                var first = (latNumber * (parTesselation + 1)) + longNumber;
                var second = first + parTesselation + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);
                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

        createBuffersVINT(sphere, vertexPositionData, indexData, normalData, textureCoordData);
        // On copie les autres données
        sphere.position = parPosition;
        sphere.colorVal = parColorVal;

        return sphere;

    }
    // Chargement du teapot
    function createObject(parPosition, parColorVal, cowDude)
    {
        var teapot = loadObj(cowDude);
        createBuffersVINT(teapot, teapot.positions, teapot.indices, teapot.normals, teapot.textures);
        // On copie les autres données
        teapot.position = parPosition;
        teapot.colorVal = parColorVal;
        return teapot;
    }
    // Creation d'un plan
    function createQuad(parP1, parP2, parP3, parP4, parColorVal)
    {
        // Données de sphere
        var plan = [];
        // Données  attribute
        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];

        // Pour chacun des somemts
        vertexPositionData.push(parP1[0]);
        vertexPositionData.push(parP1[1]);
        vertexPositionData.push(parP1[2]);

        vertexPositionData.push(parP2[0]);
        vertexPositionData.push(parP2[1]);
        vertexPositionData.push(parP2[2]);

        vertexPositionData.push(parP3[0]);
        vertexPositionData.push(parP3[1]);
        vertexPositionData.push(parP3[2]);

        vertexPositionData.push(parP4[0]);
        vertexPositionData.push(parP4[1]);
        vertexPositionData.push(parP4[2]);


        textureCoordData.push(0);
        textureCoordData.push(0);

        textureCoordData.push(1);
        textureCoordData.push(0);

        textureCoordData.push(0);
        textureCoordData.push(1);

        textureCoordData.push(1);
        textureCoordData.push(1);   

        var norm1 = computeNormal(parP1, parP3, parP2); 
        var norm2 = computeNormal(parP2, parP1, parP3); 
        var norm3 = computeNormal(parP3, parP4, parP2); 
        var norm4 = computeNormal(parP4, parP2, parP3); 

        normalData.push(norm1[0]);
        normalData.push(norm1[1]);
        normalData.push(norm1[2]);

        normalData.push(norm2[0]);
        normalData.push(norm2[1]);
        normalData.push(norm2[2]);

        normalData.push(norm3[0]);
        normalData.push(norm3[1]);
        normalData.push(norm3[2]);

        normalData.push(norm4[0]);
        normalData.push(norm4[1]);
        normalData.push(norm4[2]);

        // Tableau d'indexes
        var indexData = [];
        indexData.push(0);
        indexData.push(1);
        indexData.push(2);
        indexData.push(1);
        indexData.push(2);
        indexData.push(3);


        createBuffersVINT(plan, vertexPositionData, indexData, normalData, textureCoordData);
        // On copie les autres données
        plan.position = [0,0,0];
        plan.colorVal = parColorVal;

        return plan;

    }
