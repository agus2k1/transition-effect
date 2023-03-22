import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import t1 from './images/t1.jpg';
import t2 from './images/t2.jpg';
import t3 from './images/t3.jpg';
import mask from './images/mask2.jpg';
import fragment from './shaders/fragment.glsl.js';
import vertex from './shaders/vertex.glsl.js';

export default class Sketch {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.useLegacyLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container = document.getElementById('container');
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    this.camera.position.set(0, 0, 900);
    this.scene = new THREE.Scene();

    this.mouse = new THREE.Vector2();
    this.mouseTarget = new THREE.Vector2();
    this.time = 0;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.addMesh();
    this.events();
    this.render();
  }

  addMesh() {
    // this.material = new THREE.ShaderMaterial({
    //   fragmentShader: fragment,
    //   vertexShader: vertex,
    //   uniforms: {
    //     time: { type: 'f', value: 0 },
    //   },
    //   extensions: {
    //     derivatives: '#extension GL_OES_standard_derivatives : enable',
    //   },

    // });
    this.texturesArray = [t1, t2, t3];
    this.maskTexture = new THREE.TextureLoader().load(mask);
    this.textures = this.texturesArray.map((t) =>
      new THREE.TextureLoader().load(t)
    );
    this.geometry = new THREE.PlaneGeometry(1920, 1080, 1, 1);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    for (let i = 0; i < 3; i++) {
      let material = new THREE.MeshBasicMaterial({
        map: this.textures[2],
      });

      if (i > 0) {
        material = new THREE.MeshBasicMaterial({
          map: this.textures[2],
          alphaMap: this.maskTexture,
          transparent: true,
        });
      }

      let mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.z = (i + 1) * 100;

      this.group.add(mesh);
    }

    // this.geometry = new THREE.PlaneGeometry(1920, 1080, 1, 1);

    // this.plane = new THREE.Mesh(this.geometry, this.material);
    // this.scene.add(this.plane);
  }

  events() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.screenX / window.innerWidth - 0.55;
      this.mouse.y = e.screenY / window.innerHeight - 0.7;
    });
  }

  render() {
    this.time++;

    this.mouseTarget.lerp(this.mouse, 0.05);

    this.group.rotation.x = -this.mouseTarget.y * 0.1;
    this.group.rotation.y = -this.mouseTarget.x * 0.1;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
