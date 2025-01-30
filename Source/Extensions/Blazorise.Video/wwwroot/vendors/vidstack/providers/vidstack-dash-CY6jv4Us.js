import{l as x,p as k}from"../chunks/vidstack-CCLEdTWF.js";import{h as M,f as C,a as N,j as R}from"../chunks/vidstack-aGbemMlX.js";import{VideoProvider as F}from"./vidstack-video-DCYO2GNA.js";import{l as S,e as I,D as l,I as P,i as u,Q as _,H as v,m as $,p as q}from"../chunks/vidstack-9sLhInZa.js";import{Q as b}from"../chunks/vidstack-DRH_1tFW.js";import{T as m,a as H}from"../chunks/vidstack-49LFp0xO.js";import{L as p}from"../chunks/vidstack-C_AxqLKV.js";import{R as j}from"../chunks/vidstack-DLU8gACo.js";import{c as Q}from"../chunks/vidstack-BfBBPhXV.js";import"./vidstack-html-D_DGfXWf.js";import"../chunks/vidstack-Bxv1Qnxe.js";import"../chunks/vidstack-C1xTdSxT.js";function w(n){try{return new Intl.DisplayNames(navigator.languages,{type:"language"}).of(n)??null}catch{return null}}const O=n=>`dash-${_(n)}`;class G{#e;#i;#t=null;#a=new Set;#r=null;config={};get instance(){return this.#t}constructor(t,i){this.#e=t,this.#i=i}setup(t){this.#t=t().create();const i=this.#m.bind(this);for(const s of Object.values(t.events))this.#t.on(s,i);this.#t.on(t.events.ERROR,this.#b.bind(this));for(const s of this.#a)s(this.#t);this.#i.player.dispatch("dash-instance",{detail:this.#t}),this.#t.initialize(this.#e,void 0,!1),this.#t.updateSettings({streaming:{text:{defaultEnabled:!1,dispatchForManualRendering:!0},buffer:{fastSwitchEnabled:!0}},...this.config}),this.#t.on(t.events.FRAGMENT_LOADING_STARTED,this.#w.bind(this)),this.#t.on(t.events.FRAGMENT_LOADING_COMPLETED,this.#E.bind(this)),this.#t.on(t.events.MANIFEST_LOADED,this.#v.bind(this)),this.#t.on(t.events.QUALITY_CHANGE_RENDERED,this.#S.bind(this)),this.#t.on(t.events.TEXT_TRACKS_ADDED,this.#y.bind(this)),this.#t.on(t.events.TRACK_CHANGE_RENDERED,this.#T.bind(this)),this.#i.qualities[b.enableAuto]=this.#A.bind(this),S(this.#i.qualities,"change",this.#D.bind(this)),S(this.#i.audioTracks,"change",this.#x.bind(this)),this.#r=I(this.#d.bind(this))}#s(t){return new l(O(t.type),{detail:t})}#d(){if(!this.#i.$state.live())return;const t=new j(this.#f.bind(this));return t.start(),t.stop.bind(t)}#f(){if(!this.#t)return;const t=this.#t.duration()-this.#t.time();this.#i.$state.liveSyncPosition.set(isNaN(t)?1/0:t)}#m(t){this.#i.player?.dispatch(this.#s(t))}#n=null;#h={};#g(t){const i=this.#n?.[m.native],s=(i?.track).cues;if(!i||!s)return;const r=this.#n.id,a=this.#h[r]??0,o=this.#s(t);for(let c=a;c<s.length;c++){const h=s[c];h.positionAlign||(h.positionAlign="auto"),this.#n.addCue(h,o)}this.#h[r]=s.length}#y(t){if(!this.#t)return;const i=t.tracks,s=[...this.#e.textTracks].filter(a=>"manualMode"in a),r=this.#s(t);for(let a=0;a<s.length;a++){const o=i[a],c=s[a],h=`dash-${o.kind}-${a}`,d=new H({id:h,label:o?.label??o.labels.find(g=>g.text)?.text??(o?.lang&&w(o.lang))??o?.lang??void 0,language:o.lang??void 0,kind:o.kind,default:o.defaultTrack});d[m.native]={managed:!0,track:c},d[m.readyState]=2,d[m.onModeChange]=()=>{this.#t&&(d.mode==="showing"?(this.#t.setTextTrack(a),this.#n=d):(this.#t.setTextTrack(-1),this.#n=null))},this.#i.textTracks.add(d,r)}}#T(t){const{mediaType:i,newMediaInfo:s}=t;if(i==="audio"){const r=this.#i.audioTracks.getById(`dash-audio-${s.index}`);if(r){const a=this.#s(t);this.#i.audioTracks[p.select](r,!0,a)}}}#S(t){if(t.mediaType!=="video")return;const i=this.#i.qualities[t.newQuality];if(i){const s=this.#s(t);this.#i.qualities[p.select](i,!0,s)}}#v(t){if(this.#i.$state.canPlay()||!this.#t)return;const{type:i,mediaPresentationDuration:s}=t.data,r=this.#s(t);this.#i.notify("stream-type-change",i!=="static"?"live":"on-demand",r),this.#i.notify("duration-change",s,r),this.#i.qualities[b.setAuto](!0,r);const a=this.#t.getVideoElement(),o=this.#t.getTracksForTypeFromManifest("video",t.data),c=[...new Set(o.map(e=>e.mimeType))].find(e=>e&&M(a,e)),h=o.filter(e=>c===e.mimeType)[0];let d=this.#t.getTracksForTypeFromManifest("audio",t.data);const g=[...new Set(d.map(e=>e.mimeType))].find(e=>e&&C(a,e));if(d=d.filter(e=>g===e.mimeType),h.bitrateList.forEach((e,f)=>{const y={id:e.id?.toString()??`dash-bitrate-${f}`,width:e.width??0,height:e.height??0,bitrate:e.bandwidth??0,codec:h.codec,index:f};this.#i.qualities[p.add](y,r)}),P(h.index)){const e=this.#i.qualities[h.index];e&&this.#i.qualities[p.select](e,!0,r)}d.forEach((e,f)=>{const L=e.labels.find(T=>navigator.languages.some(D=>T.lang&&D.toLowerCase().startsWith(T.lang.toLowerCase())))||e.labels[0],A={id:`dash-audio-${e?.index}`,label:L?.text??(e.lang&&w(e.lang))??e.lang??"",language:e.lang??"",kind:"main",mimeType:e.mimeType,codec:e.codec,index:f};this.#i.audioTracks[p.add](A,r)}),a.dispatchEvent(new l("canplay",{trigger:r}))}#b(t){const{type:i,error:s}=t;switch(s.code){case 27:this.#L(s);break;default:this.#l(s);break}}#w(){this.#o>=0&&this.#c()}#E(t){t.mediaType==="text"&&requestAnimationFrame(this.#g.bind(this,t))}#o=-1;#L(t){this.#c(),this.#t?.play(),this.#o=window.setTimeout(()=>{this.#o=-1,this.#l(t)},5e3)}#c(){clearTimeout(this.#o),this.#o=-1}#l(t){this.#i.notify("error",{message:t.message??"",code:1,error:t})}#A(){this.#u("video",!0);const{qualities:t}=this.#i;this.#t?.setQualityFor("video",t.selectedIndex,!0)}#u(t,i){this.#t?.updateSettings({streaming:{abr:{autoSwitchBitrate:{[t]:i}}}})}#D(){const{qualities:t}=this.#i;!this.#t||t.auto||!t.selected||(this.#u("video",!1),this.#t.setQualityFor("video",t.selectedIndex,t.switch==="current"),N&&(this.#e.currentTime=this.#e.currentTime))}#x(){if(!this.#t)return;const{audioTracks:t}=this.#i,i=this.#t.getTracksFor("audio").find(s=>t.selected&&t.selected.id===`dash-audio-${s.index}`);i&&this.#t.setCurrentTrack(i)}#p(){this.#c(),this.#n=null,this.#h={}}onInstance(t){return this.#a.add(t),()=>this.#a.delete(t)}loadSource(t){this.#p(),u(t.src)&&this.#t?.attachSource(t.src)}destroy(){this.#p(),this.#t?.destroy(),this.#t=null,this.#r?.(),this.#r=null}}class V{#e;#i;#t;constructor(t,i,s){this.#e=t,this.#i=i,this.#t=s,this.#a()}async#a(){const t={onLoadStart:this.#r.bind(this),onLoaded:this.#s.bind(this),onLoadError:this.#d.bind(this)};let i=await B(this.#e,t);if(v(i)&&!u(this.#e)&&(i=await U(this.#e,t)),!i)return null;if(!window.dashjs.supportsMediaSource()){const s="[vidstack] `dash.js` is not supported in this environment";return this.#i.player.dispatch(new l("dash-unsupported")),this.#i.notify("error",{message:s,code:4}),null}return i}#r(){this.#i.player.dispatch(new l("dash-lib-load-start"))}#s(t){this.#i.player.dispatch(new l("dash-lib-loaded",{detail:t})),this.#t(t)}#d(t){const i=Q(t);this.#i.player.dispatch(new l("dash-lib-load-error",{detail:i})),this.#i.notify("error",{message:i.message,code:4,error:i})}}async function U(n,t={}){if(!v(n)){if(t.onLoadStart?.(),K(n))return t.onLoaded?.(n),n;if(E(n)){const i=n.MediaPlayer;return t.onLoaded?.(i),i}try{const i=(await n())?.default;if(E(i))return t.onLoaded?.(i.MediaPlayer),i.MediaPlayer;if(i)t.onLoaded?.(i);else throw Error("");return i}catch(i){t.onLoadError?.(i)}}}async function B(n,t={}){if(u(n)){t.onLoadStart?.();try{if(await x(n),!$(window.dashjs.MediaPlayer))throw Error("");const i=window.dashjs.MediaPlayer;return t.onLoaded?.(i),i}catch(i){t.onLoadError?.(i)}}}function K(n){return n&&n.prototype&&n.prototype!==Function}function E(n){return n&&"MediaPlayer"in n}const Y="https://cdn.jsdelivr.net";class z extends F{$$PROVIDER_TYPE="DASH";#e=null;#i=new G(this.video,this.ctx);get ctor(){return this.#e}get instance(){return this.#i.instance}static supported=R();get type(){return"dash"}get canLiveSync(){return!0}#t=`${Y}/npm/dashjs@4.7.4/dist/dash.all.min.js`;get config(){return this.#i.config}set config(t){this.#i.config=t}get library(){return this.#t}set library(t){this.#t=t}preconnect(){u(this.#t)&&k(this.#t)}setup(){super.setup(),new V(this.#t,this.ctx,t=>{this.#e=t,this.#i.setup(t),this.ctx.notify("provider-setup",this);const i=q(this.ctx.$state.source);i&&this.loadSource(i)})}async loadSource(t,i){if(!u(t.src)){this.removeSource();return}this.media.preload=i||"",this.appendSource(t,"application/x-mpegurl"),this.#i.loadSource(t),this.currentSrc=t}onInstance(t){const i=this.#i.instance;return i&&t(i),this.#i.onInstance(t)}destroy(){this.#i.destroy()}}export{z as DASHProvider};
