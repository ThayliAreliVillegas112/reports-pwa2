const incidencesDB = new PouchDB('incidences');

const saveIncidences = (incidence) =>{
    incidence._id = new Date().toISOString();
    return incidencesDB.put().then((result)=>{
        self.ServiceWorkerRegistration.sync.register('incidence-post');
        const response = {
            registered: true,
            offline: true
        }
        return new Response(JSON.stringify(response));
    }).catch((err)=>{
        const response = {
            registered: false,
            offline: true
        }
        return new Response(JSON.stringify(response));
    })
}

const savePostIncidences = () =>{
    const incidences = [];
    return incidencesDB.allDocs({include_docs:true})
        .then(async (docs)=>{
            const {rows} = docs;
            for (const row of rows) {
                const {doc} = row; //doc -> incidence
                const response = await fetch('http://206.189.234.55/api/incidences/status',
                {method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
            body: JSON.stringify(doc),
        });
        const data = await response.json();
        if(data['changed']){
            incidences.push(incidencesDB.remove(doc));
        }
                    
            }

            const message = self.clients.matchAll().then((clients)=>{
                clients.array.forEach(client => {
                    client.postMessage({type: 'RELOAD_PAGE_AFTER_SYNC'});
                });
            });
            return Promise.all(...incidences, message);
        })
}