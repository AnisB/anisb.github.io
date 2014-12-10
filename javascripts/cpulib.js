

var EPSILON = 0.00001
function Vector(parX, parY, parZ)
{
    var vector = []
    if(parX!=null)
    {
        if(parY != null)
        {
            vector.val = [parX, parY, parZ];
        }
        else
        {
            vector.val = [parX, parX, parX];
        }
    }
    return vector;
}

function Ray(parOrigin, parDirection)
{
    var ray = []
    ray.origin = parOrigin;
    ray.direction = parDirection;
    return ray
}


function Sphere(parRayon, parPosition, parEmission, parColor, parMaterial)
{
    var sphere = []
    sphere.rayon=parRayon;
    sphere.position=parPosition;
    sphere.emission=parEmission;
    sphere.color=parColor;
    sphere.material=parMaterial;
    return sphere
}



function Matrix()
{
    var matrix = [];
    for(var i=0; i<3; i++) 
    {
        matrix[i] = new Array(3);
    }
    return matrix;
}

function VxM(parVec, parMatrix)
{
    var data = parVec.val;
    // return Vector(data[0]*parMatrix[0][0]+ data[1]*parMatrix[1][0]+ data[2]*parMatrix[2][0], data[0]*parMatrix[0][1]+ data[1]*parMatrix[1][1]+ data[2]*parMatrix[2][1],  data[0]*parMatrix[0][2]+ data[1]*parMatrix[1][2]+ data[2]*parMatrix[2][2])
    return Vector(data[0]*parMatrix[0][0]+ data[1]*parMatrix[0][1]+ data[2]*parMatrix[0][2], data[0]*parMatrix[1][0]+ data[1]*parMatrix[1][1]+ data[2]*parMatrix[1][2],  data[0]*parMatrix[2][0]+ data[1]*parMatrix[2][1]+ data[2]*parMatrix[2][2])
}

function MxM(parMatrix1, parMatrix2)
{
    var result = Matrix()
    for(var i = 0; i< 3; ++i)
    {
        for(var j = 0; j< 3; ++j)
        {
            result[i][j] = parMatrix1[i][0]*parMatrix2[0][j]+parMatrix1[i][1]*parMatrix2[1][j]+parMatrix1[i][2]*parMatrix2[2][j];
        }
    }
    return result;
}

function RotateM(parAngle, parAxis)
{
    var ux = parAxis.val[0];
    var uy = parAxis.val[1];
    var uz = parAxis.val[2];
    var cosAngle = Math.cos(parAngle);
    var sinAngle = Math.sin(parAngle);
    var result = Matrix()
    result[0][0] = cosAngle+ux*ux*(1-cosAngle);
    result[0][1] = ux*uy*(1-cosAngle)-uz*sinAngle;
    result[0][2] = ux*uz*(1-cosAngle)+uy*sinAngle;
    result[1][0] = uy*ux*(1-cosAngle)+uz*sinAngle;
    result[1][1] = cosAngle+uy*uy*(1-cosAngle);
    result[1][2] = uy*uz*(1-cosAngle)-ux*sinAngle;
    result[2][0] = uz*ux*(1-cosAngle)-uy*sinAngle;
    result[2][1] = uy*uz*(1-cosAngle)+ux*sinAngle;
    result[2][2] = cosAngle+uz*uz*(1-cosAngle);
    return result;
}

function RotateEuler(parNormal, teta, phi)
{
    // var prevTeta = Math.acos(parNormal.val[2]);
    var prevPhi;
    
    // if(Math.abs(parNormal.val[0])<0.001)
    // {
    //     if(Math.abs(parNormal.val[1])<0.001)
    //     {
    //         prevPhi =PI;
    //     }
    //     else
    //     {
    //         prevPhi =3.14/2.0;
    //     }
    // }
    // else
    {
        prevPhi = Math.atan(parNormal.val[1]/parNormal.val[0]);
    }

    // var zAxis = VxM(Vector(0.0,0.0,1.0),RotateM(prevTeta,Vector(1.0,0.0,0.0)))
    // var zAxis = VxM(Vector(0.0,0.0,1.0),RotateM(prevTeta,Vector(1.0,0.0,0.0)))

    // var xAxis = VxM(Vector(1.0,0.0,0.0),RotateM(prevPhi,Vector(0.0,0.0,1.0)))

    var rslt = VxM(parNormal,RotateM(teta,normalize(cross(parNormal, Vector(0.0,1.0,1.0)))))
    rslt = VxM(rslt,RotateM(phi,parNormal));
    return rslt;
}


