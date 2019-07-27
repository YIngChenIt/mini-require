let path = require('path');
let fs = require('fs');
let vm = require('vm');
function Module(id){
    this.id = id;
    this.exports = {}
}
Module._extensions = {};
Module._cache = {};
let wrapper = [
    '(function(exports,module,require,__dirname,__filename){'
    ,   
    '})'
]
Module._extensions['.js'] = function(module){
    let script = fs.readFileSync(module.id,'utf8');
    let functStr = wrapper[0] + script + wrapper[1];
    let fn = vm.runInThisContext(functStr);
    fn.call(module.exports,module.exports,module,myRequire);
}
Module._extensions['.json']= function(module){
    let script = fs.readFileSync(module.id,'utf8');
    module.exports = JSON.parse(script);
} 
Module.prototype.load = function(){
    let ext = path.extname(this.id);
    Module._extensions[ext](this)
}
function myRequire(filePath){
    let absPath = path.resolve(__dirname,filePath);
    let p = '';
    try{
        // 判断当前路径是否存在
        fs.accessSync(absPath)
        p = absPath;
    }catch(e){
        // 增加逻辑 看是否存在
        let extensions = Object.keys(Module._extensions);
        extensions.some(ext=>{
          let url = absPath + ext;
          try{
            fs.accessSync(url);p = url;
            return true;
          }catch(e){
            return false;
          }
        });
    }
    if(p){
        // 单例模式
        if( Module._cache[p]){ // 如果缓存中有直接将缓存中的exports属性返回回去即可
            return  Module._cache[p].exports; 
        }
        let module = new Module(p); // 创建一个模块对象
        Module._cache[p] = module
        // 加载模块
        module.load(); // 加载这个模块
        return module.exports; // 只需要返回module.exports 属性
    }else{
        throw new Error('file not access')
    }
}
let r = myRequire('./a1');
console.log(r);