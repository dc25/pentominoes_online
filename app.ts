/// <reference path="jquery.d.ts" />
/// <reference path="three.d.ts" />

declare var Detector: any;

function renderScene(data) {
    var renderer;
    var scene;
    var camera;

    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
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

    // Get the DIV element from the HTML document by its ID and 
    // append the renderers DOM object to it
    document.getElementById("WebGLCanvas").appendChild(renderer.domElement);

    // Create the scene, in which all objects are stored (e. g. camera, 
    // lights, geometries, ...)
    scene = new THREE.Scene();

    // After definition, the camera has to be added to the scene.
    camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
    camera.position.set(0, 0, 30);
    camera.lookAt(scene.position);
    scene.add(camera);

    // 1. Instantiate the geometry object
    // 2. Add the vertices
    // 3. Define the faces by setting the vertices indices
    var squareGeometry = new THREE.Geometry();

    var solutions = data.solutions;
    var firstSolution = solutions[0];

    for (var s = 0; s < firstSolution.length; s++)
    {
        var row = firstSolution[s];
        for (var i = 0; i < row.length - 1; i++)
        {

            var element = row[i];
            var coord_strings = element.split(",");
            var x = parseInt(coord_strings[0]);
            var y = parseInt(coord_strings[1]);

            var v_index = squareGeometry.vertices.length;

            var border = 0.05;
            squareGeometry.vertices.push(new THREE.Vector3(x + border, y + border, 0.0));
            squareGeometry.vertices.push(new THREE.Vector3(x + 1 - border, y + border, 0.0));
            squareGeometry.vertices.push(new THREE.Vector3(x + 1 - border, y + 1 - border, 0.0));
            squareGeometry.vertices.push(new THREE.Vector3(x + border, y + 1 - border, 0.0));
            squareGeometry.faces.push(new THREE.Face4(v_index, v_index + 1, v_index + 2, v_index + 3));
        }
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

    /**
     * Render the scene. Map the 3D world to the 2D screen.
     */
    renderer.render(scene, camera);
}

function showSolutions() {
    $.getJSON('solutions.json', function (data) {
        renderScene(data);
    });
}

$(document).ready(showSolutions)

