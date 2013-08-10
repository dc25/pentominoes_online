/// <reference path="jquery.d.ts" />
/// <reference path="three.d.ts" />

var solutions;
var current_solution: number = 0;


function cb() {
    console.log("IN CB");
}


var solJson= $.ajax({
    url: "solutions.json",
    dataType: "json",
    success: function (result) {
        solutions = result;
        console.log("token recieved: " + result.token);
        cb();
    },
    error: function (request, textStatus, errorThrown) {
        console.log(textStatus);
        cb();
    },
    complete: function (request, textStatus) { //for additional info
        console.log(request.responseText);
        console.log(textStatus);
        cb();
    }
});

declare var Detector: any;

var renderer;

// Global scene object
var scene;

// Global camera object
var camera;

class GridPoint {
    constructor(public x: number, public y: number) {
    }
}

class GridSet {
    public points: GridPoint[];

    constructor() {
        this.points = [];
    }

    addPoint(gp: GridPoint): void {
        this.points.push(gp);
    }
}

var gs1 = new GridSet();
gs1.addPoint({ x: 0, y: 0 });
gs1.addPoint({ x: 0, y: 1 });
gs1.addPoint({ x: 0, y: 2 });
gs1.addPoint({ x: 1, y: 1 });
gs1.addPoint({ x: 1, y: 2 });



/**
 * Initialze the scene.
 */


function initializeScene(gs: GridSet) {
    // Check whether the browser supports WebGL. If so, instantiate the hardware accelerated
    // WebGL renderer. For antialiasing, we have to enable it. The canvas renderer uses
    // antialiasing by default.
    // The approach of multiplse renderers is quite nice, because your scene can also be
    // viewed in browsers, which don't support WebGL. The limitations of the canvas renderer
    // in contrast to the WebGL renderer will be explained in the tutorials, when there is a
    // difference.
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });

        // If its not supported, instantiate the canvas renderer to support all non WebGL
        // browsers
    } else {
        renderer = new THREE.CanvasRenderer();
    }

    // Set the background color of the renderer to black, with full opacity
    renderer.setClearColor(0x000000, 1);

    // Get the size of the inner window (content area) to create a full size renderer
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;

    // Set the renderers size to the content areas size
    renderer.setSize(canvasWidth, canvasHeight);

    // Get the DIV element from the HTML document by its ID and append the renderers DOM
    // object to it
    document.getElementById("WebGLCanvas").appendChild(renderer.domElement);

    // Create the scene, in which all objects are stored (e. g. camera, lights,
    // geometries, ...)
    scene = new THREE.Scene();

    // Now that we have a scene, we want to look into it. Therefore we need a camera.
    // Three.js offers three camera types:
    //  - PerspectiveCamera (perspective projection)
    //  - OrthographicCamera (parallel projection)
    //  - CombinedCamera (allows to switch between perspective / parallel projection
    //    during runtime)
    // In this example we create a perspective camera. Parameters for the perspective
    // camera are ...
    // ... field of view (FOV),
    // ... aspect ratio (usually set to the quotient of canvas width to canvas height)
    // ... near and
    // ... far.
    // Near and far define the cliping planes of the view frustum. Three.js provides an
    // example (http://mrdoob.github.com/three.js/examples/
    // -> canvas_camera_orthographic2.html), which allows to play around with these
    // parameters.
    // The camera is moved 10 units towards the z axis to allow looking to the center of
    // the scene.
    // After definition, the camera has to be added to the scene.
    camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(scene.position);
    scene.add(camera);

    // The creation of the square is done in the same way as the triangle, except of the
    // face definition. Instead of using THREE.Face3, we define a face with four vertices:
    // THREE.Face4.
    // 1. Instantiate the geometry object
    // 2. Add the vertices
    // 3. Define the faces by setting the vertices indices
    var squareGeometry = new THREE.Geometry();

    var v_index1 = squareGeometry.vertices.length;

    for (var i = 0; i < gs.points.length; i++)
    {
        var v_index = squareGeometry.vertices.length;

        var x = gs.points[i].x;
        var y = gs.points[i].y;
        
        var border = 0.05;
        squareGeometry.vertices.push(new THREE.Vector3(x + border, y + border, 0.0));
        squareGeometry.vertices.push(new THREE.Vector3(x + 1 - border, y + border, 0.0));
        squareGeometry.vertices.push(new THREE.Vector3(x + 1 - border, y + 1 - border, 0.0));
        squareGeometry.vertices.push(new THREE.Vector3(x + border, y + 1 - border, 0.0));
        squareGeometry.faces.push(new THREE.Face4(v_index, v_index + 1, v_index + 2, v_index + 3));
    }

    // Create a white basic material and activate the 'doubleSided' attribute.
    var squareMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
    });

    // Create a mesh and insert the geometry and the material. Translate the whole mesh
    // by 1.5 on the x axis and by 4 on the z axis and add the mesh to the scene.
    var squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);
    squareMesh.position.set(0.0, 0.0, 0.0);
    scene.add(squareMesh);
}

/**
 * Render the scene. Map the 3D world to the 2D screen.
 */
function renderScene() {
    renderer.render(scene, camera);
}
