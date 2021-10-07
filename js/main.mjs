import MainLoop from './utils/mainloop.mjs';
import * as THREE from './lib/three/build/three.module.js';
import { OrbitControls } from './lib/three/examples/jsm/controls/OrbitControls.js';

import hypermazeMeshMaker from './utils/hypermazeMeshMaker.mjs';
import maze3dMeshMaker from './utils/maze3dMeshMaker.mjs';
import freqBarMaker from './utils/freqBarMaker.mjs';

// Keyboard and Animation Loop managers
const mainloop = new MainLoop();

// THREE.JS Scene & camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: false, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.x = 240;
camera.position.z = 240;
camera.position.y = 240;

// THREE.JS Lights
scene.add(new THREE.AmbientLight('white', 0.7));
scene.add(new THREE.PointLight('white', 0.7));

// THREE.JS OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0;

// Lister to start it all.
document.querySelector('#play').addEventListener('click', init, { once: true });

function audioAnalyser(file) {
  const listener = new THREE.AudioListener();
  const audio = new THREE.Audio(listener);
  const loader = new THREE.AudioLoader();
  return new Promise(async (resolve, reject) => {
    const resolver = (buffer) => {
      // analyse tempo and peaks
      const chanData = getChannel(buffer);
      const mt = new MusicTempo(chanData);
      audio.setBuffer(buffer);
      audio.setVolume(0.5);
      const analyser = new THREE.AudioAnalyser(audio, 2048);
      resolve({audio, analyser, tempo: mt.bestAgent});
    };
    if (file.name) {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      resolver(audioBuffer);
    }
    loader.load(file, buffer => {
      resolver(buffer);
    }, v => 1, err => resolve(err));
  });
}

async function init() {
  document.querySelector('.synn-modal').classList.add('hidden');
  const song = document.querySelector('#chooseSong').value;
  const audioFileInput = document.getElementById('audio-file');

  const {audio, analyser, tempo} = await audioAnalyser(audioFileInput.files[0] ? audioFileInput.files[0] : song);

  let mazeOptions = {visible: false, nRows: 6, nCols: 6, nDepths: 6, cellSize: 5, color: '#f48e11'};
  let mazeMesh = hypermazeMeshMaker(mazeOptions);
  scene.add(mazeMesh);

  mazeOptions = {nRows: 15, nCols: 15, nDepths: 15, cellSize: 40, depth: 25, color: '#32373E'};
  let mazeMeshBackground = maze3dMeshMaker(mazeOptions);
  scene.add(mazeMeshBackground);

  let freqBar = freqBarMaker({nRows: 32, nCols: 32, cellSize: 5, color: '#3700B3'});
  let freqBar2 = freqBarMaker({nRows: 32, nCols: 32, cellSize: 5, color: '#3700B3'});
  freqBar2.rotateX(Math.PI);
  freqBar2.translateZ(-160);
  scene.add(freqBar, freqBar2);

  const nTimes = mazeMesh.children.length / tempo.events.length;
  // order by distance to center
  const randomChilds = [...mazeMesh.children].sort((m1, m2) => m1.userData - m2.userData);
  let indRnd = 0;
  for (const beatTime of tempo.events) {
    setTimeout(() => {
      for (let i = 0; i<nTimes; i++) {
        if (indRnd >= randomChilds.length) return;
        randomChilds[indRnd].visible = true;
        indRnd++;
      }
    }, beatTime * 1000);
  }

  mainloop.setUpdate((dt, elapsedT) => {
    const average = analyser.getAverageFrequency();
    const frequency = analyser.getFrequencyData();
    controls.autoRotateSpeed = Math.min(0.5, average/80);

    let scale = Math.min(1, Math.sqrt(average/4));
    for (const [i, freq] of frequency.entries()) {
      let scale = freq/10;
      freqBar.children[i].visible = scale > 0;
      freqBar2.children[i].visible = scale > 0;
      freqBar.children[i].scale.set(1, scale, 1);
      freqBar2.children[i].scale.set(1, scale, 1);
    }

    controls.update();
    renderer.render(scene, camera);
  });

  document.querySelector('#analyse').classList.add('hidden');
  document.body.appendChild(renderer.domElement);
  mainloop.start();
  audio.play();
}

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize( width, height );
}

function getChannel(buffer) {
  if (buffer.numberOfChannels == 1) {
    return buffer.getChannelData(0);
  }
  const chan1 = buffer.getChannelData(0);
  const chan2 = buffer.getChannelData(1);
  return chan1.map((val, i) => (val + chan2[i]) / 2);
}

function shuffle(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}