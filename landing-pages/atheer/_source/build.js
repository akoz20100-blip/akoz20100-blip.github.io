const fs=require("fs");
const SC="/tmp/claude-0/-home-user-Landing-page-/2b29c7dd-d17c-508f-90e9-fc2feb0469cd/scratchpad/";
const T=SC+"atheer-template.html";
const FD="/home/user/Landing-page-/landing-pages/eddah/fonts/thmanyah/";
const OUTDIR="/home/user/Landing-page-/landing-pages/atheer/";
const VID=OUTDIR+"assets/hero.mp4";
const tpl=fs.readFileSync(T,"utf8");
const fontFiles={__F_SANS_L__:"thmanyahsans-Light.woff2",__F_SANS_R__:"thmanyahsans-Regular.woff2",__F_SANS_M__:"thmanyahsans-Medium.woff2",__F_SANS_B__:"thmanyahsans-Bold.woff2",__F_SERIF_R__:"thmanyahserifdisplay-Regular.woff2",__F_SERIF_B__:"thmanyahserifdisplay-Bold.woff2"};
const base="https://akoz20100-blip.github.io/Landing-page-/landing-pages/eddah/fonts/thmanyah/";
const fontURL={__F_SANS_L__:base+"thmanyahsans-Light.woff2",__F_SANS_R__:base+"thmanyahsans-Regular.woff2",__F_SANS_M__:base+"thmanyahsans-Medium.woff2",__F_SANS_B__:base+"thmanyahsans-Bold.woff2",__F_SERIF_R__:base+"thmanyahserifdisplay-Regular.woff2",__F_SERIF_B__:base+"thmanyahserifdisplay-Bold.woff2"};
// self-contained (base64 fonts + video)
let a=tpl;
for(const k in fontFiles) a=a.split(k).join("data:font/woff2;base64,"+fs.readFileSync(FD+fontFiles[k]).toString("base64"));
a=a.split("__VIDEO__").join("data:video/mp4;base64,"+fs.readFileSync(VID).toString("base64"));
fs.writeFileSync(OUTDIR+"index.html",a);
// source (external URLs + relative video)
let b=tpl.replace("<head>","<head>\n<!-- Reference build: external Thmanyah + relative video. Add Atheer real images. -->");
for(const k in fontURL) b=b.split(k).join(fontURL[k]);
b=b.split("__VIDEO__").join("assets/hero.mp4");
fs.writeFileSync(OUTDIR+"index.source.html",b);
const rem=(a.match(/__[A-Z_]+__/g)||[]).concat(b.match(/__[A-Z_]+__/g)||[]);
console.log("built. index.html:",(fs.statSync(OUTDIR+"index.html").size/1024/1024).toFixed(2)+"MB | source:",(fs.statSync(OUTDIR+"index.source.html").size/1024).toFixed(0)+"KB | leftover:",rem.length);
