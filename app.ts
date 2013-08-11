/// <reference path="jquery.d.ts" />
/// <reference path="three.d.ts" />
/// <reference path="tween.js.d.ts" />

var puzzleScene: PuzzleScene;

var position;
var tween;

//init();
//animate();

function initTween() {

    position = {rotation: 0 };
    tween = new TWEEN.Tween(position)
        .to({ rotation: 359 }, 20000)
        .easing(TWEEN.Easing.Elastic.InOut)
        .start();
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    puzzleScene.update();
    puzzleScene.renderScene();
}














declare var Detector: any;

var availableColors = [
"aqua",
"blue",
"blueviolet",
"brown",
"burlywood",
"cadetblue",
"chartreuse",
"chocolate",
"coral",
"cornflowerblue",
"crimson",
"darkblue",
"darkcyan",
"darkgoldenrod",
"darkgreen",
"darkkhaki",
"darkmagenta",
"darkolivegreen",
"darkorange",
"darkorchid",
"darkred",
"darksalmon",
"darkseagreen",
"darkslateblue",
"darkslategray",
"darkturquoise",
"darkviolet",
"deeppink",
"deepskyblue",
"dimgray",
"dodgerblue",
"firebrick",
"floralwhite",
"forestgreen",
"fuchsia",
"gainsboro",
"ghostwhite",
"gold",
"goldenrod",
"gray",
"green",
"greenyellow",
"honeydew",
"hotpink",
"indianred",
"indigo",
"ivory",
"khaki",
"lavender",
"lavenderblush",
"lawngreen",
"lemonchiffon",
"lightblue",
"lightcoral",
"lightcyan",
"lightgoldenrodyellow",
"lightgreen",
"lightgrey",
"lightpink",
"lightsalmon",
"lightseagreen",
"lightskyblue",
"lightslategray",
"lightsteelblue",
"lightyellow",
"lime",
"limegreen",
"linen",
"magenta",
"maroon",
"mediumaquamarine",
"mediumblue",
"mediumorchid",
"mediumpurple",
"mediumseagreen",
"mediumslateblue",
"mediumspringgreen",
"mediumturquoise",
"mediumvioletred",
"midnightblue",
"mintcream",
"mistyrose",
"moccasin",
"navajowhite",
"navy",
"oldlace",
"olive",
"olivedrab",
"orange",
"orangered",
"orchid",
"palegoldenrod",
"palegreen",
"paleturquoise",
"palevioletred",
"papayawhip",
"peachpuff",
"peru",
"pink",
"plum",
"powderblue",
"purple",
"red",
"rosybrown",
"royalblue",
"saddlebrown",
"salmon",
"sandybrown",
"seagreen",
"seashell",
"sienna",
"silver",
"skyblue",
"slateblue",
"slategray",
"snow",
"springgreen",
"steelblue",
"tan",
"teal",
"thistle",
"tomato",
"turquoise",
"violet",
"wheat",
"white",
"whitesmoke",
"yellow",
"yellowgreen"
]

var assignedColors = [];

function getColor(label) {
    if (!(label in assignedColors))
    {
        assignedColors[label] = availableColors.shift();
    }
    return assignedColors[label];
}

var renderer;
var scene;
var camera;

class PuzzleScene {

    private meshes: { [element: string]: THREE.Mesh; } = {};

    public initializeScene(data) {

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
        camera.position.set(0, 0, 20);
        camera.lookAt(scene.position);
        scene.add(camera);

        var solutions = data.solutions;
        var firstSolution = solutions[0];

        for (var s = 0; s < firstSolution.length; s++)
        {

            var row = firstSolution[s];
            var useColor = getColor(row[row.length - 1]);
            for (var i = 0; i < row.length - 1; i++)
            {
                // 1. Instantiate the geometry object
                // 2. Add the vertices
                // 3. Define the faces by setting the vertices indices
                var squareGeometry = new THREE.Geometry();

                squareGeometry.vertices.push(new THREE.Vector3(0.0, 0.0, 0.0));
                squareGeometry.vertices.push(new THREE.Vector3(1.0, 0.0, 0.0));
                squareGeometry.vertices.push(new THREE.Vector3(1.0, 1.0, 0.0));
                squareGeometry.vertices.push(new THREE.Vector3(0.0, 1.0, 0.0));
                squareGeometry.faces.push(new THREE.Face4(0, 1, 2, 3));

                // Create a basic material and activate the 'doubleSided' attribute.
                var squareMaterial = new THREE.MeshBasicMaterial({
                    color: useColor,
                });

                // Create a mesh and insert the geometry and the material. 
                var squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);

                // save for later animation
                this.meshes[row[i]] = squareMesh;

                var coord_strings = row[i].split(",");
                var x = parseInt(coord_strings[0]);
                var y = parseInt(coord_strings[1]);

                squareMesh.position.set(x, y, 0.0);
                scene.add(squareMesh);
            }
        }
    }


    public update() {
        $.each(this.meshes, function (key, value) {
            value.rotation.y = position.rotation/180 * Math.PI;
        });
    }


    public renderScene() {
        renderer.render(scene, camera);
    }
    
}


function showSolutions() {
    $.getJSON('solutions.json', function (data) {
        puzzleScene = new PuzzleScene;
        puzzleScene.initializeScene(data);
        initTween();
        animate();
    });
}

$(document).ready(showSolutions)

