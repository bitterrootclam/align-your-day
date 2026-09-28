// Align Your Day - all data stays in this browser (localStorage)
const QUOTES=[
["Begin with the end in mind.","Stephen R. Covey"],["Put first things first.","Stephen R. Covey"],
["The secret of getting ahead is getting started.","Mark Twain"],["Small deeds done are better than great deeds planned.","Peter Marshall"],
["Be kind whenever possible. It is always possible.","Dalai Lama"],["You don't have to be great to start, but you have to start to be great.","Zig Ziglar"],
["It always seems impossible until it's done.","Nelson Mandela"],["Act as if what you do makes a difference. It does.","William James"],
["Well done is better than well said.","Benjamin Franklin"],["What you do today can improve all your tomorrows.","Ralph Marston"],
["A journey of a thousand miles begins with a single step.","Lao Tzu"],["Believe you can and you're halfway there.","Theodore Roosevelt"],
["Kindness is the language which the deaf can hear and the blind can see.","Mark Twain"],["Live as if you were to die tomorrow. Learn as if you were to live forever.","Mahatma Gandhi"],
["Do what you can, with what you have, where you are.","Theodore Roosevelt"],["The best way to predict the future is to create it.","Peter Drucker"],
["Energy and persistence conquer all things.","Benjamin Franklin"],["Sharpen the saw.","Stephen R. Covey"],
["No act of kindness, no matter how small, is ever wasted.","Aesop"],["Happiness is not something ready made. It comes from your own actions.","Dalai Lama"]];
const AREAS={
Physical:["Do 50 jumping jacks","Go for a 20-minute walk or bike ride","Do your laundry","Stretch for 10 minutes","Eat a vegetable with every meal"],
Mental:["Ask your teacher or boss for something extra to learn","Read 15 pages of a book","Learn 5 new words","Watch a short lesson on something new","Solve a puzzle"],
Social:["Give 5 people a high five","Give someone a compliment","Talk to a new friend instead of wearing headphones","Go to lunch with a friend","Text someone you haven't talked to in a while"],
Emotional:["Write down 3 things you're grateful for","Take 5 minutes of quiet breathing","Tell someone how you really feel","Do one thing just for fun","Put your phone away for an hour"],
Spiritual:["Spend 10 minutes in reflection or prayer","Spend time outside and notice nature","Do a kind act nobody knows about","Write your intention for tomorrow","Reflect on your personal values"]};
const $=id=>document.getElementById(id);
const todayKey=new Date().toLocaleDateString('en-CA');
const dayNum=Math.floor(new Date(todayKey)/864e5);
const store={get:k=>JSON.parse(localStorage.getItem(k)||'null'),set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
function fresh(){return{goals:Object.keys(AREAS).map((a,i)=>({area:a,text:AREAS[a][(dayNum+i)%AREAS[a].length],done:false})),water:[],waterGoal:store.get('waterGoal')||60,learned:''};}
let day=store.get('day:'+todayKey)||fresh();
const save=()=>{store.set('day:'+todayKey,day);renderHistory();};

$('today-date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
const q=QUOTES[dayNum%QUOTES.length];$('quote-text').textContent='"'+q[0]+'"';$('quote-author').textContent='- '+q[1];

function renderGoals(){
  const ul=$('goals');ul.innerHTML='';
  day.goals.forEach((g,i)=>{
    const li=document.createElement('li');if(g.done)li.className='done';
    li.innerHTML=`<input type="checkbox" ${g.done?'checked':''} aria-label="done"><span class="area ${g.area}">${g.area}</span><input type="text"><button class="small secondary" title="New suggestion">Shuffle</button>`;
    const [cb,,txt,btn]=li.children;txt.value=g.text;
    cb.onchange=()=>{g.done=cb.checked;save();renderGoals();};
    txt.oninput=()=>{g.text=txt.value;save();};
    btn.onclick=()=>{const l=AREAS[g.area];let n;do{n=l[Math.floor(Math.random()*l.length)]}while(n===g.text&&l.length>1);g.text=n;save();renderGoals();};
    ul.appendChild(li);
  });
  const d=day.goals.filter(g=>g.done).length;
  $('goal-bar').style.width=d/5*100+'%';$('goal-count').textContent=`${d} of 5 goals done`;
}
function renderWater(){
  const t=day.water.reduce((a,b)=>a+b,0);$('water-now').textContent=t;$('water-goal').value=day.waterGoal;
  $('water-bar').style.width=Math.min(100,t/day.waterGoal*100)+'%';
}
document.querySelectorAll('[data-oz]').forEach(b=>b.onclick=()=>{day.water.push(+b.dataset.oz);save();renderWater();});
$('water-undo').onclick=()=>{day.water.pop();save();renderWater();};
$('water-goal').onchange=e=>{day.waterGoal=Math.max(8,+e.target.value||60);store.set('waterGoal',day.waterGoal);save();renderWater();};
$('learned').value=day.learned;$('learned').oninput=e=>{day.learned=e.target.value;save();};

// Weather via Open-Meteo (free, no API key). Falls back to Meridian, ID if location is blocked.
const CODES={0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',61:'Rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',71:'Snow',73:'Snow',75:'Heavy snow',77:'Snow',80:'Showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Snow showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'};
function outfitFor(hi,lo,code,wind){
  const wet=(code>=51&&code<=67)||(code>=80&&code<=82)||code>=95, snow=(code>=71&&code<=77)||code===85||code===86;
  let cat,items;
  if(hi>=85){cat='Hot';items=['T-shirt or tank top','Shorts or a light skirt','Sandals or breathable sneakers','Sunglasses, hat, and sunscreen'];}
  else if(hi>=70){cat='Warm';items=['T-shirt or short-sleeve shirt','Shorts, light pants, or jeans','Sneakers'];}
  else if(hi>=55){cat='Mild';items=['Long-sleeve shirt or light layers','Jeans or pants','A light jacket or hoodie'];}
  else if(hi>=40){cat='Cool';items=['Sweater or warm long sleeves','Jeans or pants','A warm jacket','Closed-toe shoes'];}
  else{cat='Cold';items=['Thermal or warm base layer','Sweater plus a heavy coat','Hat, gloves, and scarf','Warm socks and boots'];}
  if(hi-lo>=20)items.push(`Layer up: it swings from ${lo}°F to ${hi}°F`);
  if(wet)items.push('Rain jacket or umbrella');if(snow)items.push('Waterproof boots');
  if(wind>=20)items.push('Windbreaker - it will be windy');
  if(code<=1&&hi>=60)items.push('Sunglasses');
  return{cat,items};
}
function loadWeather(lat,lon,label){
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=1`)
  .then(r=>r.json()).then(d=>{
    const hi=Math.round(d.daily.temperature_2m_max[0]),lo=Math.round(d.daily.temperature_2m_min[0]),code=d.daily.weather_code[0];
    const o=outfitFor(hi,lo,code,d.daily.wind_speed_10m_max[0]);
    $('weather').innerHTML=`<div class="weather-main">${CODES[code]||'Weather'} - now ${Math.round(d.current.temperature_2m)}°F (high ${hi}°, low ${lo}°)</div><small>${label}</small>`;
    window.WX={hi,lo,code,wind:d.daily.wind_speed_10m_max[0]};refreshAcc();
    $('outfit').innerHTML=`<strong>${o.cat} day outfit:</strong><ul>${o.items.map(i=>`<li>${i}</li>`).join('')}</ul>`;
  }).catch(()=>{$('weather').textContent='Could not load weather (are you online?).';$('outfit').innerHTML='';});
}
function getWeather(){
  $('weather').textContent='Loading weather...';
  const fb=()=>loadWeather(43.6121,-116.3915,'Meridian, ID (default - allow location for local weather)');
  if(!navigator.geolocation)return fb();
  let done=false;const once=f=>(...a)=>{if(!done){done=true;f(...a);}};
  setTimeout(once(fb),9000);
  navigator.geolocation.getCurrentPosition(once(p=>loadWeather(p.coords.latitude,p.coords.longitude,'Your location')),once(fb),{timeout:8000});
}
$('retry-weather').onclick=getWeather;

$('review-btn').onclick=()=>{
  const d=day.goals.filter(g=>g.done).length,missed=day.goals.filter(g=>!g.done),w=day.water.reduce((a,b)=>a+b,0);
  const msg=d===5?'Perfect day. All five areas covered.':d>=3?'Solid day. You moved forward in most areas.':d>=1?'Progress is progress. Tomorrow is a fresh start.':'Tough day - that happens. Pick one small goal for tomorrow.';
  $('review').innerHTML=`<p><strong>${d}/5 goals</strong> - ${msg}</p>`+
   (missed.length?`<p>Carry over to tomorrow:</p><ul>${missed.map(g=>`<li>${g.area}: ${g.text}</li>`).join('')}</ul>`:'')+
   `<p>Water: ${w} of ${day.waterGoal} oz ${w>=day.waterGoal?'- goal reached.':'- '+(day.waterGoal-w)+' oz short.'}</p>`+
   `<p>Learned: ${day.learned?day.learned.replace(/</g,'&lt;'):'<em>nothing written yet</em>'}</p>`;
};
function renderHistory(){
  const keys=Object.keys(localStorage).filter(k=>k.startsWith('day:')).sort().reverse().slice(0,7);
  $('history').innerHTML=keys.map(k=>{const x=store.get(k);const w=x.water.reduce((a,b)=>a+b,0);
    return `<li>${k.slice(4)}: ${x.goals.filter(g=>g.done).length}/5 goals, ${w} oz water${x.learned?' - learned: '+x.learned.replace(/</g,'&lt;').slice(0,60):''}</li>`}).join('')||'<li>No history yet.</li>';
}
$('reset').onclick=()=>{if(confirm('Reset today?')){day=fresh();save();renderGoals();renderWater();$('learned').value='';$('review').innerHTML='';}};
renderGoals();renderWater();renderHistory();getWeather();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js');

// ===== Display mode =====
function setMode(m){document.body.className=m;localStorage.setItem('mode',m);
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===m));
  document.querySelector('meta[name=theme-color]').content=m==='austere'?'#111111':'#e2508f';}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
setMode(localStorage.getItem('mode')||'effervescent');

// ===== Color wheel =====
const HUES=[["Red",0],["Red-orange",20],["Orange",35],["Yellow-orange",45],["Yellow",55],["Yellow-green",80],["Green",130],["Teal",175],["Blue",215],["Blue-violet",250],["Purple",280],["Pink",330]];
const NEUTRALS=[["Black","#1e1e1e"],["White","#fafafa"],["Gray","#9a9a9a"],["Navy","#1f2e55"],["Beige","#d9c7a7"],["Brown","#6b4a2f"],["Denim","#4a6a93"],["Olive","#6b6b3a"]];
const hsl=(h,s=70,l=55)=>`hsl(${h},${s}%,${l}%)`;
let wheelIdx=+(localStorage.getItem('wheelIdx')||8),harm=localStorage.getItem('harm')||'complementary';
function drawWheel(){
  const svg=$('wheel');svg.innerHTML='';
  HUES.forEach(([n,h],i)=>{const a0=(i*30-105)*Math.PI/180,a1=((i+1)*30-105)*Math.PI/180,R=100,r=42;
    const pt=(a,rad)=>`${(Math.cos(a)*rad).toFixed(2)},${(Math.sin(a)*rad).toFixed(2)}`;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',`M${pt(a0,r)} L${pt(a0,R)} A${R},${R} 0 0 1 ${pt(a1,R)} L${pt(a1,r)} A${r},${r} 0 0 0 ${pt(a0,r)}Z`);
    p.setAttribute('fill',hsl(h));if(i===wheelIdx)p.setAttribute('class','sel');
    p.innerHTML=`<title>${n}</title>`;p.onclick=()=>{wheelIdx=i;localStorage.setItem('wheelIdx',i);drawWheel();};svg.appendChild(p);});
  const c=document.createElementNS('http://www.w3.org/2000/svg','text');c.setAttribute('text-anchor','middle');c.setAttribute('dy','5');c.setAttribute('font-size','13');c.setAttribute('fill','currentColor');c.textContent=HUES[wheelIdx][0];svg.appendChild(c);
  renderPalette();
}
function renderPalette(){
  const [name,h]=HUES[wheelIdx],I=o=>HUES[(wheelIdx+o+12)%12];let sw,tip;
  if(harm==='complementary'){sw=[[name,hsl(h)],[I(6)[0],hsl(I(6)[1])],["Neutral: Gray","#9a9a9a"]];tip=`Bold contrast. Wear ${name.toLowerCase()} as the main piece and ${I(6)[0].toLowerCase()} as a small pop (scarf, shoes, bag).`;}
  else if(harm==='analogous'){sw=[I(-1),[name,h],I(1)].map(([n,x])=>[n,hsl(x)]);tip='Neighbors on the wheel. Calm and easy - pick one to lead and let the others support.';}
  else if(harm==='triadic'){sw=[[name,h],I(4),I(8)].map(([n,x])=>[n,hsl(x)]);tip='Playful and lively. Keep one color big and the other two as small accents.';}
  else if(harm==='monochrome'){sw=[["Light "+name,hsl(h,60,80)],[name,hsl(h)],["Deep "+name,hsl(h,60,30)]];tip='One color, different shades. Looks polished and is almost impossible to get wrong.';}
  else{sw=[[name,hsl(h)],...NEUTRALS.slice(0,4)];tip=`${name} goes with every neutral. Pair it with black, white, gray, navy, denim, or beige.`;}
  $('palette').innerHTML=sw.map(([n,c])=>`<div class="swatch"><div style="background:${c}"></div>${n}</div>`).join('');
  $('palette-tip').textContent=tip;
  document.querySelectorAll('[data-h]').forEach(b=>b.classList.toggle('on',b.dataset.h===harm));
}
document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{harm=b.dataset.h;localStorage.setItem('harm',harm);renderPalette();});
drawWheel();

// ===== Outfit builder & matching =====
const WARD={top:["T-shirt","Tank top","Button-up shirt","Polo","Blouse","Sweater","Hoodie","Flannel","Long-sleeve tee","Dress"],
 bottom:["Jeans","Shorts","Chinos","Leggings","Skirt","Joggers","Dress pants","(Dress - none)"],
 shoes:["Sneakers","Sandals","Boots","Loafers","Flats","Heels","Running shoes","Rain boots"]};
const COLORS=[...NEUTRALS.map(([n,c])=>[n,c,'n']),...HUES.map(([n,h])=>[n,hsl(h),h])];
const ACC=[["Watch",["Casual","School","Work","Dressy"]],["Belt",["Work","Dressy","Casual"]],["Sunglasses",[],"sun"],["Baseball cap",["Casual","Active"],"sun"],["Sun hat",["Casual"],"hot"],["Beanie",["Casual","School"],"cold"],["Scarf",["Casual","Work","Dressy"],"cool"],["Gloves",[],"cold"],["Umbrella",[],"wet"],["Rain jacket",[],"wet"],["Backpack",["School","Active"]],["Tote bag",["Casual","Work"]],["Crossbody bag",["Casual","Dressy"]],["Necklace",["Dressy","Casual"]],["Earrings",["Dressy","Work","Casual"]],["Bracelet",["Casual","Dressy"]],["Hair clip / scrunchie",["Casual","School","Active"]],["Tie",["Dressy","Work"]],["Headphones",["Active","School"]],["Water bottle",["Active","School","Work"]]];
let fit=store.get('fit:'+todayKey)||{top:"T-shirt",topc:"White",bottom:"Jeans",bottomc:"Denim",shoes:"Sneakers",shoesc:"White",occasion:"Casual",acc:[]};
const fill=(id,list)=>{$(id).innerHTML=list.map(x=>`<option>${x}</option>`).join('');$(id).value=fit[id];$(id).onchange=e=>{fit[id]=e.target.value;store.set('fit:'+todayKey,fit);checkMatch();refreshAcc();};};
['top','bottom','shoes'].forEach(k=>{fill(k,WARD[k]);fill(k+'c',COLORS.map(c=>c[0]));});
fill('occasion',["Casual","School","Work","Dressy","Active"]);
const col=n=>COLORS.find(c=>c[0]===n);
function checkMatch(){
  const cs=[col(fit.topc),col(fit.bottomc),col(fit.shoesc)];
  const hues=[...new Set(cs.filter(c=>c[2]!=='n').map(c=>c[2]))];let v,ok=true;
  const diff=(a,b)=>{const d=Math.abs(a-b)%360;return Math.min(d,360-d)};
  if(hues.length===0)v='All neutrals - classic and safe. Add a colorful accessory for a pop.';
  else if(hues.length===1)v='One color with neutrals - a great match.';
  else if(hues.length===2){const d=diff(hues[0],hues[1]);
    if(d<=45)v='Analogous colors - harmonious match.';else if(d>=150)v='Complementary colors - bold and it works. Keep one of them small.';else{v='These two colors may clash. Try swapping one for a neutral.';ok=false;}}
  else{v='Three colors - that is a lot. Try making one piece neutral.';ok=false;}
  if(fit.top==='Dress'&&fit.bottom!=='(Dress - none)')v+=' Tip: with a dress, set Bottom to "(Dress - none)" or pair with leggings.';
  if(fit.occasion==='Dressy'&&["Sneakers","Running shoes","Sandals"].includes(fit.shoes))v+=' For dressy, try loafers, flats, heels, or boots.';
  if(fit.occasion==='Active'&&!["Sneakers","Running shoes"].includes(fit.shoes))v+=' For active days, sneakers or running shoes are best.';
  $('match').innerHTML=`<div class="dots">${cs.map(c=>`<span style="background:${c[1]}" title="${c[0]}"></span>`).join('')}</div><strong>${ok?'Looks good':'Heads up'}:</strong> ${v}`;
  renderSummary();
}
function refreshAcc(){
  const w=window.WX||{},wet=(w.code>=51&&w.code<=67)||(w.code>=80&&w.code<=82)||w.code>=95;
  const need={sun:w.code<=1&&w.hi>=55,hot:w.hi>=80,cold:w.hi<45,cool:w.hi<60&&w.hi>=35,wet};
  $('accessories').innerHTML='';
  ACC.forEach(([n,occ,wx])=>{const b=document.createElement('button');b.textContent=n;
    if(wx?need[wx]:occ.includes(fit.occasion))b.classList.add('suggest');
    if(fit.acc.includes(n))b.classList.add('on');
    b.onclick=()=>{fit.acc=fit.acc.includes(n)?fit.acc.filter(x=>x!==n):[...fit.acc,n];store.set('fit:'+todayKey,fit);refreshAcc();};
    $('accessories').appendChild(b);});
  const tip=fit.acc.length>4?' That is a lot of accessories - 2 to 4 usually looks best.':'';
  $('accessories').dataset.tip=tip;renderSummary();
}
function renderSummary(){
  const acc=fit.acc.length?fit.acc.join(', '):'none yet';
  $('outfit-summary').innerHTML=`<strong>Today's outfit:</strong> ${fit.topc} ${fit.top.toLowerCase()}${fit.bottom.startsWith('(')?'':`, ${fit.bottomc.toLowerCase()} ${fit.bottom.toLowerCase()}`}, ${fit.shoesc.toLowerCase()} ${fit.shoes.toLowerCase()}. Accessories: ${acc}.${$('accessories').dataset.tip||''}`;
}
$('save-outfit').onclick=()=>{store.set('fit:'+todayKey,fit);$('save-outfit').textContent='Saved';setTimeout(()=>$('save-outfit').textContent="Save today's outfit",1500);};
checkMatch();refreshAcc();
