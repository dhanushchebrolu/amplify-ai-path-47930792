// @ts-nocheck
/* WebGL infinite sphere menu — based on InfiniteMenu reactbits component. */
import { useEffect, useRef, useState } from "react";
import { mat4, quat, vec2, vec3 } from "gl-matrix";
import "./InfiniteMenu.css";

const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;
void main() {
  vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
  vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
  float radius = length(centerPos.xyz);
  if (gl_VertexID > 0) {
    vec3 rotationAxis = uRotationAxisVelocity.xyz;
    float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
    vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
    vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
    float strength = dot(stretchDir, relativeVertexPos);
    float invAbsStrength = min(0., abs(strength) - 1.);
    strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
    worldPosition.xyz += stretchDir * strength;
  }
  worldPosition.xyz = radius * normalize(worldPosition.xyz);
  gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
  vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
  vUvs = aModelUvs;
  vInstanceId = gl_InstanceID;
}`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;
void main() {
  int itemIndex = vInstanceId % uItemCount;
  int cellsPerRow = uAtlasSize;
  int cellX = itemIndex % cellsPerRow;
  int cellY = itemIndex / cellsPerRow;
  vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
  vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
  ivec2 texSize = textureSize(uTex, 0);
  float imageAspect = float(texSize.x) / float(texSize.y);
  float containerAspect = 1.0;
  float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);
  vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
  st = (st - 0.5) * scale + 0.5;
  st = clamp(st, 0.0, 1.0);
  st = st * cellSize + cellOffset;
  outColor = texture(uTex, st);
  outColor.a *= vAlpha;
}`;

class Face { constructor(a,b,c){this.a=a;this.b=b;this.c=c;} }
class Vertex { constructor(x,y,z){this.position=vec3.fromValues(x,y,z);this.normal=vec3.create();this.uv=vec2.create();} }
class Geometry {
  constructor(){this.vertices=[];this.faces=[];}
  addVertex(...args){for(let i=0;i<args.length;i+=3){this.vertices.push(new Vertex(args[i],args[i+1],args[i+2]));}return this;}
  addFace(...args){for(let i=0;i<args.length;i+=3){this.faces.push(new Face(args[i],args[i+1],args[i+2]));}return this;}
  get lastVertex(){return this.vertices[this.vertices.length-1];}
  subdivide(divisions=1){
    const c={};let f=this.faces;
    for(let d=0;d<divisions;++d){
      const nf=new Array(f.length*4);
      f.forEach((face,ndx)=>{
        const mAB=this.getMidPoint(face.a,face.b,c);
        const mBC=this.getMidPoint(face.b,face.c,c);
        const mCA=this.getMidPoint(face.c,face.a,c);
        const i=ndx*4;
        nf[i]=new Face(face.a,mAB,mCA);
        nf[i+1]=new Face(face.b,mBC,mAB);
        nf[i+2]=new Face(face.c,mCA,mBC);
        nf[i+3]=new Face(mAB,mBC,mCA);
      });
      f=nf;
    }
    this.faces=f;return this;
  }
  spherize(radius=1){this.vertices.forEach(v=>{vec3.normalize(v.normal,v.position);vec3.scale(v.position,v.normal,radius);});return this;}
  get vertexData(){return new Float32Array(this.vertices.flatMap(v=>Array.from(v.position)));}
  get uvData(){return new Float32Array(this.vertices.flatMap(v=>Array.from(v.uv)));}
  get indexData(){return new Uint16Array(this.faces.flatMap(f=>[f.a,f.b,f.c]));}
  get data(){return {vertices:this.vertexData,indices:this.indexData,uvs:this.uvData};}
  getMidPoint(a,b,cache){
    const k=a<b?`k_${b}_${a}`:`k_${a}_${b}`;
    if(Object.prototype.hasOwnProperty.call(cache,k))return cache[k];
    const va=this.vertices[a].position,vb=this.vertices[b].position;
    const ndx=this.vertices.length;cache[k]=ndx;
    this.addVertex((va[0]+vb[0])*.5,(va[1]+vb[1])*.5,(va[2]+vb[2])*.5);
    return ndx;
  }
}
class IcosahedronGeometry extends Geometry {
  constructor(){super();const t=Math.sqrt(5)*.5+.5;
    this.addVertex(-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1)
      .addFace(0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1);
  }
}
class DiscGeometry extends Geometry {
  constructor(steps=4,radius=1){super();steps=Math.max(4,steps);const alpha=(2*Math.PI)/steps;
    this.addVertex(0,0,0);this.lastVertex.uv[0]=.5;this.lastVertex.uv[1]=.5;
    for(let i=0;i<steps;++i){const x=Math.cos(alpha*i),y=Math.sin(alpha*i);
      this.addVertex(radius*x,radius*y,0);this.lastVertex.uv[0]=x*.5+.5;this.lastVertex.uv[1]=y*.5+.5;
      if(i>0)this.addFace(0,i,i+1);}
    this.addFace(0,steps,1);
  }
}

