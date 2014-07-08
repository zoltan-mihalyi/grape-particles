(function () {

    var emitterShapes = {};
    var particleShapes = {};

    var ATTR_IDS = { //duration,speed,dir, gravity, gravity, gdir: only first
        size: 2,
        r: 7,
        g: 8,
        b: 9,
        a: 10
    };

    function toHex(i) {
        return (i < 16 ? '0' : '') + (i | 0).toString(16);
    }

    function addEmitterShape(name, fn) {
        emitterShapes[name] = fn;
    }

    function addParticleShape(name, fn) {
        particleShapes[name] = fn;
    }

    function pick(value) {
        var v0;
        if (value.length) {
            v0 = value[0];
            if (typeof v0 === 'number') {
                return v0 + Math.random() * (value[1] - v0); //interval
            } else {
                return value[Math.random() * value.length >> 0]; //pick a string
            }
        } else {
            return value;
        }
    }

    function pickValues(orig) {
        var result = [];
        for (var i = 0; i < orig.length; i++) {
            result.push(pick(orig[i]));
        }
        return result;
    }

    function createFirstStop(orig) {
        var stop = {};
        stop.offset = 0;
        stop.duration = orig.duration || Infinity;
        stop.size = orig.size === undefined ? 1 : orig.size;
        stop.speed = orig.speed || 0;
        stop.direction = orig.direction || 0
        stop.gravity = orig.gravity || 0;
        stop.gravityDirection = orig.gravityDirection || 0;
        stop.r = orig.r || 0;
        stop.g = orig.g || 0;
        stop.b = orig.b || 0;
        stop.a = orig.a === undefined ? 1 : orig.a
        return stop;
    }

    function createFrame(intervals) {
        var fn = 'var values = this.values, percent =this[0]/this[1]*100;\n';

        var sortedIntervals = [];

        for (var i in intervals) {
            sortedIntervals.push(intervals[i]);
        }
        sortedIntervals = sortedIntervals.sort(function (e) {
            return e.to;
        });

        for (var i = 0; i < sortedIntervals.length; i++) {
            var interval = sortedIntervals[i];
            var attrs = interval.attrs;
            fn += 'if(percent<=' + interval.from + '){\n';
            for (var j = 0; j < attrs.length; j++) {
                var attr = attrs[j];
                fn += '    this[' + attr.attr + '] = values[' + attr.fromValueId + '];\n';
            }
            fn += '} else if(percent<=' + interval.to + '){\n';
            for (var j = 0; j < attrs.length; j++) {
                var attr = attrs[j];
                fn += '    this[' + attr.attr + '] = (percent-' + interval.from + ')/(' + interval.to + '-' + interval.from + ')*(values[' + attr.toValueId + ']-values[' + attr.fromValueId + ']) + values[' + attr.fromValueId + ']\n';
            }
            fn += '};';
        }

        fn += 'this[3]+=this[5];\n'; //speedX
        fn += 'this[4]+=this[6];\n'; //speedY
        fn += 'this[11]+=this[3];\n'; //x
        fn += 'this[12]+=this[4];\n'; //y

        return new Function('', fn);
    }

    function particle(shape, stops) {
        var intervals = {},//0-100: {from: 0, to: 100, attrs:[{attr:'size', valueId:}]}
            attrLastChanged = {},//size: {offset:10, valueId:0}
            values = [],
            i, j, stop, key, valueId, interval, from, fromOffset, offset, init, frame, attrs, firstStop;

        for (i = 0; i < stops.length; i++) {
            if (i === 0) {
                stop = firstStop = createFirstStop(stops[i]);
            } else {
                stop = stops[i];
            }
            offset = stop.offset;
            for (j in stop) {
                if (j !== 'offset') {
                    valueId = values.push(stop[j]) - 1;

                    from = attrLastChanged[j];
                    if (from !== undefined) { //property was defined before
                        fromOffset = from.offset;
                        key = fromOffset + '-' + offset;
                        interval = intervals[key];
                        attrs = {attr: ATTR_IDS[j], fromValueId: from.valueId, toValueId: valueId};
                        if (interval) {
                            interval.attrs.push(attrs);
                        } else {
                            intervals[key] = {from: fromOffset, to: offset, attrs: [attrs]};
                        }
                    }
                    attrLastChanged[j] = {offset: offset, valueId: valueId};
                }
            }
        }

        frame = createFrame(intervals);

        init = function (particle) {
            particle.values = pickValues(values);
            particle[0] = 0;
            particle[1] = pick(stops[0].duration || 10) | 0;

            var speed = pick(firstStop.speed);
            var direction = pick(firstStop.direction);
            particle[3] = Math.cos(direction / 180 * Math.PI) * speed;
            particle[4] = -Math.sin(direction / 180 * Math.PI) * speed;


            var gravity = pick(firstStop.gravity);
            var gravityDirection = pick(firstStop.gravityDirection);
            particle[5] = Math.cos(gravityDirection / 180 * Math.PI) * gravity;
            particle[6] = -Math.sin(gravityDirection / 180 * Math.PI) * gravity;

            particle[2] = pick(firstStop.size); //TODO dont pick 2 times
            particle[7] = pick(firstStop.r);
            particle[8] = pick(firstStop.g);
            particle[9] = pick(firstStop.b);
            particle[10] = pick(firstStop.a);

            particle.composite = stops[0].composite || 'source-over';
        };

        return [init, frame, particleShapes[shape]];
    }

    var createParticle;

    if (typeof ArrayBuffer === 'function') {
        createParticle = function () {
            var arr = new ArrayBuffer(56); //4*14
            return new Float32Array(arr);
        }
    } else {
        createParticle = function () {
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
    }


    var Emitter = Grape.Class('Emitter', {
        init: function (opts) {
            if (!opts.particle) {
                throw new Error('"particle" option is missing.');
            }
            this.particle = opts.particle;
            this.shape = opts.shape || 'rectangle';
            this.x = opts.x || 0;
            this.y = opts.y || 0;
            this.width = opts.width || 0;
            this.height = opts.height || 0;
            this.duration = opts.duration || Infinity;
            this.rate = opts.rate || 1;
            this.delayed = 0;
            this.speedX = opts.speedX || 0;
            this.speedY = opts.speedX || 0;
        },
        remove: function () {
            var moved = this._system.emitters.remove(this._index);
            if (moved) {
                moved._index = this._index;
            }
        }
    });

    var ParticleSystem = Grape.Class('ParticleSystem', Grape.System, {
        init: function () {
            this.particles = new Grape.Bag();
            this.emitters = new Grape.Bag();
        },
        createEmitter: function (opts) {
            var emitter = new Emitter(opts);
            emitter._index = this.emitters.add(emitter) - 1;
            emitter._system = this;
            return emitter;
        },
        'event frame': function () {
            var emitters = this.emitters,
                particles = this.particles,
                length, i, emitter, pos, particle;

            for (i = 0, length = emitters.length; i < length; i++) {
                emitter = emitters[i];


                emitter.delayed += emitter.rate;
                while (emitter.delayed > 0) {
                    emitter.delayed--;
                    pos = emitterShapes[emitter.shape]();
                    particle = createParticle();
                    emitter.particle[0](particle); //init
                    particle[11] = emitter.x + pos[0] * emitter.width; //x
                    particle[12] = emitter.y + pos[1] * emitter.height; //y
                    particle[3] += emitter.speedX;
                    particle[4] += emitter.speedY;
                    particle.frame = emitter.particle[1];
                    particle.render = emitter.particle[2];
                    this.particles.push(particle);
                }


                if (--emitter.duration <= 0) {
                    emitter.remove();
                    length--;
                    i--;
                }
            }


            for (i = 0, length = particles.length; i < length; i++) {
                particle = particles[i];
                particle.frame();
                if (++particle[0] >= particle[1]) {
                    particles.remove(i);
                    length--;
                    i--;
                }
            }
        },
        'event render': function (ctx) {
            var particles = this.particles,
                i, length, particle, color;
            for (i = 0, length = particles.length; i < length; i++) {
                particle = particles[i];
                ctx.globalCompositeOperation = particle.composite;
                ctx.globalAlpha = particle[10];
                color = '#' + toHex(particle[7]) + toHex(particle[8]) + toHex(particle[9]);
                particle.render(ctx, particle[11], particle[12], particle[2], color);
            }
        }
    });


    addEmitterShape('ellipse', function () {
        var angle = Math.random() * Math.PI * 2;
        var r = Math.sqrt(Math.random());
        return [Math.cos(angle) * r / 2 + 0.5, Math.sin(angle) * r / 2 + 0.5];
    });

    addEmitterShape('point', function () {
        return [0, 0];
    });

    addEmitterShape('rectangle', function () {
        return [Math.random(), Math.random()];
    });

    addParticleShape('circle', function (ctx, x, y, size, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, size / 2, 0, Math.PI * 2, false);
        ctx.fill();
    });


    addParticleShape('glow', function (ctx, x, y, size, color) {
        var gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(' + (this[7] | 0) + ',' + (this[8] | 0) + ',' + (this[9] | 0) + ',0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, size / 2, 0, Math.PI * 2, false);
        ctx.fill();
    });


    Grape.Particles = {
        ParticleSystem: ParticleSystem,
        particle: particle,
        addEmitterShape: addEmitterShape,
        addParticleShape: addParticleShape
    };
})();