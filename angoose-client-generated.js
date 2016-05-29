/** Angoose Client Core */
/**  depdnencies: http, Q */
(function BootstrapAngoose() {

    AngooseClient = function(name) {
        if ( typeof $anget != 'undefined') {
            return $anget(camelcase(name));
        }
        return AngooseClient.getClass(name)
    };

    var logger = getLogger();
    logger.setLevel(config('logging') || 'INFO');

    AngooseClient.getClass = getClass;
    AngooseClient.model = getClass;
    AngooseClient.modelNames = modelNames;
    AngooseClient.init = init;
    AngooseClient.module = getClass;
    AngooseClient.config = config;
    AngooseClient.logger = logger;

    if ( typeof (angoose) == 'undefined') {
        angoose = AngooseClient;
    }

    logger.info("Bootstraping angoose-client");

    function getLogger() {
        var levels = {
            TRACE : {
                v : 1,
                name : "TRACE"
            },
            DEBUG : {
                v : 2,
                name : "DEBUG"
            },
            INFO : {
                v : 3,
                name : "INFO"
            },
            WARN : {
                v : 4,
                name : "WARN"
            },
            ERROR : {
                v : 5,
                name : "ERROR"
            },
            LOG : {
                v : 6,
                name : "LOG"
            }
        };

        var ClientLogger = {
            levels : levels,
            level : levels.INFO
        }
        var methods = "log,info,trace,debug,warn,error".split(",");
        for(var i=0; i < methods.length; i++){ 
            var method = methods[i];
            if(typeof(console)!='undefined' && console[method])
                ClientLogger[method]= getLoggingFunc(method);
            else
                ClientLogger[method]=function(){}
        };
        function getLoggingFunc(method){
            return function(){
                if(ClientLogger.level.v <=  levels[method.toUpperCase()].v ){
                    var args = []; args.push( method.toUpperCase() + ":");
                    for(var i =0;i<arguments.length;i++) args.push(arguments[i]);
                    if(method == 'trace') 
                        console.debug.apply(console,args);
                    else
                        console[method].apply(console,args)
                }
            }
        }
        ClientLogger.setLevel=function(level){
            if(!level) return; 
            level = level.toUpperCase();
            ClientLogger.level = levels[level] || levels.INFO;
        }
        return ClientLogger;
    }

    var counterBase = Math.round(Math.random() * 10000) * 10000;
    var nextCounter = function() {
        return counterBase++;
    }
    var encode$ = function(obj) {
        if (!obj || typeof obj != 'object')
            return obj;
        if (obj && obj.length) {
            for (var i = 0; i < obj.length; i++) {
                obj[i] = encode$(obj[i]);
            };
        } else {
            //logger.debug("Type", (typeof obj), obj)
            for (var key in obj) {
                var val = encode$(obj[key]);
                if (key.indexOf('$') == 0) {
                    delete obj[key];
                    key = "_mongo_" + key;
                }
                obj[key] = val;
            }
        }
        return obj;
    }
    var autoThrower = null;
    var handleReturn = function(retval, callback, deferred, error) {
        if (error) {
            if ( typeof (error) !== 'object')
                error = {
                    message : error
                }
            error.toString = function() {
                this.consumed = true;
                return this.message || Object.toString.call(this);
            }
        }
        if (callback)
            return callback(error, retval);
        return error ? deferred.reject(error) : deferred.resolve(retval);
    }
    function staticInvoker(modelClass, methodName, methodArgs) {
        return invoker(modelClass, methodName, methodArgs, null);

    };
    function instanceInvoker(modelClass, model, methodName, methodArgs) {
        //var modelClass = getClass(model.classname$)
        return invoker(modelClass, methodName, methodArgs, model);
    }

    function invoker(modelClass, methodName, methodArgs, modelInstance) {
        // modelInstance can be null, everything else is required.
        var modelName = modelClass.modelName;
        logger.trace("invoker: ", modelName, methodName, methodArgs);
        var callback = null;
        var isStatic = modelInstance == null;
        var depends = modelClass.dependencies$;
        var data = {
            method : methodName,
            seqnumber : nextCounter(),
            args : [],
            clazz : modelName,
            static : isStatic
        }
        for (var i = 0; methodArgs && methodArgs.length > i; i++) {
            if ( typeof methodArgs[i] != 'function')
                data.args.push(methodArgs[i]);
            else {
                callback = methodArgs[i]
                data.args.push("$callback")
                logger.debug("Callback provided");
            }
        }
        if (!isStatic) {
            data.instance = modelInstance;
            // including model instance data for instance methods
        }

        // angular http ignores all key names starting with $, this will break the mongo query
        data = encode$(data);
        var callname = modelName + "." + methodName;
        logger.debug("****** BEGIN RMI #", data.seqnumber, callname, data);
        var http = depends['http'];
        var theQ = depends['promise'];
        if (!http || !theQ)
            throw "Missing http and/or Q dependencies";
        var deferred = theQ.defer();
        var ret = http.post((getConfigs().urlPrefix || '/angoose') + "/rmi/" + modelName + "/" + methodName, data);
        ret.done(function(retdata) {
            logger.debug("====== END RMI #", data.seqnumber, callname, " Result:", retdata);
            var val = undefined;
            //@todo construct object, ret value types:  1) model data, 2) list of model data, 3) String, 4) object
            if (retdata && retdata.retval && (retdata.datatype == 'model' || retdata.datatype == 'models')) {

                if (retdata.datatype == 'model') {
                    val = newInstance(modelClass, retdata.retval);
                } else {
                    var models = [];
                    for (var i = 0; i < retdata.retval.length; i++) {
                        models.push(newInstance(modelClass, retdata.retval[i]));
                    }
                    val = models;
                }
                //return handleReturn(val, callback, deferred);
                //
                //return deferred.resolve(models);
            }
            if (retdata && retdata.instance && !isStatic) {
                // state has been changed on the server side
                modelInstance.mergeData(retdata.instance);
                logger.trace("Merged server side data", modelInstance);
            }
            if (retdata.success)
                return handleReturn(val || retdata.retval, callback, deferred);
            var ex = retdata.exception ? retdata.exception : retdata;
            return handleReturn(null, callback, deferred, ex);
            //deferred.reject(ex)
        }, function(errdata) {
            logger.debug("====== END RMI #", data.seqnumber, callname, " Error:", errdata);
            if (!errdata)
                return handleReturn(errdata, callback, deferred, "Unexpected server error occurred.");
            var ex = errdata && errdata.exception ? errdata.exception : {
                message : errdata
            };
            //var ex = errdata.exception?  (errdata.exception.message || errdata.exception.value) : errdata;
            return handleReturn(null, callback, deferred, ex);
            //return deferred.reject(ex);
        })
        if (!callback)
            return deferred.promise;
    }

    function newInstance(clazz, jsonData) {
        if (jsonData && jsonData.__t && jsonData.__t !== clazz.name) {
            clazz = getClass(jsonData.__t) || clazz;
            //@todo: __t handling is not long term solution
        }
        return new clazz(jsonData);
    }

    function createProxy(module, funcName, func, funcType) {
        if ( typeof (func) == 'function')
            return func;
        if ( typeof (func) == "string" && func.indexOf("function") == 0) {
            var vname;
            return eval("vname=" + func);
        }
        if (funcType == 'static') {
            return function proxy() {
                return staticInvoker(module, funcName, arguments);
            }
        };
        if (funcType == 'instance') {
            return function proxy() {
                return instanceInvoker(module, this, funcName, arguments);
            }
        };

    }

    /** compile the model based on the server side schema */
    function compile(modelName, schema, dependencies) {
        logger.trace("Compiling schema ", modelName)
        var model = function AngooseModule(data) {
            //@todo proper clone
            for (var i in data) {
                this[i] = data[i];
            }
        };

        model.toString = function() {
            return "PROXY: function " + modelName + "()";
        }
        // static methods
        for (var name in schema.statics) {
            model[name] = createProxy(model, name, schema.statics[name], 'static');
        }
        for (var name in schema.methods) {
            model.prototype[name] = createProxy(model, name, schema.methods[name], 'instance');
        }

        //model.angoose$ = staticInvoker;
        model.dependencies$ = dependencies;
        model.schema = schema;
        //model.prototype.angoose$ = instanceInvoker;
        //model.prototype.classname$ = modelName;
        //model.prototype.schema$ = schema;
        model.prototype.get = getter;
        model.prototype.set = setter;
        model.modelName = modelName; // this is to be compatible with backend mongoose
        model.name = modelName; 

        // merge data into this instance
        model.prototype.mergeData = function(source) {
            if ( typeof source != "object")
                throw "Invalid source object, must be an model instance";
            //@todo: proper implementation
            for (var i in source) {
                this[i] = source[i];
            }
        }
        AngooseClient.models = AngooseClient.models || {};
        AngooseClient.models[modelName] = model;
        return model;
    };

    function modelNames() {
        var ret = [];
        for (var key in getSchemas()) {
            ret.push(key);
        }
        return ret;
    };

    function config(path, val) {
        var options = getConfigs();
        if(!path) return options; /**@todo: probably a deep copy */
        
        if(typeof (path) === 'string'){
             if(val === undefined)
                return  getter.call(options, path);
             setter.call(options, path, val);
        }
    }

    function init(dependencies) {
        if (AngooseClient.initialized) {
            logger.debug("init has been called");
            return;
        }
        AngooseClient.dependencies = dependencies;
        logger.debug("Creating client side proxies for backend modules");
        for (var mName in getSchemas()) {
            compile(mName, getSchemas()[mName], dependencies);
        }
        AngooseClient.initialized = true;
    };
    function getClass(name) {
        if (!AngooseClient.initialized)
            throw "Angoose models not initialized yet";
        name = camelcase(name);
        return AngooseClient.models[name];
    };
    
     function getter(path) {
         if(!path) return undefined;
          var   pieces = path.split('.');
          var obj = this;
          for (var i = 0, l = pieces.length; i < l; i++) {
            obj = undefined === obj || null === obj
              ? undefined
              : obj[pieces[i]];
          }
          return obj;
    };
    function  setter(path, val){
    if(!path  || typeof(path)!='string') return;
     var   pieces = path.split('.');
      var obj = this;
      for (var i = 0, len = pieces.length; i < len; i++) {
          if(i+1  == len ) // last one
          {
              obj[ pieces[i]] = val;
              return;
          }
          obj[pieces[i]] = obj[pieces[i]] || {};
          obj = obj[pieces[i]] || {};
      }
    }

    function camelcase(name, space) {
        // converting client-user to ClientUser
        if (!name)
            return name;
        var parts = name.split("-");
        name = "";
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] && parts[i].length > 0) {
                name = name && space ? name + " " : name;
                name += parts[i].substring(0, 1).toUpperCase() + parts[i].substring(1);
            }
        }
        return name;
    }

    function getConfigs() {
        return {"urlPrefix":"/angoose","url-prefix":"/angoose","logging":"INFO"}
    };
    function getSchemas() {
        return {
	"MongooseExtension": {
		"moduleName": "MongooseExtension",
		"methods": {},
		"statics": {
			"postResolveTarget": "$PROXIED$",
			"postInvoke": "$PROXIED$",
			"postPack": "$PROXIED$",
			"postExportModule": "$PROXIED$",
			"afterFormatError": "$PROXIED$",
			"config": "$PROXIED$"
		}
	},
	"SampleUser": {
		"moduleName": "SampleUser",
		"methods": {
			"getFullname": "function portable(){\n    //_instance_portable\n    console.log(\"getFullname\", this);\n    return  (this.firstname ? this.firstname +\" \": \"\") + (this.lastname || \"\");\n}",
			"setPassword": "$PROXIED$",
			"save": "$PROXIED$",
			"remove": "$PROXIED$",
			"populate": "$PROXIED$"
		},
		"statics": {
			"getSample": "$PROXIED$",
			"checkExists": "$PROXIED$",
			"populate": "$PROXIED$",
			"find": "$PROXIED$",
			"findOne": "$PROXIED$",
			"findById": "$PROXIED$",
			"findByIdAndRemove": "$PROXIED$",
			"findByIdAndUpdate": "$PROXIED$",
			"findOneAndRemove": "$PROXIED$",
			"findOneAndUpdate": "$PROXIED$",
			"update": "$PROXIED$",
			"remove": "$PROXIED$",
			"count": "$PROXIED$",
			"geoNear": "$PROXIED$",
			"geoSearch": "$PROXIED$",
			"create": "$PROXIED$"
		},
		"paths": {
			"email": {
				"enumValues": [],
				"regExp": null,
				"path": "email",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String",
					"required": true,
					"match": {},
					"unique": true
				},
				"_index": {
					"unique": true,
					"background": true
				},
				"isRequired": true
			},
			"firstname": {
				"enumValues": [],
				"regExp": null,
				"path": "firstname",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String",
					"required": true
				},
				"_index": null,
				"isRequired": true
			},
			"lastname": {
				"enumValues": [],
				"regExp": null,
				"path": "lastname",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String",
					"required": true
				},
				"_index": null,
				"isRequired": true
			},
			"status": {
				"enumValues": [
					"inactive",
					"active",
					"disabled",
					"archived"
				],
				"regExp": null,
				"path": "status",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String",
					"enum": [
						"inactive",
						"active",
						"disabled",
						"archived"
					],
					"required": true,
					"def": "inactive"
				},
				"_index": null,
				"isRequired": true
			},
			"password": {
				"enumValues": [],
				"regExp": null,
				"path": "password",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String"
				},
				"_index": null
			},
			"verified": {
				"path": "verified",
				"instance": "Boolean",
				"setters": [],
				"getters": [],
				"options": {
					"type": "Boolean"
				},
				"_index": null
			},
			"groupRef": {
				"path": "groupRef",
				"instance": "ObjectID",
				"setters": [],
				"getters": [],
				"options": {
					"type": "ObjectId",
					"ref": "SampeUserGroup"
				},
				"_index": null
			},
			"_id": {
				"path": "_id",
				"instance": "ObjectID",
				"setters": [
					"not-supported"
				],
				"getters": [],
				"options": {
					"auto": true,
					"type": "ObjectId"
				},
				"_index": null,
				"defaultValue": "not-supported"
			},
			"__v": {
				"path": "__v",
				"instance": "Number",
				"setters": [],
				"getters": [],
				"options": {
					"type": "Number"
				},
				"_index": null
			}
		},
		"options": {
			"collection": "SampleUsers",
			"discriminatorKey": "type",
			"typeKey": "type",
			"id": true,
			"noVirtualId": false,
			"_id": true,
			"noId": false,
			"validateBeforeSave": true,
			"read": null,
			"shardKey": null,
			"autoIndex": null,
			"minimize": true,
			"versionKey": "__v",
			"capped": false,
			"bufferCommands": true,
			"strict": true,
			"pluralization": true
		}
	},
	"User": {
		"moduleName": "User",
		"methods": {
			"save": "$PROXIED$",
			"remove": "$PROXIED$",
			"populate": "$PROXIED$"
		},
		"statics": {
			"populate": "$PROXIED$",
			"find": "$PROXIED$",
			"findOne": "$PROXIED$",
			"findById": "$PROXIED$",
			"findByIdAndRemove": "$PROXIED$",
			"findByIdAndUpdate": "$PROXIED$",
			"findOneAndRemove": "$PROXIED$",
			"findOneAndUpdate": "$PROXIED$",
			"update": "$PROXIED$",
			"remove": "$PROXIED$",
			"count": "$PROXIED$",
			"geoNear": "$PROXIED$",
			"geoSearch": "$PROXIED$",
			"create": "$PROXIED$"
		},
		"paths": {
			"username": {
				"enumValues": [],
				"regExp": null,
				"path": "username",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String",
					"unique": true
				},
				"_index": {
					"unique": true,
					"background": true
				}
			},
			"password": {
				"enumValues": [],
				"regExp": null,
				"path": "password",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String"
				},
				"_index": null
			},
			"email": {
				"enumValues": [],
				"regExp": null,
				"path": "email",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String",
					"unique": true
				},
				"_index": {
					"unique": true,
					"background": true
				}
			},
			"resetPasswordToken": {
				"enumValues": [],
				"regExp": null,
				"path": "resetPasswordToken",
				"instance": "String",
				"setters": [],
				"getters": [],
				"options": {
					"type": "String"
				},
				"_index": null
			},
			"resetPasswordExpire": {
				"path": "resetPasswordExpire",
				"instance": "Date",
				"setters": [],
				"getters": [],
				"options": {
					"type": "Date"
				},
				"_index": null
			},
			"slist": {
				"casterConstructor": "not-supported",
				"caster": {
<<<<<<< HEAD
					"_id": "574b45d2018538a40fa78ca8"
=======
					"_id": "574b3e14122956b0377ebb68"
>>>>>>> 12ab47b8f540fe4e31663bb29454cc74e2a080ce
				},
				"path": "slist",
				"instance": "Array",
				"setters": [],
				"getters": [],
				"options": {
					"type": [
						{
							"name": {
								"type": "not-supported"
							},
							"shop": {
								"type": "not-supported"
							},
							"quantity": {
								"type": "not-supported"
							},
							"checked": {
								"type": "not-supported"
							}
						}
					]
				},
				"_index": null,
				"defaultValue": "not-supported",
				"schema": {
					"paths": {
						"name": {
							"enumValues": [],
							"regExp": null,
							"path": "name",
							"instance": "String",
							"setters": [],
							"getters": [],
							"options": {
								"type": "String"
							},
							"_index": null
						},
						"shop": {
							"enumValues": [],
							"regExp": null,
							"path": "shop",
							"instance": "String",
							"setters": [],
							"getters": [],
							"options": {
								"type": "String"
							},
							"_index": null
						},
						"quantity": {
							"path": "quantity",
							"instance": "Number",
							"setters": [],
							"getters": [],
							"options": {
								"type": "Number"
							},
							"_index": null
						},
						"checked": {
							"path": "checked",
							"instance": "Boolean",
							"setters": [],
							"getters": [],
							"options": {
								"type": "Boolean"
							},
							"_index": null
						},
						"_id": {
							"path": "_id",
							"instance": "ObjectID",
							"setters": [
								"not-supported"
							],
							"getters": [],
							"options": {
								"auto": true,
								"type": "ObjectId"
							},
							"_index": null,
							"defaultValue": "not-supported"
						}
					},
					"subpaths": {},
					"virtuals": {
						"id": {
							"path": "id",
							"getters": [
								"not-supported"
							],
							"setters": [],
							"options": {}
						}
					},
					"singleNestedPaths": {},
					"nested": {},
					"inherits": {},
					"callQueue": [
						[
							"pre",
							{
								"0": "save",
								"1": false,
								"2": "not-supported"
							}
						],
						[
							"pre",
							{
								"0": "save",
								"1": true,
								"2": "not-supported"
							}
						]
					],
					"_indexes": [],
					"methods": {},
					"statics": {},
					"tree": {
						"name": {
							"type": "not-supported"
						},
						"shop": {
							"type": "not-supported"
						},
						"quantity": {
							"type": "not-supported"
						},
						"checked": {
							"type": "not-supported"
						},
						"_id": {
							"type": "not-supported",
							"auto": true
						},
						"id": {
							"path": "id",
							"getters": [
								"not-supported"
							],
							"setters": [],
							"options": {}
						}
					},
					"_requiredpaths": [],
					"s": {
						"hooks": {
							"_pres": {},
							"_posts": {}
						},
						"queryHooks": {
							"count": true,
							"find": true,
							"findOne": true,
							"findOneAndUpdate": true,
							"findOneAndRemove": true,
							"update": true
						}
					},
					"options": {
						"minimize": true,
						"typeKey": "type",
						"id": true,
						"noVirtualId": false,
						"_id": true,
						"noId": false,
						"validateBeforeSave": true,
						"read": null,
						"shardKey": null,
						"autoIndex": null,
						"discriminatorKey": "__t",
						"versionKey": "__v",
						"capped": false,
						"bufferCommands": true,
						"strict": true
					}
				}
			},
			"vfridge": {
				"casterConstructor": "not-supported",
				"caster": {
<<<<<<< HEAD
					"_id": "574b45d2018538a40fa78ca9"
=======
					"_id": "574b3e14122956b0377ebb69"
>>>>>>> 12ab47b8f540fe4e31663bb29454cc74e2a080ce
				},
				"path": "vfridge",
				"instance": "Array",
				"setters": [],
				"getters": [],
				"options": {
					"type": [
						{
							"name": {
								"type": "not-supported"
							},
							"shop": {
								"type": "not-supported"
							},
							"quantity": {
								"type": "not-supported"
							}
						}
					]
				},
				"_index": null,
				"defaultValue": "not-supported",
				"schema": {
					"paths": {
						"name": {
							"enumValues": [],
							"regExp": null,
							"path": "name",
							"instance": "String",
							"setters": [],
							"getters": [],
							"options": {
								"type": "String"
							},
							"_index": null
						},
						"shop": {
							"enumValues": [],
							"regExp": null,
							"path": "shop",
							"instance": "String",
							"setters": [],
							"getters": [],
							"options": {
								"type": "String"
							},
							"_index": null
						},
						"quantity": {
							"path": "quantity",
							"instance": "Number",
							"setters": [],
							"getters": [],
							"options": {
								"type": "Number"
							},
							"_index": null
						},
						"_id": {
							"path": "_id",
							"instance": "ObjectID",
							"setters": [
								"not-supported"
							],
							"getters": [],
							"options": {
								"auto": true,
								"type": "ObjectId"
							},
							"_index": null,
							"defaultValue": "not-supported"
						}
					},
					"subpaths": {},
					"virtuals": {
						"id": {
							"path": "id",
							"getters": [
								"not-supported"
							],
							"setters": [],
							"options": {}
						}
					},
					"singleNestedPaths": {},
					"nested": {},
					"inherits": {},
					"callQueue": [
						[
							"pre",
							{
								"0": "save",
								"1": false,
								"2": "not-supported"
							}
						],
						[
							"pre",
							{
								"0": "save",
								"1": true,
								"2": "not-supported"
							}
						]
					],
					"_indexes": [],
					"methods": {},
					"statics": {},
					"tree": {
						"name": {
							"type": "not-supported"
						},
						"shop": {
							"type": "not-supported"
						},
						"quantity": {
							"type": "not-supported"
						},
						"_id": {
							"type": "not-supported",
							"auto": true
						},
						"id": {
							"path": "id",
							"getters": [
								"not-supported"
							],
							"setters": [],
							"options": {}
						}
					},
					"_requiredpaths": [],
					"s": {
						"hooks": {
							"_pres": {},
							"_posts": {}
						},
						"queryHooks": {
							"count": true,
							"find": true,
							"findOne": true,
							"findOneAndUpdate": true,
							"findOneAndRemove": true,
							"update": true
						}
					},
					"options": {
						"minimize": true,
						"typeKey": "type",
						"id": true,
						"noVirtualId": false,
						"_id": true,
						"noId": false,
						"validateBeforeSave": true,
						"read": null,
						"shardKey": null,
						"autoIndex": null,
						"discriminatorKey": "__t",
						"versionKey": "__v",
						"capped": false,
						"bufferCommands": true,
						"strict": true
					}
				}
			},
			"always": {
				"casterConstructor": "not-supported",
				"caster": {
<<<<<<< HEAD
					"_id": "574b45d2018538a40fa78caa"
=======
					"_id": "574b3e14122956b0377ebb6a"
>>>>>>> 12ab47b8f540fe4e31663bb29454cc74e2a080ce
				},
				"path": "always",
				"instance": "Array",
				"setters": [],
				"getters": [],
				"options": {
					"type": [
						{
							"name": {
								"type": "not-supported"
							},
							"quantity": {
								"type": "not-supported"
							}
						}
					]
				},
				"_index": null,
				"defaultValue": "not-supported",
				"schema": {
					"paths": {
						"name": {
							"enumValues": [],
							"regExp": null,
							"path": "name",
							"instance": "String",
							"setters": [],
							"getters": [],
							"options": {
								"type": "String"
							},
							"_index": null
						},
						"quantity": {
							"path": "quantity",
							"instance": "Number",
							"setters": [],
							"getters": [],
							"options": {
								"type": "Number"
							},
							"_index": null
						},
						"_id": {
							"path": "_id",
							"instance": "ObjectID",
							"setters": [
								"not-supported"
							],
							"getters": [],
							"options": {
								"auto": true,
								"type": "ObjectId"
							},
							"_index": null,
							"defaultValue": "not-supported"
						}
					},
					"subpaths": {},
					"virtuals": {
						"id": {
							"path": "id",
							"getters": [
								"not-supported"
							],
							"setters": [],
							"options": {}
						}
					},
					"singleNestedPaths": {},
					"nested": {},
					"inherits": {},
					"callQueue": [
						[
							"pre",
							{
								"0": "save",
								"1": false,
								"2": "not-supported"
							}
						],
						[
							"pre",
							{
								"0": "save",
								"1": true,
								"2": "not-supported"
							}
						]
					],
					"_indexes": [],
					"methods": {},
					"statics": {},
					"tree": {
						"name": {
							"type": "not-supported"
						},
						"quantity": {
							"type": "not-supported"
						},
						"_id": {
							"type": "not-supported",
							"auto": true
						},
						"id": {
							"path": "id",
							"getters": [
								"not-supported"
							],
							"setters": [],
							"options": {}
						}
					},
					"_requiredpaths": [],
					"s": {
						"hooks": {
							"_pres": {},
							"_posts": {}
						},
						"queryHooks": {
							"count": true,
							"find": true,
							"findOne": true,
							"findOneAndUpdate": true,
							"findOneAndRemove": true,
							"update": true
						}
					},
					"options": {
						"minimize": true,
						"typeKey": "type",
						"id": true,
						"noVirtualId": false,
						"_id": true,
						"noId": false,
						"validateBeforeSave": true,
						"read": null,
						"shardKey": null,
						"autoIndex": null,
						"discriminatorKey": "__t",
						"versionKey": "__v",
						"capped": false,
						"bufferCommands": true,
						"strict": true
					}
				}
			},
			"_id": {
				"path": "_id",
				"instance": "ObjectID",
				"setters": [
					"not-supported"
				],
				"getters": [],
				"options": {
					"auto": true,
					"type": "ObjectId"
				},
				"_index": null,
				"defaultValue": "not-supported"
			},
			"__v": {
				"path": "__v",
				"instance": "Number",
				"setters": [],
				"getters": [],
				"options": {
					"type": "Number"
				},
				"_index": null
			}
		},
		"options": {
			"typeKey": "type",
			"id": true,
			"noVirtualId": false,
			"_id": true,
			"noId": false,
			"validateBeforeSave": true,
			"read": null,
			"shardKey": null,
			"autoIndex": null,
			"minimize": true,
			"discriminatorKey": "__t",
			"versionKey": "__v",
			"capped": false,
			"bufferCommands": true,
			"strict": true,
			"pluralization": true
		}
	}
}
    };
})();

