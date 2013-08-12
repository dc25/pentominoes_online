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
        .easing(TWEEN.Easing.Back.InOut)
        .onComplete(function () { puzzleScene.loadNextSolution() });

    backtween = new TWEEN.Tween(position)
        .to({ rotation: 0 }, rotateTime)
        .easing(TWEEN.Easing.Back.InOut)
        .onComplete(function () { puzzleScene.loadNextSolution() });

    pausetween0 = new TWEEN.Tween({})
        .to({}, pauseTime)
        .easing(TWEEN.Easing.Linear.None);

    pausetween1 = new TWEEN.Tween({})
        .to({}, pauseTime)
        .easing(TWEEN.Easing.Linear.None);

    pausetween0.chain(tween);
    tween.chain(pausetween1);
    pausetween1.chain(backtween);
    backtween.chain(pausetween0);

    pausetween0.start();
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

    private meshes: { [element: string]: THREE.Mesh; }[];

    private colorMesh(mesh, solution):void {
        for (var s = 0; s < solution.length; s++)
        {
            var row = solution[s];
            var useColor = getColor(row[row.length - 1]);
            for (var i = 0; i < row.length - 1; i++)
            {
                var material = <THREE.MeshBasicMaterial>mesh[row[i]].material;
                material.color.set(useColor);
            }
        }
    }

    private initSolutionMeshes(solution, meshIndex: number): void {
        var mesh = this.meshes[meshIndex];
        for (var s = 0; s < solution.length; s++)
        {

            var row = solution[s];
            //var useColor = getColor(row[row.length - 1]);
            for (var i = 0; i < row.length - 1; i++)
            {
                // 1. Instantiate the geometry object
                // 2. Add the vertices
                // 3. Define the faces by setting the vertices indices
                var squareGeometry = new THREE.Geometry();

                var border: number = 0.02;
                squareGeometry.vertices.push(new THREE.Vector3(0.0 + border, 0.0 + border, 0.0));
                squareGeometry.vertices.push(new THREE.Vector3(1.0 - border, 0.0 + border, 0.0));
                squareGeometry.vertices.push(new THREE.Vector3(1.0 - border, 1.0 - border, 0.0));
                squareGeometry.vertices.push(new THREE.Vector3(0.0 + border, 1.0 - border, 0.0));
                if (meshIndex == 0) {
                    squareGeometry.faces.push(new THREE.Face4(0, 1, 2, 3));
                } else {
                    squareGeometry.faces.push(new THREE.Face4(3, 2, 1, 0));
                }

                // Create a mesh and insert the geometry and the material. 
                var squareMesh = new THREE.Mesh(squareGeometry);

                // save for later animation
                mesh[row[i]] = squareMesh;
                squareMesh.matrixAutoUpdate = false;
                this.scene.add(squareMesh);
            }
        }
        this.colorMesh(mesh, solution);
    }

    public initializeScene(data) {

        this.solutions = data.solutions
        
        this.meshes = [];
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

    public update(): void {
        var rotationAxis = new THREE.Vector3(1.0, 1.0, 0.0);
        rotationAxis.normalize();
        var rotationMatrix: THREE.Matrix4 = new THREE.Matrix4;
        rotationMatrix.makeRotationAxis(rotationAxis, position.rotation / 180.0 * Math.PI);
        $.each(this.meshes, function (key, mesh) {
            $.each(mesh, function (key, square) {
                var coord_strings = key.split(",");
                var x = parseInt(coord_strings[0]);
                var y = parseInt(coord_strings[1]);
                var position = new THREE.Vector3(x - 5, y - 3, 0.0);

                square.matrix.copy(rotationMatrix);
                square.matrix.setPosition(position);
                square.updateMatrixWorld(true);  // why is this necessary?
            });
        });
    }

    public loadNextSolution(): void {
        this.backMeshIndex = (this.backMeshIndex + 1) % 2;
        this.backSolutionIndex = (this.backSolutionIndex + 1) % this.solutions.length;

        var mesh = this.meshes[this.backMeshIndex];
        var solution = this.solutions[this.backSolutionIndex];
        this.colorMesh(mesh, solution);
    }

    public renderScene():void {
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

