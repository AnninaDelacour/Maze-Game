const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 20;
const cellsVertical = 20;
const width = window.innerWidth;
const height = window.innerHeight;




const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height,
    background: "transparent",
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls

const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true}),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, width, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, width, { isStatic: true }), 
];
World.add(world, walls);

//Maze generation

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temporary = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temporary;
  }

  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
  //If cell is visited at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  //Cell is visited (marked as true)
  grid[row][column] = true;

  //Assemble randomly-ordered list of neighbours
  const neighbours = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  //For each neighbour
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;

    //See if neighbour is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }

    //If neighbour is visited by us, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    //Remove wall from either horizontals or verticals
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }

  //Visit next cell (call stepThroughCall)
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      10,
      {
        label: "wall",
        isStatic: true,
        chamfer: {
          radius: 5
        },
        render: {
          fillStyle: 'rgba(50, 38, 100, 0.85)'
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      10,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        chamfer: {
          radius: 5
        },
        render: {
          fillStyle: 'rgba(163, 62, 122, 0.85)'
        }
      }
    );
    World.add(world, wall);
  });
});

//Goal

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * .7,
  unitLengthY * .7,
  {
    label: "goal",
    isStatic: true,
    render: {
      sprite: {
        texture: "cute_moon.png",
        xScale: 0.045,
        yScale: 0.045,
      },
      // fillStyle: "#8D5658",
    },
  }
);
World.add(world, goal);

//Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    sprite: {
      texture: "cute_star.png",
      xScale: 0.06,
      yScale: 0.06,
    },
  },
  // render: {
  //   fillStyle: "#332142",
  // },
});
World.add(world, ball);

document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;

  if (event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  if (event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

//Win Condition

let gameEnded = false;
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    console.log("Collision happened");

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label) &&
      !gameEnded
    ) {
      gameEnded = true;
      document.querySelector(".winner").classList.remove("hidden");
      const audio = new Audio("fine_aShamaluevMusic.mp3");
      audio.play();
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
