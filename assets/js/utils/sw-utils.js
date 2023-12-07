const updateDynamicCache = (cacheName,req,res) =>{//mantener actualizads las apis...
    if(res.ok){
        return caches.open(cacheName).then((cache)=>{
            cache.put(req,res.clone());
            return res.clone();
        })
    }else{
        return res;
    }
}

const updateStaticCache = (cacheName,req,APP_SHELL_INMUTABLE) =>{
    if(!APP_SHELL_INMUTABLE.includes(req.url)){
        return fetch(req).then((response)=>{
            return updateDynamicCache(cacheName,req,response);
        })
    }    
}

const apiIncidencesManager = (cacheName,req) =>{
    //only network
    if(req.url.indexOf('/api/notification')>=0 || 
    req.url.indexOf('/api/auth')>=0){
        return fetch(req);
    }
    //network with cache callfack / update
    if(req.clone().method === 'POST'){
        if(self.ServiceWorkerRegistration.sync && !navigator.onLine){
            return req.clone().text().then((body)=>{
                return saveIncidences(JSON.parse(body));
            })
        }else{
            return fetch(req);
        }
    }else{
        return fetch(req).then(response=>{
            if(response.ok){
                updateDynamicCache(cacheName,req,response.clone());
                return response.clone();
            }else{
                return caches.match(req);
            }
        }).catch((err)=>{
            caches.match(req);
        })
    }
}