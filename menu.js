function clearModule() {
    const content = document.getElementById("content");
    content.innerHTML = "";
    document.querySelectorAll("link[data-module], script[data-module]").forEach(i => i.remove());
}

async function loadModule(modulePath) {
    clearModule();

    // load module HTML
    const module=modulePath+'/index.html'
    const resp = await fetch(module);
    const html = await resp.text();
    document.getElementById("content").innerHTML = html;

    // load module CSS if exists
    const cssPath = modulePath+'/styles.css'
    fetch(cssPath).then(response => {
        if (response.ok) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssPath;
            link.setAttribute("data-module", "true");
            document.head.appendChild(link);
        }
    });

    // load module JS if exists
    const jsPath = modulePath+'/script.js'
    const script = document.createElement("script");
    script.src = jsPath;
    script.type=
    script.defer = true;
    script.setAttribute("data-module", "true");
    document.body.appendChild(script);
}

//redirecting to defaults
/* document.addEventListener('DOMContentLoaded',
    event =>{
        event.preventDefault();
        loadModule('modules/DataForm');
    }); */