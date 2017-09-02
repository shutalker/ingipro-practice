//import * as THREE from 'three';
//import TrackballControls from 'three-trackballcontrols';
import mediator from '../mediator';
import './style.css';

class Viewer {
    constructor(elem, globalId, userId) {
        this._globalId = globalId;
        this._userId = userId;
        console.log("Viewer created");
        //Create drag&drop zone
        this.createDragAndDropZone.bind(this)(elem);

        //Create 3d scene
        this.create3dScene.bind(this)();

        //Add event on various controls changes
        this._controls.addEventListener('change', this.renderPhone.bind(this));

        //Add event on change window size
        window.addEventListener('resize', this.editCanvasSize.bind(this), false);

        this.animationLoop.bind(this)();


        this._objLoader = new THREE.OBJLoader();           //Obj Loader
        this._textureLoader = new THREE.ImageLoader();
        this._texture = new THREE.Texture();

        this.mediatorOnEvents.bind(this)();
    }

    _onDownCtrl(r) {
        if (r.ctrlKey === true) {this._controls.enabled = true;}
        if (r.shiftKey === true) {this._controls.enabled = false;}
        if (r.shiftKey === true && r.ctrlKey === true) {this._controls.enabled = false;}
    }

    _onUpCtrl(e) {
        if (e.ctrlKey === false) {
            this._controls.enabled = false;
        }
    }
    m(e) {
        console.log('ctrl from viewer');
        console.dir(e);
    }

