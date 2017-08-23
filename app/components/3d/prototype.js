/*1) открытие нового окна (внешнее/локальное) -> реакция: создание 3D-подложки;
2) закрытие окна (внешнее/локальное) -> реакция: удаление модели из подложки, если она была загружена, и удаление самой подложки;
3) изменение размеров окна (внешнее/локальное) -> реакция: масштабирование 3D-модели в окне под новый размер;
 более продвинутый вариант - отсутствие масштабирования, изменение положения камеры в соответствии с новыми габаритами окна;
4) загрузка модели в окно (внешнее/локальное через Drag'n'Drop) -> реакция: удаление модели, висящей в окне (при ее наличии), загрузка модели в окно;
5) зум (внешнее/локальное при нажатии Ctrl без Shift) -> реакция: изменение положения камеры в окне, синхронизация с SVG-подложкой;
6) панорамирование (внешнее/локальное при нажатии Ctrl без Shift) -> реакция: изменение положения модели в окне (перетаскивание),
 синхронизация с SVG-подложкой;
7) поворот камеры (внешнее/локальное при нажатии Ctrl без Shift) -> реакция: изменение углов поворота камеры,
 синхронизация с SVG-подложкой (удаление полилиний - на стороне SVG).

Для всех локальных событий необходимо предусмотреть проверку наличия разрешения на изменения (чья сейчас очередь редактировать):
 при отсутствии права редактирования блокировать события мыши.*/

'use strict'

class module3d {

    constructor(id, width, height, x, y) {

        this.id = id;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.pause = false;
        this.activeKeyboard = false;

        // связываем контекст
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.destructor = this.destructor.bind(this);
        this.loadModel = this.loadModel.bind(this);
        this.handler = this.handler.bind(this);
        this.throttle = this.throttle.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);

