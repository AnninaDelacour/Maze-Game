const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Mouse,
  MouseConstraint,
  Composites,
  Common
} = Matter;

const width = 1000;
const height = 650;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

//Walls

const walls = [
  Bodies.rectangle(500, 0, 1000, 30, { isStatic: true }),
  Bodies.rectangle(500, 650, 1000, 30, { isStatic: true }),
  Bodies.rectangle(0, 325, 30, 650, { isStatic: true }),
  Bodies.rectangle(1000, 325, 30, 650, { isStatic: true }),
];
World.add(world, walls);

//Random Shapes

// for (let i = 0; i < 30; i++) {
//   if (Math.random() > 0.5) {
//     World.add(
//       world,
//       Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
//     );
//   } else {
//     World.add(
//       world,
//       Bodies.circle(Math.random() * width, Math.random() * height, 30, {
//         render: {
//           fillStyle: "",
//         },
//       })
//     );
//   }
// }



//Polygon Shape

const shape = Bodies.polygon(40, 40, 12, 100, {
   isStatic: false,
   render: {
     sprite: {
      texture: 'banana.png',
      xScale: .2,
      yScale: .2
     }
   }
  });

World.add(world, shape);


//Banana Ball Shape

// const banana = Bodies.circle(40, 40, 5, {
//   isStatic: false,
//   render: {
//     sprite: {
//       texture: './banana.png',
//       xScale: .2,
//       yScale: .2
//     }
//   }
// });

// World.add(world, banana);
