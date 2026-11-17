/* Vanilla 1.20.1 static crafting, inventory operations and operator UI. */
function golemIngredient(ingredient,item){
 if(Array.isArray(ingredient))return ingredient.some(x=>golemIngredient(x,item));
 if(!ingredient)return !item;if(!item)return false;
 if(ingredient.item)return ingredient.item.replace('minecraft:','')===item;
 return (GOLEM_CRAFT_DATA.tags[ingredient.tag?.replace('minecraft:','')]||[]).includes(item);
}
function golemMatchRecipe(grid){
 if(!Array.isArray(grid)||grid.length!==9||!grid.every(x=>x==null||typeof x==='string'))return null;
 grid=grid.map(x=>(x||'').replace('minecraft:',''));
 for(const recipe of GOLEM_CRAFT_DATA.recipes){
  if(recipe.type==='minecraft:crafting_shaped'){
   const pattern=recipe.pattern,h=pattern.length,w=pattern[0].length;
   for(let oy=0;oy<=3-h;oy++)for(let ox=0;ox<=3-w;ox++)for(const mirror of [false,true]){
    let ok=true;for(let y=0;y<3&&ok;y++)for(let x=0;x<3;x++){
     const ix=x-ox,iy=y-oy,c=ix>=0&&iy>=0&&ix<w&&iy<h?pattern[iy][mirror?w-ix-1:ix]:' ';
     if(!golemIngredient(recipe.key[c],grid[y*3+x])){ok=false;break;}
    }if(ok)return recipe;
   }
  }else{
   const items=grid.filter(Boolean);if(items.length!==recipe.ingredients.length)continue;
   const match=(i,remaining)=>i===items.length||remaining.some((ing,j)=>golemIngredient(ing,items[i])&&match(i+1,remaining.filter((_,k)=>k!==j)));
   if(match(0,recipe.ingredients))return recipe;
  }
 }return null;
}
function golemCraft(u,grid,bag){
 if(!exAlive(u)||!restBehaviors(u).some(b=>b.type==='golems:craft_menu'))return false;
 const r=golemMatchRecipe(grid);if(!r||!bag)return false;const need={};for(const item of grid)if(item){const k=item.replace('minecraft:','');need[k]=(need[k]||0)+1;}
 for(const [id,count] of Object.entries(need))if(!Number.isSafeInteger(bag[id])||bag[id]<count)return false;
 const id=r.result.item.replace('minecraft:','');if(!Number.isSafeInteger((bag[id]||0)-(need[id]||0)+(r.result.count||1)))return false;
 for(const [key,count] of Object.entries(need))bag[key]-=count;
 bag[id]=(bag[id]||0)+(r.result.count||1);
 // Vanilla crafting remainders for the static recipes using milk/water buckets.
 for(const [k,n] of Object.entries(need))if(/^(milk|water|lava)_bucket$/.test(k))bag.bucket=(bag.bucket||0)+n;
 return {item:id,count:r.result.count||1,recipe:r.id};
}
function golemInventoryUse(u,item,bag){
 if(!bag||!Number.isSafeInteger(bag[item])||bag[item]<1||!exAlive(u))return false;
 if(golemUseItem(u,item,bag))return true;
 if(u.key==='eg_furnace'&&restFeedFuel(u,item)){bag[item]--;if(['water_bucket','lava_bucket'].includes(item))bag.bucket=(bag.bucket||0)+1;return true;}
 const b=restBehaviors(u).find(b=>b.type==='golems:shoot_arrows'&&/^(arrow|spectral_arrow|tipped_arrow)$/.test(item)||b.type==='golems:shoot_fireballs'&&item==='fire_charge');
 if(b){u.golemAmmo=(u.golemAmmo||0)+1;bag[item]--;return true;}
 if(restBehaviors(u).some(b=>b.type==='golems:explode')&&['flint_and_steel','fire_charge'].includes(item)){
  const cfg=restBehaviors(u).find(b=>b.type==='golems:explode');if(!golemIgnite(u,cfg))return false;if(item==='fire_charge')bag[item]--;return true;
 }return false;
}
function golemPowerNetwork(){
 const world=golemWorld(),tiles=world.tiles;for(const t of tiles.values()){t.power=0;t.powered=false;}
 const queue=[];for(const u of G.units)if(exAlive(u))for(const b of restBehaviors(u))if(b.type==='golems:power'&&golemVariant(u,b)){
  const p=golemCell(u.x,u.y);queue.push({key:p.key,power:b.power??15});
 }
 const best=new Map();while(queue.length){const p=queue.shift();if((best.get(p.key)||0)>=p.power||p.power<=0)continue;best.set(p.key,p.power);
  const x=p.key%G.map.w,y=Math.floor(p.key/G.map.w);for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
   if(x+dx<0||x+dx>=G.map.w||y+dy<0||y+dy>=G.map.h)continue;const k=p.key+dy*G.map.w+dx,t=tiles.get(k);if(!t)continue;
   if(t.block==='redstone_wire'){if(t.power<p.power){t.power=p.power;queue.push({key:k,power:p.power-1});}}
   if(t.block==='redstone_lamp'){t.power=Math.max(t.power,p.power);t.powered=t.power>0;}
  }
 }
}
function golemCollectLights(L){
 for(const u of G.units)if(exAlive(u)){const n=golemLight(u);if(n>0)L.push({x:u.x,y:u.y,z:24,r:n*TILE,col:'255,214,145',a:.85});if(golemActive(u,'glowing'))L.push({x:u.x,y:u.y,z:16,r:35,col:'225,250,255',a:.7});}
 for(const t of G.golemWorld?.tiles.values()||[])if(t.block==='redstone_lamp'&&t.powered)L.push({x:t.x,y:t.y,z:8,r:15*TILE,col:'255,210,140',a:.85});
}
function golemDrawStatus(u){
 if(!(u.golemBurn>0)&&!golemActive(u,'glowing')&&u.golemFuse==null)return;
 ctx.save();if(u.golemBurn>0){ctx.fillStyle='#ef933d';ctx.beginPath();ctx.moveTo(u.x-8,u.y*SQ-(u.z||0));ctx.lineTo(u.x+Math.sin(G.time*13)*5,u.y*SQ-(u.z||0)-30);ctx.lineTo(u.x+8,u.y*SQ-(u.z||0));ctx.fill();}
 if(golemActive(u,'glowing')){ctx.strokeStyle='#e4fcff';ctx.lineWidth=2;ctx.strokeRect(u.x-u.r,u.y*SQ-(u.z||0)-40,u.r*2,42);}
 if(u.golemFuse!=null){ctx.fillStyle='#ffcd78';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText((u.golemFuse/20).toFixed(1)+'s',u.x,u.y*SQ-65);}
 ctx.restore();
}
function golemInspector(el,u){
 const box=document.getElementById('restActions');if(!box)return;
 const button=document.createElement('button');button.textContent='素材・環境操作'+(restBehaviors(u).some(b=>b.type==='golems:craft_menu')?'／3×3作業台':'');button.onclick=()=>golemOpenTools(u);box.appendChild(button);
 if(REST_GOLEM_DATA[u.key]){const p=document.createElement('div');p.textContent='素材 '+u.key.replace('eg_','')+' / 光量 '+golemLight(u)+' / '+(golemWet(u)?'水濡れ':'乾燥')+(u.golemAmmo!=null?' / 弾薬 '+u.golemAmmo:'');box.appendChild(p);}
 if(u.golemEffects){const p=document.createElement('div');p.textContent=Object.entries(u.golemEffects).filter(([id,e])=>e.until>G.time).map(([id,e])=>id+' '+(e.amp+1)+' ('+(e.until-G.time).toFixed(1)+'秒)').join(' / ');box.appendChild(p);}
}
function golemOpenTools(u){
 document.getElementById('golemTools')?.remove();const root=document.createElement('div');root.id='golemTools';root.style.cssText='position:fixed;inset:5% 10%;z-index:10000;background:#211e1a;color:#eee;border:1px solid #887455;padding:20px;overflow:auto;font:14px sans-serif';document.body.appendChild(root);let grid=Array(9).fill(''),message='';
 const render=()=>{
  root.innerHTML='';const bag=golemWorld().bag;
  const title=document.createElement('h2');title.textContent=u.sp.name+'：素材・環境操作';root.appendChild(title);
  const text=t=>{const p=document.createElement('p');p.textContent=t;root.appendChild(p);};
  const button=(label,action)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='padding:7px;margin:4px';b.onclick=()=>{action();render();};root.appendChild(b);return b;};
  const input=(placeholder,value)=>{const e=document.createElement('input');e.placeholder=placeholder;e.value=value;e.style.cssText='padding:7px;margin:4px;max-width:200px';root.appendChild(e);return e;};
  const select=(values,current,fn,parent=root)=>{const e=document.createElement('select');e.style.cssText='padding:5px;max-width:190px';for(const [value,label] of values){const op=document.createElement('option');op.value=value;op.textContent=label;e.appendChild(op);}e.value=current;e.onchange=()=>{fn(e.value);render();};parent.appendChild(e);return e;};
  button('閉じる',()=>{root.remove();}); // Rendering a detached root is harmless.
  text('観戦者用の操作です。素材は在庫から消費します。「観戦用に追加」は資源入手の再現ではありません。');
  if(!exAlive(u)){text('対象が死亡・消滅したため操作できません。');return;}
  text('在庫：'+Object.entries(bag).filter(([k,n])=>n>0).map(([k,n])=>k+' ×'+n).join(' / '));
  const name=input('minecraft: を省いたアイテムID','coal'),count=input('個数','1');count.type='number';count.min='1';
  button('観戦用に素材を追加',()=>{const id=name.value.trim().replace('minecraft:',''),n=Number(count.value);if(/^[a-z0-9_]+$/.test(id)&&Number.isSafeInteger(n)&&n>0&&Number.isSafeInteger((bag[id]||0)+n)){bag[id]=(bag[id]||0)+n;message='素材を追加';}else message='ID・個数が不正';});
  let item=Object.keys(bag).find(k=>bag[k]>0)||'';
  select([['','空の手'],...Object.keys(bag).filter(k=>bag[k]>0).map(k=>[k,k])],root.golemItem??item,v=>{root.golemItem=v;});item=root.golemItem??item;
  button('選んだ素材を対象に使用',()=>{const it=root.golemItem??item;message=it?golemInventoryUse(u,it,bag)?'使用成功':'素材・条件・対象が一致しません':golemUseItem(u,'',bag)?'切替成功':'空の手の操作なし';});
  button('対象に持たせる（誘引）',()=>{u.golemHeldItem=root.golemItem??item;u.golemHeldBag=bag;message='手持ち表示を変更。石炭を持つ対象へ、稼働中のFurnaceが接近します。';});
  select([['clear','晴れ'],['rain','雨'],['thunder','雷雨']],golemWorld().weather,v=>{golemWorld().weather=v;});
  button('昼にする',()=>golemWorld().clock=6000);button('夜にする',()=>golemWorld().clock=18000);
  const room=G.map.rooms[G.map.roomOf?.[golemCell(u.x,u.y).key]];
  if(room)button(room.golemOpenSky?'この部屋の屋根を戻す':'この部屋を屋外扱いにする',()=>room.golemOpenSky=!room.golemOpenSky);
  button('足元へ水を置く（観戦操作）',()=>golemPut(u.x,u.y,'water',{water:true}));
  button('足元の水・設置物を除去（観戦操作）',()=>golemWorld().tiles.delete(golemCell(u.x,u.y).key));
  button('素材を足元へ設置',()=>{const it=root.golemItem??item;if(bag[it]>0&&['redstone','redstone_lamp','moss_carpet','brown_mushroom','red_mushroom','dirt','grass_block','soul_sand'].includes(it)){if(['dirt','grass_block','soul_sand'].includes(it))golemPut(u.x,u.y,'air',{substrate:it});else golemPut(u.x,u.y,it==='redstone'?'redstone_wire':it);bag[it]--;message='設置';}else message='設置対象：redstone / redstone_lamp / moss_carpet / brown_mushroom / red_mushroom / dirt / grass_block / soul_sand';});
  button('周辺のドロップ回収',()=>{for(const t of golemWorld().tiles.values())if(dist(t.x,t.y,u.x,u.y)<3*TILE)for(const [id,n] of Object.entries(t.drops||{})){bag[id]=(bag[id]||0)+n;delete t.drops[id];}});
  if(restBehaviors(u).some(b=>b.type==='golems:craft_menu')){
   text('3×3作業台 — Vanilla 1.20.1の通常定形・不定形レシピ822件。素材は完成時に消費。');
   const table=document.createElement('div');table.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(80px,190px));gap:5px';root.appendChild(table);
   const options=[['','（空）'],...Array.from(new Set([...Object.keys(bag).filter(k=>bag[k]>0),...grid.filter(Boolean)])).map(k=>[k,k+' ('+(bag[k]||0)+')'])];for(let i=0;i<9;i++)select(options,grid[i],v=>grid[i]=v,table);
   const r=golemMatchRecipe(grid);text(r?'完成品：'+r.result.item+' ×'+(r.result.count||1):'該当レシピなし');
   button('クラフト',()=>{const result=golemCraft(u,grid,bag);message=result?'作成：'+result.item:'素材不足・対象消滅・レシピ不一致';});
   button('配置を空にする',()=>grid=Array(9).fill(''));
  }
  text(message);
 };render();
}
