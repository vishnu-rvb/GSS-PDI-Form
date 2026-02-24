function clearModule() {
    const content = document.getElementById("content");
    content.innerHTML = "";
    document.querySelectorAll("link[data-module], script[data-module]").forEach(i => i.remove());
}

async function loadHTML(htmlPath){
    const resp = await fetch(htmlPath);
    const html = await resp.text();
    document.getElementById("content").innerHTML = html;
}

function loadCSS(cssPath){
    fetch(cssPath).then(response => {
        if (response.ok) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssPath;
            link.setAttribute("data-module", "true");
            document.head.appendChild(link);
        }
    });
}

function loadJS(jsPath,module=true){
    const script = document.createElement("script");
    script.src = jsPath;
    if(module){script.type = "module";}
    else{script.defer = true;};
    script.setAttribute("data-module", "true");
    document.body.appendChild(script);
}

async function loadModule(modulePath) {
    clearModule();
    loadHTML(modulePath+'/index.html');
    loadCSS(modulePath+'/styles.css');
    loadJS(modulePath+'/script.js');
    if(modulePath==='modules/DataForm'){
        loadJS(modulePath+'/browser-image-compression.js',false);
    };
}
//redirecting to defaults
/* document.addEventListener('DOMContentLoaded',
    event =>{
        event.preventDefault();
        loadModule('modules/DataForm');
    }); */