/****** Angular Adapter for Angoose Client *******/
// Angular client for Angoose automatically register the model and service classes as angular injectables. 
// For instance, with the `SampleUser` model, you can inject in your controller:
//
//      angular.module('myapp', ['angoose.client'])
//            .controller('MyCtroller', function($scope, SampleUser){
//              $scope.users = SampleUser.$query({'status':'active'});
//        })      
//
(function(){
    var logger = AngooseClient.logger;
    
    if(typeof angular =='undefined'){
        logger.error("No angular")
        return;  
    } 
    logger.info("angoose-angular client adapter initializing");
    var angularModule =  angular.module("angoose.client", []);
    AngooseClient.client='angular';
    
    // ** angoose **
    //
    //  You may require `angoose` client as an injectable
    //  
    angularModule.factory('angoose', function($http, $q, $rootScope, $timeout){
            var myQ = addDoneMethod($q);
            AngooseClient.init({
                http:angularHttpWrapper($http, myQ, $rootScope, $timeout),
                promise: myQ
            });
            return AngooseClient;
    })
    function factoryFunc(modelName){
        logger.trace("Create factory for model "+ modelName)
        angularModule.factory(modelName , function($http, $q, $rootScope, $injector, angoose){
            var acModel = AngooseClient.model(modelName);
            resourceAdapt(acModel, $rootScope, $injector );
            return acModel;
        });
    }
    angular.forEach( AngooseClient.modelNames(), factoryFunc );

    function addDoneMethod($q){
        var myQ = angular.extend({}, $q)
        myQ.defer = function(){
            var out = $q.defer.apply($q, arguments);
            if(out.promise.done) return out;
            out.promise.done = function(successCallback, errorCallback){
                out.promise.then(successCallback, errorCallback);
            }
            return out;
        }
        return myQ;
    }
    function angularHttpWrapper($http, $q, $rootScope, $timeout){
        var autoThrower = null;
        
        var ret = {};
        ret.post = function(){
            var deferred = $q.defer();
            $http.post(arguments[0], arguments[1], {withCredentials:true}).success(function(data){
                deferred.resolve(  data );
                if(!data || !data.exception) return;
                if(!autoThrower){
                        data.exception.toString =    function(){
                            this.consumed = true;
                            return  this.message || Object.toString.call(this);
                        }
                        $rootScope.$emit('AngooseError', data.exception);
                        autoThrower = $timeout(function(){
                            autoThrower = null;
                            if(!data.exception.consumed){
                                console.error("Unhandled error detected, throwing", data.exception);
                                throw data.exception;  
                            } 
                        }, 100);  
                }   
            }).error(function(err){
                // emit angoose error
                deferred.reject(err);
            });
            return deferred.promise;
        }
        return ret;
    }
    function resourceAdapt(modelClass, $rootScope, $injector){
        // now adpat to angular resource
        modelClass.$get= function(){
            if(!modelClass.findOne) throw "Model does not support findOne operation";
            var modelInstance = new modelClass();
            modelClass.findOne.apply(modelClass, arguments).done(function(object){
                // the return data should be a model instance
                modelInstance.mergeData(object);
                //$rootScope.$digest();
                logger.trace("Copied server data to placeholder", modelInstance)
            }, errorHandler);    
            
            return modelInstance;
        };
        modelClass.$query=function(){
            if(!modelClass.find) throw "Model does not support find operation";
            var models = [];
            modelClass.find.apply(modelClass, arguments).done(function(retModels){
                // the return data should be a list of models
                models.length = 0;
                for(var i=0; retModels && retModels.length>i; i++)
                    models[i] = retModels[i];
                //$rootScope.$digest();
                logger.trace("Copied server data to placeholder")
            },  errorHandler);
            return models;
        };
        
        function errorHandler(err){
            console.error("$query/$get error: ", err);
            // if(true) return
            // var action = 'throw';
            // try{
                // var $ui = $injector.get("$ui");
                // action = $ui.config("$query-error") || action;
                // if(action == 'alert'){
                    // var alerts = $injector.get("$alert");
                    // alerts && alerts.error(err);    
                // } 
            // }
            // catch(ex){
            // }
            // if(action === 'throw')  throw err;
        }
    }
})();

