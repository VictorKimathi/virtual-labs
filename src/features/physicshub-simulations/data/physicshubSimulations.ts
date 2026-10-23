import type { PhysicshubSimulation } from "../physicshub.types";

// Generated from physicshub.github.io app/(core)/data/chapters.js (internal tools excluded).
export const physicshubSimulations: PhysicshubSimulation[] = [
  {
    id: "BouncingBall",
    title: "Bouncing Ball",
    description:
      "Simulation of the ball bouncing off the walls. A playful first look at motion, speed and collisions — suited for middle school and even younger explorers.",
    level: "lowerSecondary",
    alsoFor: ["elementary"],
    difficulty: "core",
    topics: ["Kinematics", "Collision"],
    thumbnail: "/thumbnails/bouncing-ball.webp",
  },
  {
    id: "VectorsOperations",
    title: "Vector Operations Calculator",
    description:
      "Interactive 2D vector calculator — visualize addition, subtraction, and dot products in real time. The standard high-school tool for students learning vector physics.",
    level: "upperSecondary",
    alsoFor: ["lowerSecondary"],
    difficulty: "core",
    topics: ["Math", "Vectors", "Trigonometry"],
    thumbnail: "/thumbnails/vector-operations.webp",
  },
  {
    id: "BallAcceleration",
    title: "Ball Acceleration",
    description:
      "Simulate a ball accelerating toward your cursor in real time. Explore velocity and uniform acceleration, a core topic from middle-school physics onward — free online.",
    level: "lowerSecondary",
    alsoFor: ["upperSecondary"],
    difficulty: "core",
    topics: ["Kinematics", "Acceleration"],
    thumbnail: "/thumbnails/ball-acceleration.webp",
  },
  {
    id: "BallGravity",
    title: "Ball Gravity",
    description:
      "Watch a ball fall and bounce under gravity and external forces in real time. Adjust mass, elasticity, and gravitational force to explore Newton's laws — free interactive simulation for high-school physics.",
    level: "upperSecondary",
    alsoFor: ["lowerSecondary"],
    difficulty: "core",
    topics: ["Dynamics", "Gravity", "Collision"],
    thumbnail: "/thumbnails/ball-gravity.webp",
  },
  {
    id: "SpringConnection",
    title: "Spring Mass System Simulator",
    description:
      "Explore Hooke's Law and Simple Harmonic Motion interactively. Adjust mass and spring constant to visualize oscillations and energy conservation — an extended high-school (A-Level) topic.",
    level: "upperSecondary",
    alsoFor: ["lowerSecondary"],
    difficulty: "extended",
    topics: ["Dynamics", "Springs", "Oscillations"],
    thumbnail: "/thumbnails/spring-mass.webp",
  },
  {
    id: "SimplePendulum",
    title: "Simple Pendulum Simulation",
    description:
      "Simulate a pendulum and calculate its period and frequency in real time. Explore how length, gravity, and energy are related, in a standard high-school topic — free interactive physics tool.",
    level: "upperSecondary",
    alsoFor: ["lowerSecondary"],
    difficulty: "core",
    topics: ["Dynamics", "Oscillations", "Energy"],
    thumbnail: "/thumbnails/simple-pendulum.webp",
  },
  {
    id: "ParabolicMotion",
    title: "Projectile & Parabolic Motion",
    description:
      "Simulate projectile motion and predict trajectory, range, and max height instantly. A staple of high-school kinematics — interactive parabolic motion calculator, free online.",
    level: "upperSecondary",
    alsoFor: [],
    difficulty: "core",
    topics: ["Kinematics", "Gravity", "Math"],
    thumbnail: "/thumbnails/projectile.webp",
  },
  {
    id: "InclinedPlane",
    title: "Inclined Plane",
    description:
      "Simulate a block sliding down an inclined plane with friction. Adjust angle, mass, and surface to explore forces and Newton's laws — a core high-school dynamics experiment.",
    level: "upperSecondary",
    alsoFor: [],
    difficulty: "core",
    topics: ["Dynamics", "Forces", "Friction"],
    thumbnail: "/thumbnails/incline-plane.webp",
  },
  {
    id: "CircularMotion",
    title: "Circular Motion",
    description:
      "Simulate uniform circular motion in real time. Visualize velocity and centripetal acceleration vectors while adjusting radius and speed — an extended high-school to first-year university topic.",
    level: "upperSecondary",
    alsoFor: ["undergraduate"],
    difficulty: "extended",
    topics: ["Dynamics", "Kinematics", "Vectors"],
    thumbnail: "/thumbnails/circular.webp",
  },
  {
    id: "ThreeBody",
    title: "Three Body Problem",
    description:
      "Simulate a classic physics problem of three bodies operating under the gravity of each other. A numerically advanced topic aimed at university level (and keen high-school students).",
    level: "undergraduate",
    alsoFor: ["upperSecondary"],
    difficulty: "advanced",
    topics: ["Gravity", "Kinematics", "Forces"],
    thumbnail: "/thumbnails/three-body.webp",
  },
  {
    id: "HorizontalSpring",
    title: "Horizontal Spring",
    description:
      "A spring attached to the left wall with a draggable mass. Explore Hooke's Law and oscillation on a horizontal plane — approachable from middle school, standard in high school.",
    level: "upperSecondary",
    alsoFor: ["lowerSecondary"],
    difficulty: "core",
    topics: ["Dynamics", "Springs", "Oscillations"],
    thumbnail: "/thumbnails/horizontal-spring.webp",
  },
  {
    id: "DoublePendulum",
    title: "Double Pendulum",
    description:
      "Simulate a double pendulum and explore chaotic motion. Watch how small changes in initial conditions lead to completely different trajectories — a classic university-level example of chaos theory.",
    level: "undergraduate",
    alsoFor: [],
    difficulty: "advanced",
    topics: ["Dynamics", "Oscillations", "Energy"],
    thumbnail: "/thumbnails/double-pendulum.webp",
  },
  {
    id: "CollisionSimulation",
    title: "1D Collision simulation",
    description:
      "Simulate 1D elastic collisions with velocity vectors, momentum, and kinetic energy visualization — a core momentum topic in high-school physics.",
    level: "upperSecondary",
    alsoFor: ["lowerSecondary"],
    difficulty: "core",
    topics: ["Collision", "Vectors"],
    thumbnail: "/thumbnails/1d-collision.webp",
  },
  {
    id: "PiCollisions",
    title: "Pi From Collisions",
    description:
      "Simulate two colliding blocks of different masses to derive pi. A beautiful conservation-law puzzle for university students (and gifted high-schoolers): adjust the mass of the larger block by a power of 100 to see further precision of pi.",
    level: "undergraduate",
    alsoFor: ["upperSecondary"],
    difficulty: "extended",
    topics: ["Math", "Forces", "Dynamics"],
    thumbnail: "/thumbnails/pi.webp",
  },
  {
    id: "TrigonometricCircle",
    title: "Trigonometric Circle",
    description:
      "Interactive unit circle with a draggable angle θ. Visualize sin, cos, tan, cot, sec and csc as circle segments, watch the generalized wave A·sin(ωθ+φ) plot in real time, and trace the inverse functions arcsin, arccos, arctan and arccot — a bridge from middle-school geometry to high-school trig.",
    level: "lowerSecondary",
    alsoFor: ["upperSecondary"],
    difficulty: "core",
    topics: ["Math", "Trigonometry"],
    thumbnail: "/thumbnails/trigonometric-circle.webp",
  },
  {
    id: "RayTracing",
    title: "Ray Tracing",
    description:
      "Follow a single ray of light from a camera into a 3D scene and watch a real ray tracer colour each pixel. Drag the camera, sphere and light to see the ray–sphere quadratic, Lambert's cosine law, the inverse-square law, shadows and the law of reflection update live.",
    level: "undergraduate",
    alsoFor: ["upperSecondary"],
    difficulty: "core",
    topics: ["Optics", "Vectors"],
    thumbnail: "/thumbnails/ray-tracing.webp",
  },
  {
    id: "KirchhoffCircuit",
    title: "Kirchhoff's Circuit Laws",
    description:
      "Build and solve DC circuits online: single loop, series, parallel and a two-loop network with two cells. Watch charge flow, drag a voltmeter and an ammeter onto the circuit, and see Kirchhoff's current and voltage laws balance to zero in real time.",
    level: "upperSecondary",
    alsoFor: ["lowerSecondary"],
    difficulty: "extended",
    topics: ["Electromagnetism", "Energy"],
    thumbnail: "/thumbnails/kirchhoff-circuit.webp",
  },
];