        this.init();           // создать сцену, камеру, рендер, освещение и loader
        this.createElements(); // создать drop_zone и canvas
        this.setEvents();      // установить события
        this.animate();        // бесконечный цикл перерисовки

    };

    createElements() {

        const div = document.createElement('div');
        div.id = 'drop_zone' + this.id;
        div.setAttribute("style","position:absolute;left:" + this.x + "px;top:" + this.y + "px;width:"+this.width+"px;height:"+this.height+"px;");
        document.body.insertBefore(div, document.body.firstChild);

        let container = document.createElement('div');
        container.innerHTML = "";
        container.id = 'container' + this.id;
        container.setAttribute("style","position:absolute;left:" + this.x + "px;top:" + this.y + "px;"); // ?
        container.appendChild( this.renderer.domElement );  // <canvas width="1243" height="920" style="width: 995px; height: 736px;"></canvas> внутрь div id = container
        document.body.insertBefore(container, document.body.firstChild);

    }

    setEvents() {

        const dropZone = document.getElementById('drop_zone' + this.id );
        dropZone.addEventListener('dragover', this.handleDragOver, false);
        dropZone.addEventListener('drop', this.handleFileSelect, false);

        document.addEventListener("keydown", this.handler);
        document.addEventListener("keyup", this.handler);
        document.getElementById("drop_zone" + this.id).onmouseout  =  this.handler;
        document.getElementById("drop_zone" + this.id).onmouseover =  this.handler;
        // kinput.onkeydown = kinput.onkeyup =  this.throttle(this.handler.bind(this), 300);

        window.addEventListener('resize', this.onWindowResize, false);

    }

    init() {

        this.scene = new THREE.Scene();
        let textureCube = new THREE.CubeTextureLoader()
            .setPath( 'https://threejs.org/examples/textures/cube/pisa/' )
            .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
        this.scene.background = textureCube;
        //this.scene.background = new THREE.Color( "black" );

        this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 0.1, 3000 );
        this.camera.position.set(100,0,1000);

        this.controls = new THREE.TrackballControls( this.camera ); // , this.renderer.domElement
        this.controls.rotateSpeed = 2.0;
        this.controls.zoomSpeed = 0.3;
        this.controls.panSpeed = 0.2;   // right  mouse
        this.controls.noZoom = true;    // zoom   forbidden
        this.controls.noPan = true;     // pan    forbidden
        this.controls.noRotate = true;  // rotate forbidden
        //this.controls.staticMoving = true;
        //this.controls.dynamicDampingFactor = 0.3;

        this.scene.add( this.camera );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio( window.devicePixelRatio ); // улучшение качества изображения
        this.renderer.setSize( this.width, this.height);
        this.renderer.shadowMap.enabled = true;

        let light = new THREE.AmbientLight( 0xffffff );
        this.scene.add(light);

        let manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( loaded, total );
        };

        this.onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                let percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };

        this.onError = function ( xhr ) {
        };

        // model
        this.loader = new THREE.OBJLoader( manager ); // ObjectLoader

        this.object = "undefined";

    }

    destructor() {

        // events
        const dropZone = document.getElementById('drop_zone' + this.id );
        dropZone.removeEventListener('dragover', this.handleDragOver, false);
        dropZone.removeEventListener('drop', this.handleFileSelect, false);

        window.removeEventListener('resize', this.onWindowResize, false);

        document.removeEventListener("keydown", this.handler);
        document.removeEventListener("keyup", this.handler);

        document.getElementById("drop_zone" + this.id).onmouseout  =  null;
        document.getElementById("drop_zone" + this.id).onmouseover =  null;

        //elements
        let div = document.getElementById("container" + this.id);
        document.getElementsByTagName('body')[0].removeChild(div);

        div = document.getElementById("drop_zone" + this.id);
        document.getElementsByTagName('body')[0].removeChild(div);

        // variables
        this.pause = true;

        this.id = null;
        this.width = null;
        this.height = null;
        this.x = null;
        this.y = null;

        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.renderer = null;
        this.loader = null;
        this.object = null;

        // нужно ли очищать контекст в функциях?

    }

    onWindowResize() {

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.width, this.height );
        this.controls.handleResize();

    }

    loadModel(files) {

        if ( this.object !== "undefined" ) {
               this.deleteModel();
        }

        let output = [];
        for (let i = 0, f; f = files[i]; i++) {

            let reader = new FileReader();

            reader.onload = ( (theFile) => {
                return (e) => {
                    this.loader.load(e.target.result, ( object ) => {
                        object.traverse( function ( child ) {
                            if ( child instanceof THREE.Mesh ) {
                            }
                        } );
                        this.camera.lookAt(object);
                        this.object = object;
                        this.scene.add( object );

                    }, this.onProgress, this.onError );
                };
            })(f);

            reader.readAsDataURL(f);
        }

    }

    deleteModel() {
        this.scene.remove(this.object);
    }

    handler(event) {

        if ( event.type == "mouseover" ) {
            this.activeKeyboard = true;
        }

        if ( event.type == "mouseout") {
            this.activeKeyboard = false;
        }

        if ( event.keyCode == 17 ) { // ctrl
            if ( event.type == "keydown" && this.activeKeyboard == true ) {

                this.controls.noZoom = false;    // zoom allowed (зум) 5
                this.controls.noPan = false;     // pan allowed (панорамирование) 6
                this.controls.noRotate = false;  // rotate allowed (поворот камеры) 7

            } else if ( event.type == "keyup" || this.activeKeyboard == false ) {

                this.controls.noZoom = true;
                this.controls.noPan = true;
                this.controls.noRotate = true;

            }
        }

    }

    animate() {

        if ( this.pause ) return;

        requestAnimationFrame(this.animate);
        this.controls.update();
        this.render();

    }

    render() {

        this.renderer.render( this.scene, this.camera );

    }

    throttle(func, ms) {

        let isThrottled = false,
            savedArgs,
            savedThis;

        function wrapper() {

            if (isThrottled) { // (2)
                savedArgs = arguments;
                savedThis = this;
                return;
            }

            func.apply(this, arguments); // (1)

            isThrottled = true;

            setTimeout(function() {
                isThrottled = false; // (3)
                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
                }
            }, ms);
        }

        return wrapper;
    }

    handleFileSelect(evt) {

        evt.stopPropagation();
        evt.preventDefault();

        const files = evt.dataTransfer.files; // FileList object.

        this.loadModel(files);

    }

    handleDragOver(evt) {

        // файл находится над drop_zone
        evt.stopPropagation(); // не открывать файл
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

    }

}

// 1) как по-другому остановить requestAnimationFrame
// 2) при не ппадании в drop_zone открывается файл. пофиксить


