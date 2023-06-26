import * as PIXI from 'pixi.js';

const app = new PIXI.Application({ background: '#a2e5f4' });
document.body.appendChild(app.view);

let plane = null;

PIXI.Assets.load('sample.png').then((texture) => {
    plane = new PIXI.SimplePlane(texture, 100, 100);

    plane.x = 100;
    plane.y = 100;

    app.stage.addChild(plane);

    // Get the buffer for vertice positions.

    console.log(plane.verticesBuffer);
    console.log(plane.uvBuffer);

    // Listen for animate update
    // let timer = 0;
    // app.ticker.add(() => {
    //     // Randomize the vertice positions a bit to create movement.
    //     for (let i = 0; i < buffer.data.length; i++) {
    //         buffer.data[i] += Math.sin((timer / 10) + i) * 0.5;
    //     }
    //     buffer.update();
    //     timer++;
    // });
});

const pointerMove = (e) => {
  if (plane) {
    let m1, m2;
    const m = Math.min(e.clientX, 512);
    if (m < 256) {
      m1 = (Math.abs(256 - m) / 256) / 10 + 1;
      m2 = (Math.abs(256 - m) / 256) / 20 + 1;
    } else {
      m1 = (Math.abs(256 - m) / 256) / 20 + 1;
      m2 = (Math.abs(256 - m) / 256) / 10 + 1;
    }

    const buffer = plane.verticesBuffer;
    for (let i = 0 ; i < 100; i ++) {
      for (let j = 0; j < 100; j ++) {
        const x = (i * 100 + j) * 2;
        const y = (i * 100 + j) * 2 + 1;

        const c = j / 50 * 256;

        if (j < 50) {
          buffer.data[x] = 256 - (256 - c) / m1;
        } else {
          buffer.data[x] = 256 - (256 - c) / m2;
        }
      }
    }

    buffer.update();
  }
}

document.body.addEventListener('mousemove',pointerMove);