// testing functions
function $anget(serviceName){
    return angular.element(document).injector().get(serviceName)
}// depdnencies: http, Q
/****** jQuery plugin for Angoose Client *******/
function angoose_jquery_adapater(){
    if(AngooseClient.client) return;
    if(typeof($) == 'undefined' && typeof(jQuery) == 'undefined') return;
    AngooseClient.client = 'jquery';
    var $ = $ || jQuery;
    var $q = typeof(Q) == 'undefined'? createQ() : Q;
    
    window.console && console.log("##### Angoose Client for jQuery Initializing");
     AngooseClient.init({
                http: ajaxHttpWrapper(),
                promise: $q
            });
     function ajaxHttpWrapper( ){
        var ret = {};
        ret.post = function(){
            var deferred = $q.defer();
            var url = arguments[0];
            var data = arguments[1];
            $.ajax(url, {
                method: 'POST',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json;charset=UTF-8',
                xhrFields: {
                   withCredentials: true
                }
            }).done(function(data, textStatus, jqXHR ){
                deferred.resolve(  data );
            }).fail(function( jqXHR, textStatus, err){
                deferred.reject(err);
            });
            return deferred.promise;
        };
        return ret;
    }
   
}
angoose_jquery_adapater();
 
/** include Q for now */
function createQ() {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you donb t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Millerb s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
// engine that has a deployed base of browsers that support generators.
// However, SM's generators use the Python-inspired semantics of
// outdated ES6 drafts.  We would like to support ES6, but we'd also
// like to make it possible to use generators in deployed browsers, so
// we also support Python-style generators.  At some point we can remove
// this block.
var hasES6Generators;
try {
    /* jshint evil: true, nonew: false */
    new Function("(function* (){ yield 1; })");
    hasES6Generators = true;
} catch (e) {
    hasES6Generators = false;
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If itb s a fulfilled promise, the fulfillment value is nearer.
 * If itb s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var unhandledReasonsDisplayed = false;
var trackUnhandledRejections = true;
function displayUnhandledReasons() {
    if (
        !unhandledReasonsDisplayed &&
        typeof window !== "undefined" &&
        window.console
    ) {
        console.warn("[Q] Unhandled rejection reasons (should be empty):",
                     unhandledReasons);
    }

    unhandledReasonsDisplayed = true;
}

function logUnhandledReasons() {
    for (var i = 0; i < unhandledReasons.length; i++) {
        var reason = unhandledReasons[i];
        console.warn("Unhandled rejection reason:", reason);
    }
}

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;
    unhandledReasonsDisplayed = false;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;

        // Show unhandled rejection reasons if Node exits without handling an
        // outstanding rejection.  (Note that Browserify presently produces a
        // `process` global without the `EventEmitter` `on` method.)
        if (typeof process !== "undefined" && process.on) {
            process.on("exit", logUnhandledReasons);
        }
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
    displayUnhandledReasons();
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    if (typeof process !== "undefined" && process.on) {
        process.removeListener("exit", logUnhandledReasons);
    }
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;
            if (hasES6Generators) {
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

}/** Angoose Client for Node.js */

(function(){
    if(typeof exports =="undefined" || typeof require == 'undefined') return;
    console.log("##### Angoose node client Loading");
    var Q  = require("q");
    AngooseClient.init({
        //http: realHttp(),
        http:mockHttp(),
        promise:Q
    });
    
    function realHttp(){
        var request = require('request');
        var _ = require("underscore")
        var HTTP_BASE =  "http://localhost:9988"; // +( AngooseClient.configs.httpPort ?(":"+ AngooseClient.config.httpPort):"");
        var $httpDelegate = {}
        var methods = ['get', 'post','put','delete'];
        // create deletage functions over request module
        var createFunc = function(method){
            return function(url, data, callback){
                console.log("Sending thtp request", url)
                var options = {url:  HTTP_BASE + url, method:method, jar:true , json:true};
                if(data && typeof(data) != 'function' ) 
                    options.json = data;
                else{
                    callback = data;
                } 
                var deferred = Q.defer();
                request(options, function(err, res, body){
                    if(err) 
                        deferred.reject(new Error(err));
                    else
                        deferred.resolve(body);
                    if(callback) callback(err, body);
                });
                return deferred.promise;
            }
        }
        _.each(methods, function(method){
            $httpDelegate[method] = createFunc(method);
        })
        return $httpDelegate;
           
    }
    function mockHttp(){
        var httpMock = require("node-mocks-http");
        var mock = {};
        var session = {};
        mock.post = function(url, data){
            var deferred = Q.defer();
            
            var request= httpMock.createRequest({
                    url: url,
                    method:'POST',
                    params: {
                        method: data.method,
                        model: data.clazz
                    }, 
                    session:session
            });
            request.body = data;
            var mockUser = {
                    _id: '52c44dd0ecafbf1a9a000002',
                    username:'Gaelyn',
                    email:'gaelyn@demo.com',
                    roles:'admin',
                    type:'admin'
               }
            // /** session */
           // request.session = {
               // user: mockUser,
               // userObj: mockUser
           // }
           var response = httpMock.createResponse();
           response.send = function(code, data){
               data = JSON.parse( JSON.stringify(data) );
               deferred.resolve(data);
           }
           var ROOT = process.cwd();
           var angoose = null;
           if(require("fs").existsSync(ROOT+"/lib/angoose.js"))
                angoose = require(ROOT+"/lib/angoose");
           else {
                angoose = require("angoose");
           }
               
           
           angoose.rmiAccept(request, response);
           return deferred.promise;
        }
        return mock    
    }

    module.exports = AngooseClient;         
})()
