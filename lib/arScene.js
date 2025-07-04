export class ARScene {
  constructor(options = {}) {
    this.video = options.video;
    this.model = options.model;
    this.isMobile = options.isMobile;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.mixer = null;
    
    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupLighting();
    this.setupModel();
    this.setupEventListeners();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    
    if (this.video) {
      const webcamTexture = new THREE.VideoTexture(this.video);
      webcamTexture.magFilter = THREE.LinearFilter;
      webcamTexture.minFilter = THREE.LinearFilter;
      webcamTexture.format = THREE.RGBFormat;
      this.scene.background = webcamTexture;
    }
  }

  setupCamera() {
    const [w, h] = [window.innerWidth, window.innerHeight];
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.set(0, 3, 2);
    this.scene.add(this.camera);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = 0;
    this.renderer.domElement.style.left = 0;
    
    document.body.style.margin = 0;
    document.body.style.overflow = 'hidden';
    
    document.body.appendChild(this.renderer.domElement);
  }

  setupControls() {
    if (this.isMobile) {
      this.controls = new THREE.DeviceOrientationControls(this.camera, true);
      this.controls.connect();
    } else {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    }
  }

  setupLighting() {
    const light = new THREE.HemisphereLight();
    this.scene.add(light);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.set(0, 3, 2);
    this.scene.add(pointLight);
  }

  setupModel() {
    if (!this.model) return;
    
    this.model.scene.scale.set(3, 3, 3);
    this.model.scene.traverse((object) => {
      object.frustumCulled = false;
    });
    
    this.mixer = new THREE.AnimationMixer(this.model.scene);
    const action = this.mixer.clipAction(this.model.animations[0]);
    action.play();
    
    this.scene.add(this.model.scene);
    
    this.addModelLighting(this.model.scene, 10);
  }

  addModelLighting(object, distance) {
    const positions = this.generateLightPositions(
      object.position.x,
      object.position.y,
      object.position.z,
      distance
    );

    positions.forEach((pos) => {
      const pointLight = new THREE.PointLight(0xffffff, 1, 10);
      pointLight.position.set(...pos);
      this.scene.add(pointLight);
    });
  }

  generateLightPositions(x, y, z, distance) {
    const operations = [(v) => v + distance, (v) => v - distance, (v) => v];
    const positions = [];

    operations.forEach((opX) => {
      operations.forEach((opY) => {
        operations.forEach((opZ) => {
          positions.push([opX(x), opY(y), opZ(z)]);
        });
      });
    });

    return positions;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    const clock = new THREE.Clock();
    
    const loop = () => {
      requestAnimationFrame(loop);
      
      if (this.mixer) {
        const delta = clock.getDelta();
        this.mixer.update(delta);
      }
      
      if (this.controls) {
        this.controls.update();
      }
      
      this.renderer.render(this.scene, this.camera);
    };
    
    loop();
  }
}