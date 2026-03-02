function clearModule() {
    document.querySelector("#content").innerHTML = "";
    const dataModules=document.querySelectorAll("link[data-module], script[data-module]");
    for(const i of dataModules){
        i.remove();
        console.log('removed '+i)
    };
}

async function loadHTML(srcPath){
    const resp = await fetch(srcPath);
    const html = await resp.text();
    document.querySelector("#content").innerHTML = html;
}

async function loadCSS(srcPath){
    return new Promise((resolve, reject)=>{
        const element = document.createElement("link");
        element.rel = "stylesheet";
        element.href = srcPath + "?t=" + Date.now();
        element.setAttribute("data-module", "true");
        element.onload = ()=>{
            console.log("loaded ", srcPath);
            resolve();
        };
        element.onerror = ()=>{
            console.error("failed ", srcPath);
            reject();
        };
        document.head.appendChild(element);
    });
}

async function loadJS(srcPath,module=false){
    return new Promise((resolve, reject)=>{
        const element = document.createElement("script");
        element.src = srcPath + "?t=" + Date.now();
        element.async = false;
        if (module) {element.type = "module";}
        element.onload = ()=>{
            console.log("loaded ", srcPath);
            resolve();
        };
        element.onerror = ()=>{
            console.error("failed ", srcPath);
            reject();
        };
        document.head.appendChild(element);
    });
}

async function loadModule(modulePath) {
    clearModule();

    if(modulePath==='/modules/DataForm'){
        await Promise.all([
            loadJS('/static/browser-image-compression.js'),
            loadJS('/static/flatpickr.js'),
            loadJS('/static/dropzone.js'),
            loadCSS('/static/flatpickr.css'),
            loadCSS('/static/dropzone.css')
        ]);
    };

    await Promise.all([
        loadHTML(modulePath+'/index.html'),
        loadCSS(modulePath+'/styles.css'),
        loadJS(modulePath+'/script.js',true)
    ]);

    if(typeof(window.init_controls)==='function'){
        window.init_controls();
    };
}
