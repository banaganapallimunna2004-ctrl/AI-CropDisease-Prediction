import{b as m,r as o,f as c,j as e}from"./index-TJ09YICa.js";import{c as r}from"./createLucideIcon-BRjl67IN.js";/**
 * @license lucide-react v1.18.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],u=r("check",p);/**
 * @license lucide-react v1.18.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],b=r("chevron-down",f);/**
 * @license lucide-react v1.18.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]],N=r("globe",g),w=({compact:d=!1})=>{const{lang:n,changeLanguage:x}=m(),[a,s]=o.useState(!1),l=o.useRef(null),i=c.find(t=>t.code===n)||c[0];return o.useEffect(()=>{const t=h=>{l.current&&!l.current.contains(h.target)&&s(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]),e.jsxs("div",{ref:l,className:"relative z-50 inline-block text-left",children:[e.jsxs("button",{type:"button",onClick:()=>s(!a),className:"inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-cyan-500/10","aria-label":"Select language",children:[e.jsx(N,{className:"h-4 w-4 text-cyan-400"}),e.jsx("span",{className:"hidden sm:inline",children:i.flag}),!d&&e.jsx("span",{className:"hidden sm:inline text-xs font-bold text-slate-700",children:i.nativeName}),e.jsx(b,{className:`h-3.5 w-3.5 text-slate-500 transition-transform duration-300 ${a?"rotate-180":""}`})]}),a&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>s(!1)}),e.jsx("div",{className:"absolute right-0 mt-2 w-52 origin-top-right z-50 animate-in fade-in slide-in-from-top-2 duration-200",children:e.jsxs("div",{className:"rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl ring-1 ring-white/5",children:[e.jsx("p",{className:"px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500",children:"Select Language"}),c.map(t=>e.jsxs("button",{type:"button",onClick:()=>{x(t.code),s(!1)},className:`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${n===t.code?"bg-cyan-500/15 text-cyan-700":"text-slate-600 hover:bg-white/8 hover:text-slate-900"}`,children:[e.jsx("span",{className:"text-lg leading-none",children:t.flag}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-semibold truncate",children:t.nativeName}),e.jsx("p",{className:"text-[10px] text-slate-500",children:t.label})]}),n===t.code&&e.jsx(u,{className:"h-3.5 w-3.5 text-cyan-400 flex-shrink-0"})]},t.code))]})})]})]})};export{w as L};
