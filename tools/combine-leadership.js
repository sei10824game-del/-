/* Stable, directed squads. Rank priorities and patrol policy are crossover AI,
 * not a claim to replicate every original Source-engine squad schedule. */
function cbLeaderRank(u){return (u.sp.cbMajor?100:0)+(u.sp.cbElite?50:0)+(u.sp.cbRole==='infantry'?10:0);}
function cbUpdateSquads(){
 const eligible=G.units.filter(u=>u.fac==='cb'&&u.sp.combineUnit&&exAlive(u)&&u.state!=='transform'&&u.sp.cbRole!=='turret'&&u.sp.walk>0);
 const available=new Set(eligible),claimed=new Set(),groups=[];
 for(const old of G.cbSquads||[]){
  const members=old.members.filter(u=>available.has(u)&&!claimed.has(u));if(!members.length)continue;
  members.forEach(u=>claimed.add(u));
  const leader=members.includes(old.leader)?old.leader:[...members].sort((a,b)=>cbLeaderRank(b)-cbLeaderRank(a)||a.id-b.id)[0];
  if(leader!==old.leader){old.patrolGoal=null;old.trail=[];leader.dest=null;leader.path=null;}
  old.leader=leader;old.members=[leader,...members.filter(u=>u!==leader)];groups.push(old);
 }
 const free=eligible.filter(u=>!claimed.has(u)).sort((a,b)=>cbLeaderRank(b)-cbLeaderRank(a)||a.id-b.id);
 for(const u of free){let s=groups.find(s=>s.members.length<5);
  if(!s){s={id:u.id,leader:u,members:[],trail:[],visited:{},target:null};groups.push(s);}
  s.members.push(u);
 }
 for(const u of G.units){u.cbSquad=null;u.cbFollowing=null;}
 const intruder=cbCoreIntruder();
 for(const s of groups){
  s.target=intruder;
  for(const scout of s.members){if(s.target)break;const t=acquireTarget(scout,scout.sp.cbRole==='scanner'?800:550);if(t&&!cbCapturable(t)){s.target=t;break;}}
  s.members.forEach((u,slot)=>{u.cbSquad=s;u.cbSlot=slot;if(s.target)u.tgt=s.target;});
 }
 G.cbSquads=groups;
}
function cbPatrolThink(u){
 const s=u.cbSquad;if(!s||!exAlive(s.leader)||s.leader.cbSquad!==s)return false;
 if(s.leader===u){
  u.cbFollowing=null;s.visited=s.visited||{};s.trail=s.trail||[];
  const last=s.trail[s.trail.length-1];if(!last||dist(last.x,last.y,u.x,u.y)>14){s.trail.push({x:u.x,y:u.y});if(s.trail.length>160)s.trail.shift();}
  const goal=s.patrolGoal;
  if(goal&&(dist(u.x,u.y,goal.x,goal.y)<24||G.time-goal.at>18)){s.visited[goal.room]=G.time;s.patrolGoal=null;u.dest=null;u.path=null;}
  if(!s.patrolGoal){
   const current=roomOfUnit(u),rooms=[...G.map.rooms].filter(r=>r.id!==current);
   rooms.sort((a,b)=>(s.visited[a.id]??-Infinity)-(s.visited[b.id]??-Infinity)||dist(u.x,u.y,a.cx*TILE,a.cy*TILE)-dist(u.x,u.y,b.cx*TILE,b.cy*TILE));
   const room=rooms[0]||G.map.rooms[current]||G.map.rooms[0],p=randWalkIn(room);
   s.patrolGoal={...p,room:room.id,at:G.time};
  }
  const p=s.patrolGoal;if(!u.dest||dist(u.dest.x,u.dest.y,p.x,p.y)>8)setDest(u,p.x,p.y);return true;
 }
 // Followers never choose another follower or a personal random patrol destination.
 const l=s.leader;u.cbFollowing=l.id;
 if(dist(u.x,u.y,l.x,l.y)<60){u.dest=null;u.path=null;u.moveSpd=0;return true;}
 let p={x:l.x,y:l.y},remaining=(u.cbSlot||1)*17,prev=p;
 for(let i=(s.trail||[]).length-1;i>=0;i--){const q=s.trail[i],d=dist(prev.x,prev.y,q.x,q.y);p=q;remaining-=d;if(remaining<=0)break;prev=q;}
 if(!u.dest||dist(u.dest.x,u.dest.y,p.x,p.y)>12)setDest(u,p.x,p.y);return true;
}
function drawCombineLeader(u){
 if(u.fac!=='cb'||u.cbSquad?.leader!==u)return;ctx.save();ctx.fillStyle='#efd281';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('隊長',u.x,u.y*SQ-(u.z||0)-unitTopY(u)-12);ctx.restore();
}
