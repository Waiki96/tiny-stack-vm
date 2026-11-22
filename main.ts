// Tiny stack VM: one dispatch loop over flat Int32Array stacks, exact to the reference
// VM (ISA.md) — same trap order, same wrapping arithmetic. T packs pops/pushes per opcode.
import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const T="!\"\"%'+,0        *******&***&*** ***             !%%!!           &)              %%\"%";
const E=new TextEncoder();
function run(p,q){
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,n=0,j=0,pc=0,st=0;
 const end=x=>({out:o.slice(0,n),code:x});
 try{for(;;){
  if(st===1e6)throw 10;
  if(pc<0||pc>=p.length)throw 9;
  const op=p[pc],t=T.charCodeAt(op)-33;
  if(!(t>=0))throw 5;
  const m=op===1?1:op===2?4:op>47&&op<52?2:0;
  if(pc+m>=p.length)throw 9;
  st++;const nx=pc+1+m;pc=nx;
  const u=t>>2;if(s<u)throw 2;
  if(s-u+(t&3)>256)throw 3;
  if(op>15&&op<35&&op!==23&&op!==27&&op!==31){
   const b=D[s-1],a=D[s-2];let r;
   if(op>18&&op<23&&!b)throw 4;
   if(op===16)r=(a+b)|0;
   else if(op===17)r=(a-b)|0;
   else if(op===18)r=Math.imul(a,b);
   else if(op===19)r=a===-2147483648&&b===-1?a:(a/b)|0;
   else if(op===20)r=b===-1?0:(a%b)|0;
   else if(op===21)r=Math.floor((a>>>0)/(b>>>0))|0;
   else if(op===22)r=(a>>>0)%(b>>>0)|0;
   else if(op===24)r=a&b;
   else if(op===25)r=a|b;
   else if(op===26)r=a^b;
   else if(op===28)r=a<<(b&31);
   else if(op===29)r=a>>(b&31);
   else if(op===30)r=(a>>>(b&31))|0;
   else if(op===32)r=a===b?1:0;
   else if(op===33)r=a<b?1:0;
   else r=(a>>>0)<(b>>>0)?1:0;
   s-=2;D[s++]=r;continue;
  }
  switch(op){
   case 0:return end(0);
   case 1:D[s++]=(p[nx-1]<<24)>>24;break;
   case 2:D[s++]=p[nx-4]|(p[nx-3]<<8)|(p[nx-2]<<16)|(p[nx-1]<<24);break;
   case 3:s--;break;
   case 4:D[s]=D[s-1];s++;break;
   case 5:{const w=D[s-1];D[s-1]=D[s-2];D[s-2]=w;break;}
   case 6:D[s]=D[s-2];s++;break;
   case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break;}
   case 23:D[s-1]=-D[s-1]|0;break;
   case 27:D[s-1]=~D[s-1];break;
   case 48:case 49:case 50:{
    const rel=((p[nx-2]|(p[nx-1]<<8))<<16)>>16;
    let take=true;
    if(op!==48){const v=D[--s];take=op===49?v===0:v!==0;}
    if(take)pc=nx+rel;break;}
   case 51:if(c===64)throw 7;C[c++]=nx;pc=p[nx-2]|(p[nx-1]<<8);break;
   case 52:if(!c)throw 8;pc=C[--c];break;
   case 64:{const a=D[s-1];if(a<0||a>255)throw 6;D[s-1]=M[a];break;}
   case 65:{const a=D[s-1],v=D[s-2];if(a<0||a>255)throw 6;s-=2;M[a]=v;break;}
   case 80:{const y=E.encode(String(D[s-1]));if(n+y.length>65536)throw 11;s--;o.set(y,n);n+=y.length;break;}
   case 81:if(n+1>65536)throw 11;o[n++]=D[--s]&255;break;
   case 82:D[s++]=j<q.length?q[j++]:-1;break;
   case 83:return end(D[--s]&255);
  }
 }}catch(x){return end(x);}
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const d of readdirSync(I).sort()){
 const r=run(readFileSync(join(I,d,'program.bin')),readFileSync(join(I,d,'input.bin')));
 mkdirSync(join(O,d),{recursive:true});
 writeFileSync(join(O,d,'stdout.bin'),r.out);
 writeFileSync(join(O,d,'exit.txt'),r.code+'\n');
}
