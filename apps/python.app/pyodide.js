!function(global,factory){"object"==typeof exports&&"undefined"!=typeof module?factory(exports):"function"==typeof define&&define.amd?define(["exports"],factory):factory((global="undefined"!=typeof globalThis?globalThis:global||self).loadPyodide={})}(this,(function(exports){"use strict";"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var errorStackParser={exports:{}},stackframe={exports:{}};!function(module,exports){module.exports=function(){function _isNumber(n){return!isNaN(parseFloat(n))&&isFinite(n)}function _capitalize(str){return str.charAt(0).toUpperCase()+str.substring(1)}function _getter(p){return function(){return this[p]}}var booleanProps=["isConstructor","isEval","isNative","isToplevel"],numericProps=["columnNumber","lineNumber"],stringProps=["fileName","functionName","source"],arrayProps=["args"],objectProps=["evalOrigin"],props=booleanProps.concat(numericProps,stringProps,arrayProps,objectProps);function StackFrame(obj){if(obj)for(var i=0;i<props.length;i++)void 0!==obj[props[i]]&&this["set"+_capitalize(props[i])](obj[props[i]])}StackFrame.prototype={getArgs:function(){return this.args},setArgs:function(v){if("[object Array]"!==Object.prototype.toString.call(v))throw new TypeError("Args must be an Array");this.args=v},getEvalOrigin:function(){return this.evalOrigin},setEvalOrigin:function(v){if(v instanceof StackFrame)this.evalOrigin=v;else{if(!(v instanceof Object))throw new TypeError("Eval Origin must be an Object or StackFrame");this.evalOrigin=new StackFrame(v)}},toString:function(){var fileName=this.getFileName()||"",lineNumber=this.getLineNumber()||"",columnNumber=this.getColumnNumber()||"",functionName=this.getFunctionName()||"";return this.getIsEval()?fileName?"[eval] ("+fileName+":"+lineNumber+":"+columnNumber+")":"[eval]:"+lineNumber+":"+columnNumber:functionName?functionName+" ("+fileName+":"+lineNumber+":"+columnNumber+")":fileName+":"+lineNumber+":"+columnNumber}},StackFrame.fromString=function(str){var argsStartIndex=str.indexOf("("),argsEndIndex=str.lastIndexOf(")"),functionName=str.substring(0,argsStartIndex),args=str.substring(argsStartIndex+1,argsEndIndex).split(","),locationString=str.substring(argsEndIndex+1);if(0===locationString.indexOf("@"))var parts=/@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString,""),fileName=parts[1],lineNumber=parts[2],columnNumber=parts[3];return new StackFrame({functionName:functionName,args:args||void 0,fileName:fileName,lineNumber:lineNumber||void 0,columnNumber:columnNumber||void 0})};for(var i=0;i<booleanProps.length;i++)StackFrame.prototype["get"+_capitalize(booleanProps[i])]=_getter(booleanProps[i]),StackFrame.prototype["set"+_capitalize(booleanProps[i])]=function(p){return function(v){this[p]=Boolean(v)}}(booleanProps[i]);for(var j=0;j<numericProps.length;j++)StackFrame.prototype["get"+_capitalize(numericProps[j])]=_getter(numericProps[j]),StackFrame.prototype["set"+_capitalize(numericProps[j])]=function(p){return function(v){if(!_isNumber(v))throw new TypeError(p+" must be a Number");this[p]=Number(v)}}(numericProps[j]);for(var k=0;k<stringProps.length;k++)StackFrame.prototype["get"+_capitalize(stringProps[k])]=_getter(stringProps[k]),StackFrame.prototype["set"+_capitalize(stringProps[k])]=function(p){return function(v){this[p]=String(v)}}(stringProps[k]);return StackFrame}()}(stackframe),function(module,exports){var StackFrame,FIREFOX_SAFARI_STACK_REGEXP,CHROME_IE_STACK_REGEXP,SAFARI_NATIVE_CODE_REGEXP;module.exports=(StackFrame=stackframe.exports,FIREFOX_SAFARI_STACK_REGEXP=/(^|@)\S+:\d+/,CHROME_IE_STACK_REGEXP=/^\s*at .*(\S+:\d+|\(native\))/m,SAFARI_NATIVE_CODE_REGEXP=/^(eval@)?(\[native code])?$/,{parse:function(error){if(void 0!==error.stacktrace||void 0!==error["opera#sourceloc"])return this.parseOpera(error);if(error.stack&&error.stack.match(CHROME_IE_STACK_REGEXP))return this.parseV8OrIE(error);if(error.stack)return this.parseFFOrSafari(error);throw new Error("Cannot parse given Error object")},extractLocation:function(urlLike){if(-1===urlLike.indexOf(":"))return[urlLike];var parts=/(.+?)(?::(\d+))?(?::(\d+))?$/.exec(urlLike.replace(/[()]/g,""));return[parts[1],parts[2]||void 0,parts[3]||void 0]},parseV8OrIE:function(error){return error.stack.split("\n").filter((function(line){return!!line.match(CHROME_IE_STACK_REGEXP)}),this).map((function(line){line.indexOf("(eval ")>-1&&(line=line.replace(/eval code/g,"eval").replace(/(\(eval at [^()]*)|(,.*$)/g,""));var sanitizedLine=line.replace(/^\s+/,"").replace(/\(eval code/g,"(").replace(/^.*?\s+/,""),location=sanitizedLine.match(/ (\(.+\)$)/);sanitizedLine=location?sanitizedLine.replace(location[0],""):sanitizedLine;var locationParts=this.extractLocation(location?location[1]:sanitizedLine),functionName=location&&sanitizedLine||void 0,fileName=["eval","<anonymous>"].indexOf(locationParts[0])>-1?void 0:locationParts[0];return new StackFrame({functionName:functionName,fileName:fileName,lineNumber:locationParts[1],columnNumber:locationParts[2],source:line})}),this)},parseFFOrSafari:function(error){return error.stack.split("\n").filter((function(line){return!line.match(SAFARI_NATIVE_CODE_REGEXP)}),this).map((function(line){if(line.indexOf(" > eval")>-1&&(line=line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,":$1")),-1===line.indexOf("@")&&-1===line.indexOf(":"))return new StackFrame({functionName:line});var functionNameRegex=/((.*".+"[^@]*)?[^@]*)(?:@)/,matches=line.match(functionNameRegex),functionName=matches&&matches[1]?matches[1]:void 0,locationParts=this.extractLocation(line.replace(functionNameRegex,""));return new StackFrame({functionName:functionName,fileName:locationParts[0],lineNumber:locationParts[1],columnNumber:locationParts[2],source:line})}),this)},parseOpera:function(e){return!e.stacktrace||e.message.indexOf("\n")>-1&&e.message.split("\n").length>e.stacktrace.split("\n").length?this.parseOpera9(e):e.stack?this.parseOpera11(e):this.parseOpera10(e)},parseOpera9:function(e){for(var lineRE=/Line (\d+).*script (?:in )?(\S+)/i,lines=e.message.split("\n"),result=[],i=2,len=lines.length;i<len;i+=2){var match=lineRE.exec(lines[i]);match&&result.push(new StackFrame({fileName:match[2],lineNumber:match[1],source:lines[i]}))}return result},parseOpera10:function(e){for(var lineRE=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,lines=e.stacktrace.split("\n"),result=[],i=0,len=lines.length;i<len;i+=2){var match=lineRE.exec(lines[i]);match&&result.push(new StackFrame({functionName:match[3]||void 0,fileName:match[2],lineNumber:match[1],source:lines[i]}))}return result},parseOpera11:function(error){return error.stack.split("\n").filter((function(line){return!!line.match(FIREFOX_SAFARI_STACK_REGEXP)&&!line.match(/^Error created at/)}),this).map((function(line){var argsRaw,tokens=line.split("@"),locationParts=this.extractLocation(tokens.pop()),functionCall=tokens.shift()||"",functionName=functionCall.replace(/<anonymous function(: (\w+))?>/,"$2").replace(/\([^)]*\)/g,"")||void 0;functionCall.match(/\(([^)]*)\)/)&&(argsRaw=functionCall.replace(/^[^(]+\(([^)]*)\)$/,"$1"));var args=void 0===argsRaw||"[arguments not available]"===argsRaw?void 0:argsRaw.split(",");return new StackFrame({functionName:functionName,args:args,fileName:locationParts[0],lineNumber:locationParts[1],columnNumber:locationParts[2],source:line})}),this)}})}(errorStackParser);var ErrorStackParser=errorStackParser.exports;const IN_NODE="undefined"!=typeof process&&process.release&&"node"===process.release.name&&void 0===process.browser;let nodeUrlMod,nodeFetch,nodePath,nodeVmMod,nodeFsPromisesMod,resolvePath,pathSep,loadBinaryFile,loadScript;if(resolvePath=IN_NODE?function(path,base){return nodePath.resolve(base||".",path)}:function(path,base){return void 0===base&&(base=location),new URL(path,base).toString()},IN_NODE||(pathSep="/"),loadBinaryFile=IN_NODE?async function(path,_file_sub_resource_hash){if(path.startsWith("file://")&&(path=path.slice("file://".length)),path.includes("://")){let response=await nodeFetch(path);if(!response.ok)throw new Error(`Failed to load '${path}': request failed.`);return new Uint8Array(await response.arrayBuffer())}{const data=await nodeFsPromisesMod.readFile(path);return new Uint8Array(data.buffer,data.byteOffset,data.byteLength)}}:async function(path,subResourceHash){const url=new URL(path,location);let options=subResourceHash?{integrity:subResourceHash}:{},response=await fetch(url,options);if(!response.ok)throw new Error(`Failed to load '${url}': request failed.`);return new Uint8Array(await response.arrayBuffer())},globalThis.document)loadScript=async url=>await import(/* webpackIgnore: true */url);else if(globalThis.importScripts)loadScript=async url=>{try{globalThis.importScripts(url)}catch(e){if(!(e instanceof TypeError))throw e;await import(/* webpackIgnore: true */url)}};else{if(!IN_NODE)throw new Error("Cannot determine runtime environment");loadScript=async function(url){url.startsWith("file://")&&(url=url.slice("file://".length));url.includes("://")?nodeVmMod.runInThisContext(await(await nodeFetch(url)).text()):await import(/* webpackIgnore: true */nodeUrlMod.pathToFileURL(url).href)}}function setStandardStreams(Module,stdin,stdout,stderr){stdout&&(Module.print=stdout),stderr&&(Module.printErr=stderr),stdin&&Module.preRun.push((function(){Module.FS.init(function(stdin){const encoder=new TextEncoder;let input=new Uint8Array(0),inputIndex=-1;function stdinWrapper(){try{if(-1===inputIndex){let text=stdin();if(null==text)return null;if("string"!=typeof text)throw new TypeError(`Expected stdin to return string, null, or undefined, got type ${typeof text}.`);text.endsWith("\n")||(text+="\n"),input=encoder.encode(text),inputIndex=0}if(inputIndex<input.length){let character=input[inputIndex];return inputIndex++,character}return inputIndex=-1,null}catch(e){throw console.error("Error thrown in stdin:"),console.error(e),e}}return stdinWrapper}(stdin),null,null)}))}function finalizeBootstrap(API,config){API.runPythonInternal_dict=API._pyodide._base.eval_code("{}"),API.importlib=API.runPythonInternal("import importlib; importlib");let import_module=API.importlib.import_module;API.sys=import_module("sys"),API.sys.path.insert(0,config.homedir);let globals=API.runPythonInternal("import __main__; __main__.__dict__"),builtins=API.runPythonInternal("import builtins; builtins.__dict__");var builtins_dict;API.globals=(builtins_dict=builtins,new Proxy(globals,{get:(target,symbol)=>"get"===symbol?key=>{let result=target.get(key);return void 0===result&&(result=builtins_dict.get(key)),result}:"has"===symbol?key=>target.has(key)||builtins_dict.has(key):Reflect.get(target,symbol)}));let importhook=API._pyodide._importhook;importhook.register_js_finder(),importhook.register_js_module("js",config.jsglobals),importhook.register_unvendored_stdlib_finder();let pyodide=API.makePublicAPI();return importhook.register_js_module("pyodide_js",pyodide),API.pyodide_py=import_module("pyodide"),API.pyodide_code=import_module("pyodide.code"),API.pyodide_ffi=import_module("pyodide.ffi"),API.package_loader=import_module("pyodide._package_loader"),API.site=import_module("site"),API.sitepackages=API.site.getsitepackages().toJs()[0],pyodide.pyodide_py=API.pyodide_py,pyodide.globals=API.globals,pyodide}async function loadPyodide(options={}){await async function(){if(!IN_NODE)return;if(nodeUrlMod=(await import("url")).default,nodeFsPromisesMod=await import("fs/promises"),nodeFetch=globalThis.fetch?fetch:(await import("node-fetch")).default,nodeVmMod=(await import("vm")).default,nodePath=await import("path"),pathSep=nodePath.sep,"undefined"!=typeof require)return;const node_modules={fs:await import("fs"),crypto:await import("crypto"),ws:await import("ws"),child_process:await import("child_process")};globalThis.require=function(mod){return node_modules[mod]}}();let indexURL=options.indexURL||function(){if("string"==typeof __dirname)return __dirname;let err;try{throw new Error}catch(e){err=e}let fileName=ErrorStackParser.parse(err)[0].fileName;const indexOfLastSlash=fileName.lastIndexOf(pathSep);if(-1===indexOfLastSlash)throw new Error("Could not extract indexURL path from pyodide module location");return fileName.slice(0,indexOfLastSlash)}();indexURL=resolvePath(indexURL),indexURL.endsWith("/")||(indexURL+="/"),options.indexURL=indexURL;const default_config={fullStdLib:!1,jsglobals:globalThis,stdin:globalThis.prompt?globalThis.prompt:void 0,homedir:"/home/pyodide",lockFileURL:indexURL+"repodata.json",args:[],_node_mounts:[]},config=Object.assign(default_config,options),pyodide_py_tar_promise=loadBinaryFile(config.indexURL+"pyodide_py.tar"),Module=function(){let Module={noImageDecoding:!0,noAudioDecoding:!0,noWasmDecoding:!1,preRun:[],quit:(status,toThrow)=>{throw Module.exited={status:status,toThrow:toThrow},toThrow}};return Module}();Module.preRun.push((()=>{for(const mount of config._node_mounts)Module.FS.mkdirTree(mount),Module.FS.mount(Module.NODEFS,{root:mount},mount)})),Module.arguments=config.args;const API={config:config};Module.API=API,setStandardStreams(Module,config.stdin,config.stdout,config.stderr),function(Module,path){Module.preRun.push((function(){try{Module.FS.mkdirTree(path)}catch(e){console.error(`Error occurred while making a home directory '${path}':`),console.error(e),console.error("Using '/' for a home directory instead"),path="/"}Module.ENV.HOME=path,Module.FS.chdir(path)}))}(Module,config.homedir);const moduleLoaded=new Promise((r=>Module.postRun=r));if(Module.locateFile=path=>config.indexURL+path,"function"!=typeof _createPyodideModule){const scriptSrc=`${config.indexURL}pyodide.asm.js`;await loadScript(scriptSrc)}if(await _createPyodideModule(Module),await moduleLoaded,Module.exited)throw Module.exited.toThrow;if("0.22.0a1"!==API.version)throw new Error(`Pyodide version does not match: '0.22.0a1' <==> '${API.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`);Module.locateFile=path=>{throw new Error("Didn't expect to load any more file_packager files!")};const pyodide_py_tar=await pyodide_py_tar_promise;!function(Module,pyodide_py_tar){let stream=Module.FS.open("/pyodide_py.tar","w");Module.FS.write(stream,pyodide_py_tar,0,pyodide_py_tar.byteLength,void 0,!0),Module.FS.close(stream);const code_ptr=Module.stringToNewUTF8('\nfrom sys import version_info\npyversion = f"python{version_info.major}.{version_info.minor}"\nimport shutil\nshutil.unpack_archive("/pyodide_py.tar", f"/lib/{pyversion}/")\ndel shutil\nimport importlib\nimportlib.invalidate_caches()\ndel importlib\n    ');Module.API.capture_stderr();let errcode=Module._PyRun_SimpleString(code_ptr);const captured_stderr=Module.API.restore_stderr().trim();errcode&&Module.API.fatal_loading_error("Failed to unpack standard library.\n",captured_stderr),Module._free(code_ptr),Module.FS.unlink("/pyodide_py.tar")}(Module,pyodide_py_tar),Module._pyodide_init();const pyodide=finalizeBootstrap(API,config);if(pyodide.version.includes("dev")||API.setCdnUrl(`https://cdn.jsdelivr.net/pyodide/v${pyodide.version}/full/`),await API.packageIndexReady,"0.22.0a1"!==API.repodata_info.version)throw new Error("Lock file version doesn't match Pyodide version");return API.package_loader.init_loaded_packages(),config.fullStdLib&&await pyodide.loadPackage(API._pyodide._importhook.UNVENDORED_STDLIBS),pyodide.runPython("print('Python initialization complete')"),pyodide}globalThis.loadPyodide=loadPyodide,exports.loadPyodide=loadPyodide,exports.version="0.22.0a1",Object.defineProperty(exports,"__esModule",{value:!0})}));
//# sourceMappingURL=pyodide.js.map
