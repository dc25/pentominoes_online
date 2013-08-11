/// <reference path="jquery.d.ts" />
/// <reference path="three.d.ts" />
/// <reference path="tween.js.d.ts" />

var puzzleScene: PuzzleScene;

var position;
var tween;
var backtween;
var pausetween0;
var pausetween1;

function initTween() {

    var rotateTime: number = 3000;
    var pauseTime: number = 2000;

    position = {rotation: 0 };
    tween = new TWEEN.Tween(position)
        .to({ rotation: 180 }, rotateTime)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(function () { puzzleScene.loadNextSolution() });

    backtween = new TWEEN.Tween(position)
        .to({ rotation: 0 }, rotateTime)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(function () { puzzleScene.loadNextSolution() });

    pausetween0 = new TWEEN.Tween({})
        .to({}, pauseTime)
        .easing(TWEEN.Easing.Linear.None);

    pausetween1 = new TWEEN.Tween({})
        .to({}, pauseTime)
        .easing(TWEEN.Easing.Linear.None);

    tween.chain(pausetween0);
    pausetween0.chain(backtween);
    backtween.chain(pausetween1);
    pausetween1.chain(tween);

    tween.start();
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

class PuzzleScene {

    private renderer;
    private scene;
    private camera;

    private backMeshIndex: number;
    private backSolutionIndex: number;
    private solutions;

    private meshes: { [element: string]: THREE.Mesh; }[] = [];



    private colorMesh(mesh, solution): void {
        for (var s = 0; s < solution.length; s++)
        {

            var row = solution[s];
            var useColor = getColor(row[row.length - 1]);
            for (var i = 0; i < row.length - 1; i++)
            {
                var squareMesh = mesh[row[i]];
                squareMesh.material.color.set(useColor);
            }
        }
    }


    private initSolutionMeshes(solution, meshIndex: number): void {
        for (var s = 0; s < solution.length; s++)
        {

            var row = solution[s];
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
                if (meshIndex == 0) {
                    squareGeometry.faces.push(new THREE.Face4(0, 1, 2, 3));
                } else {
                    squareGeometry.faces.push(new THREE.Face4(3, 2, 1, 0));
                }

                // Create a basic material and activate the 'doubleSided' attribute.
                var squareMaterial = new THREE.MeshBasicMaterial({
                    color: useColor,
                });

                // Create a mesh and insert the geometry and the material. 
                var squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);

                // save for later animation
                this.meshes[meshIndex][row[i]] = squareMesh;
                squareMesh.matrixAutoUpdate = false;
                this.scene.add(squareMesh);
            }
        }
    }

    public initializeScene(data) {

        this.solutions = data.solutions

        this.meshes[0] = {};
        this.meshes[1] = {};

        if (Detector.webgl) {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
        } else {
            this.renderer = new THREE.CanvasRenderer();
        }

        // Set the background color of the renderer to black, with full opacity
        this.renderer.setClearColor(0x000000, 1);

        // Get the size of the inner window (content area) to create a full size renderer
        var canvasWidth = window.innerWidth;
        var canvasHeight = window.innerHeight;

        // Set the renderers size to the content areas size
        this.renderer.setSize(canvasWidth, canvasHeight);

        // Get the DIV element from the HTML document by its ID and 
        // append the renderers DOM object to it
        document.getElementById("WebGLCanvas").appendChild(this.renderer.domElement);

        // Create the scene, in which all objects are stored (e. g. camera, 
        // lights, geometries, ...)
        this.scene = new THREE.Scene();

        // After definition, the camera has to be added to the scene.
        this.camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);

        this.initSolutionMeshes(this.solutions[0], 0);
        this.initSolutionMeshes(this.solutions[1], 1);

        this.backSolutionIndex = 1;
        this.backMeshIndex = 1;

    }

    private rotateMeshes(rotationMatrix: THREE.Matrix4, meshIndex: number): void {
        $.each(this.meshes[meshIndex], function (key, value) {
            var coord_strings = key.split(",");
            var x = parseInt(coord_strings[0]);
            var y = parseInt(coord_strings[1]);
            var position = new THREE.Vector3(x-5, y-3, 0.0);

            value.matrix.copy(rotationMatrix);
            value.matrix.setPosition(position);
            value.updateMatrixWorld(true);  // why is this necessary?
        });
    }

    public update() {
        var rotationAxis = new THREE.Vector3(1.0, 1.0, 0.0);
        rotationAxis.normalize();
        var rotationMatrix: THREE.Matrix4 = new THREE.Matrix4;
        rotationMatrix.makeRotationAxis(rotationAxis, position.rotation / 180.0 * Math.PI);
        this.rotateMeshes(rotationMatrix, 0);
        this.rotateMeshes(rotationMatrix, 1);
    }


    public loadNextSolution(): void {
        this.backMeshIndex += 1;
        if (this.backMeshIndex == this.meshes.length) {
            this.backMeshIndex = 0;
        }

        this.backSolutionIndex += 1;
        if (this.backSolutionIndex == this.solutions.length) {
            this.backSolutionIndex = 0;
        }

        this.colorMesh(this.meshes[this.backMeshIndex], this.solutions[this.backSolutionIndex]);
    }

    public renderScene() {
        this.renderer.render(this.scene, this.camera);
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

