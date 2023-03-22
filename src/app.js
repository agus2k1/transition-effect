import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import fragment from '../shaders/fragment.glsl.js';
import vertex from '../shaders/vertex.glsl.js';
import t1 from '../images/t1.jpg';
import t2 from '../images/t2.jpg';
import t3 from '../images/t3.jpg';
import mask from '../images/mask2.jpg';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CurtainShader } from './effects/effect-1';
import { RGBAShader } from './effects/effect-2';

export default class Sketch {
  constructor() {
    this.container = document.getElementById('container');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.useLegacyLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.aspect = this.width / this.height;
    this.camera.position.set(0, 0, 900);
    this.scene = new THREE.Scene();

    this.mouse = new THREE.Vector2();
    this.mouseTarget = new THREE.Vector2();
    this.time = 0;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.initPost();
    this.addMesh();
    this.events();
    this.settings();
    this.render();
  }

  initPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(this.width, this.height);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.effectPass1 = new ShaderPass(CurtainShader);
    this.composer.addPass(this.effectPass1);

    this.effectPass2 = new ShaderPass(RGBAShader);
    this.composer.addPass(this.effectPass2);
  }

  addMesh() {
    this.maskTexture = new THREE.TextureLoader().load(mask);
    this.texturesArray = [t1, t2, t3];
    this.textures = this.texturesArray.map((t) =>
      new THREE.TextureLoader().load(t)
    );
    this.geometry = new THREE.PlaneGeometry(1920, 1080, 1, 1);

    this.groups = [];

    this.textures.forEach((t, j) => {
      let group = new THREE.Group();
      this.scene.add(group);
      this.groups.push(group);

      for (let i = 0; i < 3; i++) {
        let material = new THREE.MeshBasicMaterial({
          map: t,
        });

        if (i > 0) {
          material = new THREE.MeshBasicMaterial({
            map: t,
            alphaMap: this.maskTexture,
            transparent: true,
          });
        }

        let mesh = new THREE.Mesh(this.geometry, material);
        mesh.position.z = (i + 1) * 100;

        group.add(mesh);
        group.position.x = j * 2500;
      }
    });
  }

  events() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.screenX / window.innerWidth - 0.55;
      this.mouse.y = e.screenY / window.innerHeight - 0.7;
    });
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
      progress2: 0,
      runAnimation: () => {
        this.runAnimation();
      },
    };
    this.gui = new GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.01);
    this.gui.add(this.settings, 'progress2', 0, 1, 0.01).onChange((value) => {
      this.effectPass.uniforms.uProgress.value = value;
    });
    this.gui.add(this.settings, 'runAnimation', 0, 1, 0.01);
  }

  runAnimation() {
    let tl = gsap.timeline();

    tl.to(this.camera.position, {
      x: 2500,
      duration: 1.5,
      ease: 'power4.inOut',
    });
    tl.to(
      this.camera.position,
      {
        z: 700,
        duration: 1,
        ease: 'power4.inOut',
      },
      0
    );
    tl.to(
      this.camera.position,
      {
        z: 900,
        duration: 1,
        ease: 'power4.inOut',
      },
      1
    );

    // Effect 1
    tl.to(
      this.effectPass1.uniforms.uProgress,
      {
        value: 1,
        duration: 1,
        ease: 'power3.inOut',
      },
      0
    );
    tl.to(
      this.effectPass1.uniforms.uProgress,
      {
        value: 0,
        duration: 1,
        ease: 'power3.inOut',
      },
      1
    );

    // Effect 2
    tl.to(
      this.effectPass2.uniforms.uProgress,
      {
        value: 1,
        duration: 1,
        ease: 'power3.inOut',
      },
      0
    );
    tl.to(
      this.effectPass2.uniforms.uProgress,
      {
        value: 0,
        duration: 1,
        ease: 'power3.inOut',
      },
      1
    );
  }

  render() {
    this.time += 0.05;
    this.oscilator = Math.sin(this.time * 0.1) * 0.5 + 0.5;

    this.mouseTarget.lerp(this.mouse, 0.1);

    this.groups.forEach((group) => {
      group.rotation.x = -this.mouseTarget.y * 0.1;
      group.rotation.y = -this.mouseTarget.x * 0.1;

      group.children.forEach((mesh, i) => {
        mesh.position.z = (i + 1) * 100 - this.oscilator * 200;
      });
    });

    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
