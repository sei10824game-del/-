/* Neutral material lighting; never adds armor/equipment to biological bodies. */
function visualMaterial(col,x,y,w,h){
 if(G.quality==='low'||w<4||!visualOpaqueColor(col))return col;
 const g=ctx.createLinearGradient(x,y,x+w,y+h);
 g.addColorStop(0,shade(col,-.28));g.addColorStop(.34,shade(col,.23));g.addColorStop(.62,col);g.addColorStop(1,shade(col,-.4));return g;
}

function visualOpaqueColor(col){return typeof col==='string'&&/^(?:#[0-9a-f]{3}(?:[0-9a-f]{3})?|rgb\(\s*[\d.,\s]+\))$/i.test(col);}
