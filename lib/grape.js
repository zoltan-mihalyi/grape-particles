/*!
    Grape.js JavaScript game engine
    (c) 2012-2014 Zoltan Mihalyi.
 https://github.com/zoltan-mihalyi/grape/blob/master/MIT-LICENSE.txt
 */
/*jshint unused:false*/ //originalRequire
(function (factory) {
    var Grape = factory(typeof require !== 'undefined' ? require : null);
    if (typeof module === "object" && typeof module.exports === "object") { //node module
        module.exports = Grape;
    } else { //global object
        this.Grape = Grape;
    }
    if (typeof define === 'function' && define.amd) { //amd module loader
        define([], function () {
            return Grape;
        });
    }
}(function (originalRequire) { //todov2 don't use this?
/*
 * A small implementation of amd module loader, used in the built file
 */
var require, define;
(function () {
    "use strict";
    /*jshint -W020 */ //redefine require
    var STRING_TYPE = '[object String]';
    var defined = {};
    var waiting = {};

    var hasOwn = Object.prototype.hasOwnProperty;
    var hasProp = function (obj, prop) {
        return hasOwn.call(obj, prop);
    };
    define = function (name, deps, callback) {
        if (hasProp(defined, name) || hasProp(waiting, name)) {
            throw new Error('Already defined: ' + name);
        }
        waiting[name] = [deps, callback];
    };

    var loadTree = function (name) {
        var w, deps, args, i;
        if (hasProp(defined, name)) {
            return;
        }
        if (hasProp(waiting, name)) {
            w = waiting[name];
            deps = w[0];
            args = [];
            for (i = 0; i < deps.length; ++i) {
                loadTree(deps[i]);
                args[i] = defined[deps[i]];
            }
            defined[name] = w[1].apply({}, args);
        }
    };

    require = function (deps, callback) {
        var i = 0, n, modules = [], global = (function () {
            return this;
        })();
        if (Object.prototype.toString.call(deps) === STRING_TYPE) {
            deps = [deps];
        }
        for (n = deps.length; i < n; ++i) {
            loadTree(deps[i]);
            modules[i] = defined[deps[i]];
        }
        if (callback) {
            callback.apply(global, modules);
        } else {
            return defined[deps[0]];
        }

    };
})();

define('m1', [], function () {
    /**
     * Environment information
     *
     * @class Grape.Env
     * @static
     */
    return {
        /**
         * Is the current environment a browser?
         *
         * @type boolean
         * @property browser
         * @static
         */
        browser: typeof window !== 'undefined',
        /**
         * Is the current environment node.js?
         *
         * @type boolean
         * @property node
         * @static
         */
        node: typeof process === 'object' && typeof process.env === 'object'
    };
});
define('m2', ['m1'], function (Env) {
    var objToString = Object.prototype.toString;

    var addEventListener, removeEventListener, domContains;

    if (Env.browser) {
        if (typeof window.addEventListener === 'function') { //TODOv2 get real event object in listeners, with which, preventDefault, target...
            /**
             * Adds an event listener to a DOM element.
             *
             * @static
             * @method addEventListener
             * @param {HTMLElement} el DOM element
             * @param {String} ev Event name
             * @param {Function} fn Event handler
             */
            addEventListener = function (el, ev, fn) {
                el.addEventListener(ev, fn, false);
            };
            /**
             * Removes an event listener from a DOM element.
             *
             * @static
             * @method removeEventListener
             * @param {HTMLElement} el DOM element
             * @param {String} ev Event name
             * @param {Function} fn Event handler
             */
            removeEventListener = function (el, ev, fn) {
                el.removeEventListener(ev, fn, false);
            };
        } else if (document.attachEvent) {
            addEventListener = function (el, ev, fn) {
                el.attachEvent('on' + ev, fn);
            };
            removeEventListener = function (el, type, fn) {
                el.detachEvent('on' + type, fn);
            };
        }

        if (document.documentElement.contains) {
            /**
             * Decides whether a DOM element contains an other one
             *
             * @static
             * @method domContains
             * @param {HTMLElement} a The container element
             * @param {HTMLElement} b The contained element
             *
             * @return {boolean} true if the first element contains the second
             */
            domContains = function (a, b) {
                return b.nodeType !== 9 && a !== b && (a.contains ? a.contains(b) : true);
            };
        } else if (document.documentElement.compareDocumentPosition) {
            domContains = function (a, b) {
                return !!(a.compareDocumentPosition(b) + 0 & 16);
            };
        }
    }

    /**
     * Utility class.
     *
     * @static
     * @class Grape.Utils
     */
    return {
        /**
         * Decides whether an object is an array.
         *
         * @static
         * @method isArray
         * @param {*} obj The object to test
         * @return {boolean} true, if the object is an array
         */
        isArray: function (obj) {
            return objToString.call(obj) === '[object Array]';
        },
        /**
         * Decides whether an object is a function.
         *
         * @static
         * @method isFunction
         * @param {*} obj The object to test
         * @return {boolean} true, if the object is a function
         */
        isFunction: function (obj) {
            return objToString.call(obj) === '[object Function]';
        },
        /**
         * Copies properties to an object from an other object.
         *
         * @static
         * @method extend
         * @param {Object} target The properties are copied to this object.
         * @param {Object} options The properties are copied from this object
         */
        extend: function (target, options) {
            var i;
            for (i in options) {
                target[i] = options[i];
            }
        },
        /**
         * Finds an element in an array and removes it.
         *
         * @static
         * @method removeFromArray
         * @param {Array} array The array
         * @param {*} element The element to remove
         * @return {boolean} true, if the item was found and removed
         */
        removeFromArray: function (array, element) {
            var index = array.indexOf(element);
            if (index !== -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
            //TODOv2 IE8 fallback
        },
        /**
         * Decides whether an array contains an element.
         *
         * @static
         * @method arrayContains
         * @param {Array} array The array
         * @param {*} element The element to find
         * @return {boolean} true, if found
         */
        arrayContains: function (array, element) {
            return array.indexOf(element) !== -1;
            //TODOv2 IE8 fallback
        },
        /**
         * Sends an AJAX request
         *
         * @static
         * @method ajax
         * @param {String} url Request url
         * @param {Object} [opts] Options AJAX options
         * @param {Boolean} [opts.async] The request is asynchronous
         * @param {String} [opts.responseType] the XHR responseType
         * @param {Function} onSuccess Success event handler. The parameter is the response text.
         * @param {Function} onError Error callback
         */
        ajax: function (url, opts, onSuccess, onError) { //TODOv2 browser compatibility
            if (typeof opts === 'function') { //no opts given
                onError = onSuccess;
                onSuccess = opts;
                opts = {};
            }
            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                if ((xhr.responseType === 'blob' || xhr.responseType === 'arraybuffer') && xhr.response !== undefined) {
                    onSuccess(xhr.response);
                } else {
                    onSuccess(xhr.responseText);
                }
            };
            xhr.onerror = function () {
                onError();
            };
            xhr.open('get', url, opts.async === undefined ? true : opts.async);

            if (opts.responseType) {
                xhr.responseType = opts.responseType;
            }

            xhr.send();
        },
        /**
         * Parses a JSON document
         *
         * @method parseJSON
         * @static
         * @param {String} str The document
         * @return {*} The JSON object
         */
        parseJSON: function (str) {
            return JSON.parse(str); //TODOv2 fallback
        },
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        domContains: domContains //TODOv2 DOM namespace
    };
});
define('m3', ['m2'], function (Utils) {
    var nextId = 0;
    var registeredKeywords = {};

    /**
     * A fake class to represent default class methods
     *
     * @class Grape.Object
     */
    var classMethods = {
        /**
         * Tells whether the given class is a parent of the current class.
         *
         * @method extends
         * @static
         * @param {Class} clazz The class
         * @return {boolean} true, if the given class is a parent
         */
        extends: function (clazz) {
            return !!this.allParentId[clazz.id];
        },
        /**
         * Creates a new class, which extends this class. X.extend(a, b) is the same as Grape.Class(a,X,b)
         *
         * @method extend
         * @static
         * @param {String} [name] The class name
         * @param {Object} [methods] Class methods
         * @return {Class} The new class
         */
        extend: function (name, methods) {
            if (typeof name === 'string') { //name given
                if (methods) { //avoid undefined arguments
                    return Class(name, this, methods);
                } else {
                    return Class(name, this);
                }
            } else {
                if (name) { //avoid undefined arguments
                    return Class(this, name);
                } else {
                    return Class(this);
                }
            }
        }
    };

    var instanceMethods = {
        /**
         * Tells that the current instance is an instance of a class, or it's descendants.
         *
         * @method instanceOf
         * @param {Class} clazz
         * @return {boolean} true, if yes.
         */
        instanceOf: function (clazz) {
            return (this instanceof clazz) || !!this.getClass().allParentId[clazz.id];
        },
        /**
         * Creates a proxy for calling a parent method
         *
         * @method parent
         * @param {Class} clazz The parent, whose method will be called
         * @param {String} method Method name
         * @return {Function} Method proxy. When called, calls the parent method with the parameters, and original
         * context.
         */
        parent: function (clazz, method) {
            if (!this.instanceOf(clazz)) {
                throw new Error('Accessing parent member of not inherited class');
            }
            var m = clazz.prototype[method], that = this;
            if (Utils.isFunction(m)) {
                return function () {
                    return m.apply(that, arguments);
                };
            } else {
                return m;
            }
        },
        /**
         * Returns the instance's constructor class
         *
         * @method getClass
         * @return {Class}
         */
        getClass: function () {
            return this.constructor;
        }
    };

    function empty() {
    }

    /**
     * A static class for storing keyword related functions. To see how to create a class, check the Class method in the
     * Grape class.
     *
     * @class Grape.Class
     */

    /**
     * Creates a class by optionally copying prototype methods of one or more class.
     *
     * @for Grape
     * @method Class
     * @static
     * @param {String} [name] The name of the class (mainly for debugging purposes)
     * @param {Array|Class} [parents] Parent class or classes
     * @param {Object} methods An object containing methods. If method name contains space, the keyword parts are parsed
     * and keyword specific tasks are executed.
     * @return {*}
     */
    function Class(name, parents, methods) {
        var classInfo = {}, constructor, i, id = ++nextId;

        for (i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'undefined') {
                throw new Error('Argument is undefined: ' + i);
            }
        }
        //parameter transformations
        if (typeof name !== 'string') { //no name
            methods = parents;
            parents = name;
            name = 'Class #' + id;
        }
        if (!Utils.isArray(parents)) {
            if (Utils.isFunction(parents)) { //single parent
                parents = [parents];
            } else { //no parent
                methods = parents;
                parents = [];
            }

        }
        if (!methods) { //no methods
            methods = {};
        }


        /**
         * The name of the class if set, or a generated string.
         *
         * @for Grape.Object
         * @property className
         * @static
         * @type {String}
         */
        classInfo.className = name;

        /**
         * An unique number for the class, mainly for indexing purposes
         *
         * @for Grape.Object
         * @property id
         * @static
         * @type {Number}
         */
        classInfo.id = id;

        for (i in classMethods) { //plugins can use 'extends' check
            classInfo[i] = classMethods[i];
        }

        createParentInfo(classInfo, parents);
        createMethodDescriptors(classInfo, methods);

        initializeKeywords(classInfo);

        addParentMethods(classInfo); //left to right order
        addOwnMethods(classInfo);

        createConstructor(classInfo);

        finishKeywords(classInfo);

        constructor = classInfo.constructor;
        //extend prototype with methods
        for (i in classInfo.methods) {
            if (instanceMethods.hasOwnProperty(i)) {
                throw new Error('The method name "' + i + '" is reserved');
            }
            constructor.prototype[i] = classInfo.methods[i];
        }
        //extend constructor with class info
        for (i in classInfo) {
            constructor[i] = classInfo[i];
        }

        for (i in instanceMethods) {
            constructor.prototype[i] = instanceMethods[i];
        }

        constructor.prototype.init = constructor;
        constructor.toString = function () { //debug info
            return name;
        };

        constructor.prototype.constructor = constructor;

        return constructor;
    }

    function createParentInfo(classInfo, parents) {
        var i;
        classInfo.parents = parents;
        classInfo.allParent = getAllParent(parents);
        classInfo.allParentId = {};
        for (i = 0; i < classInfo.allParent.length; i++) {
            classInfo.allParentId[classInfo.allParent[i].id] = true;
        }
    }

    function createMethodDescriptors(classInfo, methods) {
        var methodDescriptors = {}, m;

        for (m in methods) {
            methodDescriptors[m] = parseMethod(m, methods[m], classInfo);
        }
        classInfo.methodDescriptors = methodDescriptors;
        classInfo.methods = {};
        classInfo.ownMethods = {};
        classInfo.init = null;
    }

    /*
     * We create a custom function for performance and debugging reasons.
     */
    function createConstructor(classInfo) {
        /*jslint evil: true */
        var name = classInfo.className, initMethods = [], factory = [], i, parent, constructor;
        //add parent init methods
        for (i = 0; i < classInfo.allParent.length; i++) {
            parent = classInfo.allParent[i];
            if (parent.init) {
                initMethods.push(parent.init);
            }
        }
        //add own init method
        if (classInfo.init) {
            initMethods.push(classInfo.init);
        }

        for (i = 0; i < initMethods.length; i++) {
            factory.push('var init' + i + ' = inits[' + i + '];'); //var init0 = inits[0];
        }

        //With this trick we can see the name of the class while debugging.
        factory.push('this["' + name + '"] = function(){'); //this["MyClass"] = function(){
        for (i = 0; i < initMethods.length; i++) {
            factory.push('init' + i + '.apply(this, arguments);'); //init0.apply(this, arguments)
        }
        factory.push('};');
        factory.push('return this["' + name + '"];'); //return this["MyClass"];
        constructor = (new Function('inits', factory.join('\n'))).call({}, initMethods);
        classInfo.constructor = constructor;
    }

    function initializeKeywords(classInfo) {
        var keyword;
        for (keyword in registeredKeywords) {
            (registeredKeywords[keyword].onInit || empty)(classInfo);
        }
    }

    function finishKeywords(classInfo) {
        var keyword;
        for (keyword in registeredKeywords) {
            (registeredKeywords[keyword].onFinish || empty)(classInfo);
        }
    }

    function addParentMethods(classInfo) {
        var i = 0, allParent = classInfo.allParent, parentsNum = allParent.length, parent, m;
        for (; i < parentsNum; i++) {
            parent = allParent[i];
            for (m in parent.ownMethods) {
                classInfo.methods[m] = parent.ownMethods[m];
            }
        }
    }

    function addOwnMethods(classInfo) {
        var m, methodDescriptors = classInfo.methodDescriptors, methodDescriptor, modifiers, i, j, modifier, canAdd;
        for (m in methodDescriptors) {
            methodDescriptor = methodDescriptors[m];
            if (methodDescriptor.init) {
                classInfo.init = methodDescriptor.method;
            } else {

                modifiers = methodDescriptor.modifiers;
                canAdd = true;
                for (i = 0; i < modifiers.length; i++) {
                    modifier = modifiers[i];
                    if (registeredKeywords[modifier]) {
                        //iterate over other modifiers checking compatibility
                        for (j = i + 1; j < modifiers.length; j++) {
                            if (modifier === modifiers[j]) {
                                throw new Error('Modifier "' + modifier + '" duplicated.');
                            }
                            if (!registeredKeywords[modifier].matches[modifiers[j]]) {
                                throw new Error('Modifier "' + modifier + '" cannot use with "' + modifiers[j] + '".');
                            }
                        }

                        if ((registeredKeywords[modifier].onAdd)(classInfo, methodDescriptor) === false) {
                            canAdd = false;
                        }
                    } else {
                        throw new Error('Unknown modifier "' + modifier + '"');
                    }
                }
                if (canAdd) {
                    classInfo.methods[methodDescriptor.name] = methodDescriptor.method;
                    classInfo.ownMethods[methodDescriptor.name] = methodDescriptor.method;
                }
            }
        }
    }

    function parseMethod(name, method, source) {
        var all = name.split(' '),
            modifiers = all.slice(0, -1),
            realName = all.slice(-1)[0],
            is = {},
            init = false,
            i;

        if (realName === 'init') {
            init = true;
            if (modifiers.length !== 0) {
                throw new Error('init method cannot be marked with any modifiers.');
            }
        }

        for (i = modifiers.length - 1; i >= 0; i--) {
            is[modifiers[i]] = true;
        }

        return {
            modifiers: modifiers,
            is: is,
            name: realName,
            method: method,
            source: source,
            init: init
        };
    }

    /*
     * Leftmost iteration of parent tree.
     */
    function getAllParent(parents, directly, acc) {
        var i, parentsNum = parents.length, parent;
        if (!directly) {
            directly = {};
            for (i = 0; i < parentsNum; i++) {
                parent = parents[i];
                if (!parent) {
                    throw new Error('Parent #' + (i + 1) + ' is ' + parent + '.');
                }
                directly[parent.id] = true;
            }
            acc = {
                list: [],
                set: {}
            };
        }
        for (i = 0; i < parentsNum; i++) { //add all parents recursively
            parent = parents[i];
            if (!acc.set[parent.id]) { //not added yet
                getAllParent(parent.parents, directly, acc);
                acc.list.push(parent);
                acc.set[parent.id] = true;
            } else if (directly[parent.id]) { //added directly
                throw new Error('Class "' + parent.className + '" is set as parent twice, or implied by a parent class'); //TODOv2 format global string
            }
        }
        return acc.list;
    }

    /**
     * Registers a new keyword (like 'final' or 'static').
     * Todov2 callback params
     *
     * @for Grape.Class
     * @method registerKeyword
     * @static
     * @param {String} name
     * @param {Object} handlers The functions called during the class creation
     * @param {Function} [handlers.onInit] Called when a new class is about to create
     * @param {Function} [handlers.onAdd] Called when a method with the keyword is added to the class
     * @param {Function} [handlers.onFinish] Called when the class is ready
     */
    function registerKeyword(name, handlers) {
        if (registeredKeywords[name]) {
            throw new Error('keyword "' + name + '" already registered');
        }
        handlers.matches = {};
        registeredKeywords[name] = handlers;
    }

    /**
     * Tells to the Grape class system that two keywords can be used together. If not explicitly told, a keyword cannot
     * be used with other ones. The order of keywords is irrelevant.
     *
     * @for Grape.Class
     * @static
     * @method registerKeywordMatching
     * @param {String} k1 Keyword 1
     * @param {String} k2 Keyword 2
     */
    function registerKeywordMatching(k1, k2) {
        registeredKeywords[k1].matches[k2] = true;
        registeredKeywords[k2].matches[k1] = true;
    }

    registerKeyword('static', {
        onAdd: function (classInfo, methodDescriptor) {
            if (classInfo[methodDescriptor.name] || classMethods[methodDescriptor.name]) {
                throw new Error('Static method "' + methodDescriptor.name + '" hides a reserved attribute.');
            }
            classInfo[methodDescriptor.name] = methodDescriptor.method;
            return false;
        }
    });

    registerKeyword('override', {
        onAdd: function (classInfo, methodDescriptor) {
            var i, j, parent;
            if (!classInfo.methods[methodDescriptor.name]) { //we are not overriding an implemented method

                //check for abstract methods
                for (i = 0; i < classInfo.allParent.length; ++i) {
                    parent = classInfo.allParent[i];
                    for (j in parent.abstracts) {
                        if (j === methodDescriptor.name) {
                            return;
                        }
                    }
                }
                //no abstract method found
                throw new Error('Method "' + methodDescriptor.name + '" does not override a method from its superclass');
            }
        }
    });

    registerKeyword('abstract', {
        onInit: function (classInfo) {
            classInfo.abstracts = {};
            classInfo.isAbstract = false;
        },
        onAdd: function (classInfo, methodDescriptor) {
            classInfo.abstracts[methodDescriptor.name] = methodDescriptor.method;
            classInfo.isAbstract = true;
            if (classInfo.methods[methodDescriptor.name]) { //inherited method with the same name
                throw new Error('Method "' + methodDescriptor.name + '" cannot be abstract, because it is inherited from a parent.');
            }
            return false;
        },
        onFinish: function (classInfo) {
            var i, j, parent, oldToString;
            if (classInfo.isAbstract) {
                //replace constructor, this happens before extending it with anything
                oldToString = classInfo.constructor.toString;
                classInfo.constructor = function () {
                    throw new Error('Abstract class "' + classInfo.className + '" cannot be instantiated.');
                };
                classInfo.constructor.toString = oldToString;
                classInfo.constructor.prototype.constructor = classInfo.constructor;
            }

            //check all abstract parent methods are implemented, inherited, or marked abstract
            for (i = 0; i < classInfo.allParent.length; ++i) {
                parent = classInfo.allParent[i];
                for (j in parent.abstracts) {
                    if (!classInfo.methods[j] && classInfo.abstracts[j] === undefined) {
                        throw new Error('Method "' + j + '" is not implemented, inherited, or marked abstract'); //TODOv2 source?
                    }
                }
            }
        }
    });

    registerKeyword('final', {
        onInit: function (classInfo) {
            var parent, i, j, parentFinals = {};
            //iterate over parent methods checking not overwrite a final method by inheriting
            for (i = 0; i < classInfo.allParent.length; ++i) {
                parent = classInfo.allParent[i];

                for (j in parent.methods) {
                    if (parentFinals.hasOwnProperty(j) && parentFinals[j] !== parent.methods[j]) { //overriding final method by inheriting
                        throw new Error('Method "' + j + '" is final and cannot be overridden by inheriting from "' + parent.className + '"');
                    }
                }

                for (j in parent.finals) {
                    parentFinals[j] = parent.finals[j];
                }
            }
            classInfo.parentFinals = parentFinals;
            classInfo.finals = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            classInfo.finals[methodDescriptor.name] = methodDescriptor.method;
        },
        onFinish: function (classInfo) {
            var i;

            for (i in classInfo.parentFinals) {
                if (classInfo.methods[i] !== classInfo.parentFinals[i]) {
                    throw new Error('Overriding final method "' + i + '"');
                }
            }
        }
    });

    registerKeywordMatching('final', 'override');


    Class.registerKeyword = registerKeyword;
    Class.registerKeywordMatching = registerKeywordMatching;

    return Class;
});
define('m4', ['m3'], function (Class) {
    var returnsNewArray = ['slice', 'filter', 'map'], //must return a new instance of the class instead of the native array
        slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        methods, methodNames, i, orig;


    /**
     * An array class created with Grape.Class mixing all of the Array.prototype methods and some new utility.
     * Some functions are modified (like slice) to return a new instance of the current class instead of a plain array.
     * If you extend this class, these methods will return an instance of your class.
     * In the future, we should create implementations of default methods for old browsers.
     * Note that adding elements with indexing does not change the length property unlike the native Array.
     *
     * @constructor
     * @class Grape.Array
     */
    methods = {
        /**
         * Calls a method of each item. The subsequent parameters are passed to the method.
         *
         * @method call
         * @param which {String} The method name to call
         * @return {Grape.Array} this
         */
        call: function (which/*,params*/) {
            var params = Array.prototype.slice.call(arguments, 1),
                i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][which].apply(this[i], params);
            }
            return this;
        },
        /**
         * Calls a method of each item, but the parameters are passed as an array like in Function.prototype.apply
         *
         * @method apply
         * @param which {String} The method name to call
         * @param params {Array} The method parameters
         * @return {Grape.Array} this
         */
        apply: function (which, params) {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][which].apply(this[i], params);
            }
            return this;
        },

        /**
         * Returns true if the length of the array is 0.
         *
         * @method isEmpty
         * @return {boolean} true, if length is 0
         */
        isEmpty: function () {
            return this.length === 0;
        },

        /**
         * Creates a native Array by copying the items
         *
         * @method toArray
         * @return {Array} The native Array
         */
        toArray: function () {
            return slice.call(this, 0);
        },

        /**
         * Sets an attribute on each item.
         *
         * @method attr
         * @param name {String} The attribute name
         * @param newVal {*} The new value of the attribute
         * @return {Grape.Array} this
         */
        attr: function (name, newVal) { //todov2 use as attr({x:10, y:20})
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][name] = newVal;
            }
            return this;
        },

        /**
         * Creates a new instance of the current class, containing the item at the index i if exists, or an empty array
         *
         * @method eq
         * @param i {number} The index
         * @return {Grape.Array} The array containing 0 or 1 item
         */
        eq: function (i) {
            var result = new (this.getClass())();
            if (this.length > i) {
                result.push(this[i]);
            }
            return result;
        },

        /**
         * Returns an item at the given position. Equivalent to arr[i].
         *
         * @method get
         * @param i {number} The index of the item to return
         * @return {*} The item at the given position
         */
        get: function (i) {
            return this[i];
        },

        /**
         * Returns one (the first) item from the array.
         *
         * @method one
         * @return {*} The first item
         */
        one: function () {
            return this[0];
        },

        /**
         * Returns a new instance of the current class containing random items from the original array.
         *
         * @method random
         * @param num {number|undefined} The number of random items. If not set returns one item.
         * @return {Grape.Array} The random items
         */
        random: function (num) {
            var result;
            if (num === undefined) {
                return this[Math.random() * this.length >> 0];
            }

            result = this.clone(); //todov2 performance
            while (result.length > num) {
                result.splice(Math.random() * result.length >> 0, 1);
            }
            return result;
        },

        /**
         * Clones the array (shallow copy) by creating a new instance of the current class.
         *
         * @method clone
         * @return {*} The cloned array
         */
        clone: function () {
            return this.slice(0);
        },

        /**
         * Returns the length of the array.
         *
         * @method size
         * @return {number} The size of the array
         */
        size: function () {
            return this.length;
        }
        //TODOv2 union, intersect, complement, etc.);

    };

    //TODOv2 implement methods if not available
    if (Object.getOwnPropertyNames) {
        methodNames = Object.getOwnPropertyNames(Array.prototype);
    } else {
        methodNames = ['concat', 'constructor', 'indexOf', 'join', 'pop', 'push', 'reverse', 'shift', 'slice', 'splice', 'sort', 'toString', 'unshift', 'valueOf']; //IE8
    }

    for (i = methodNames.length - 1; i >= 0; i--) {
        //if (methodNames[i] !== 'length') {
            methods[methodNames[i]] = Array.prototype[methodNames[i]];
        //}
    }

    function createProxy(orig) {
        return function () {
            var result = new (this.getClass())();
            var origResult = orig.apply(this, arguments);
            origResult.splice(0, 0, 0, 0); //push 0 twitce at the beginning
            splice.apply(result, origResult); //result.splice(0,0,r1,r2,r3..): push all items to the result array
            return result;
        };
    }

    for (i = returnsNewArray.length - 1; i >= 0; i--) {
        orig = methods[returnsNewArray[i]];
        methods[returnsNewArray[i]] = createProxy(orig);
    }


    return Class('Array', methods);
});
define('m5', ['m3', 'm4'], function (Class, Arr) {
    /**
     * A bag class, ie. an unordered list.
     * It is an array, but if you remove an item, and the bag contains at least one more item, the last item replaces the item, and length is reduced by 1.
     *
     * @constructor
     * @class Grape.Bag
     * @uses Array
     */
    return Class('Bag', Arr, {
        /**
         * Adds an element to the bag. Equivalent to push()
         * @param item {*} The item to add
         * @method add
         * @return {number} the new size of the bag
         */
        add: Arr.prototype.push,
        /**
         * @method remove
         * @param index {number} The index to remove at
         * @return {*} The moved item (which replaces the removed item)
         */
        remove: function (index) {
            if (index === this.length - 1) {
                this.pop();
            } else {
                return this[index] = this.pop();
            }
        }
    });
});
define('m6', ['m4', 'm5'], function (Arr, Bag) {
    return {
        Array: Arr,
        Bag: Bag
    };
});
define('m7', ['m3'], function (Class) {
    /**
     * An interface for axis-aligned bounding box methods. All methods are abstract.
     *
     * @class Grape.AABB
     */
    return Class('AABB', {
        /**
         * Gets the left, right, top, bottom coordinates at once.
         *
         * @method getBounds
         * @return {Object} The bounding box coordinates, should contain "left", "right", "top" and "bottom" properties
         */
        'abstract getBounds': null,

        /**
         * Returns the left axis.
         *
         * @method getLeft
         * @return {number} the left axis
         */
        'abstract getLeft': null,

        /**
         * Returns the top axis.
         *
         * @method getTop
         * @return {number} the top axis
         */
        'abstract getTop': null,

        /**
         * Returns the right axis.
         *
         * @method getRight
         * @return {number} the right axis
         */
        'abstract getRight': null,

        /**
         * Returns the bottom axis.
         *
         * @method getBottom
         * @return {number} the bottom axis
         */
        'abstract getBottom': null,

        /**
         * Returns the width (right - left).
         *
         * @method getWidth
         * @return {number} the width, should be right - left
         */
        'abstract getWidth': null,

        /**
         * Returns the height (bottom - top).
         *
         * @method getHeight
         * @return {number} the height, should be bottom - top
         */
        'abstract getHeight': null
    });
});
define('m8', ['m3'], function (Class) {
    var EventEmitter;

    /**
     * A helper function for decomposing nested event handlers. When the method is a function, it is just added to the
     * target. If the method is an object, all of it's element are added with name.key.
     *
     * @example
     *      var target = {};
     *      Grape.EventEmitter.decompose(function(){},target,'name1');
     *      Grape.EventEmitter.decompose({
     *          x:function(){}
     *      },target,'name2');
     *
     *      //target will be {'name1':function(){},'name2.x':function(){}}
     *
     * @method decompose
     * @static
     * @param {Function|Object} method The method or methods
     * @param {Object} target The target the methods are added to.
     * @param {String} name method name or nested method prefix
     */
    function decompose(method, target, name) {
        var i;
        if (typeof method === 'object') { //nested methods
            for (i in method) {
                decompose(method[i], target, name + '.' + i);
            }
        } else {
            target[name] = method;
        }
    }

    Class.registerKeyword('event', {
        onInit: function (classInfo) {
            classInfo.events = {};
            classInfo.allEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.extends(EventEmitter)) {
                throw new Error('To use "event" keyword, inherit the Grape.EventEmitter class!');
            }
            decompose(methodDescriptor.method, classInfo.events, methodDescriptor.name);
            return false;
        },
        onFinish: function (classInfo) {
            var i, event, events;
            //add parent events
            for (i = 0; i < classInfo.allParent.length; i++) {
                events = classInfo.allParent[i].events;
                for (event in events) {
                    (classInfo.allEvent[event] || (classInfo.allEvent[event] = [])).push(events[event]);
                }
            }
            //add own events
            events = classInfo.events;
            for (event in events) {
                (classInfo.allEvent[event] || (classInfo.allEvent[event] = [])).push(events[event]);
            }
        }
    });


    /**
     * An object which cna emit events, others can subscribe to it, and we can use the event keyword to make easier
     * the subscription when extending this class.
     *
     * @class Grape.EventEmitter
     */
    EventEmitter = Class('EventEmitter', {
        init: function () { //subscribe to events defined in class
            var i, myClass = this.getClass();
            this._events = {};
            for (i in myClass.allEvent) { //TODOv2 separate static and dynamic subscriptions
                this._events[i] = myClass.allEvent[i].slice(0);
            }
        },
        /**
         * Subscribes to an event. The event handler will be called with this instance as context.
         *
         * @method on
         * @param {String} event The event to subscribe
         * @param {Function} listener Event listener
         */
        on: function (event, listener) {
            (this._events[event] || (this._events[event] = [])).push(listener);
        },

        /**
         * Unsubscribes from an event.
         *
         * @method off
         * @param {String} event Event
         * @param {Function} listener Event listener
         */
        off: function (event, listener) { //todov2 check remove with indexOf speed
            //todov2 remove all listeners
            var i, listeners = this._events[event];
            for (i = 0; i < listeners.length; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    i--;
                }
            }
        },
        //todov2 once
        /**
         * Emits an event to the instance: calls all event listeners subscribed to this event, or the 'any' event.
         *
         * @method emit
         * @param {String} event Event
         * @param {*} payload An object passed as parameter to all event listeners.
         */
        emit: function (event, payload) { //TODOv2 class level listeners?
            var i, listeners = this._events[event], n;
            if (listeners) {

                for (i = 0, n = listeners.length; i < n; i++) {
                    listeners[i].call(this, payload);
                }
            }
            /**
             * Emitted when any event is emitted. The parameters are the event and the payload.
             *
             * @event any
             */
            listeners = this._events.any;
            if (listeners) {
                for (i = 0, n = listeners.length; i < n; i++) {
                    listeners[i].call(this, event, payload);
                }
            }
        },
        'static decompose': decompose
    });


    return EventEmitter;
});
define('m9', ['m3', 'm5'], function (Class, Bag) {
    /**
     * A container for tagging. You can get items by tags.
     *
     * @class Grape.TagContainer
     * @constructor
     * @see Grape.Tag
     */
    var TagContainer = Class('TagContainer', {
        init: function () {
            this._tags = {};
        },
        /**
         * Gets items stored in the container by a tag.
         *
         * @example
         *      var container = new Grape.TagContainer();
         *      var obj = new Grape.Taggable();
         *      obj.setTagContainer(container);
         *      obj.addTag('my tag');
         *      container.get('my tag'); //returns an array containing obj
         *
         *
         * @method get
         * @param {String} tag The tag
         * @return {Array} Items containing the tag
         */
        get: function (tag) { //TODOv2 multiple tags
            var i, instances, result = this.createResultContainer();
            instances = this._tags[tag];
            if (instances) {
                for (i = instances.length - 1; i >= 0; i--) {
                    result.push(instances[i]);
                }
            }
            return result;
        },
        _getTag: function (tag) {
            return this._tags[tag] || this.createResultContainer();
        },
        /**
         * Creates an array-like object. If you want to redefine the result type of the get method, you can override
         * this method.
         *
         * @method createResultContainer
         * @return {Array} An initial array.
         * @see get
         */
        createResultContainer: function () {
            return [];
        },
        'final _add': function (taggable, tag) {
            var tags = this._tags,
                items = tags[tag];
            if (!items) {
                items = tags[tag] = new Bag();
            }
            return items.add(taggable) - 1;
        },
        'final _remove': function (taggable, tag) {
            var idx = taggable._tags[tag], bag = this._tags[tag], moved = bag.remove(idx);

            if (moved) {
                moved._tags[tag] = idx;
            }

            if (bag.length === 0) {
                delete this._tags[tag];
            }
        }
    });

    /**
     * A taggable class. If you add a tag to an instance, you can get it from the container.
     *
     * @see Grape.TagContainer
     * @class Grape.Taggable
     * @constructor
     */
    var Taggable = Class('TagContainer', {
        init: function () {
            this._tags = {};
        },
        /**
         * Sets the tag container for the instance. If tags are added already, they will appear in the new container.
         * If the instance already has a tagContainer, it will be removed first.
         *
         * @method setTagContainer
         * @param {TagContainer} container The container
         */
        setTagContainer: function (container) { //todov2 instanceOf check
            var i;
            if (this._tagContainer) { //should remove old tag container first
                if (this._tagContainer === container) {
                    return;
                }
                this.removeTagContainer(); //todov2 better move
            }
            this._tagContainer = container;
            for (i in this._tags) {
                container._add(this, i);
            }
        },
        /**
         * Adds a tag to a taggable object.
         *
         * @method addTag
         * @param {String} name Tag name
         * @return {boolean} true, if a new tag is added, false, if the tag was already added.
         */
        addTag: function (name) {
            var container = this._tagContainer;
            if (this.hasTag(name)) { //already added
                return false;
            }
            if (container) { //have container
                this._tags[name] = container._add(this, name); //store the index for removal purpose
            } else {
                this._tags[name] = true;
            }
            return true;
        },
        /**
         * Checks if a tag is added or not.
         *
         * @method hasTag
         * @param {String} name Tag name
         * @return {boolean} true, if the instance has the tag
         */
        hasTag: function (name) {
            return this._tags[name] !== undefined;
        },
        /**
         * Removes a tag from a taggable object. If the tag is not added, does nothing.
         *
         * @method removeTag
         * @param {String} name Tag name
         */
        removeTag: function (name) {
            if (!this.hasTag(name)) {
                return;
            }

            if (this._tagContainer) {
                this._tagContainer._remove(this, name);
            }
            delete this._tags[name];
        },
        /**
         * Detaches the TagContainer. The instance is no more queryable through the container.
         *
         * @method removeTagContainer
         */
        removeTagContainer: function () {
            var name;
            if (!this._tagContainer) { //nothing to do
                return;
            }
            for (name in this._tags) {
                this._tagContainer._remove(this, name);
            }
        }
    });

    return {
        TagContainer: TagContainer,
        Taggable: Taggable
    };
});
define('ma', ['m3', 'm5', 'm8', 'm9'], function (Class, Bag, EventEmitter, Tag) {
    var GameObject;
    Class.registerKeyword('global-event', {
        onInit: function (classInfo) {
            classInfo.globalEvents = {};
            classInfo.allGlobalEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.allParentId[GameObject.id]) {
                throw new Error('To use "global-event" keyword, inherit the Grape.GameObject class!');
            }
            EventEmitter.decompose(methodDescriptor.method, classInfo.globalEvents, methodDescriptor.name);
            return false;
        },
        onFinish: function (classInfo) {
            var i, event, events;
            //add parent events
            for (i = 0; i < classInfo.allParent.length; i++) {
                events = classInfo.allParent[i].globalEvents;
                for (event in events) {
                    (classInfo.allGlobalEvent[event] || (classInfo.allGlobalEvent[event] = [])).push(events[event]);
                }
            }
            //add own events
            events = classInfo.globalEvents;
            for (event in events) {
                (classInfo.allGlobalEvent[event] || (classInfo.allGlobalEvent[event] = [])).push(events[event]);
            }
        }
    });

    function subscribe(th, ev, fn) {
        var proxy = function (payload) {
            fn.call(th, payload);
        };
        th._layer.on(ev, proxy);
        th.on('remove', function () {
            this._layer.off(ev, proxy);
        });
    }

    /**
     * A GameObject is an object which can be added to a layer, and can subscribe to the layer's events with the
     * onGlobal() method or the global-event keyword.
     *
     * @class Grape.GameObject
     * @uses Grape.EventEmitter
     * @uses Grape.Taggable
     * @constructor
     */
    GameObject = Class('GameObject', [EventEmitter, Tag.Taggable], {
        init: function () {
            this._layer = null;
            this.on('add', function () {//TODOv2 optimize
                var myClass = this.getClass(), event, listeners;
                for (event in myClass.allGlobalEvent) {
                    listeners = myClass.allGlobalEvent[event];
                    for (var j = 0; j < listeners.length; j++) {
                        subscribe(this, event, listeners[j]);
                    }
                }
            });
        },
        /**
         * Subscribes to an event on the layer the instance is added to. If the instance is not yet added to any layers,
         * it will subscribe when added.
         *
         * @method onGlobal
         * @param {String} event Event
         * @param {Function} handler Event listener
         */
        onGlobal: function (event, handler) {
            var that = this,
                proxy = function (payload) {
                    handler.call(that, payload);
                };
            if (this._layer) { //already added
                this._layer.on(event, proxy);
            } else {
                this.on('add', function () {
                    this._layer.on(event, proxy);
                });
            }
            this.on('remove', function () {
                this._layer.off(event, proxy);
            });
        },
        /**
         * Removes the instance from the layer.
         *
         * @method remove
         */
        'final remove': function () {
            this._layer.remove(this);
        },
        /**
         * Gets the current game instance through the current layer.
         *
         * @method getGame
         * @return {Grape.Game|null} The current game, or null, if the lookup fails.
         */
        getGame: function () {
            return this._layer === null ? null : this._layer.getGame();
        },
        /**
         * Gets the root layer.
         *
         * @method getScene
         * @return {Grape.Scene|null} The root layer, or null, if the lookup fails.
         */
        getScene: function () {
            return this._layer === null ? null : this._layer.getScene();
        },
        /**
         * Returns the layer the instance is added to.
         *
         * @method getLayer
         * @return {Grape.Layer} The layer
         */
        getLayer: function () {
            return this._layer;
        }
    });

    return GameObject;
});
define('mb', ['m3', 'ma'], function (Class, GameObject) {

    /**
     * A utility class for creating timeouts in a game.
     *
     * @constructor
     * @class Grape.Alarm
     * @constructor
     * @uses Grape.GameObject
     */
    return Class('Alarm', GameObject, {
        init: function () {
            this._alarms = {};
        },

        /**
         * Sets a timeout with a given name in frames.
         *
         * @method setAlarm
         * @param name {String} Alarm name
         * @param frames {number} The number of frames after the alarm triggers
         */
        'final setAlarm': function (name, frames) {
            this._alarms[name] = frames;
        },

        /**
         * Returns the remaining frames of a timeout
         *
         * @method getAlarm
         * @param name {String} Alarm name
         * @return {number} The remaining time
         */
        'final getAlarm': function (name) {
            return this._alarms[name];
        },

        /**
         * Increases the duration of a timeout by a given amount. If timeout does not exist, the method creates it.
         *
         * @method increaseAlarm
         * @param name {String} Alarm name
         * @param frames {number} Number of frames to increase with
         */
        'final increaseAlarm': function (name, frames) {
            if (!this._alarms[name]) {
                this._alarms[name] = frames;
            } else {
                this._alarms[name] += frames;
            }
        },

        /**
         * Tells whether a timeout with a given name exists.
         *
         * @method hasAlarm
         * @param id {String} Name of the timeout
         * @return {boolean} true, if the timeout exists
         */
        'final hasAlarm': function (id) {
            return this._alarms[id] !== undefined;
        },

        'global-event frame': function () {
            var id;
            for (id in this._alarms) {
                if (--this._alarms[id] <= 0) {
                    delete this._alarms[id];
                    /**
                     * When a timeout ends, this event occurs. The parameter is the name of the timeout.
                     * @event alarm
                     */
                    this.emit('alarm', id);
                    /**
                     * When a timeout ends, this event occurs too.
                     * @event alarm.<name>
                     */
                    this.emit('alarm.' + id);
                }
            }
        }
    });
});
define('mc', ['m3'], function (Class) {
    /**
     * Stores x and y properties
     *
     * @class Grape.Position
     * @constructor
     * @param {Object} [opts] Initial values of properties
     */
    return Class('Position', {
        init: function (opts) {
            opts = opts || {};
            /**
             * X coordinate
             *
             * @property x
             * @type {number}
             * @default 0
             */
            this.x = opts.x || 0;
            /**
             * Y coordinate
             *
             * @property y
             * @type {number}
             * @default 0
             */
            this.y = opts.y || 0;
        }
    });
});
define('md', ['m3', 'm7', 'mc', 'ma'], function (Class, AABB, Position, GameObject) {
    /**
     * An abstract class for visualizing different things. This class provides alpha and visible properties.
     * It calls the visualize method with the rendering context in each render frame if visible is set to true.
     *
     * @class Grape.Visualizer
     * @uses Grape.GameObject
     * @uses Grape.Position
     *
     * @constructor
     * @param {Object} [opts] Initial values of properties
     */
    return Class('Visualizer', [GameObject, Position, AABB], { //TODOv2
        init: function (opts) {
            opts = opts || {};
            if (opts.alpha === undefined) {
                /**
                 * The alpha value set before calling the visualize method
                 *
                 * @property alpha
                 * @default 1
                 * @type {number}
                 */
                this.alpha = 1;
            } else {
                this.alpha = opts.alpha;
            }
            if (opts.visible === undefined) {
                /**
                 * If set false, the visualize method is not called.
                 *
                 * @property visible
                 * @default true
                 * @type {number}
                 */
                this.visible = true;
            } else {
                this.visible = opts.visible;
            }
        },
        'global-event render': function (ctx) {
            if (this.visible) {
                ctx.globalAlpha = this.alpha;
                this.visualize(ctx);
                ctx.globalAlpha = 1;
            }
        },
        /**
         * This abstract method is called each render frame if visible is set to true.
         *
         * @method visualize
         * @param {CanvasRenderingContext2D} ctx The rendering context
         */
        'abstract visualize': null,
        'abstract getBounds': null,
        'abstract getLeft': null,
        'abstract getTop': null,
        'abstract getRight': null,
        'abstract getBottom': null,
        'abstract getWidth': null,
        'abstract getHeight': null
    });
});
define('me', ['m3', 'md'], function (Class, Visualizer) {
    /**
     * Visualizes a sprite. If no sprite is set, draws a question mark to indicate the error.
     *
     * @class Grape.SpriteVisualizer
     * @uses Grape.Visualizer
     * @constructor
     * @param {Object} [opts] Initial values of properties
     */
    return Class('SpriteVisualizer', Visualizer, {
        init: function (opts) {
            opts = opts || {};
            /**
             * The image index of the sprite to show
             *
             * @property subimage
             * @default 0
             * @type {number}
             */
            this.subimage = opts.subimage || 0;

            /**
             * The sprite
             *
             * @property sprite
             * @type {Grape.Sprite}
             */
            this.sprite = opts.sprite;
        },
        'override visualize': function (ctx) {
            var sprite = this.sprite;
            if (sprite && sprite.img) {
                ctx.drawImage(sprite.img, sprite.left + sprite.width * (Math.round(this.subimage) % sprite.subimages), sprite.top, sprite.width, sprite.height, this.x - sprite.originX, this.y - sprite.originY, sprite.width, sprite.height);
            } else {
                ctx.fillStyle = 'black';
                ctx.fillRect(this.x, this.y, 32, 32);
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.fillText('?', this.x + 11, this.y + 24);
            }
        },
        'override getBounds': function () {
            var s = this.sprite;
            var l = this.x - s.originX;
            var t = this.y - s.originY;
            return {
                left: l + s.leftBounding,
                top: t + s.topBounding,
                right: l + s.rightBounding,
                bottom: t + s.bottomBounding
            };
        },
        'override getLeft': function () {
            return this.x - this.sprite.originX + this.sprite.leftBounding;
        },

        'override getTop': function () {
            return this.y - this.sprite.originY + this.sprite.topBounding;
        },

        'override getRight': function () {
            return this.x - this.sprite.originX + this.sprite.rightBounding;
        },

        'override getBottom': function () {
            return this.y - this.sprite.originY + this.sprite.bottomBounding;
        },

        'override getWidth': function () {
            return this.sprite.rightBounding - this.sprite.leftBounding;
        },

        'override getHeight': function () {
            return this.sprite.bottomBounding - this.sprite.topBounding;
        }
    });
});
define('mf', ['m3', 'me'], function (Class, SpriteVisualizer) {
    /**
     * A utility class which increases a the subimage of a SpriteVisualizer in each frame by a given amount.
     *
     * @class Grape.Animation
     * @constructor
     * @uses Grape.SpriteVisualizer
     * @param [opts] The initial properties
     */
    return Class('Animation', SpriteVisualizer, {
        init: function (opts) {
            opts = opts || {};
            /**
             * The number the subimage is shifted with each second.
             *
             * @property imageSpeed
             * @type number
             * @default 1
             */
            this.imageSpeed = opts.imageSpeed === undefined ? 1 : opts.imageSpeed;
        },
        'global-event frame': function () {
            if (!this.sprite) {
                return;
            }
            var subimages = this.sprite.subimages, nextSubimage = this.subimage + this.imageSpeed;
            if (nextSubimage >= subimages || nextSubimage < 0) {
                this.subimage = nextSubimage % subimages;
                if (this.subimage < 0) {
                    this.subimage += subimages;
                }
                /**
                 * Occurs when the animation falls through the last image (or the first if imageSpeed is negative)
                 *
                 * @event animationEnd
                 */
                this.emit('animationEnd');
            } else {
                this.subimage = nextSubimage;
            }
        }
    });
});
define('mg', ['m3'], function (Class) {
    Class.registerKeyword('chainable', {
        onAdd: function (classInfo, methodDescriptor) {
            var originalMethod;
            originalMethod = methodDescriptor.method;
            methodDescriptor.method = function () {
                originalMethod.apply(this, arguments);
                return this;
            };
            if (methodDescriptor.is.final) { //on final methods we replace the final reference too
                classInfo.finals[methodDescriptor.name] = methodDescriptor.method;
            }
        }
    });

    Class.registerKeywordMatching('chainable', 'final');
    Class.registerKeywordMatching('chainable', 'override');

    return null;
});
define('mh', ['m3', 'm8'], function (Class, EventEmitter) {
    /**
     * A system can be added to a layer, and the layer emits all of its event to the system. The system can access the
     * layer through the getLayer method.
     *
     * @class Grape.System
     * @uses Grape.EventEmitter
     * @constructor
     */
    return Class('System', EventEmitter, {
        /* istanbul ignore next */
        /**
         * Returns the layer the system is added to.
         *
         * @method getLayer
         * @return {Grape.Layer|undefined} The layer
         */
        'final getLayer': function () {
            return this._layer;
        }
    });
});
define('mi', ['m3', 'm7', 'ma', 'mh'], function (Class, AABB, GameObject, System) {

    Class.registerKeyword('collision', {
        onInit: function (classInfo) {
            classInfo.collisions = {};
            classInfo.allCollision = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.extends(Collidable)) {
                throw new Error('To use "collision" keyword, inherit the Grape.Collidable class!');
            }
            classInfo.collisions[methodDescriptor.name] = methodDescriptor.method;
        },
        onFinish: function (classInfo) {
            var parents = classInfo.allParent, colls = classInfo.allCollision, parentsAndMe = parents.concat(classInfo),
                i, j, parent;
            for (i = 0; i < parentsAndMe.length; i++) {
                parent = parentsAndMe[i];
                if (parent.collisions) {
                    for (j in parent.collisions) {
                        if (colls[j]) {
                            colls[j].push(parent.collisions[j]);
                        } else {
                            colls[j] = [parent.collisions[j]];
                        }
                    }
                }
            }
            for (i in colls) {
                if (colls[i].length === 1) { //one handler for the collision
                    colls[i] = colls[i][0];
                } else {
                    colls[i] = createBatchFunction(colls[i]);
                }
            }
        }
    });

    function createBatchFunction(fns) { //todov2 optimize (compile)
        var i;
        return function () {
            for (i = 0; i < fns.length; i++) {
                fns[i].apply(this, arguments);
            }
        };
    }

    function createPartition(instances, blockSize) {
        var partition = {
                size: instances.length
            },
            id, instance, bounds, boundsArray, leftCell, rightCell, bottomCell, topCell, i, j, cellItems, cellHash;

        for (id = instances.length - 1; id >= 0; id--) {
            instance = instances[id];
            bounds = instance.getBounds();
            boundsArray = [bounds.left, bounds.right, bounds.top, bounds.bottom];
            leftCell = (boundsArray[0] / blockSize) >> 0;
            rightCell = (boundsArray[1] / blockSize) >> 0;
            topCell = (boundsArray[2] / blockSize) >> 0;
            bottomCell = (boundsArray[3] / blockSize) >> 0;
            for (i = leftCell; i <= rightCell; ++i) {
                for (j = topCell; j <= bottomCell; ++j) {
                    if (!(cellItems = partition[cellHash = i + ';' + j])) { //no cell list
                        partition[cellHash] = [
                            [instance, boundsArray]
                        ];
                    } else {
                        cellItems.push([instance, boundsArray]);
                    }
                }
            }
        }
        return partition;
    }

    /**
     * A system, which handles broad phase collision detection of Collidable instances added to the system's layer.
     * It uses spatial partitioning algorithm, creating a partition for each class and tag only if they have collision
     * event handler. Note that the collision system gets the instances of the layer directly, not through an event
     * emission, so instances in sub-layers won't collide.
     *
     * @class Grape.CollisionSystem
     * @uses Grape.System
     */
    var CollisionSystem = Class('CollisionSystem', System, {
        init: function (settings) {
            settings = settings || {};
            this.blockSize = settings.blockSize || 64;
            this.ClassPartition = function () {
            };

            this.TagPartition = function () {
            };
        },
        /**
         * (Re)creates a partition table for a class or a tag. This table is used to check collision until removed.
         *
         * @method createStaticPartition
         * @param {String|Class} name Tag or class
         */
        createStaticPartition: function (name) {
            if (name.id) {//class
                this.ClassPartition.prototype[name.id] = createPartition(this._layer._get(name), this.blockSize); //store static partition in prototype to speed up the lookup
            } else {//tag
                this.TagPartition.prototype[name] = createPartition(this._layer._getTag(name), this.blockSize); //store static partition in prototype to speed up the lookup
            }
        },
        /**
         * Removes a partition table for a class or a tag.
         *
         * @method removeStaticPartition
         * @param {String|Class} name Tag or class
         */
        removeStaticPartition: function (name) {
            if (name.id) {//class
                delete this.ClassPartition.prototype[name.id];
            } else {//tag
                delete  this.TagPartition.prototype[name];
            }
        },
        'event frame': function () {
            //collision is defined between classes and tags
            var classes = this._layer._getClasses(Collidable),
                partitionsByTag = new this.TagPartition(),
                partitionsByClass = new this.ClassPartition(),
                list = [],
                classId, tagName, colls, instances, hasRealTarget, i, j, k, l, item, emitted, part1, part2, handler, invert, bigger, smaller, cell1, cell2, inst1, inst2, key, box1, box2;
            for (classId in classes) {
                colls = classes[classId].clazz.allCollision;
                hasRealTarget = false;
                for (tagName in colls) {
                    if (!partitionsByTag[tagName]) {
                        instances = this._layer._tags[tagName];
                        if (instances && instances.length !== 0) {
                            partitionsByTag[tagName] = createPartition(instances, this.blockSize);
                            hasRealTarget = true;
                            list.push([classId, tagName, colls[tagName]]);
                        }
                    } else {
                        hasRealTarget = true;
                        list.push([classId, tagName, colls[tagName]]);
                    }
                }
                if (hasRealTarget && !partitionsByClass[classId]) {
                    partitionsByClass[classId] = createPartition(classes[classId].instances, this.blockSize);
                }
            }

            for (i = 0; i < list.length; i++) {
                item = list[i];
                emitted = {};
                part1 = partitionsByClass[item[0]];
                part2 = partitionsByTag[item[1]];
                handler = item[2];

                if (invert = part1.size > part2.size) {
                    bigger = part1;
                    smaller = part2;
                } else {
                    bigger = part2;
                    smaller = part1;
                }

                for (j in smaller) {
                    if (j === 'size' || !bigger[j]) { //other partition does not contain the cell
                        continue;
                    }

                    cell1 = invert ? bigger[j] : smaller[j];
                    cell2 = invert ? smaller[j] : bigger[j];
                    for (k = cell1.length - 1; k >= 0; --k) {
                        inst1 = cell1[k];
                        for (l = cell2.length - 1; l >= 0; --l) {
                            inst2 = cell2[l];
                            if (inst1[0] === inst2[0]) { //same instance
                                continue;
                            }
                            key = inst1[0].collisionId + '-' + inst2[0].collisionId;
                            if (emitted[key]) {
                                continue;
                            }
                            box1 = inst1[1];
                            box2 = inst2[1];
                            if (box1[1] > box2[0] && box2[1] > box1[0] && box1[3] > box2[2] && box2[3] > box1[2]) { //intersect
                                handler.call(inst1[0], inst2[0]);
                                emitted[key] = true;
                            }
                        }
                    }
                }
            }
        }
    });

    var nextId = 0;
    /**
     * A class, which can have collision events.
     *
     * @class Grape.Collidable
     * @uses Grape.GameObject
     * @uses Grape.AABB
     */
    var Collidable = Class('Collidable', [GameObject, AABB], {
        init: function () {
            this.collisionId = nextId++;
        },
        'abstract getBounds': null,
        'abstract getLeft': null,
        'abstract getTop': null,
        'abstract getRight': null,
        'abstract getBottom': null,
        'abstract getWidth': null,
        'abstract getHeight': null
    });

    return {
        Collidable: Collidable,
        CollisionSystem: CollisionSystem
    };
});
define('mj', ['m3', 'ma', 'm7'], function (Class, GameObject, AABB) {

    /**
     * Can decide whether the mouse is over it (in any view). If the mouse enters or leaves, mouseOver and mouseOut
     * events are emitted. When global mouse events are emitted (keyPress.mouseLeft, etc.) and the mouse is over the
     * instance, the event is emitted locally. This class works when AABB interface is implemented.
     *
     * @class Grape.Mouse
     * @uses Grape.GameObject
     * @uses Grape.AABB
     */
    return Class('Mouse', [GameObject, AABB], {
        /**
         * Returns the mouse is over the instance in any view.
         *
         * @method isMouseOver
         * @return {Boolean} true, if mouse is over the instance in any view.
         */
        isMouseOver: function () {
            return this._mouseOver;
        },
        'global-event beforeMouseMove': function () { //pessimistic search
            this._hasMouse = false;
        },
        'global-event mouseMoveView': function (view) {
            var bounds = this.getBounds(),
                mouse = view.mouse;
            if (mouse.x >= bounds.left && mouse.x < bounds.right && mouse.y >= bounds.top && mouse.y < bounds.bottom) {
                this._hasMouse = true;
                if (!this._mouseOver) {
                    this._mouseOver = true;
                    /**
                     * When the mouse enters, this event is emitted.
                     *
                     * @event mouseOut
                     */
                    this.emit('mouseOver');
                }
            }
        },
        'global-event afterMouseMove': function () { //if none of the view's mouse is inside the obj
            if (!this._hasMouse && this._mouseOver) {
                this._mouseOver = false;
                /**
                 * When the mouse leaves, this event is emitted.
                 *
                 * @event mouseOut
                 */
                this.emit('mouseOut');
            }
        },
        /**
         * Fires the global mouse event locally, when a global mouse event is emitted and the mouse is over the
         * instance.
         *
         * @event <mouse events>
         */
        'global-event keyPress': { //TODOv2 create with loop
            //todov2 view stores instances under mouse and emits click events
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('keyPress.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('keyPress.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('keyPress.mouseRight');
                }
            }
        },

        'global-event keyRelease': {
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('keyRelease.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('keyRelease.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('keyRelease.mouseRight');
                }
            }
        },

        'global-event keyDown': {
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('keyDown.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('keyDown.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('keyDown.mouseRight');
                }
            }
        },
        'abstract getBounds': null,
        'abstract getLeft': null,
        'abstract getTop': null,
        'abstract getRight': null,
        'abstract getBottom': null,
        'abstract getWidth': null,
        'abstract getHeight': null
    });
});
define('mk', ['m3', 'mc', 'ma'], function (Class, Position, GameObject) {
    //TODOv2 friction, acceleration...
    /**
     * Provides simple physics: velocity. In the future more features can be added like friction or acceleration
     *
     * @class Grape.Physical
     * @uses Grape.Position
     * @uses Grape.GameObject
     */
    return Class('Physical', [Position, GameObject], { //TODOv2 more method
        init: function (opts) {
            opts = opts || {};
            this.speedX = opts.speedX || 0;
            this.speedY = opts.speedY || 0;
        },
        /**
         * Returns the speed of the instance, calculated by the speedX and speedY properties.
         *
         * @method getSpeed
         * @return {Number}
         */
        getSpeed: function () {
            return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        },
        /**
         * Sets the speed of the instance, keeping the original direction (or the opposite if speed is negative). If
         * Original speed is 0, the direction is considered as 0 (left-to right).
         *
         * @method setSpeed
         * @param {Number} speed new Speed
         * @chainable
         * @return {Grape.Physical} this
         */
        setSpeed: function (speed) {
            var s = this.getSpeed();
            if (s !== 0) {
                this.speedX *= speed / s;
                this.speedY *= speed / s;
            } else {
                this.speedX = speed; //if speed was 0, start moving right
            }
            return this;
        },
        /**
         * Increases the speed by a given amount, keeping the original direction.
         *
         * @method accelerate
         * @param {Number} plus The amount the speed is increased with
         * @chainable
         * @return {Grape.Physical} this
         */
        accelerate: function (plus) {
            return this.setSpeed(this.getSpeed() + plus);
        },
        'global-event frame': function () {
            this.x += this.speedX;
            this.y += this.speedY;
        }
    });
});
define('ml', ['m3', 'md'], function (Class, Visualizer) {
    /**
     * A Rectangle visualizer.
     *
     * @constructor
     * @class Grape.Rectangle
     * @uses Grape.Visualizer
     * @param {Object} [opts] Initial values of properties
     */
    return Class('Rectangle', Visualizer, {
        init: function (opts) {
            opts = opts || {};

            /**
             * The width of the rectangle
             *
             * @property width
             * @default 0
             * @type {number}
             */
            this.width = opts.width || 0;
            /**
             * The height of the rectangle
             *
             * @property height
             * @default 0
             * @type {number}
             */
            this.height = opts.height || 0;
            /**
             * The border width
             *
             * @property borderWidth
             * @default 1
             * @type {number}
             */
            this.borderWidth = opts.borderWidth === undefined ? 1 : opts.borderWidth;
            /**
             * The background color
             *
             * @property backgroundColor
             * @default '#fff'
             * @type {number}
             */
            this.backgroundColor = opts.backgroundColor || '#fff';
            this.borderColor = opts.borderColor || '#000';
        },
        'override visualize': function (ctx) { //todov2 background api
            ctx.fillStyle = this.backgroundColor;
            ctx.borderStyle = this.borderColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        'override getBounds': function () {
            return {
                left: this.x,
                top: this.y,
                right: this.x + this.width,
                bottom: this.y + this.height
            };
        },
        'override getLeft': function () {
            return this.x;
        },

        'override getTop': function () {
            return this.y;
        },

        'override getRight': function () {
            return this.x + this.width;
        },

        'override getBottom': function () {
            return this.y + this.height;
        },

        'override getWidth': function () {
            return this.width;
        },

        'override getHeight': function () {
            return this.height;
        }
    });
});
define('mm', ['m7', 'mb', 'mf', 'mg', 'mi', 'm8', 'mj', 'mk', 'mc', 'ml', 'me', 'm9', 'md'], function (AABB, Alarm, Animation, Chainable, Collision, EventEmitter, Mouse, Physical, Position, Rectangle, SpriteVisualizer, Tag, Visualizer) {
    return {
        AABB: AABB,
        Alarm: Alarm,
        Animation: Animation,
        Collidable: Collision.Collidable,
        CollisionSystem: Collision.CollisionSystem,
        EventEmitter: EventEmitter,
        Mouse: Mouse,
        Physical: Physical,
        Position: Position,
        Rectangle: Rectangle,
        SpriteVisualizer: SpriteVisualizer,
        TagContainer: Tag.TagContainer,
        Taggable: Tag.Taggable,
        Visualizer: Visualizer
    };
});
define('mn', ['m3', 'm1', 'mh', 'm2'], function (Class, Env, System, Utils) {
    function propValue(prop, max) {
        if (typeof (prop) === 'function') {
            return prop(max);
        }
        if (parseFloat(prop) + '' === prop + '') { //number format
            return prop * 1;
        } else {
            return createFunction('p', 'return ' + prop.replace(/%/g, '/100*p') + ';')(max);
        }
    }

    var fnCache = {}; //params+body -> function
    var cacheOrder = []; //params+body

    function createFunction(params, body) {
        /*jslint evil: true */
        var key = params + ';' + body;
        if (!fnCache[key]) {
            if (cacheOrder.length >= 100) { //cache full
                delete fnCache[cacheOrder.shift()];
            }
            fnCache[key] = new Function(params, body);
            cacheOrder.push(key);
        }
        return fnCache[key];
    }

    //TODOv2 follow player etc.
    /**
     * Provides a viewport to the game. The dimension properties (width, height, left, top, originX, originY) are
     * calculated dynamically. You can set these properties as functions or evaluated strings, like '30%+40'.
     *
     * @class Grape.AbstractView
     * @uses Grape.System
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('AbstractView', System, {
        init: function (opts) {
            /**
             * The width of the view. The maximum value (100%) is the container width.
             *
             * @property width
             * @type {String|Number|Function}
             * @default '100%'
             */
            this.width = '100%';
            /**
             * The height of the view. The maximum value (100%) is the container height.
             *
             * @property height
             * @type {String|Number|Function}
             * @default '100%'
             */
            this.height = '100%';
            /**
             * The left axis of the view in the container. The maximum value (100%) is the container width.
             *
             * @property left
             * @type {String|Number|Function}
             * @default 0
             */
            this.left = 0;
            /**
             * The top axis of the view in the container. The maximum value (100%) is the container height.
             *
             * @property top
             * @type {String|Number|Function}
             * @default 0
             */
            this.top = 0;
            /**
             * The horizontal origin of the view. Tells where should a point with x = view.x appear on the screen. The
             * maximum value (100%) is the width of the view.
             *
             * @property originX
             * @type {String|Number|Function}
             * @default 0
             */
            this.originX = 0;
            /**
             * The vertical origin of the view. Tells where should a point with y = view.y appear on the screen. The
             * maximum value (100%) is the height of the view.
             *
             * @property originY
             * @type {String|Number|Function}
             * @default 0
             */
            this.originY = 0;

            /**
             * The x coordinate of the showed area.
             *
             * @property x
             * @type {Number}
             * @default 0
             */
            this.x = 0;

            /**
             * The y coordinate of the showed area.
             *
             * @property y
             * @type {Number}
             * @default 0
             */
            this.y = 0;
            /* TODOv2 doc
             * The zoom level of the view.
             *
             * @property zoom
             * @type {Number}
             * @default 1
             */
            this.zoom = 1; //TODOv2 use
            /**
             * The global alpha value of the view.
             *
             * @property alpha
             * @type {number}
             * @default 1
             */
            this.alpha = 1;
            Utils.extend(this, opts);
        },
        _calculateMouse: function (mouse) {
            /**
             * Information about the mouse relative to the view.
             *
             * @property mouse
             * @type {number}
             */
            var viewX = this.mouse.view.x = mouse.x - this.getLeft();
            var viewY = this.mouse.view.y = mouse.y - this.getTop();
            this.mouse.x = viewX + this.x - this.getOriginX();
            this.mouse.y = viewY + this.y - this.getOriginY();
            this.mouse.inView = false;
            if (viewX >= 0 && viewY >= 0 && viewX < this.getWidth() && viewY < this.getHeight()) {
                this.mouse.inView = true;
                mouse.view = this;
                /**
                 * Emitted to the containing layer when the mouse position changed according to the position in the
                 * previous frame. The parameter is the view.
                 *
                 * @event mouseMoveView (layer)
                 */
                this.getLayer().emit('mouseMoveView', this);
            }
        },
        'event start': function (game) {
            var el;
            this._game = game;
            this.mouse = {
                view: {}
            };
            /* istanbul ignore else */
            if (Env.browser) {
                el = this.el = this.createDom();
                el.style.position = 'absolute';
                this.updateSize();
                this._game.getScreen().appendChild(el);
                /**
                 * This event is fired after the createDom() method is called and the DOM element is appended to the
                 * container. The parameter is the element.
                 *
                 * @event domCreated
                 */
                this.emit('domCreated', el);
            }
            this._calculateMouse(game.input.mouse);
        },
        'event stop': function () {
            /* istanbul ignore else */
            if (Env.browser) {
                this.el.parentNode.removeChild(this.el);
            }
        },
        'event renderLayer': function () {
            this.el.style.left = this.getLeft() + 'px';
            this.el.style.top = this.getTop() + 'px';
            this.el.style.opacity = this.alpha;
            this.updateSize();
        },
        'event mouseMove': function (mouse) {
            this._calculateMouse(mouse);
        },
        /**
         * This method is called in each render frame, and should be update the displayed element's width.
         * The default functionality is setting the style width and height, but for canvas it is different.
         *
         * @method updateSize
         */
        updateSize: function () {
            this.el.style.width = this.getWidth() + 'px';
            this.el.style.height = this.getHeight() + 'px';
        },
        /**
         * Returns the calculated width left.
         *
         * @method getLeft
         * @return {Number} calculated left
         */
        getLeft: function () {
            return propValue(this.left, this._game.getScreenWidth()) >> 0;
        },
        /**
         * Returns the calculated top value.
         *
         * @method getTop
         * @return {Number} calculated top
         */
        getTop: function () {
            return propValue(this.top, this._game.getScreenHeight()) >> 0;
        },
        /**
         * Returns the calculated width value.
         *
         * @method getWidth
         * @return {Number} calculated width
         */
        getWidth: function () {
            return propValue(this.width, this._game.getScreenWidth()) >> 0;
        },
        /**
         * Returns the calculated height value.
         *
         * @method getHeight
         * @return {Number} calculated height
         */
        getHeight: function () {
            return propValue(this.height, this._game.getScreenHeight()) >> 0;
        },
        /**
         * Returns the calculated originX value.
         *
         * @method getOriginX
         * @return {Number} calculated originX
         */
        getOriginX: function () {
            return propValue(this.originX, this.getWidth()) >> 0;
        },
        /**
         * Returns the calculated originY value.
         *
         * @method getOriginY
         * @return {Number} calculated originY
         */
        getOriginY: function () {
            return propValue(this.originY, this.getHeight()) >> 0;
        },
        /**
         * This abstract method should create the HTMLElement which serves
         *
         * @method createDom
         * @return {HTMLElement} Canvas
         */
        'abstract createDom': null
    });
});
define('mo', ['m3', 'm1'], function (Class, Env) {
    var DROP_FRAME_THRESHOLD = Env.node ? 100 : 0;
    //todov2 different parameters: don't drop frame?
    var reqTimeout, clearReqTimeout, reqInterval, clearReqInterval;
    if (Env.browser) {
        reqTimeout = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.mozRequestAnimationFrame;

        clearReqTimeout = window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            window.mozCancelRequestAnimationFrame;
    }

    if (reqTimeout) { //we have native requestAnimationFrame
        reqInterval = function (callback) {
            var handle;

            function run() {
                callback();
                if (handle !== null) { //clearInterval not called inside callback
                    handle = reqTimeout(run);
                }
            }

            handle = reqTimeout(run);
            return {
                _stop: function () {
                    handle = null;
                    clearReqTimeout(handle);
                }
            };
        };

        clearReqInterval = function (handle) {
            handle._stop();
        };
    } else { //we have to use a polyfill
        reqTimeout = function (callback) {
            return setTimeout(callback, 16);
        };

        clearReqTimeout = function (handle) {
            clearTimeout(handle);
        };

        reqInterval = function (callback) {
            return setInterval(callback, 16);
        };

        clearReqInterval = function (handle) {
            clearInterval(handle);
        };
    }

    var now = Date.now ? Date.now : function () {
        return new Date().getTime();
    };

    function StopFrame() {
    }

    StopFrame.prototype = new Error();
    StopFrame.prototype.name = 'StopFrame';
    /**
     * A class which serves as a loop. It uses requestAnimationFrame if possible. It tries to execute the game.frame()
     * game.getRequiredFps() times a second. The game.render() method will be executed 0 or 1 times in each
     * animation frame, depending on the game.frame() was executed at least once or not.
     *
     * @class Grape.GameLoop
     * @constructor
     * @param {Grape.Game} game the game for frame(), render() and getRequiredFps() calls
     */
    return Class('GameLoop', {
        init: function (game) {
            this.intervalId = null;
            this.game = game;
            this.insideFrame = false;
        },
        /**
         * Starts the game loop.
         *
         * @method start
         */
        start: function () {
            if (this.isRunning()) {
                throw new Error('already running');
            }
            var game = this.game;
            var loop = this;
            var backlog = 0;
            var last = now();
            var lastRenderStart = last;
            this.intervalId = reqInterval(function () {

                var start = now(), wasFrame = false;
                backlog += start - last;

                loop.insideFrame = true;
                try {
                    while (backlog > 0) {
                        backlog -= 1000 / game.getRequiredFps();
                        wasFrame = true;
                        game.frame();
                        //can't keep up
                        if (now() - lastRenderStart > 16 + DROP_FRAME_THRESHOLD + 1000 / game.getRequiredFps()) {
                            backlog = 0;
                        }
                    }
                    if (wasFrame) {
                        last = start;
                        lastRenderStart = now();
                        game.render(); //TODOv2 can skip render?
                    }
                } catch (e) {
                    if (!(e instanceof StopFrame)) {
                        throw e;
                    }
                } finally {
                    loop.insideFrame = false;
                }
            }); //TODOv2 run once before set interval?
        },
        /**
         * Stops the game loop
         *
         * @method stop
         */
        stop: function () {
            if (!this.isRunning()) {
                throw new Error('not running');
            }
            clearReqInterval(this.intervalId);
            this.intervalId = null;

            if (this.insideFrame) {
                throw new StopFrame();
            }
        },
        /**
         * Tells whether the game loop is running or not.
         *
         * @method isRunning
         * @return {Boolean} true, if running
         */
        isRunning: function () {
            return this.intervalId !== null;
        }
    });
});
define('mp', ['m3', 'm1', 'm2'], function (Class, Env, Utils) {
    //TODOv2 node environment
    var KEYS = {
        any: 'any',
        none: 'none',
        mouse1: 'mouseLeft',
        mouse2: 'mouseMiddle',
        mouse3: 'mouseRight',
        8: 'backspace',
        9: 'tab',
        12: 'clear',
        13: 'enter',
        16: 'lshift',
        17: 'ctrl',
        18: 'alt',
        19: 'pause',
        20: 'rshift',
        27: 'esc',
        32: 'space',
        33: 'pagegup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'delete',
        91: 'windows',
        93: 'contextmenu',
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111: '/',
        144: 'numlock',
        186: 'é',
        187: 'ó',
        188: ',',
        189: '/',
        190: '.',
        191: 'ü',
        192: 'ö',
        219: '\u0151',
        220: '\u0171',
        221: 'ú',
        222: 'á',
        226: 'í'
    };
    var REVERSED_KEYS = {};
    var i;
    /**
     * An object which stores the mouse position relative to the page. In the most cases you want to use the instance
     * level mouse property instead.
     *
     * @property mouse
     * @static
     * @type {Object}
     */
    var mouseScreen = {
        /**
         * Mouse x relative to document.
         *
         * @property mouse.x
         * @static
         * @type Number
         */
        x: 0,
        /**
         * Mouse y relative to document.
         *
         * @property mouse.y
         * @static
         * @type Number
         */
        y: 0
    };

    /*register letters*/
    for (i = 65; i <= 90; ++i) {
        KEYS[i] = String.fromCharCode(i).toLowerCase();
    }

    /*register digits*/
    for (i = 0; i <= 9; ++i) {
        KEYS[i + 48] = i;
    }

    /*register numpad digits*/
    for (i = 0; i <= 9; ++i) {
        KEYS[i + 96] = 'num' + i;
    }

    /*register function keys*/
    for (i = 1; i <= 12; ++i) {
        KEYS[i + 111] = 'f' + i;
    }

    /*reverse*/
    for (i in KEYS) {
        REVERSED_KEYS[KEYS[i]] = i;
    }


    function isKeyIn(key, keySet) {
        var i;
        if (key === "any" || key === "none") {
            for (i in keySet) {
                return key === "any";
            }
            return key === "none";
        }
        return keySet[REVERSED_KEYS[key]] === true;
    }

    function dispatchKeys(target, keys, prefix) {
        var keyNum = 0;
        for (var i in keys) {
            if (keyNum === 0) { //first key
                target.emit(prefix + '.any', i);
            }
            ++keyNum;
            target.emit(prefix + '.' + KEYS[i]);
        }
        if (keyNum === 0) {
            target.emit(prefix + '.none');
        }
    }

    if (Env.browser) {
        //TODOv2 have to be initialized: https://forum.jquery.com/topic/is-it-possible-to-get-mouse-position-when-the-page-has-loaded-without-moving-the-mouse
        Utils.addEventListener(document, 'mousemove', function (event) {
            mouseScreen.x = event.clientX;
            mouseScreen.y = event.clientY;
        });
    }
    /**
     * Handles which key is down, just pressed or just released in a game. A Game  Also handles mouse. The following
     * keys are available:
     *  <ul>
     *      <li><code>any</code> (matches any key)</li>
     *      <li><code>none</code></li>
     *      <li><code>mouseLeft</code></li>
     *      <li><code>mouseMiddle</code></li>
     *      <li><code>mouseRight</code></li>
     *      <li><code>a</code> ... <code>z</code> (letter keys)</li>
     *      <li><code>0</code> ... <code>9</code> (digit keys)</li>
     *      <li><code>num0</code> ... <code>num9</code> (numpad keys)</li>
     *      <li><code>f1</code> ... <code>f12</code> (function keys)</li>
     *      <li><code>backspace</code></li>
     *      <li><code>tab</code></li>
     *      <li><code>enter</code></li>
     *      <li><code>lshift</code> (left shift)</li>
     *      <li><code>rshift</code> (right shift)</li>
     *      <li><code>ctrl</code></li>
     *      <li><code>alt</code></li>
     *      <li><code>pause</code></li>
     *      <li><code>clear</code></li>
     *      <li><code>esc</code></li>
     *      <li><code>space</code></li>
     *      <li><code>pageup</code></li>
     *      <li><code>pagedown</code></li>
     *      <li><code>end</code></li>
     *      <li><code>home</code></li>
     *      <li><code>left</code></li>
     *      <li><code>right</code></li>
     *      <li><code>up</code></li>
     *      <li><code>down<</code>/li>
     *      <li><code>insert</code></li>
     *      <li><code>delete</code></li>
     *      <li><code>windows</code></li>
     *      <li><code>contextmenu</code></li>
     *      <li><code>+</code></li>
     *      <li><code>-</code></li>
     *      <li><code>*</code></li>
     *      <li><code>.</code></li>
     *      <li><code>/</code></li>
     *      <li><code>numlock</code></li>
     *  </ul>
     *
     * @class Grape.Input
     * @constructor
     * @param {Object} [opts] Options
     * @param {Array} [opts.reservedKeys] keys for which browser's default action will be prevented. The Game class
     * passes this property when instantiating the input.
     */
    return Class('Input', {
        'static mouse': mouseScreen,
        /**
         * Sets the keys which would prevent the browser's default action to be triggered.
         *
         * @method setReservedKeys
         * @param {Array} keys Key ids
         */
        setReservedKeys: function (keys) {
            var result = {},
                i, key;
            for (i = 0; i < keys.length; i++) {
                key = REVERSED_KEYS[keys[i]];
                if (!key) {
                    throw new Error('Key ' + keys[i] + ' does not exist.');
                }
                result[key] = true;
            }
            this._reservedKeys = result;
        },
        init: function (opts) {
            opts = opts || {};
            this.downKeys = {};
            this.pressedKeys = {};
            this.releasedKeys = {};
            /**
             * The x and y coordinates of the mouse relative to the game screen.
             *
             * @property mouse
             * @type {Object}
             */
            this.mouse = {
                x: mouseScreen.x,
                y: mouseScreen.y,
                prevX: mouseScreen.x,
                prevY: mouseScreen.y,
                screen: mouseScreen
            };
            this.setReservedKeys(opts.reservedKeys || []);
        },
        _calculateMouse: function () {
            var rect = this._screen.getBoundingClientRect();
            this.mouse.x = mouseScreen.x - rect.left;
            this.mouse.y = mouseScreen.y - rect.top;
            this.mouse.view = null;
        },
        _start: function (screen) {
            var that = this;
            this._screen = screen;

            function down(key, event) {
                if (!that.downKeys[key]) {
                    that.pressedKeys[key] = true;
                }
                that.downKeys[key] = true;

                if (that._reservedKeys[key]) {
                    event.preventDefault();
                }
            }

            function up(key) {
                if (that.downKeys[key]) {
                    delete that.downKeys[key];
                    that.releasedKeys[key] = true;
                }
            }

            this.onKeyDown = function (event) {
                down(event.which, event);
            };
            this.onKeyUp = function (event) {
                up(event.which);
            };
            this.onContextMenu = function (event) {
                if (Utils.domContains(screen, event.target)) {
                    event.preventDefault();
                }
            };
            this.onMouseDown = function (event) {
                if (screen === event.target || Utils.domContains(screen, event.target)) {
                    down('mouse' + event.which, event);
                    event.preventDefault();
                }
            };
            this.onMouseUp = function (event) {
                up('mouse' + event.which);
            };
            this._calculateMouse();
            Utils.addEventListener(document, 'keydown', this.onKeyDown); //TODOv2 to loop
            Utils.addEventListener(document, 'keyup', this.onKeyUp); //TODOv2 handle all of these globally
            Utils.addEventListener(document, 'contextmenu', this.onContextMenu);
            Utils.addEventListener(document, 'mousedown', this.onMouseDown);
            Utils.addEventListener(document, 'mouseup', this.onMouseUp);
        },
        _stop: function () {
            Utils.removeEventListener(document, 'keydown', this.onKeyDown);
            Utils.removeEventListener(document, 'keyup', this.onKeyUp);
            Utils.removeEventListener(document, 'contextmenu', this.onContextMenu);
            Utils.removeEventListener(document, 'mousedown', this.onMouseDown);
            Utils.removeEventListener(document, 'mouseup', this.onMouseUp);
        },
        _emitEvents: function (target) {
            /**
             * Fires when the <key> was pressed since the last frame.
             *
             * @event keyPress.<key>
             */
            dispatchKeys(target, this.pressedKeys, 'keyPress');
            /**
             * Fires when the <key> is held in the current frame.
             *
             * @event keyDown.<key>
             */
            dispatchKeys(target, this.downKeys, 'keyDown');
            /**
             * Fires when the <key> was released since the last frame.
             *
             * @event keyRelease.<key>
             */
            dispatchKeys(target, this.releasedKeys, 'keyRelease');
            this._calculateMouse();
            if (this.mouse.prevX !== this.mouse.x || this.mouse.prevY !== this.mouse.y) {
                /**
                 * When the mouse moves, this is the first event emitted. The parameter is the mouse property of the
                 * input instance.
                 *
                 * @event beforeMouseMove
                 */
                target.emit('beforeMouseMove', this.mouse);
                /**
                 * When the mouse moves, this is the second event emitted. The parameter is the mouse property of the
                 * input instance.
                 *
                 * @event mouseMove
                 */
                target.emit('mouseMove', this.mouse);
                /**
                 * When the mouse moves, this is the third event emitted. The parameter is the mouse property of the
                 * input instance.
                 *
                 * @event afterMouseMove
                 */
                target.emit('afterMouseMove', this.mouse);
            }
            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.pressedKeys = {};
            this.releasedKeys = {};
        },
        /**
         * Resets the status of the input system. Since this point all key is considered as it wasn't held. When a key
         * is released when the document is not in focus (like during an alert call), it can be used.
         *
         * @method resetKeys
         */
        resetKeys: function () {
            this.pressedKeys = {};
            this.releasedKeys = {};
            this.downKeys = {};
        },
        /**
         * Tells whether the given key was pressed since the previous frame.
         *
         * @method isPressed
         * @param {String key Key id
         * @return {Boolean} true, if the key wasn't held in the last frame but now is.
         */
        isPressed: function (key) {
            return isKeyIn(key, this.pressedKeys);
        },
        /**
         * Tells whether the given key was released since the last frame.
         *
         * @method isReleased
         * @param {String} key Key id
         * @return {Boolean} true, if the key was held in the last frame and now isn't.
         */
        isReleased: function (key) {
            return isKeyIn(key, this.releasedKeys);
        },
        /**
         * Tells whether the user is holding a key.
         *
         * @method isDown
         * @param {String} key Key id
         * @return {Boolean} true, if held.
         */
        isDown: function (key) {
            return isKeyIn(key, this.downKeys);
        }
    });
});
define('mq', ['m3', 'm4', 'ma'], function (Class, Arr, GameObject) {
    var methods = {};

    function createProxy(method) {
        return function () {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][method].apply(this[i], arguments);
            }
            return this;
        };
    }

    for (var i in GameObject.methods) {
        methods[i] = createProxy(i);
    }

    /**
     * A special array, which contains GameObjects and provides the same methods as the GameObject. The methods iterate
     * through the elements, and calls the same method for each element with the given parameters.
     *
     * @class Grape.GameObjectArray
     * @uses Grape.Array
     * @constructor
     */
    return Class('GameObjectArray', Arr, methods);
});
define('mr', ['m3', 'm8', 'm9', 'ma', 'mq', 'm2', 'm5'], function (Class, EventEmitter, Tag, GameObject, GameObjectArray, Utils, Bag) {

    function addWithOrWithoutName(target, name, object) {
        if (object === undefined) { //no name
            object = name;
            target.push(object);
        } else {
            if (target[name]) {
                throw new Error('Element "' + name + '" already added.');
            }
            target[name] = object;
        }
        return object;
    }

    function remove(target, name) {
        if (typeof  name === 'string') { //by name
            if (!target[name]) {
                throw new Error('Element "' + name + '" does not exist.');
            }
            delete target[name];
        } else { //by object
            if (!Utils.removeFromArray(target, name)) {
                throw new Error('Element does not exist.');
            }
        }
    }

    /**
     * A layer contains instances, systems, and other layers.
     * When any event is emitted to the layer, it is emitted to the systems and layers of the layer too.
     * When you want to subscribe to the layer events with a GameObject (which is added to the layer) you can use the
     * gameObject.onGlobal() function or the global-event keyword.
     *
     * @class Grape.Layer
     * @uses Grape.EventEmitter
     * @uses Grape.TagContainer
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('Layer', [EventEmitter, Tag.TagContainer], {
        init: function (opts) {
            opts = opts || {};
            this.width = opts.widht || 400;
            this.height = opts.height || 300;
            this.background = opts.background || null;
            this.backgroundColor = opts.backgroundColor || null;

            this._classes = {};
            this._activeClasses = {};

            this.instanceNumber = 0;
            this._layers = [];
            this._systems = [];

            this._parentLayer = null;
        },
        /**
         * Adds an instance to the layer and emits it's "add" event.
         *
         * @method add
         * @param {Grape.GameObject} instance Instance
         * @return {Grape.GameObject} The added instance
         */
        add: function (instance) {
            var i, classData, parentId, clazz = instance.getClass(), classId = clazz.id, allParent;
            if (!instance.instanceOf(GameObject)) {
                throw new Error('The instance must be a descendant of Grape.GameObject.');
            }
            instance.setTagContainer(this);
            instance._layer = this;

            if (!(classData = this._classes[classId])) { //instance class is not registered yet
                this._activeClasses[classId] = this._classes[classId] = classData = {
                    id: classId,
                    clazz: clazz,
                    instances: new Bag(),
                    instanceNumber: 1,
                    descendants: []
                };
                allParent = clazz.allParent;
                for (i = allParent.length; --i >= 0;) {
                    parentId = allParent[i].id;
                    if (!this._classes[parentId]) { //parent type is not registered yet
                        this._classes[parentId] = {
                            id: parentId,
                            clazz: allParent[i],
                            instances: new Bag(),
                            instanceNumber: 0,
                            descendants: [classData]
                        };
                    } else {
                        this._classes[parentId].descendants.push(classData);
                    }
                }
            } else {
                this._activeClasses[classId] = classData; //set class active
                classData.instanceNumber++;
            }
            this.instanceNumber++;
            instance._index = classData.instances.add(instance) - 1; //store the index in the bag for efficient remove

            /**
             * This event is emitted to the instance when it is added to the layer. The parameter is the layer.
             *
             * @event add (instance)
             */
            instance.emit('add', this);
            return instance;
        },
        /**
         * Removes an instance from the layer and emits it's "remove" event.
         *
         * @method remove
         * @param instance
         */
        remove: function (instance) {
            var clazz = instance.getClass(), classId = clazz.id, typeData = this._classes[classId], instances = this._activeClasses[classId].instances, idx = instance._index, moved = instances.remove(idx);
            if (moved) {
                moved._index = idx; //update the index of the item moved to the position of the removed item
            }
            typeData.instanceNumber -= 1;
            if (typeData.instanceNumber === 0) {
                delete this._activeClasses[classId];
            }
            this.instanceNumber--;
            instance.removeTagContainer();

            /**
             * Emitted to the instance when it is removed from the layer.
             *
             * @event remove (instance)
             */
            instance.emit('remove');
        },
        /**
         * Returns the instances with the given tag. Instances are indexed by tags.
         *
         * @method getByTag
         * @return {Grape.GameObjectArray} Instances with the tag
         */
        getByTag: function (/*tag1, tag2, ...*/) {
            return this.parent(Tag.TagContainer, 'get').apply(this, arguments);
        },
        /**
         * Overrides the TagContainer's method so getByTag calls produce GameObjectArray results instead of Array.
         *
         * @method createResultContainer
         * @return {Grape.GameObjectArray}
         */
        'override createResultContainer': function () {
            return new GameObjectArray();
        },
        _getClasses: function (parent) {
            var result = {}, classData = this._classes[parent.id], i, desc;
            if (classData) {
                if (this._activeClasses[classData.id]) {
                    result[classData.id] = classData;
                }
                for (i = 0; i < classData.descendants.length; i++) {
                    desc = classData.descendants[i];
                    if (this._activeClasses[desc.id]) {
                        result[desc.id] = desc;
                    }
                }
            }
            return result;
        },
        _get: function (clazz) {
            var instances = this._activeClasses[clazz.id];
            if (instances) {
                return instances.instances;
            }
            return [];
        },
        /**
         * Gets the instances of one or more class in the current layer (sub-layers not included).
         *
         * @method get
         * @param {Class|Array} classes Class or classes
         * @param {Boolean} [descendants=false] Get the descendants of that class or just instances of the class itself
         * @return {GameObjectArray} Instances
         */
        get: function (classes, descendants) {
            var i, j, instances,
                classData, classDataArr = [], addedClasses = {}, result = new GameObjectArray();

            function addIfNotAdded(cd) {
                if (addedClasses[cd.id]) {
                    return;
                }
                addedClasses[cd.id] = true;
                instances = cd.instances;
                for (i = instances.length; i-- > 0;) { //todov2 use this loop everywhere if possible
                    result.push(instances[i]);
                }
            }

            if (classes) {
                if (!Utils.isArray(classes)) {
                    classes = [classes];
                }
                for (i = 0; i < classes.length; i++) {
                    classData = this._classes[classes[i].id];
                    if (classData) {
                        classDataArr.push(classData);
                    }
                }
            } else {
                /*jshint -W088 */ //due an issue: https://github.com/jshint/jshint/issues/1016
                for (i in this._activeClasses) {
                    classDataArr.push(this._activeClasses[i]);
                }
            }
            for (i = 0; i < classDataArr.length; i++) {
                classData = classDataArr[i];
                addIfNotAdded(classData);
                if (descendants) {
                    descendants = classData.descendants;
                    for (j = 0; j < descendants.length; j++) {
                        addIfNotAdded(descendants[j]);
                    }
                }
            }
            return result;
        },
        /**
         * Adds a sub-layer to the current layer.
         *
         * @method addLayer
         * @param {String} [name] Layer name
         * @param {Grape.Layer} layer Sub-layer
         */
        addLayer: function (name, layer) {
            layer = addWithOrWithoutName(this._layers, name, layer);
            layer._parentLayer = this;
            /*TODOv2 needed? if (this._started) {
             layer.emit('start');
             }*/
        },
        /**
         * Adds a system to the layer. All events are emitted to all added systems.
         *
         * @method addSystem
         * @param {String} [name] Name
         * @param {Grape.System} system The system
         */
        addSystem: function (name, system) { //todov2 add without name
            system = addWithOrWithoutName(this._systems, name, system);
            system._layer = this;
            if (this._started) {
                /**
                 * Emitted to a system when it is added to a running layer or when the layer is started with a system
                 * added before.
                 *
                 * @event start (system)
                 */
                system.emit('start');
            }
        },
        /**
         * Adds a view to the layer. A synonym for addSystem.
         *
         * @method addView
         * @param {String} name View name
         * @param {Grape.View} view The view
         */
        addView: function (name, view) { //todv2o create with view class if config object is given
            this.addSystem(name, view);
        },
        /**
         * Removes a layer.
         *
         * @method removeLayer
         * @param {String|Grape.Layer} name Name of the layer or the layer itself
         */
        removeLayer: function (name) { //todov2 stop event?
            remove(this._layers, name);
        },
        /**
         * Removes a system from the layer.
         *
         * @method removeSystem
         * @param {String|Grape.System} system The name of the system or the system itself.
         */
        removeSystem: function (system) {
            system = remove(this._systems, system);
            if (this._started) {
                /**
                 * Emitted to a system when it is removed from the running layer or when the layer is stopped.
                 *
                 * @event stop (system)
                 */
                system.emit('stop');
            }
        },
        /**
         * Removes a view from the layer. An alias for removeSystem.
         *
         * @method removeView
         * @param {String|Grape.View} name View name or the view itself
         */
        removeView: function (name) {
            this.removeSystem(name);
        },
        /**
         * Returns a system with the given name. Views are also considered as systems.
         *
         * @method getSystem
         * @param {String} name System name
         * @return {Grape.System} System
         */
        getSystem: function (name) {
            return this._systems[name];
        },
        /**
         * Returns the root layer.
         *
         * @method getScene
         * @return {Grape.Scene} The root layer
         */
        getScene: function () {
            if (this._parentLayer) {
                return this._parentLayer.getScene();
            }
            return this;
        },
        /**
         * Returns the current game.
         *
         * @method getGame
         * @return {Grape.Game} The game
         */
        getGame: function () {
            return this.getScene()._game;
        },
        'event start': function () {
            this._started = true;
        },
        'event render': function (ctx) {
            if (this.backgroundColor) {
                ctx.fillStyle = this.backgroundColor;
                ctx.fillRect(0, 0, this.width, this.height);
            }
            if (this.background) {
                var pattern = ctx.createPattern(this.background.img, 'repeat'); //TODOv2 create function for bg drawing
                ctx.rect(0, 0, this.width, this.height);
                ctx.fillStyle = pattern;
                ctx.fill();
                ctx.fillStyle = '';
            }
        },
        'event any': function (event, payload) {
            var i;
            for (i in this._layers) {
                this._layers[i].emit(event, payload);
            }
            for (i in this._systems) {
                this._systems[i].emit(event, payload);
            }
        }
    });
});
define('ms', ['m3', 'm1', 'mn'], function (Class, Env, AbstractView) {
    /**
     * A view using canvas to render. It emits the render event to the layer it is added to, with the canvas context as
     * parameter in each render frame. Because the layer emits any event to its sub-layers, instances in sub-layers are
     * alos visible.
     *
     * @class Grape.View
     * @uses Grape.AbstractView
     * @constructor
     */
    return Class('View', AbstractView, { //TODOv2 custom functions like ctx.extra.drawBackground()
        'override createDom': function () {
            var canvas = document.createElement('canvas');
            /**
             * The context of the view
             *
             * @property ctx
             * @type {CanvasRenderingContext2D}
             */
            this.ctx = canvas.getContext('2d');
            this.ctx.view = this;
            return canvas;
        },
        'event renderLayer': function () {
            this.ctx.clearRect(0, 0, this.el.width, this.el.height); //TODOv2 preserve surface (optional)
            this.ctx.translate(-this.x + this.getOriginX(), -this.y + this.getOriginY());
            /**
             * The render event is emitted to the layer with the canvas context parameter.
             *
             * @event render (layer)
             */
            this._layer.emit('render', this.ctx);
        },
        /**
         * Sets the width and height property for canvas (style.width and style.height are wrong).
         *
         * @method updateSize
         */
        'override updateSize': function () { //TODOv2 preserve data on resizing (optional)
            this.el.width = this.getWidth();
            this.el.height = this.getHeight();
        }
    });
});
define('mt', ['m3', 'mr', 'ms'], function (Class, Layer, View) {
    //TODOv2 JSON source
    /**
     * The root layer in a game. It describes the game FPS and has a default view which can be overridden with
     * initViews.
     *
     * @class Grape.Scene
     * @uses Grape.Layer
     */
    return Class('Scene', Layer, {
        init: function () {
            this._started = false; //todov2 ??
            this.fps = 30;
            this.initViews();
        },
        /**
         * This method is called in the constructor, and adds an initial view to the scene with name 'view'. If you
         * don't want this view, you can override this method and add your own views.
         *
         * @method initViews
         */
        initViews: function () {
            this.addView('view', new View());
        }
    });
});
define('mu', ['m3', 'm1', 'm8', 'mo', 'mp', 'mt'], function (Class, Env, EventEmitter, GameLoop, Input, Scene) {
    /**
     * A class that represents a game. You can create and run multiple games in a single page.
     *
     * @class Grape.Game
     * @uses Grape.EventEmitter
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('Game', EventEmitter, {
        init: function (opts) {
            opts = opts || {};
            /**
             *  The scene which starts when (re)starting the game.
             * It should be a constructor or a function returning with the scene, not an instantiated scene.
             *
             * @property initialScene
             * @type {Function}
             * @default Grape.Scene
             */
            this.initialScene = opts.initialScene || Scene;
            /* istanbul ignore else */
            if (opts.hasOwnProperty('container')) { //null and undefined too
                /**
                 * The dom element which serves as the screen of the game. The size of the container is not manipulated
                 * by the engine, therefore you should set the size of it. The engine handles when this "screen size"
                 * changes and updates the displayed views. The container can be an id of a html element or a html
                 * element itself.
                 *
                 * @property container
                 * @type {String|HTMLElement}
                 * @default document.body
                 */
                this.container = opts.container;
            } else if (Env.browser) {
                this.container = document.body;
            }
            this.gameLoop = this.createGameLoop();
            /* istanbul ignore else */
            if (Env.browser) {
                this.input = new Input({reservedKeys: opts.reservedKeys});
            }
        },
        /**
         * This method is called once when the game is created. If you want to use a custom game loop for your game, you
         * can override this method.
         *
         * @method createGameLoop
         * @return {Grape.GameLoop} The game loop
         */
        createGameLoop: function () {
            return new GameLoop(this);
        },
        /**
         * Starts the game. Initializes the game screen, the input system, and the game loop.
         *
         * @method start
         * @param {Grape.Scene} [scene] Initial scene, which overrides the initialScene property.
         */
        'final start': function (scene) {
            if (this.gameLoop.isRunning()) {
                throw new Error('already running');
            }

            //initialize screen
            /* istanbul ignore else */
            if (Env.browser) {
                if (typeof this.container === 'string') {
                    this.container = document.getElementById(this.container);
                }
                if (!this.container) {
                    throw new Error('Container does not exists!');
                }
                this.container.innerHTML = ''; //todov2 test restart
                this._screen = document.createElement('div');
                this._screen.style.position = 'relative';
                this._screen.style.float = 'left';
                this._screen.style.width = '100%';
                this._screen.style.height = '100%';
                this._screen.style.overflow = 'hidden';
                this.container.appendChild(this._screen);
            }

            this._starting = true; //startScene can run now
            /* istanbul ignore else */
            if (this.input) {
                this.input._start(this._screen);
            }
            scene = scene || this.initialScene;
            this.startScene(typeof scene === 'function' ? new scene() : scene);
            this._starting = false;
            this.gameLoop.start();
        },
        /**
         * Stops the game.
         *
         * @method stop
         */
        'final stop': function () { //TODOv2 remove screen
            this.gameLoop.stop();
            /* istanbul ignore else */
            if (this.input) {
                this.input._stop();
            }
            /**
             * Fired when the stop() method is called.
             *
             * @event stop
             */
            this.emit('stop');
        },
        /**
         * Starts a new scene in the game.
         *
         * @method startScene
         * @param {Scene} scene The scene
         */
        startScene: function (scene) {
            if (!this._starting && !this.gameLoop.isRunning()) {
                throw new Error('Game is not running! You can game.start(scene).');
            }

            if (scene._game) {
                throw new Error('Scene already started!');
            }
            if (this.scene) {
                /**
                 * Fired to the scene when the scene is stopped.
                 *
                 * @event stop (scene)
                 */
                this.scene.emit('stop');
                this.scene._game = null;
            }

            scene._game = this;
            this.scene = scene;
            /**
             * Emitted to the scene when started. The parameter is the game.
             *
             * @event start (scene)
             */
            scene.emit('start', this);
        },
        /**
         * Called by the game loop in each frame.
         *
         * @method frame
         */
        frame: function () {
            /**
             * Fired in each frame
             *
             * @event frame
             */
            this.emit('frame');
            /**
             * Fired to the actual scene in each frame
             *
             * @event frame (scene)
             */
            this.scene.emit('frame');
            /* istanbul ignore else */
            if (this.input) {
                this.input._emitEvents(this.scene); //TODOv2 is it wrong? ie. keyPress.none?
            }
        },
        /**
         * Called by the game loop when at least one frame was executed since the last screen update.
         *
         * @method render
         */
        render: function () {
            /* istanbul ignore else */
            if (Env.browser) {
                /**
                 * Fired to the current scene in each render frame
                 *
                 * @event renderLayer (scene)
                 */
                this.scene.emit('renderLayer');
            }
        },
        /**
         * Returns the game screen which is appended to the container.
         *
         * @method getScreen
         * @return {HTMLElement} Screen element
         */
        getScreen: function () {
            return this._screen;
        },

        /**
         * Returns the width of the screen.
         *
         * @method getScreenWidth
         * @return {Number} Width
         */
        getScreenWidth: function () {
            /* istanbul ignore next */
            return this._screen ? this._screen.offsetWidth : 1;
        },

        /**
         * Returns the height of the screen.
         *
         * @method getScreenHeight
         * @return {Number} Height
         */
        getScreenHeight: function () {
            /* istanbul ignore next */
            return this._screen ? this._screen.offsetHeight : 1;
        },

        /**
         * Sets the cursor style for the screen.
         *
         * @method setCursor
         * @param {String} cursor new cursor style
         */
        setCursor: /* istanbul ignore next */ function (cursor) {
            if (!this._screen) {
                return;
            }
            this._screen.style.cursor = cursor;
        },
        /**
         * Returns the current scene.
         *
         * @method getScene
         * @return {Grape.Scene}
         */
        getScene: function () {
            return this.scene; //todov2 rename to _scene
        },

        /**
         * This method is called by the game loop to determine what is the required FPS (Frames Per Second) for the
         * game. By default, this is decided by the "fps" property of the current scene.
         *
         * @method getRequiredFps
         * @return {Number} FPS
         */
        getRequiredFps: function () {
            return this.scene.fps;
        }
    });
});
define('mv', ['m3', 'mn'], function (Class, AbstractView) {
    /**
     * A View which creates a simple div as view, which can be used to render real DOM elements.
     *
     * @class Grape.GUIView
     * @uses Grape.AbstractView
     * @constructor
     */
    return Class('GUIView', AbstractView, {
        createDom: function () {
            return document.createElement('div');
        }
    });
});
define('mw', ['mn', 'mu', 'mo', 'ma', 'mq', 'mv', 'mp', 'mr', 'mt', 'mh', 'ms'], function (AbstractView, Game, GameLoop, GameObject, GameObjectArray, GUIView, Input, Layer, Scene, System, View) {
    return {
        AbstractView: AbstractView,
        Game: Game,
        GameLoop: GameLoop,
        GameObject: GameObject,
        GameObjectArray: GameObjectArray,
        GUIView: GUIView,
        Input: Input,
        Layer: Layer,
        Scene: Scene,
        System: System,
        View: View
    };
});
define('mx', ['m3', 'm8'], function (Class, EventEmitter) {
    /**
     * An abstract class to represent a resource. A resource can load itself, and can tell the estimated time to load
     * it (default:1).
     *
     * @class Grape.Resource
     * @uses Grape.EventEmitter
     */
    return Class('Resource', EventEmitter, {
        /**
         * Returns the estimated time to load the resource. Can be overridden.
         * @method getEstimatedTime
         * @return {number} The estimated time
         */
        getEstimatedTime: function () { //TODOv2
            return 1;
        },
        /**
         * Called when the resource is needed to load.
         *
         * @method load
         * @param {Function} onFinish have to be called when the resource is finished
         * @param {Function} onError have to be called when an error occurs
         * @param {Function} onProgress may be called when the progress changes (value in percent)
         */
        'abstract load': null
    });
});
define('my', ['m3', 'mx'], function (Class, Resource) {
    var cache = {};

    /**
     * Provides a cache feature for a resource: when a resource is loaded multiple times, the expensive operations are
     * executed only once. The resource uses the loadResource method to tell what to do when the resource should be
     * actually loaded. A typical usage is for tile maps, when multiple sprites are on the same image.
     *
     * @class Grape.Cacheable
     * @uses Grape.Resource
     * @constructor
     */
    return Class('Cacheable', Resource, { //todov2 disable cache with a property?
        'final override load': function (onFinish, onError, onProgress) {
            var key = this.getResourceKey(), that = this;
            if (cache[key]) {
                if (!this.processed) {
                    this.process(cache[key]);
                    this.processed = true;
                }
                onFinish();
            } else {
                this.loadResource(function (data) {
                    cache[key] = data;
                    that.process(data);
                    that.processed = true;
                    onFinish();
                }, onError, onProgress);
            }
        },
        /**
         * An abstract method which should return the same key when the resource is the same, it is used as cache key.
         * A typical key is the url.
         *
         * @method getResourceKey
         */
        'abstract getResourceKey': null,

        /**
         * This method is called when we want to load the resource and it is not in the cache.
         *
         * @method loadResource
         * @param {Function} onFinish Should be called when the resource is ready. The parameter is the loaded data.
         * @param {Function} onError Should be called when an error occurs
         * @param {Function} onProgress Should be called when the loading progress changes (0-100)
         */
        'abstract loadResource': null,
        /**
         * This method is called after load is called. If load is called multiple times, this method is not called more
         * than once. It should initialize the resource with the loaded data.
         *
         * @method process
         * @param (*) data The loaded data (passed to the onFinish method in loadResource
         */
        'abstract process': null
    });
});
define('mz', ['m3', 'm1', 'my', 'm2'], function (Class, Env, Cacheable, Utils) {
    /*global Audio, AudioBuffer, Media, Cordova*/
    //TODOv2 partial preload for large files
    var defaultPlayOpts = {
        volume: 100
    };

    /*jshint newcap:false */
    /*global webkitAudioContext */
    var context = typeof webkitAudioContext === 'function' ? new webkitAudioContext() : null;

    var canPlay = (function () {
        var extensions, formats, i, max, canPlayTypes, audio, can;
        if (typeof Audio === 'function') {
            extensions = ['mp3', 'wav', 'ogg'];
            formats = ['audio/mpeg', 'audio/wav; codecs="1"', 'audio/ogg; codecs="vorbis"'];
            audio = new Audio();
            canPlayTypes = {};
            for (i = 0, max = extensions.length; i < max; ++i) {
                can = audio.canPlayType(formats[i]);
                if (can === 'maybe' || can === 'probably') {
                    canPlayTypes[extensions[i]] = true;
                }
            }
            return canPlayTypes;
        } else {
            return {};
        }
    })();

    function getPhoneGapPath() {
        var path = window.location.pathname;
        return 'file://' + path.substr(0, path.length - 10);
    }

    /**
     * Represents a sound. It decides from the extension of the given url which to use.
     *
     * @class Grape.Audio
     * @uses Grape.Cacheable
     * @constructor
     * @param {Object} opts Audio options
     * @param {String} url1 Audio URL
     * @param {String} url2 Audio URL fallback if url1 extension is not supported
     * @param {String} url3 Audio URL fallback if url2 extension is not supported
     */
    return Class('Audio', Cacheable, {
        init: function (opts, url1, url2, url3) {
            var url = null,
                urls, i;
            if (typeof opts === 'string') { //no opts given
                url3 = url2;
                url2 = url1;
                url1 = opts;
                opts = {}; //todov2 use
            }


            urls = [url1, url2, url3];
            for (i = 0; i < urls.length; ++i) {
                if (urls[i] && canPlay[urls[i].substring(urls[i].length - 3)]) {
                    url = urls[i];
                    break;
                }
            }
            if (url === null) {
                //TODOv2 warning None of the given formats is supported by your browser!
            }

            this.url = url;
        },
        'override loadResource': function (onFinish, onError) { //TODOv2 preload phonegap audio
            if (Env.node) {
                onFinish(null);
            } else if (location.protocol !== 'file:' && typeof Blob === 'function') { //load as blob
                Utils.ajax(this.url, {responseType: 'arraybuffer'}, function (response) {
                    if (context && typeof intel==='undefined') {
                        context.decodeAudioData(response, function (buffer) {
                            onFinish(buffer);
                        });
                    } else {
                        var blob = new Blob([response], {type: 'audio'});
                        onFinish({
                            url: URL.createObjectURL(blob),
                            blob: blob
                        });
                    }
                }, function () {
                    onError();
                });
            } else if (typeof Audio === 'function' && typeof Cordova === 'undefined') {
                //TODOv2 IE9 loads a sound multiple times
                var a = new Audio();
                a.src = this.url;
                a.addEventListener('canplaythrough', function () {
                    var arr = [];
                    arr.next = 0;
                    for (var i = 0; i < 8; ++i) {
                        arr[i] = a.cloneNode(false);
                    }
                    onFinish(arr);
                }, false);
                a.load();
            } else if (typeof Media === 'function') {
                onFinish('cordova');
            } else {
                //No audio support
                onFinish(null);
            }
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (buffer) {
            this.buffer = buffer;
        },
        /**
         * Plays the audio.
         *
         * @method play
         */
        'play': function (opts) {
            var src, snd;
            if (this.buffer === undefined) {
                throw new Error('Audio is not loaded yet.');
            }
            opts = opts || defaultPlayOpts; //TODOv2 use

            //TODOv2 separate to classes instead of instanceof
            if (this.buffer === null) { //no sound

            } else if (typeof this.buffer === 'object' && this.buffer.url) { //loading created a blob url
                snd = new Audio(this.buffer.url);
                snd.play();
            } else if (context && this.buffer instanceof AudioBuffer) {//webAudio
                src = context.createBufferSource();
                src.buffer = this.buffer;
                src.connect(context.destination);
                src.noteOn(0);
            } else if (typeof Audio === 'function' && typeof Cordova === 'undefined' && this.buffer instanceof Array) { //IE9
                snd = this.buffer[this.buffer.next++];
                if (this.buffer.next === this.buffer.length) {
                    this.buffer.next = 0;
                }
                snd.play();
            } else if (typeof Media !== 'undefined') { //Cordova
                src = getPhoneGapPath() + this.url;
                snd = new Media(src, function () {
                    snd.release();
                }, function () {
                    //TODOv2 handle error
                });
                snd.play();
            }
        }
    });
});
define('m10', ['m3', 'mt', 'my', 'm2'], function (Class, Scene, Cacheable, Utils) {
    /**
     * Represents a JSON scene source. After the scene source is loaded, you can instantiate the scene. The type of the
     * instances have to be defined in a type mapping.
     *
     * @class Grape.JSONSceneSource
     * @uses Grape.Cacheable
     * @constructor
     * @param {String} url JSON url
     * @param {Object} opts Initial properties
     */
    return Class('JSONSceneSource', Cacheable, { //TODOv2 unload unnecessary scenes?
        init: function (url, opts) {
            opts = opts || {};
            this.url = url;
            /**
             * The type mapping as key:class pairs.
             *
             * @property typeMapping
             * @type {Object}
             */
            this.typeMapping = opts.typeMapping || {};
            /**
             * The type(class) of the scene to create.
             *
             * @property type
             * @type Class
             * @default Grape.Scene
             */
            this.type = opts.type || Scene;
            this.data = null;
        },
        'override loadResource': function (onFinish, onError) {
            Utils.ajax(this.url, function (response) {
                onFinish(Utils.parseJSON(response));
            }, function () {
                onError();
            });
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (data) {
            this.data = data;
        },
        /**
         * Instantiates the scene.
         *
         * @method create
         * @return {Scene} The new scene instance
         */
        create: function () {
            var i, j, scene, row, inst, clazz, data, typeProp, w, h, instances;
            if (this.data === null) {
                throw new Error('Scene not loaded yet.');
            }
            instances = this.data.instances ? this.data.instances.slice(0) : [];
            scene = new this.type();

            w = this.data.cellWidth || 1;
            h = this.data.cellHeight || 1;

            if (this.data.attributes) {
                for (i in this.data.attributes) {
                    scene[i] = this.data.attributes[i];
                }
            }

            if (this.data.matrix) {
                for (i = 0; i < this.data.matrix.length; i++) {
                    row = this.data.matrix[i];
                    for (j = 0; j < row.length; j++) {
                        instances.push([row[j], j * w, i * h]);
                    }
                }
            }

            for (i = 0; i < instances.length; i++) {
                inst = instances[i];
                if (inst.type) {//object format
                    typeProp = 'type';
                    data = inst.data;
                } else { //array format
                    typeProp = '0';
                    data = {x: inst[1], y: inst[2]};
                }

                clazz = this.typeMapping[inst[typeProp]];
                if (clazz !== null) {
                    if (!clazz) { //undefined
                        throw new Error('Type "' + inst[typeProp] + '" is not registered in the type mapping.');
                    }
                    scene.add(new clazz(data));
                }
            }

            return scene;
        }
    });
});
define('m11', ['m3', 'm1', 'my'], function (Class, Env, Cacheable) {
    function readUInt32(data) {
        var b1, b2, b3, b4;
        b1 = data[data.pos++] << 24;
        b2 = data[data.pos++] << 16;
        b3 = data[data.pos++] << 8;
        b4 = data[data.pos++];
        return b1 | b2 | b3 | b4;
    }

    function readSection(data) {
        var i, _i, chars;
        chars = [];
        for (i = _i = 0; _i < 4; i = ++_i) {
            chars.push(String.fromCharCode(data[data.pos++]));
        }
        return chars.join('');
    }

    function getImageSize(data) {
        //TODOv2 works only for png
        var chunkSize, section;
        data.pos = 8; //TODOv2 before this should be '..PNG...'
        while (data.pos < data.length) {
            chunkSize = readUInt32(data);
            section = readSection(data);
            if (section === 'IHDR') {
                return  {
                    width: readUInt32(data),
                    height: readUInt32(data)
                };
            } else {
                data.pos += chunkSize;
            }
        }
        throw new Error('Failed to determine image size');
    }

    /**
     * A sprite is an image or an animation. It can be defined as a part of a real image (tile sets).
     * When a sprite is an animation, the subsequent images have to be next to each other (left to right direction)
     *
     * @class Grape.Sprite
     * @uses Grape.Cacheable
     * @constructor
     * @param {String} url
     * @param {Object} opts Initial properties
     */
    return Class('Sprite', Cacheable, {
        init: function (url, opts) {
            opts = opts || {};
            /**
             * The left position of the sprite in the image.
             *
             * @property left
             * @type {Number}
             * @default 0
             */
            this.left = opts.left || 0;
            /**
             * The top position of the sprite in the image.
             *
             * @property top
             * @type {Number}
             * @default 0
             */
            this.top = opts.top || 0;
            /**
             * The left side of the sprite's bounding box
             *
             * @property leftBounding
             * @type {Number}
             * @default 0
             */
            this.leftBounding = opts.leftBounding || 0;
            /**
             * The top side of the sprite's bounding box
             *
             * @property topBounding
             * @type {Number}
             * @default 0
             */
            this.topBounding = opts.topBounding || 0;

            /**
             * The x coordinate of the sprite origin
             *
             * @property originX
             * @type {Number}
             * @default 0
             */
            this.originX = opts.originX || 0;
            /**
             * The y coordinate of the sprite origin
             *
             * @property originY
             * @type {Number}
             * @default 0
             */
            this.originY = opts.originY || 0;
            this.url = url;
            /**
             * The number of subimages (animation length). Subsequent images have to be arranged left to right.
             *
             * @property subimages
             * @type {Number}
             * @default 1
             */
            this.subimages = opts.subimages || 1;

            //if the following parameters are not set, they are set if the image is processed.
            /**
             * The width of the sprite. If not set, it will be calculated by the image width and the animation length.
             *
             * @property width
             * @type {Number}
             */
            this.width = opts.width;
            /**
             * The height of the sprite. If not set, it will be the height of the image.
             *
             * @property height
             * @type {Number}
             */
            this.height = opts.height;
            /**
             * The right side of the sprite's bounding box. If not set, it will be the image width.
             *
             * @property rightBounding
             * @type {Number}
             */
            this.rightBounding = opts.rightBounding;
            /**
             * The bottom side of the sprite's bounding box. If not set it will be the image height.
             *
             * @property bottomBounding
             * @type {Number}
             */
            this.bottomBounding = opts.bottomBounding;
        },
        'override loadResource': function (onFinish, onError) {
            if (Env.node) {
                /*global originalRequire*/
                var fs = originalRequire('fs');
                fs.readFile(this.url, function (err, file) {
                    if (err) {
                        onError();
                    } else {
                        onFinish(getImageSize(file));
                    }
                });
            } else {
                var img = document.createElement('img');
                img.onload = function () {
                    onFinish(img);
                };
                img.onerror = function () {
                    onError();
                };

                img.src = this.url;
            }
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (img) {
            this.img = img;
            if (this.width === undefined) {
                this.width = img.width / this.subimages;
            }
            if (this.height === undefined) {
                this.height = img.height;
            }
            if (this.rightBounding === undefined) {
                this.rightBounding = this.width;
            }
            if (this.bottomBounding === undefined) {
                this.bottomBounding = this.height;
            }
        }
    });
});
define('m12', ['m3', 'mz', 'm10', 'mx', 'm11'], function (Class, GrapeAudio, JSONSceneSource, Resource, Sprite) {
    function empty() {
    }

    /**
     * Represents a collection of resources. You can add, get different kind of resources (nested collections are
     * allowed) and load resources at once.
     *
     * @class Grape.ResourceCollection
     * @uses Grape.Resource
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('ResourceCollection', Resource, {
        init: function (opts) {
            opts = opts || {};
            /**
             * When you create new items with the helpers(sprite(), audio()) this prefix is added to the url.
             * Does NOT affect resources you manually add to the collection.
             *
             * @property prefix
             * @type String
             */
            this.prefix = opts.prefix || '';
            this.resources = [];
            this.resourcesByName = {};
        },
        /**
         * Adds a new resource to the collection.
         *
         * @method add
         * @param {String} [name] The unique name of the resource
         * @param {Grape.Resource} Resource
         */
        add: function (name, res) {
            if (!res) { //no name given
                res = name;
                name = null;
            }
            if (name !== null) {
                if (this.resourcesByName[name]) {
                    throw new Error('resource with name "' + name + '" already exists.');
                }
                this.resourcesByName[name] = res;
            }
            this.resources.push(res);

        },
        /**
         * Get a previously added resource by name.
         *
         * @method get
         * @param {String} name Name
         * @return {Grape.Resource} the resource
         */
        get: function (name) {
            if (!this.resourcesByName[name]) {
                throw new Error('Resource "' + name + '" not found');
            }
            return this.resourcesByName[name];
        },
        /**
         * Loads all resources.
         *
         * @method load
         * @param {Function} onFinish Called when all resource is loaded
         * @param {Function} onError Called when an error happens
         * @param {Function} onProgress Called when a resource is loaded or progress changed
         */
        'override load': function (onFinish, onError, onProgress) {
            var i, estimated, originalTimes = [], times = [],
                estimatedTime = 0,
                remainingTime,
                hasError = false,
                remaining = this.resources.length;
            onFinish = onFinish || empty;
            onError = onError || empty;
            onProgress = onProgress || empty;

            for (i = 0; i < this.resources.length; i++) {
                estimated = this.resources[i].getEstimatedTime();
                times[i] = originalTimes[i] = estimated;
                estimatedTime += estimated;
            }
            remainingTime = estimatedTime;

            function createOnLoad(i) {
                return function () {
                    remaining--;
                    if (times[i] > 0) {
                        remainingTime -= times[i];
                        times[i] = 0;
                        onProgress((1 - remainingTime / estimatedTime) * 100);
                    }
                    if (remaining === 0) {
                        onFinish();
                    }
                };
            }

            function createOnProgress(i) {
                return function (progress) {
                    var n = originalTimes[i] * (1 - progress / 100);
                    if (times[i] !== n) {
                        remainingTime -= [times[i] - n];
                        times[i] = n;
                        onProgress((1 - remainingTime / estimatedTime) * 100);
                    }
                };
            }

            if (this.resources.length === 0) {
                onFinish();
            }

            for (i = 0; i < this.resources.length; i++) {
                /*jshint -W083 */
                this.resources[i].load(createOnLoad(i), function () {
                    if (!hasError) {
                        onError();
                        hasError = true;
                    }
                }, createOnProgress(i));
            }
        },
        /**
         * Returns the sum of the estimated time of all resource.
         *
         * @method getEstimatedTime
         * @return {Number} Sum
         */
        'override getEstimatedTime': function () {
            var i, time = 0;
            for (i = 0; i < this.resources.length; i++) {
                time += this.resources[i].getEstimatedTime();
            }
            return time;
        },
        /**
         * Creates a new sprite and adds to the collection.
         *
         * @method sprite
         * @param {String} name Key
         * @param {String} url Sprite URL
         * @param {Object} settings Settings passed to the Sprite constructor
         * @return {Grape.Sprite} The defined sprite
         */
        sprite: function (name, url, settings) {
            var spr = new Sprite(this.prefix + url, settings);
            this.add(name, spr);
            return spr;
        },
        /**
         * Creates multiple sprites and adds to the collection. The sprites should have the same dimensions.
         *
         * @method tile
         * @param {String} url Image url
         * @param {Number} width Width of all sprite
         * @param {Number} height Height of all sprite
         * @param {Object} sprites Sprite names and positions as key:[left, top, subimages] The positions array is
         * multiplied with the width and height, and the 'subimages' part is optional.
         * @return {Object} The created sprites by name
         */
        tile: function (url, width, height, sprites) {
            var i, coords, res = {};
            for (i in sprites) {
                coords = sprites[i];
                res[i] = this.sprite(i, this.prefix + url, {
                    subimages: coords.length === 2 ? 1 : coords[2],
                    left: coords[0] * width,
                    top: coords[1] * height,
                    width: width,
                    height: height
                });
            }
            return res;
        },
        /**
         * Creates an Audio resource and adds to the collection. Check Grape.Audio for more information.
         *
         * @method audio
         * @param {String} name Key
         * @param {Object} opts Audio options
         * @param {String} url1 Audio URL
         * @param {String} url2 Audio URL fallback if url1 extension is not supported
         * @param {String} url3 Audio URL fallback if url2 extension is not supported
         * @return {Grape.Audio} The Audio resource
         */
        audio: function (name, opts, url1, url2, url3) { //TODOv2 add from audio.js
            if (typeof opts === 'string') {
                url3 = url2 ? this.prefix + url2 : url2;
                url2 = url1 ? this.prefix + url1 : url1;
                url1 = opts ? this.prefix + opts : opts;
                opts = {};
            }
            var audio = new GrapeAudio(opts, url1, url2, url3);
            this.add(name, audio);
            return audio;
        },
        /**
         * Creates a new JSONSceneSource, and adds to the collection.
         *
         * @method scene
         * @param {String} name Key
         * @param {String} url Scene JSON URL
         * @param {Object} settings Settings passed as constructor parameter to JSONSceneSource.
         * @return {Grape.JSONSceneSource} The created JSONSceneSource
         */
        scene: function (name, url, settings) {
            var scn = new JSONSceneSource(this.prefix + url, settings);
            this.add(name, scn);
            return scn;
        }
    });
});
define('m13', ['mz', 'my', 'm10', 'mx', 'm12', 'm11'], function (Audio, Cacheable, JSONSceneSource, Resource, ResourceCollection, Sprite) {
    return {
        Audio: Audio,
        Cacheable: Cacheable,
        JSONSceneSource: JSONSceneSource,
        Resource: Resource,
        ResourceCollection: ResourceCollection,
        Sprite: Sprite
    };
});
define('m14', ['m3', 'm6', 'm1', 'mm', 'mw', 'm13', 'm2'], function (Class, Collections, Env, Etc, Game, Resource, Utils) {

    var Grape = {};
    Grape.Class = Class;
    Grape.Env = Env;
    Grape.Utils = Utils;
    Grape.Object = Grape.Class(); //fake class
    Utils.extend(Grape, Collections);
    Utils.extend(Grape, Etc);
    Utils.extend(Grape, Game);
    Utils.extend(Grape, Resource);
    /**
     * The version of the current Grape library
     *
     * @static
     * @property version
     * @type {string}
     */
    Grape.version = "1.0.1";

    return Grape;
});
return require('m14');
}));