// Fonction de debug
function printToPage(name, vec)
{
    var mytext = name +vec.toString();
    document.writeln(mytext);
}

// Fonction de traitement des vec3

// Scale x par y
function scale( parVecX,y )
{
    return Vector(parVecX.val[0]*y, parVecX.val[1]*y, parVecX.val[2]*y)
}

// Calcule la valeur negative de x
function negate(parVec)
{
    return Vector(-parVec.val[0], -parVec.val[1], -parVec.val[2]);
}

// Ajoute x à y et renvoie le resultat
function addV( parVec1, parVec2 )
{
    return Vector(parVec1.val[0]+parVec2.val[0], parVec1.val[1]+parVec2.val[1], parVec1.val[2]+parVec2.val[2])
}

// Teste si une des composantes au moins est non nule (pour les couleurs)
function isNotNil( parVec1, parVec2 )
{
    return (Math.abs(parVec1.val[0])+Math.abs(parVec1.val[1])+Math.abs(parVec1.val[2]))>EPSILON
}

// Teste si une des composantes au moins est non nule (pour les couleurs)
function isNil( parVec1 )
{
    return (Math.abs(parVec1.val[0])+Math.abs(parVec1.val[1])+Math.abs(parVec1.val[2]))<EPSILON
}

// Calcule x dot y
function dot( parVec1, parVec2 )
{
    return (parVec1.val[0]*parVec2.val[0]+ parVec1.val[1]*parVec2.val[1]+ parVec1.val[2]*parVec2.val[2]);
}
// Calcule x-y
function substract( parVec1, parVec2)
{
    return Vector(parVec1.val[0]-parVec2.val[0], parVec1.val[1]-parVec2.val[1], parVec1.val[2]-parVec2.val[2]);
}

// Multiplication terme a terme de x et y
function mult( parVec1, parVec2 )
{
    return Vector(parVec1.val[0]*parVec2.val[0], parVec1.val[1]*parVec2.val[1], parVec1.val[2]*parVec2.val[2]);
}

// normalise x et renvoie sa norme
function normalizeAndNorm( parVec1)
{
    var norm = Math.sqrt( parVec1.val[0]*parVec1.val[0]+ parVec1.val[1]*parVec1.val[1]+ parVec1.val[2]*parVec1.val[2]);
    parVec1 = Vector(parVec1.val[0]/norm, parVec1.val[1]/norm, parVec1.val[2]/norm);
    return norm;
}
// Normalise x
function normalize( parVec1)
{
    var norm = Math.sqrt( parVec1.val[0]*parVec1.val[0]+ parVec1.val[1]*parVec1.val[1]+ parVec1.val[2]*parVec1.val[2]);
    return ( Vector(parVec1.val[0]/norm, parVec1.val[1]/norm, parVec1.val[2]/norm));
}

//calcule la norme de x
function norm( parVec1)
{
    var norm = Math.sqrt( parVec1.val[0]*parVec1.val[0]+ parVec1.val[1]*parVec1.val[1]+ parVec1.val[2]*parVec1.val[2]);
    return norm;
}

//calcule le produit vectoriel de x et y
function cross( parVec1, parVec2)
{
    return Vector( parVec1.val[1]*parVec2.val[2] - parVec1.val[2]*parVec2.val[1], parVec1.val[2]*parVec2.val[0] - parVec1.val[0]*parVec2.val[2], parVec1.val[0]*parVec2.val[1] - parVec1.val[1]*parVec2.val[0])
}

//calcule le produit vectoriel de x et y
function clamp( x)
{
    if(x>1.0)
        return 1.0
    else if(x<0.0)
        return 0.0
    else
        return x
}


// Conversion de float à int pour les couleurs
function FloatToInt( x ) 
{
    return x * 255;
}