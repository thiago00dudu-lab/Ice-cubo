module.exports = (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).end(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#072445;--g:rgba(255,255,255,.55);--l:rgba(7,36,69,.18);--t:#06223f;--m:#2b587d;--a:#0ea5e9}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--t);height:100vh;overflow:hidden;
background:radial-gradient(1200px 700px at 15% -10%,rgba(255,255,255,.85),transparent 55%),
radial-gradient(900px 700px at 110% 20%,rgba(56,189,248,.25),transparent 60%),
linear-gradient(180deg,var(--bg1),var(--bg2) 45%,#7dd3fc 70%,#2aa9ff 86%,var(--bg3));
}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.35;mix-blend-mode:multiply;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none'%3E%3Cpath d='M60 10c6 10 6 20 0 30c-6-10-6-20 0-30Z' fill='%230ea5e9' opacity='.35'/%3E%3Cpath d='M35 35c10 6 20 6 30 0c-10-6-20-6-30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Cpath d='M85 35c-10 6-20 6-30 0c10-6 20-6 30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Ccircle cx='22' cy='88' r='3' fill='%23ffffff' opacity='.35'/%3E%3Ccircle cx='35' cy='98' r='2' fill='%23ffffff' opacity='.25'/%3E%3Ccircle cx='48' cy='88' r='2' fill='%23ffffff' opacity='.2'/%3E%3Cpath d='M82 86c8-10 12-18 4-28c-9 6-14 12-4 28Z' fill='%230b5fa5' opacity='.22'/%3E%3Cpath d='M82 86c2-6 8-10 12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M82 86c-2-6-8-10-12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E");
background-size:140px 140px;
}
a{color:inherit}button{cursor:pointer}input,textarea{font:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:rgba(0,0,0,.08)}
.bub:before,.bub:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.35) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.22) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.bub:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}

.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.10)}
.brandname{display:flex;flex-direction:column;line-height:1.05}
.brandname b{letter-spacing:1.2px;font-size:15px}
.brandname small{color:var(--m);font-size:11px}

.pill{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px}
.coin{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#38bdf8,#0b2a6a);
border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset}
.coin span{color:#ffd700;font-weight:1000}
.pill .meta{display:flex;flex-direction:column;line-height:1.05}
.pill .meta b{font-size:12px}
.pill .meta small{font-size:11px;color:var(--m)}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainV{width:100%;height:100%;object-fit:cover;display:none}
#mainI{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;color:var(--m);text-align:center}

.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:4}
.card{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.av{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;font-weight:1000;background:linear-gradient(135deg,#38bdf8,#1d4ed8);position:relative;color:#fff}
.meta2{min-width:0}
.meta2 .name{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}
.meta2 .sub{font-size:12px;color:var(--m);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.star{font-size:13px}
.star.gold{color:#ffd700;text-shadow:0 0 10px rgba(255,215,0,.35)}
.star.blue{color:#0ea5e9;text-shadow:0 0 10px rgba(14,165,233,.25)}
.sbtn{padding:10px 12px;border-radius:18px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);color:var(--t)}
.sbtn:active{transform:scale(.98)}

.bottom{flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 10px 74px;overflow:hidden}
.carousel{display:flex;gap:10px;overflow:auto;scroll-snap-type:x mandatory;padding-bottom:4px}
.item{min-width:190px;max-width:190px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--l);background:rgba(255,255,255,.35);scroll-snap-align:center;position:relative}
.item video,.item img{width:100%;height:100%;object-fit:cover;display:block}
.tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(7,36,69,.18);background:rgba(255,255,255,.55);backdrop-filter:blur(8px);border-radius:14px;font-size:12px;display:flex;gap:8px;align-items:center;color:#053055}
.tag .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff}
.item.active{outline:2px solid rgba(14,165,233,.9)}

.panel{flex:1;overflow:auto;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.muted{color:var(--m);font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.post{border:1px solid var(--l);background:rgba(255,255,255,.35);border-radius:18px;overflow:hidden}
.post video,.post img{width:100%;height:140px;object-fit:cover;display:block}
.pbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px}
.badge{font-size:12px;color:var(--m);display:flex;align-items:center;gap:8px;min-width:0}
.badge .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff;flex:0 0 auto;position:relative}
.badge b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:105px}
.chip{font-size:11px;padding:4px 8px;border-radius:999px;border:1px solid rgba(14,165,233,.25);background:rgba(14,165,233,.10);color:#075985}
.icon{border:0;background:transparent;color:#ef4444;padding:6px 8px;border-radius:12px}
.icon:active{transform:scale(.96)}

.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:10}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(14px);color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(14,165,233,.9)}

.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(760px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.88);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(7,36,69,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.field{flex:1;min-width:180px}
.field input,.field textarea{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.75);color:var(--t);outline:none}
.field textarea{min-height:74px;resize:vertical}
hr{border:0;border-top:1px solid rgba(7,36,69,.12);margin:10px 0}

/* filtros */
.filt{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 10px}
.filt button{padding:8px 10px;border-radius:999px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.7)}
.filt button.on{outline:2px solid rgba(14,165,233,.9);background:rgba(14,165,233,.12)}

/* bear */
.bearWrap{width:44px;height:44px;border-radius:16px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.65);display:grid;place-items:center;overflow:hidden}
