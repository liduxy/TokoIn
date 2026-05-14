import{r as i,b as y,j as e,H as G}from"./app-CYqKaw4z.js";import{A as J}from"./AuthenticatedLayout-DMFvbyKh.js";import"./transition-CEqRtjvp.js";const q="#6366f1";function V(){const[j,K]=i.useState([]),[T,M]=i.useState([]),[r,x]=i.useState([]),[m,E]=i.useState(""),[c,N]=i.useState(null),[v,k]=i.useState(!1),[O,g]=i.useState(!1),[h,w]=i.useState(0),[d,p]=i.useState(0),[u,b]=i.useState("cash"),[S,C]=i.useState(""),[_,R]=i.useState(""),[a,D]=i.useState(null),[A,$]=i.useState(!1);i.useEffect(()=>{y.get("/api/kasir/categories").then(t=>M(t.data))},[]);const L=i.useCallback(async()=>{const t=new URLSearchParams;m&&t.set("search",m),c&&t.set("category_id",c.toString());const l=await y.get(`/api/kasir/products?${t}`);K(l.data)},[m,c]);i.useEffect(()=>{L()},[L]);const B=t=>{x(l=>{const n=l.find(s=>s.product_id===t.id);return n?t.track_stock&&n.qty>=t.stock?(alert("Stok tidak mencukupi!"),l):l.map(s=>s.product_id===t.id?{...s,qty:s.qty+1,subtotal:(s.qty+1)*s.price}:s):[...l,{product_id:t.id,name:t.name,price:t.price,qty:1,subtotal:t.price,stock:t.stock,track_stock:t.track_stock}]})},I=(t,l)=>{if(l<1){P(t);return}x(n=>n.map(s=>s.product_id!==t?s:s.track_stock&&l>s.stock?(alert("Stok tidak mencukupi!"),s):{...s,qty:l,subtotal:l*s.price}))},P=t=>{x(l=>l.filter(n=>n.product_id!==t))},f=r.reduce((t,l)=>t+l.subtotal,0),o=f-h,F=async()=>{var t,l;if(r.length===0)return alert("Keranjang kosong!");if(d<o)return alert("Pembayaran kurang!");k(!0);try{const n=await y.post("/api/kasir/transactions",{items:r.map(s=>({product_id:s.product_id,qty:s.qty})),discount:h,paid:d,payment_method:u,customer_name:S||void 0,note:_||void 0});D(n.data),$(!0),g(!1),H()}catch(n){alert(((l=(t=n.response)==null?void 0:t.data)==null?void 0:l.message)||"Gagal memproses transaksi")}finally{k(!1)}},H=()=>{x([]),w(0),p(0),b("cash"),C(""),R("")},z=()=>{var n;const t=window.open("","_blank","width=400,height=600");if(!t||!a)return;const l=`
            <html>
                <head>
                    <title>Struk - ${a.invoice_no}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 300px; margin: auto; }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        .line { border-top: 1px dashed #000; margin: 10px 0; }
                        table { width: 100%; }
                        td { padding: 2px 0; }
                        .right { text-align: right; }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h3>TOKO KITA</h3>
                        <p>Jl. Contoh No. 123</p>
                        <div class="line"></div>
                        <p>${a.invoice_no}</p>
                        <p>${new Date(a.created_at).toLocaleString("id-ID")}</p>
                        <p>Kasir: ${((n=a.user)==null?void 0:n.name)||"-"}</p>
                        ${a.customer_name?`<p>Pelanggan: ${a.customer_name}</p>`:""}
                        <div class="line"></div>
                        <table>
                            ${a.items.map(s=>`
                                <tr>
                                    <td>${s.product_name}</td>
                                </tr>
                                <tr>
                                    <td>${s.qty} x Rp ${s.price.toLocaleString("id-ID")}</td>
                                    <td class="right">Rp ${s.subtotal.toLocaleString("id-ID")}</td>
                                </tr>
                            `).join("")}
                        </table>
                        <div class="line"></div>
                        <table>
                            <tr>
                                <td>Subtotal</td>
                                <td class="right">Rp ${a.subtotal.toLocaleString("id-ID")}</td>
                            </tr>
                            ${a.discount>0?`
                                <tr>
                                    <td>Diskon</td>
                                    <td class="right">-Rp ${a.discount.toLocaleString("id-ID")}</td>
                                </tr>
                            `:""}
                            <tr class="bold">
                                <td>Total</td>
                                <td class="right">Rp ${a.total.toLocaleString("id-ID")}</td>
                            </tr>
                            <tr>
                                <td>Bayar (${a.payment_method})</td>
                                <td class="right">Rp ${a.paid.toLocaleString("id-ID")}</td>
                            </tr>
                            <tr class="bold">
                                <td>Kembalian</td>
                                <td class="right">Rp ${a.change_amount.toLocaleString("id-ID")}</td>
                            </tr>
                        </table>
                        ${a.note?`
                            <div class="line"></div>
                            <p>Catatan: ${a.note}</p>
                        `:""}
                        <div class="line"></div>
                        <p class="center">Terima Kasih!</p>
                    </div>
                    <script>window.onload = function() { window.print(); }<\/script>
                </body>
            </html>
        `;t.document.write(l),t.document.close()};return e.jsxs(J,{header:e.jsx("h2",{className:"text-xl font-semibold text-gray-800",children:"Kasir (POS)"}),children:[e.jsx(G,{title:"Kasir"}),e.jsx("div",{className:"py-6 px-4 sm:px-6 lg:px-8",children:e.jsxs("div",{className:"flex gap-6 h-[calc(100vh-120px)]",children:[e.jsxs("div",{className:"flex-1 flex flex-col",children:[e.jsxs("div",{className:"mb-4 space-y-3",children:[e.jsx("input",{type:"text",placeholder:"Cari produk...",value:m,onChange:t=>E(t.target.value),className:"w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"}),e.jsxs("div",{className:"flex gap-2 flex-wrap",children:[e.jsx("button",{onClick:()=>N(null),className:`px-3 py-1 rounded-full text-sm font-medium transition ${c?"bg-gray-200 text-gray-700 hover:bg-gray-300":"bg-indigo-600 text-white"}`,children:"Semua"}),T.map(t=>e.jsx("button",{onClick:()=>N(t.id),className:"px-3 py-1 rounded-full text-sm font-medium transition",style:c===t.id?{backgroundColor:t.color||q,color:"white"}:{backgroundColor:"#e5e7eb",color:"#374151"},children:t.name},t.id))]})]}),e.jsxs("div",{className:"flex-1 overflow-auto",children:[e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3",children:j.map(t=>e.jsxs("button",{onClick:()=>B(t),disabled:t.track_stock&&t.stock<=0,className:"text-left p-3 bg-white border rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed",children:[e.jsx("div",{className:"w-full h-2 rounded mb-2",style:{backgroundColor:t.category_color||q}}),e.jsx("p",{className:"font-semibold text-sm truncate",children:t.name}),e.jsx("p",{className:"text-xs text-gray-500",children:t.category}),e.jsxs("p",{className:"text-indigo-600 font-bold mt-1",children:["Rp ",t.price.toLocaleString("id-ID")]}),t.track_stock&&e.jsxs("p",{className:"text-xs text-gray-400",children:["Stok: ",t.stock]}),t.track_stock&&t.stock<=0&&e.jsx("p",{className:"text-xs text-red-500",children:"Habis"})]},t.id))}),j.length===0&&e.jsx("p",{className:"text-center text-gray-500 py-8",children:"Tidak ada produk"})]})]}),e.jsxs("div",{className:"w-96 bg-white rounded-lg shadow flex flex-col",children:[e.jsxs("div",{className:"p-4 border-b",children:[e.jsx("h3",{className:"font-semibold text-lg",children:"Keranjang"}),e.jsxs("p",{className:"text-sm text-gray-500",children:[r.length," item"]})]}),e.jsxs("div",{className:"flex-1 overflow-auto p-4 space-y-3",children:[r.map(t=>e.jsxs("div",{className:"bg-gray-50 rounded p-3",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium text-sm",children:t.name}),e.jsxs("p",{className:"text-xs text-gray-500",children:["Rp ",t.price.toLocaleString("id-ID")]})]}),e.jsx("button",{onClick:()=>P(t.product_id),className:"text-red-500 text-xs",children:"✕"})]}),e.jsxs("div",{className:"flex justify-between items-center mt-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:()=>I(t.product_id,t.qty-1),className:"w-7 h-7 bg-gray-200 rounded text-center hover:bg-gray-300",children:"-"}),e.jsx("span",{className:"w-8 text-center text-sm",children:t.qty}),e.jsx("button",{onClick:()=>I(t.product_id,t.qty+1),className:"w-7 h-7 bg-gray-200 rounded text-center hover:bg-gray-300",children:"+"})]}),e.jsxs("p",{className:"font-semibold text-sm",children:["Rp ",t.subtotal.toLocaleString("id-ID")]})]})]},t.product_id)),r.length===0&&e.jsx("p",{className:"text-center text-gray-400 py-8",children:"Keranjang kosong"})]}),e.jsxs("div",{className:"border-t p-4 space-y-3",children:[e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsx("span",{children:"Subtotal"}),e.jsxs("span",{className:"font-semibold",children:["Rp ",f.toLocaleString("id-ID")]})]}),e.jsxs("button",{onClick:()=>{p(o),g(!0)},disabled:r.length===0,className:"w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition",children:["Bayar · Rp ",o.toLocaleString("id-ID")]})]})]})]})}),O&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:e.jsxs("div",{className:"bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-auto space-y-4",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Pembayaran"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsx("span",{children:"Subtotal"}),e.jsxs("span",{children:["Rp ",f.toLocaleString("id-ID")]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("label",{className:"text-sm w-20",children:"Diskon"}),e.jsx("input",{type:"number",value:h,onChange:t=>w(Math.max(0,parseInt(t.target.value)||0)),className:"flex-1 border rounded px-3 py-1 text-sm",min:"0"})]}),e.jsxs("div",{className:"flex justify-between font-semibold",children:[e.jsx("span",{children:"Total"}),e.jsxs("span",{children:["Rp ",o.toLocaleString("id-ID")]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"Metode Pembayaran"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>b("cash"),className:`flex-1 py-2 rounded border text-sm ${u==="cash"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300"}`,children:"💵 Cash"}),e.jsx("button",{onClick:()=>b("qris"),className:`flex-1 py-2 rounded border text-sm ${u==="qris"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300"}`,children:"📱 QRIS"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-sm",children:"Jumlah Bayar"}),e.jsx("input",{type:"number",value:d,onChange:t=>p(parseInt(t.target.value)||0),className:"w-full border rounded px-3 py-2 text-lg font-bold",min:"0",autoFocus:!0}),d>=o&&e.jsxs("p",{className:"text-green-600 text-sm mt-1",children:["Kembalian: Rp ",(d-o).toLocaleString("id-ID")]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-sm",children:"Nama Pelanggan (opsional)"}),e.jsx("input",{type:"text",value:S,onChange:t=>C(t.target.value),className:"w-full border rounded px-3 py-1 text-sm"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-sm",children:"Catatan"}),e.jsx("textarea",{value:_,onChange:t=>R(t.target.value),className:"w-full border rounded px-3 py-1 text-sm",rows:2})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>g(!1),className:"flex-1 py-2 border rounded-lg text-sm",children:"Batal"}),e.jsx("button",{onClick:F,disabled:v||d<o,className:"flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50",children:v?"Memproses...":"Selesaikan Pembayaran"})]})]})}),A&&a&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:e.jsxs("div",{className:"bg-white rounded-lg p-6 w-96 space-y-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-4xl mb-2",children:"✅"}),e.jsx("h3",{className:"text-lg font-semibold text-green-600",children:"Transaksi Berhasil!"}),e.jsx("p",{className:"text-sm text-gray-500",children:a.invoice_no}),e.jsxs("p",{className:"text-lg font-bold mt-2",children:["Total: Rp ",a.total.toLocaleString("id-ID")]}),e.jsxs("p",{className:"text-sm text-gray-500",children:["Kembalian: Rp ",a.change_amount.toLocaleString("id-ID")]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:z,className:"flex-1 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200",children:"🖨️ Cetak Struk"}),e.jsx("button",{onClick:()=>{$(!1),D(null)},className:"flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700",children:"Selesai"})]})]})})]})}export{V as default};