    create3dScene() {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(10, this._viewZone.clientWidth / this._viewZone.clientHeight, 1, 1000);    //Initials value = 0, therefore camera placed at infiniity
        //this._camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 1000);
        this._camera.position.set(10, 10, 10);
        this._camera.lookAt(this._scene.position);
        this._renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });


        this._renderer.setSize(this._viewZone.clientWidth, this._viewZone.clientHeight);        //0, 0, but after resize it will be update

        this._tanFOV = Math.tan(((Math.PI / 180) * this._camera.fov / 2));                      //Needs for save model scale

        //this._windowHeight = this._viewZone.clientHeight;
        this._windowHeight = window.innerHeight;

        this._viewZone.appendChild(this._renderer.domElement);

        this._controls = new THREE.TrackballControls(this._camera, this._viewZone);
        this._controls.rotateSpeed = 5.0;
        this._controls.zoomSpeed = 3.2;
        this._controls.panSpeed = 0.8;
        this._controls.noZoom = false;
        this._controls.noPan = true;
        this._controls.noRotate = false;
        this._controls.staticMoving = false;
        this._controls.dynamicDampingFactor = 0.2;
        this._controls.enabled = false;
        document.addEventListener('keydown', this._onDownCtrl.bind(this), false);
        document.addEventListener('keyup', this._onUpCtrl.bind(this), false);




        const light_color  = '#FAFAFA',
            ambientLight  = new THREE.AmbientLight('#EEEEEE'),
            hemiLight     = new THREE.HemisphereLight(light_color, light_color, 0),
            light         = new THREE.PointLight(light_color, 1, 100);

        hemiLight.position.set(0, 50, 0);
        light.position.set(0, 20, 10);

        //this._scene.add(ambientLight);
        this._scene.add(hemiLight);
        this._scene.add(light);

        this._axisHelper = new THREE.AxisHelper(1.25);
        this._scene.add(this._axisHelper);
    }

    createDragAndDropZone(elem) {
        this._viewZone = elem;
        this._viewZone.addEventListener('dragover', this.handleDragOver.bind(this), false);
        this._viewZone.addEventListener('drop', this.handleFileSelect.bind(this), false);
    }

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }

    handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const file = evt.dataTransfer.files;                             //Just for 1 file, if you want drag > 1 files, you should use const file = evt.dataTransfer.files and use for() through files

        const rightFileOrder = [].slice.call(file).sort((a, b) => {
                return (a.name.indexOf('.obj') !== -1) ? 1: -1;
            });

        const textureReader = new FileReader();
        textureReader.onload = (theFile => {
            this._textureLoader.load(theFile.target.result, texture => {
                this._texture.image = texture;
                this._texture.needsUpdate = true;
            });
            mediator.emit('viewer:addTexture', {
                url: theFile.target.result,
                userId: this._userId,
                globalId: this._globalId
            });
        });
        textureReader.readAsDataURL(rightFileOrder[0]);

        const objReader = new FileReader();
        objReader.onload = (theFile => {
            this._objLoader.load(theFile.target.result, this.loadObj.bind(this));
            mediator.emit('viewer:addModel', {url: theFile.target.result, userId: this._userId, globalId: this._globalId});
        });
        objReader.readAsDataURL(rightFileOrder[1]);

    }

    renderPhone() {
        if (!this._flag) {
            mediator.emit('viewer:change', {
                cameraPos: this._camera.position,
                cameraRot: this._camera.rotation,
                cameraQua: this._camera.quaternion,
                cameraUp: this._camera.up,
                userId: this._userId,
                globalId: this._globalId
            });
        }
        this._flag = false;
        this._renderer.render(this._scene, this._camera);
    }

    animationLoop() {
        requestAnimationFrame(this.animationLoop.bind(this));
        this._controls.update();
    }

    loadObj(object) {
        this._obj = object;

        const scale = this.getScaleModel.bind(this)();

        this._obj.traverse(this.addTextureOnObj.bind(this));

        this._obj.scale.set(scale, scale, scale);

        this._scene.add(this._obj);
        this.renderPhone();
    }

    addTextureOnObj(child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = this._texture;
        }
    }

    getScaleModel() {
        const size = new THREE.Box3().setFromObject(this._obj);     //Get real size of model
        const INIT_SIZE = 10;                                       //Desired size

        const maxSize = Math.max.apply(null,
            [size.max.x - size.min.x,
                size.max.y - size.min.y,
                size.max.z - size.min.z]);
        const scale = INIT_SIZE / maxSize;

        return scale;
    }

    addNewModel(payload) {
        if (payload.userId !== this._userId && this._globalId === payload.globalId) {
            this._objLoader.load(payload.url, this.loadObj.bind(this));
        }
    }

    addNewTexture(payload) {
        if (payload.userId !== this._userId && this._globalId === payload.globalId) {
            this._textureLoader.load(payload.url, texture => {
                this._texture.image = texture;
                this._texture.needsUpdate = true;
            });
        }
    }

    newCameraPos(payload) {
        if (payload.userId !== this._userId && this._globalId === payload.globalId) {
            this._camera.position.set(payload.cameraPos.x,
                payload.cameraPos.y,
                payload.cameraPos.z,);
            this._camera.up.set(payload.cameraUp.x,
                payload.cameraUp.y,
                payload.cameraUp.z,);
            this._camera.quaternion.set(payload.cameraQua._x,
                payload.cameraQua._y,
                payload.cameraQua._z,);
            this._camera.rotation.set(payload.cameraRot._x,
                payload.cameraRot._y,
                payload.cameraRot._z,);

            this._flag = true;          //Lock new transfer camara data, because of appears loop
        }
    }

    editCanvasSize() {
        //this._controls.screen.width = this._viewZone.clientWidth;   //Initials value = 0, therefore it needs to update
        //this._controls.screen.height = this._viewZone.clientHeight;

        this._controls.handleResize();      //Initials value of screen = 0, therefore it needs to update

        this._camera.aspect = this._viewZone.clientWidth / this._viewZone.clientHeight;

        this._camera.fov = (360 / Math.PI) * Math.atan(this._tanFOV * (this._viewZone.clientHeight / this._windowHeight));

        this._camera.updateProjectionMatrix();
        this._camera.lookAt(this._scene.position);

        this._renderer.setSize(this._viewZone.clientWidth, this._viewZone.clientHeight);
        this._renderer.render(this._scene, this._camera);
    }

    mediatorOnEvents() {
        mediator.on('viewer:addModel', this.addNewModel.bind(this));
        mediator.on('viewer:addTexture', this.addNewTexture.bind(this));
        mediator.on('viewer:change', this.newCameraPos.bind(this));
        mediator.on('layout:change', this.editCanvasSize.bind(this));
        // mediator.on('conference:join', this.newUserJoin.bind(this));
        // mediator.on('conference:sync', this.newUserSync.bind(this));
        // mediator.on('viewer:addData', this.addViewer.bind(this));
    }
}

export default Viewer;