function createShader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(gl.getShaderParameter(s,gl.COMPILE_STATUS))return s;console.error(gl.getShaderInfoLog(s));gl.deleteShader(s);return null;}
function createProgram(gl,sources,_tfv,attribs){const p=gl.createProgram();[gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].forEach((t,i)=>{const sh=createShader(gl,t,sources[i]);if(sh)gl.attachShader(p,sh);});if(attribs)for(const a in attribs)gl.bindAttribLocation(p,attribs[a],a);gl.linkProgram(p);if(gl.getProgramParameter(p,gl.LINK_STATUS))return p;console.error(gl.getProgramInfoLog(p));gl.deleteProgram(p);return null;}
function makeVertexArray(gl,pairs,indices){const va=gl.createVertexArray();gl.bindVertexArray(va);for(const[buf,loc,n] of pairs){if(loc===-1)continue;gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0);}if(indices){const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);}gl.bindVertexArray(null);return va;}
function resizeCanvas(c){const dpr=Math.min(2,window.devicePixelRatio);const w=Math.round(c.clientWidth*dpr),h=Math.round(c.clientHeight*dpr);const need=c.width!==w||c.height!==h;if(need){c.width=w;c.height=h;}return need;}
function makeBuffer(gl,data,usage){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,usage);gl.bindBuffer(gl.ARRAY_BUFFER,null);return b;}
function setupTex(gl,minF,magF,wS,wT){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wS);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,minF);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,magF);return t;}

class ArcballControl {
  constructor(canvas,cb){
    this.canvas=canvas;this.updateCallback=cb||(()=>null);
    this.isPointerDown=false;this.orientation=quat.create();this.pointerRotation=quat.create();
    this.rotationVelocity=0;this.rotationAxis=vec3.fromValues(1,0,0);
    this.snapDirection=vec3.fromValues(0,0,-1);this.snapTargetDirection=null;
    this.EPSILON=0.1;this.IDENTITY_QUAT=quat.create();
    this.pointerPos=vec2.create();this.previousPointerPos=vec2.create();
    this._rotationVelocity=0;this._combinedQuat=quat.create();
    canvas.addEventListener("pointerdown",e=>{vec2.set(this.pointerPos,e.clientX,e.clientY);vec2.copy(this.previousPointerPos,this.pointerPos);this.isPointerDown=true;});
    canvas.addEventListener("pointerup",()=>{this.isPointerDown=false;});
    canvas.addEventListener("pointerleave",()=>{this.isPointerDown=false;});
    canvas.addEventListener("pointermove",e=>{if(this.isPointerDown)vec2.set(this.pointerPos,e.clientX,e.clientY);});
    canvas.style.touchAction="none";
  }
  update(dt,target=16){
    const ts=dt/target+1e-5;let af=ts;let snap=quat.create();
    if(this.isPointerDown){
      const INT=.3*ts,AMP=5/ts;
      const mid=vec2.sub(vec2.create(),this.pointerPos,this.previousPointerPos);
      vec2.scale(mid,mid,INT);
      if(vec2.sqrLen(mid)>this.EPSILON){
        vec2.add(mid,this.previousPointerPos,mid);
        const p=this.#project(mid),q=this.#project(this.previousPointerPos);
        const a=vec3.normalize(vec3.create(),p),b=vec3.normalize(vec3.create(),q);
        vec2.copy(this.previousPointerPos,mid);af*=AMP;
        this.quatFromVectors(a,b,this.pointerRotation,af);
      } else {
        quat.slerp(this.pointerRotation,this.pointerRotation,this.IDENTITY_QUAT,INT);
      }
    } else {
      const INT=.1*ts;
      quat.slerp(this.pointerRotation,this.pointerRotation,this.IDENTITY_QUAT,INT);
      if(this.snapTargetDirection){
        const SI=.2;const a=this.snapTargetDirection,b=this.snapDirection;
        const sq=vec3.squaredDistance(a,b);const df=Math.max(.1,1-sq*10);
        af*=SI*df;this.quatFromVectors(a,b,snap,af);
      }
    }
    const comb=quat.multiply(quat.create(),snap,this.pointerRotation);
    this.orientation=quat.multiply(quat.create(),comb,this.orientation);
    quat.normalize(this.orientation,this.orientation);
    quat.slerp(this._combinedQuat,this._combinedQuat,comb,.8*ts);
    quat.normalize(this._combinedQuat,this._combinedQuat);
    const rad=Math.acos(this._combinedQuat[3])*2;const s=Math.sin(rad/2);let rv=0;
    if(s>1e-6){rv=rad/(2*Math.PI);this.rotationAxis[0]=this._combinedQuat[0]/s;this.rotationAxis[1]=this._combinedQuat[1]/s;this.rotationAxis[2]=this._combinedQuat[2]/s;}
    this._rotationVelocity+=(rv-this._rotationVelocity)*(.5*ts);
    this.rotationVelocity=this._rotationVelocity/ts;
    this.updateCallback(dt);
  }
  quatFromVectors(a,b,out,af=1){const ax=vec3.cross(vec3.create(),a,b);vec3.normalize(ax,ax);const d=Math.max(-1,Math.min(1,vec3.dot(a,b)));const angle=Math.acos(d)*af;quat.setAxisAngle(out,ax,angle);return{q:out,axis:ax,angle};}
  #project(pos){const r=2,w=this.canvas.clientWidth,h=this.canvas.clientHeight,s=Math.max(w,h)-1;const x=(2*pos[0]-w-1)/s,y=(2*pos[1]-h-1)/s;let z=0;const xy=x*x+y*y,rSq=r*r;if(xy<=rSq/2)z=Math.sqrt(rSq-xy);else z=rSq/Math.sqrt(xy);return vec3.fromValues(-x,y,z);}
}

