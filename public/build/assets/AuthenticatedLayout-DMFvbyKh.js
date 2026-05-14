import{r as l,j as e,L as f,d as P}from"./app-CYqKaw4z.js";import{e as R}from"./transition-CEqRtjvp.js";const C=l.createContext({open:!1,setOpen:()=>{},toggleOpen:()=>{}}),p=({children:t})=>{const[s,a]=l.useState(!1),r=()=>{a(n=>!n)};return e.jsx(C.Provider,{value:{open:s,setOpen:a,toggleOpen:r},children:e.jsx("div",{className:"relative",children:t})})},D=({children:t})=>{const{open:s,setOpen:a,toggleOpen:r}=l.useContext(C);return e.jsxs(e.Fragment,{children:[e.jsx("div",{onClick:r,children:t}),s&&e.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>a(!1)})]})},I=({align:t="right",width:s="48",contentClasses:a="py-1 bg-white",className:r="",children:n})=>{const{open:d,setOpen:i}=l.useContext(C);let h="origin-top";t==="left"?h="ltr:origin-top-left rtl:origin-top-right start-0":t==="right"&&(h="ltr:origin-top-right rtl:origin-top-left end-0");let u="";return s==="48"&&(u="w-48"),e.jsx(e.Fragment,{children:e.jsx(R,{show:d,enter:"transition ease-out duration-200",enterFrom:"opacity-0 scale-95",enterTo:"opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"opacity-100 scale-100",leaveTo:"opacity-0 scale-95",children:e.jsx("div",{className:`absolute z-50 rounded-md shadow-lg ${h} ${u} ${r}`,onClick:()=>i(!1),children:e.jsx("div",{className:"rounded-md ring-1 ring-black ring-opacity-5 "+a,children:n})})})})},T=({className:t="",children:s,...a})=>e.jsx(f,{...a,className:"block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none "+t,children:s});p.Trigger=D;p.Content=I;p.Link=T;function $({active:t=!1,className:s="",children:a,...r}){return e.jsx(f,{...r,className:`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${t?"border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800":"border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800"} text-base font-medium transition duration-150 ease-in-out focus:outline-none ${s}`,children:a})}/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=(...t)=>t.filter((s,a,r)=>!!s&&s.trim()!==""&&r.indexOf(s)===a).join(" ").trim();/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(s,a,r)=>r?r.toUpperCase():a.toLowerCase());/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=t=>{const s=V(t);return s.charAt(0).toUpperCase()+s.slice(1)};/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=t=>{for(const s in t)if(s.startsWith("aria-")||s==="role"||s==="title")return!0;return!1},K=l.createContext({}),q=()=>l.useContext(K),U=l.forwardRef(({color:t,size:s,strokeWidth:a,absoluteStrokeWidth:r,className:n="",children:d,iconNode:i,...h},u)=>{const{size:y=24,strokeWidth:x=2,absoluteStrokeWidth:m=!1,color:k="currentColor",className:N=""}=q()??{},j=r??m?Number(a??x)*24/Number(s??y):a??x;return l.createElement("svg",{ref:u,...w,width:s??y??w.width,height:s??y??w.height,stroke:t??k,strokeWidth:j,className:S("lucide",N,n),...!d&&!E(h)&&{"aria-hidden":"true"},...h},[...i.map(([v,b])=>l.createElement(v,b)),...Array.isArray(d)?d:[d]])});/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=(t,s)=>{const a=l.forwardRef(({className:r,...n},d)=>l.createElement(U,{ref:d,iconNode:s,className:S(`lucide-${W(L(t))}`,`lucide-${t}`,r),...n}));return a.displayName=L(t),a};/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]],F=o("calendar-days",B);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]],A=o("chart-column",H);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],Z=o("chevron-up",J);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=[["path",{d:"M17.925 20.056a6 6 0 0 0-11.851.001",key:"z69sun"}],["circle",{cx:"12",cy:"11",r:"4",key:"1gt34v"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],G=o("circle-user-round",X);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]],Y=o("clipboard-check",Q);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6h4",key:"135r8i"}]],te=o("clock-3",ee);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]],ae=o("credit-card",se);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]],oe=o("history",re);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],ie=o("layout-dashboard",ne);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],ce=o("log-out",le);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],he=o("map-pin",de);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],xe=o("menu",me);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]],ue=o("package",pe);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m16 15-3-3 3-3",key:"14y99z"}]],ye=o("panel-left-close",ge);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m14 9 3 3-3 3",key:"8010ee"}]],be=o("panel-left-open",fe);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],z=o("shield",ke);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=[["path",{d:"M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5",key:"slp6dd"}],["path",{d:"M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244",key:"o0xfot"}],["path",{d:"M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05",key:"wn3emo"}]],je=o("store",Ne);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],we=o("users",ve);/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Me=o("x",Ce),_e=[{label:"Toko",routeName:"master.tenants.index",roles:["master_dev"],icon:je},{label:"Dashboard",routeName:"admin.dashboard",roles:["owner","admin"],icon:ie},{label:"Karyawan",routeName:"admin.users.index",roles:["owner","admin"],icon:we},{label:"Lokasi & Jadwal",routeName:"admin.offices.index",roles:["owner","admin"],icon:he},{label:"Jadwal Shift",routeName:"admin.shifts.index",roles:["owner","admin"],icon:te},{label:"Rekap Karyawan",routeName:"admin.attendance.report",roles:["owner","admin"],icon:A},{label:"Produk",routeName:"admin.products.index",roles:["owner","admin"],icon:ue},{label:"Kasir (POS)",routeName:"kasir",roles:["kasir","admin","owner"],icon:ae},{label:"Rekap Penjualan",routeName:"sales.report",roles:["kasir","admin","owner"],icon:A},{label:"Absen",routeName:"attendance.index",roles:["waiters","kasir","admin","owner"],icon:Y},{label:"Riwayat Absen Saya",routeName:"attendance.history",roles:["waiters","kasir","admin","owner"],icon:oe},{label:"Jadwal",routeName:"schedule.index",roles:["waiters","kasir","admin","owner"],icon:F}];function $e(t){return t.toLocaleString("id-ID",{timeZone:"Asia/Jakarta",weekday:"short",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}).replace(",","")}function Le(t,s){if(t===s)return!0;const a=s.split(".");if(a.length<2)return!1;const r=`${a[0]}.${a[1]}`;return new RegExp(`^${r.replace(/\./g,"\\.")}(\\..*)?$`).test(t)}function Se({header:t,children:s}){const a=P(),{auth:r,flash:n,app:d}=a.props,{user:i,tenant:h}=r,u=(d==null?void 0:d.name)||"TokoIn",[y,x]=l.useState(!1),[m,k]=l.useState(!1),[N,j]=l.useState(new Date);l.useEffect(()=>{const c=setInterval(()=>j(new Date),1e3);return()=>clearInterval(c)},[]);const v=_e.filter(c=>c.roles.includes(i.role)),b=({mobile:c=!1})=>e.jsx("nav",{className:"space-y-1",children:v.map(g=>{const O=g.icon;return e.jsxs(f,{href:route(g.routeName),onClick:()=>c&&x(!1),className:`
                            flex items-center
                            ${m&&!c?"justify-center":"gap-3"}
                            px-3 py-3 rounded-xl text-sm transition
                            ${Le(route().current()||"",g.routeName)?"bg-indigo-50 text-indigo-600 font-medium":"hover:bg-gray-50"}
                        `,children:[e.jsx(O,{className:"h-5 w-5"}),(!m||c)&&e.jsx("span",{children:g.label})]},g.routeName)})}),M=c=>({master_dev:"bg-purple-100 text-purple-700 border-purple-200",owner:"bg-amber-100 text-amber-700 border-amber-200",admin:"bg-blue-100 text-blue-700 border-blue-200",kasir:"bg-emerald-100 text-emerald-700 border-emerald-200",waiters:"bg-pink-100 text-pink-700 border-pink-200"})[c]||"bg-gray-100 text-gray-700 border-gray-200",_=c=>({master_dev:"Master Developer",owner:"Owner",admin:"Admin",kasir:"Kasir",waiters:"Waiter/Waitress"})[c]||c.charAt(0).toUpperCase()+c.slice(1);return e.jsxs("div",{className:"min-h-screen bg-gray-100",children:[e.jsxs("div",{className:"flex min-h-screen",children:[e.jsxs("aside",{className:`
                        hidden sm:flex flex-col h-screen sticky top-0
                        bg-white border-r shadow-sm
                        transition-all duration-300
                        ${m?"w-20":"w-70"}
                    `,children:[e.jsxs("div",{className:"p-4 border-b shrink-0",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(f,{href:route("dashboard"),className:"flex items-center gap-3",children:[e.jsx("img",{src:"/assets/images/logotokoin.png",className:"h-10 w-10 rounded-xl",alt:"Logo"}),!m&&e.jsx("h1",{className:"text-lg font-bold text-indigo-600",children:u})]}),e.jsx("button",{onClick:()=>k(!m),className:"p-2 rounded hover:bg-gray-100",children:m?e.jsx(be,{size:18}):e.jsx(ye,{size:18})})]}),!m&&h&&e.jsxs("p",{className:"text-xs text-gray-500 mt-3",children:["Toko:",e.jsx("span",{className:"ml-1 font-semibold",children:h.name})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-3",children:e.jsx(b,{})}),e.jsxs("div",{className:"border-t bg-white/80 backdrop-blur-sm p-3 shrink-0",children:[!m&&e.jsx("div",{className:"mb-3",children:e.jsxs("div",{className:`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 
                                    rounded-lg text-xs font-medium border
                                    ${M(i.role)}
                                `,children:[e.jsx(z,{size:12}),_(i.role)]})}),e.jsx("div",{className:"relative",children:e.jsxs(p,{children:[e.jsx(p.Trigger,{children:e.jsxs("button",{className:"w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2","aria-label":"Menu pengguna",children:[e.jsx("div",{className:"h-9 w-9 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm",children:i.name.charAt(0).toUpperCase()}),!m&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"min-w-0 flex-1 text-left",children:[e.jsx("p",{className:"text-sm font-medium text-gray-900 truncate",children:i.name}),e.jsx("p",{className:"text-xs text-gray-500 truncate",children:i.email})]}),e.jsx(Z,{className:"h-4 w-4 text-gray-400 transition-transform group-hover:text-gray-600"})]})]})}),e.jsxs(p.Content,{align:"right",width:"48",className:"bottom-full right-0 mb-3 !top-auto origin-bottom-right",children:[e.jsxs("div",{className:"px-4 py-3 border-b border-gray-100",children:[e.jsx("p",{className:"text-sm font-semibold text-gray-900 truncate",children:i.name}),e.jsx("p",{className:"text-xs text-gray-500 truncate",children:i.email})]}),e.jsx("div",{className:"py-1",children:e.jsx(p.Link,{href:route("profile.edit"),children:e.jsxs("div",{className:"flex items-center gap-2.5 px-1 py-0.5",children:[e.jsx(G,{size:16,className:"text-gray-500"}),e.jsx("span",{className:"text-sm",children:"Pengaturan Akun"})]})})}),e.jsx("div",{className:"border-t border-gray-100 py-1",children:e.jsx(p.Link,{href:route("logout"),method:"post",as:"button",children:e.jsxs("div",{className:"flex items-center gap-2.5 px-1 py-0.5 text-red-600",children:[e.jsx(ce,{size:16}),e.jsx("span",{className:"text-sm",children:"Keluar"})]})})})]})]})})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col min-w-0",children:[e.jsx("nav",{className:"h-16 bg-white border-b sticky top-0 z-40 shadow-sm",children:e.jsxs("div",{className:"h-full px-4 sm:px-6 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{className:"sm:hidden",onClick:()=>x(!0),children:e.jsx(xe,{className:"h-6 w-6"})}),t]}),e.jsxs("div",{className:"text-xs font-mono bg-gray-100 px-3 py-2 rounded-lg",children:[$e(N)," WIB"]})]})}),(n==null?void 0:n.success)&&e.jsx("div",{className:"m-4 rounded bg-green-50 border border-green-300 px-4 py-3",children:n.success}),(n==null?void 0:n.error)&&e.jsx("div",{className:"m-4 rounded bg-red-50 border border-red-300 px-4 py-3",children:n.error}),e.jsx("main",{className:"flex-1 p-4 sm:p-6 overflow-y-auto",children:s})]})]}),y&&e.jsxs("div",{className:"fixed inset-0 z-50 sm:hidden",children:[e.jsx("button",{className:"absolute inset-0 bg-black/40",onClick:()=>x(!1)}),e.jsxs("aside",{className:"absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white shadow-xl flex flex-col",children:[e.jsxs("div",{className:"p-4 border-b",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(f,{href:route("dashboard"),className:"flex items-center gap-3",children:[e.jsx("img",{src:"/assets/images/logotokoin.png",className:"h-10 w-10 rounded-xl",alt:"Logo"}),e.jsx("h1",{className:"font-bold text-indigo-600",children:u})]}),e.jsx("button",{onClick:()=>x(!1),children:e.jsx(Me,{})})]}),h&&e.jsxs("p",{className:"text-xs text-gray-500 mt-3",children:["Toko:",e.jsx("span",{className:"ml-1 font-semibold",children:h.name})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-3",children:e.jsx(b,{mobile:!0})}),e.jsxs("div",{className:"border-t p-4",children:[e.jsx("div",{className:"mb-3",children:e.jsxs("div",{className:`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 
                                    rounded-lg text-xs font-medium border
                                    ${M(i.role)}
                                `,children:[e.jsx(z,{size:12}),_(i.role)]})}),e.jsx("div",{className:"font-semibold text-sm mb-1",children:i.name}),e.jsx("div",{className:"text-xs text-gray-500 mb-3",children:i.email}),e.jsx($,{href:route("profile.edit"),onClick:()=>x(!1),children:"Pengaturan"}),e.jsx($,{href:route("logout"),method:"post",as:"button",onClick:()=>x(!1),children:"Keluar"})]})]})]})]})}export{Se as A};
