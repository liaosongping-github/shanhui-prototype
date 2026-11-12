(() => {
  const root=new URL('../',document.currentScript.src);
  const fileMode=location.protocol==='file:';
  const isLocal=location.protocol==='http:'&&location.hostname==='127.0.0.1';
  const apiRoot=fileMode?new URL('http://127.0.0.1:4173/'):root;
  let session=null;
  const configReady=fileMode?new Promise(resolve=>{
    const script=document.createElement('script');script.src=new URL('资源/本机连接.js',root).href;
    script.onload=()=>resolve(window.prototypeLocalConnection||null);script.onerror=()=>resolve(null);document.head.append(script);
  }):Promise.resolve(null);
  async function request(path,options={}){
    const config=await configReady;
    const headers={...(options.headers||{})};
    if(fileMode&&config?.pairing)headers['X-Prototype-Pairing']=config.pairing;
    const response=await fetch(new URL(path,apiRoot),{cache:'no-store',signal:AbortSignal.timeout(15000),...options,headers});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'请求失败，请重试。');
    return result;
  }
  async function probe(){
    try{
      const result=await request('api/session',{signal:AbortSignal.timeout(800)});
      if(result.service!=='shanhui-prototype')return null;
      const config=await configReady;
      if(fileMode&&result.root.toLowerCase().replaceAll('\\','/')!==config?.root?.toLowerCase().replaceAll('\\','/'))throw new Error('服务对应另一份项目，请重新配置保存助手。');
      session=result;return session;
    }catch{return null;}
  }
  async function connect(wake=false){
    if(!fileMode&&!isLocal)throw new Error('请在本机原型中编辑并保存。');
    if(await probe())return session;
    if(fileMode&&wake){
      if(!(await configReady)?.pairing)throw new Error('请先运行“配置保存助手.cmd”，完成一次性配置。');
      const launcher=document.createElement('iframe');launcher.hidden=true;launcher.src='shanhui-prototype://start';document.body.append(launcher);setTimeout(()=>launcher.remove(),30000);
    }
    for(let n=0;n<25;n++){
      await new Promise(resolve=>setTimeout(resolve,600));
      if(await probe())return session;
    }
    throw new Error('未连接到保存助手。请允许浏览器打开助手，或双击“启动原型.cmd”，然后再次保存；草稿仍保留。');
  }
  const ready=isLocal?probe():Promise.resolve(null);
  window.prototypeStore={ready,fileMode,connect,probe,
    async fingerprint(data){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(data)));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');},
    read:key=>request('api/annotations?key='+encodeURIComponent(key)),
    async save(key,data,baseRevision){
      const active=await connect();
      return request('api/annotations',{method:'POST',headers:{'Content-Type':'application/json','X-Prototype-Token':active.token},body:JSON.stringify({key,data,baseRevision})});
    },
    async sync(){
      const active=await connect();
      return request('api/sync',{method:'POST',headers:{'Content-Type':'application/json','X-Prototype-Token':active.token},body:'{}'});
    },
    status:()=>request('api/sync')
  };
})();