class InfiniteGridMenu {
  TARGET_FRAME_DURATION=1000/60;SPHERE_RADIUS=2;
  #time=0;#deltaTime=0;#frames=0;
  constructor(canvas,items,onActive,onMove,onInit,scale=1){
    this.canvas=canvas;this.items=items||[];this.onActiveItemChange=onActive||(()=>{});this.onMovementChange=onMove||(()=>{});
    this.scaleFactor=scale;this.smoothRotationVelocity=0;this.movementActive=false;
    this.camera={matrix:mat4.create(),near:.1,far:40,fov:Math.PI/4,aspect:1,position:vec3.fromValues(0,0,3*scale),up:vec3.fromValues(0,1,0),matrices:{view:mat4.create(),projection:mat4.create(),inversProjection:mat4.create()}};
    this.#init(onInit);
  }
  resize(){this.viewportSize=vec2.set(this.viewportSize||vec2.create(),this.canvas.clientWidth,this.canvas.clientHeight);const gl=this.gl;if(resizeCanvas(gl.canvas))gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);this.#updateProjection(gl);}
  run(time=0){this.#deltaTime=Math.min(32,time-this.#time);this.#time=time;this.#frames+=this.#deltaTime/this.TARGET_FRAME_DURATION;this.#animate(this.#deltaTime);this.#render();this._raf=requestAnimationFrame(t=>this.run(t));}
  dispose(){cancelAnimationFrame(this._raf);}
  #init(onInit){
    this.gl=this.canvas.getContext("webgl2",{antialias:true,alpha:true});const gl=this.gl;if(!gl)throw new Error("WebGL 2 required");
    this.viewportSize=vec2.fromValues(this.canvas.clientWidth,this.canvas.clientHeight);
    this.discProgram=createProgram(gl,[discVertShaderSource,discFragShaderSource],null,{aModelPosition:0,aModelUvs:2,aInstanceMatrix:3});
    this.loc={aModelPosition:gl.getAttribLocation(this.discProgram,"aModelPosition"),aModelUvs:gl.getAttribLocation(this.discProgram,"aModelUvs"),aInstanceMatrix:gl.getAttribLocation(this.discProgram,"aInstanceMatrix"),uWorldMatrix:gl.getUniformLocation(this.discProgram,"uWorldMatrix"),uViewMatrix:gl.getUniformLocation(this.discProgram,"uViewMatrix"),uProjectionMatrix:gl.getUniformLocation(this.discProgram,"uProjectionMatrix"),uCameraPosition:gl.getUniformLocation(this.discProgram,"uCameraPosition"),uRotationAxisVelocity:gl.getUniformLocation(this.discProgram,"uRotationAxisVelocity"),uTex:gl.getUniformLocation(this.discProgram,"uTex"),uItemCount:gl.getUniformLocation(this.discProgram,"uItemCount"),uAtlasSize:gl.getUniformLocation(this.discProgram,"uAtlasSize")};
    this.discGeo=new DiscGeometry(56,1);this.db=this.discGeo.data;
    this.discVAO=makeVertexArray(gl,[[makeBuffer(gl,this.db.vertices,gl.STATIC_DRAW),this.loc.aModelPosition,3],[makeBuffer(gl,this.db.uvs,gl.STATIC_DRAW),this.loc.aModelUvs,2]],this.db.indices);
    this.icoGeo=new IcosahedronGeometry();this.icoGeo.subdivide(1).spherize(this.SPHERE_RADIUS);
    this.instancePositions=this.icoGeo.vertices.map(v=>v.position);this.COUNT=this.icoGeo.vertices.length;
    this.#initInstances(this.COUNT);
    this.worldMatrix=mat4.create();this.#initTexture();
    this.control=new ArcballControl(this.canvas,dt=>this.#onControl(dt));
    this.#updateCamera();this.#updateProjection(gl);this.resize();if(onInit)onInit(this);
  }
  #initTexture(){
    const gl=this.gl;this.tex=setupTex(gl,gl.LINEAR,gl.LINEAR,gl.CLAMP_TO_EDGE,gl.CLAMP_TO_EDGE);
    const n=Math.max(1,this.items.length);this.atlasSize=Math.ceil(Math.sqrt(n));
    const c=document.createElement("canvas"),ctx=c.getContext("2d"),cell=512;c.width=this.atlasSize*cell;c.height=this.atlasSize*cell;
    Promise.all(this.items.map(it=>new Promise(res=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>res(img);img.onerror=()=>res(null);img.src=it.image;}))).then(imgs=>{
      imgs.forEach((img,i)=>{if(!img)return;const x=(i%this.atlasSize)*cell,y=Math.floor(i/this.atlasSize)*cell;ctx.drawImage(img,x,y,cell,cell);});
      gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
    });
  }
  #initInstances(count){
    const gl=this.gl;this.inst={arr:new Float32Array(count*16),mats:[],buf:gl.createBuffer()};
    for(let i=0;i<count;++i){const m=new Float32Array(this.inst.arr.buffer,i*16*4,16);m.set(mat4.create());this.inst.mats.push(m);}
    gl.bindVertexArray(this.discVAO);gl.bindBuffer(gl.ARRAY_BUFFER,this.inst.buf);gl.bufferData(gl.ARRAY_BUFFER,this.inst.arr.byteLength,gl.DYNAMIC_DRAW);
    for(let j=0;j<4;++j){const loc=this.loc.aInstanceMatrix+j;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,64,j*16);gl.vertexAttribDivisor(loc,1);}
    gl.bindBuffer(gl.ARRAY_BUFFER,null);gl.bindVertexArray(null);
  }
  #animate(dt){
    const gl=this.gl;this.control.update(dt,this.TARGET_FRAME_DURATION);
    const positions=this.instancePositions.map(p=>vec3.transformQuat(vec3.create(),p,this.control.orientation));
    const SCALE=.25,SI=.6;
    positions.forEach((p,ndx)=>{const s=(Math.abs(p[2])/this.SPHERE_RADIUS)*SI+(1-SI);const fs=s*SCALE;const m=mat4.create();
      mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),vec3.negate(vec3.create(),p)));
      mat4.multiply(m,m,mat4.targetTo(mat4.create(),[0,0,0],p,[0,1,0]));
      mat4.multiply(m,m,mat4.fromScaling(mat4.create(),[fs,fs,fs]));
      mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),[0,0,-this.SPHERE_RADIUS]));
      mat4.copy(this.inst.mats[ndx],m);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER,this.inst.buf);gl.bufferSubData(gl.ARRAY_BUFFER,0,this.inst.arr);gl.bindBuffer(gl.ARRAY_BUFFER,null);
    this.smoothRotationVelocity=this.control.rotationVelocity;
  }
  #render(){
    const gl=this.gl;gl.useProgram(this.discProgram);gl.enable(gl.CULL_FACE);gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.loc.uWorldMatrix,false,this.worldMatrix);
    gl.uniformMatrix4fv(this.loc.uViewMatrix,false,this.camera.matrices.view);
    gl.uniformMatrix4fv(this.loc.uProjectionMatrix,false,this.camera.matrices.projection);
    gl.uniform3f(this.loc.uCameraPosition,this.camera.position[0],this.camera.position[1],this.camera.position[2]);
    gl.uniform4f(this.loc.uRotationAxisVelocity,this.control.rotationAxis[0],this.control.rotationAxis[1],this.control.rotationAxis[2],this.smoothRotationVelocity*1.1);
    gl.uniform1i(this.loc.uItemCount,this.items.length);gl.uniform1i(this.loc.uAtlasSize,this.atlasSize);gl.uniform1i(this.loc.uTex,0);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex);
    gl.bindVertexArray(this.discVAO);gl.drawElementsInstanced(gl.TRIANGLES,this.db.indices.length,gl.UNSIGNED_SHORT,0,this.COUNT);
  }
  #updateCamera(){mat4.targetTo(this.camera.matrix,this.camera.position,[0,0,0],this.camera.up);mat4.invert(this.camera.matrices.view,this.camera.matrix);}
  #updateProjection(gl){this.camera.aspect=gl.canvas.clientWidth/gl.canvas.clientHeight;const h=this.SPHERE_RADIUS*.35,d=this.camera.position[2];this.camera.fov=this.camera.aspect>1?2*Math.atan(h/d):2*Math.atan(h/this.camera.aspect/d);mat4.perspective(this.camera.matrices.projection,this.camera.fov,this.camera.aspect,this.camera.near,this.camera.far);mat4.invert(this.camera.matrices.inversProjection,this.camera.matrices.projection);}
  #onControl(dt){
    const ts=dt/this.TARGET_FRAME_DURATION+1e-4;let damp=5/ts;let targetZ=3*this.scaleFactor;
    const moving=this.control.isPointerDown||Math.abs(this.smoothRotationVelocity)>.01;
    if(moving!==this.movementActive){this.movementActive=moving;this.onMovementChange(moving);}
    if(!this.control.isPointerDown){
      const idx=this.#nearestVertex();const item=idx%Math.max(1,this.items.length);this.onActiveItemChange(item);
      const snap=vec3.normalize(vec3.create(),this.#vertexWorldPos(idx));this.control.snapTargetDirection=snap;
    } else { targetZ+=this.control.rotationVelocity*80+2.5;damp=7/ts; }
    this.camera.position[2]+=(targetZ-this.camera.position[2])/damp;this.#updateCamera();
  }
  #nearestVertex(){const n=this.control.snapDirection;const inv=quat.conjugate(quat.create(),this.control.orientation);const nt=vec3.transformQuat(vec3.create(),n,inv);let maxD=-1,idx=0;for(let i=0;i<this.instancePositions.length;++i){const d=vec3.dot(nt,this.instancePositions[i]);if(d>maxD){maxD=d;idx=i;}}return idx;}
  #vertexWorldPos(i){return vec3.transformQuat(vec3.create(),this.instancePositions[i],this.control.orientation);}
}

