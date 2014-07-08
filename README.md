# grape-particles

Particle system for Grape game engine

## Try

- Download and unzip https://github.com/zoltan-mihalyi/grape-particles/archive/master.zip
- Run example.html

## Use

### Define particles

You can define particles like in the code below.

```javascript
 var flame = Grape.Particles.particle('glow', [ //'circle' draws a circle, 'glow' draws a circle with 0 alpha at the corners. 
            {
                offset: 0, //first item must have offset=0.
                duration: [10, 30], //particle lives from 10 to 30 frames
                size: 0, //initial size is 0
                speed: [2, 4], //speed is between 2 and 4 pixel/frame 
                direction: [85, 95], //up. 0 degree means right
                gravity: 0.05, //gravity
                gravityDirection: 270, //down
                r: 255, //red component
                g: 40, //green component
                b: 10, //blue component
                a: 0.7, //alpha component
                composite: 'lighter' //addition drawing mode (ideal for light-like particles)
            },
            {
                offset: 15, //when time is at 15% of the full duration
                size: [2,14] //size should be 2 to 14 pixel (animated)
            },
            {
                offset: 70, //when time is at 70% of the full duration
                r: 255, //color is orange (animated)
                g: 165,
                b: 30
            },
            {
                offset: 100, //at the end
                size: 1, //size is 1
                r: 90, //color is gray
                g: 90,
                b: 90,
                a: 0 //alpha is 0
            }
        ]);
```

This compiles the particle, creating a frame function which can decide very fast the values of the attributes.

### Add particle system

The particle system handles the particles and the emitters. You have to add the particle system to your layer in order
to use it.

```javascript
var MyScene = Grape.Scene.extend({
    init: function () {
        this.addSystem('particles', new Grape.Particles.ParticleSystem());
    }
});
```

### Create emitters

Particles are emitted from emitters.

```javascript
particleSystem.createEmitter({
   x: 10,
   y: 20,
   shape: 'ellipse', //only ellipse is supported yet
   width: 24,
   height: 16,
   duration: Infinity, //emitter is destroyed after duration expires
   rate: 6, //particles/second. If smaller than 0, like 0.2, it will emit particle every 5th frame.
   particle: flame //reference to the compiled particle
});
```