export interface InfiniteMenuItem { image: string; link: string; title: string; description: string }

export default function InfiniteMenu({ items = [] as InfiniteMenuItem[], scale = 1, onLaunch }: { items: InfiniteMenuItem[]; scale?: number; onLaunch?: (item: InfiniteMenuItem) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeItem, setActiveItem] = useState<InfiniteMenuItem | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sketch = new InfiniteGridMenu(canvas, items, (i: number) => setActiveItem(items[i] ?? null), setIsMoving, (sk: any) => sk.run(), scale);
    const onResize = () => sketch.resize();
    window.addEventListener("resize", onResize);
    onResize();
    return () => { window.removeEventListener("resize", onResize); sketch.dispose?.(); };
  }, [items, scale]);

  const launch = () => {
    if (!activeItem) return;
    if (onLaunch) onLaunch(activeItem);
    else if (activeItem.link.startsWith("http")) window.open(activeItem.link, "_blank");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas id="infinite-grid-menu-canvas" ref={canvasRef} />
      {activeItem && (
        <>
          <h2 className={`im-face-title ${isMoving ? "inactive" : "active"}`}>{activeItem.title}</h2>
          <p className={`im-face-desc ${isMoving ? "inactive" : "active"}`}>{activeItem.description}</p>
          <button onClick={launch} className={`im-action-button ${isMoving ? "inactive" : "active"}`} aria-label="Start this task">
            Start ↗
          </button>
        </>
      )}
    </div>
  );
}
