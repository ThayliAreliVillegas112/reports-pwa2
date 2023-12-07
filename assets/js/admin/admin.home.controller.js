(() => {
  'use strict';
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.clear();
    changeView('');
  }
})();

const incidencesDB = new PouchDB('incidences');
const aceptIncidence = async(idincidence) =>{
  try{
    const response = await axiosClient.post('/incidences/status',
    {
      idincidence,
      status: {
        id: 4
      },
    });
    if(response['changed']){
      toastMessage('Estado cambiado correctamente').showToast();
      getAllIncidencesPending();
    }
  }catch(error){
    console.log(error)
    toastMessage('Error al cambiar el estado').showToast();
  }

}

const rejectIncidence = async(idincidence) =>{
  try{
    const response = await axiosClient.post('/incidences/status',
    {
      idincidence,
      status: {
        id: 6
      },
    });
    if(response['changed']){
      toastMessage('Estado cambiado correctamente').showToast();
      getAllIncidencesPending();
    }
  }catch(error){
    console.log(error)
    toastMessage('Error al cambiar el estado').showToast();
  }

}

$(document).ready(function () {
  if (!fullname) fullname = localStorage.getItem('fullname');
  if (!role) role = localStorage.getItem('activeRole');
  $('#fullname').text(fullname);
  $('#fullname2').text(fullname);
  $('#role').text(role);

  getAllIncidencesPending();

  navigator.serviceWorker.addEventListener('message',(event) => {
    if(event.data && event.data.type === 'RELOAD_PAGE_AFTER_SYNC'){
      window.location.reload(true)
    }
  })
});


// const getAllIncidencesPending = async () => {
//   let content = ``;
//   try {
//     const response = await axiosClient.get(`/incidences/pending/2`);
//     for (const [index, incidence] of response?.incidences.entries()) {
//       console.log("infor de la incidencias -->",incidence)
//       content += `
//         <tr>
//             <th scope="row">${index + 1}</th>
//             <td>${incidence.person.name + ' ' + incidence.person.surname}</td>
//             <td>${incidence.user.area.name }</td>
//             <td>${incidence.title + ' - ' + incidence.type }</td>
//             <td>${incidence.incidenceDate.split('T')[0]}</td>
//             <td>
//             <button type='button' class='btn btn-primary'>Edit</button>
//             <button type='button' class='btn btn-danger '>Del</button>
//             </td>
//         </tr>
//         `;
//     }
//     document.getElementById('incidencesBody').innerHTML = content;
//     const table = $('#incidencesTable');
//     new DataTable(table, {
//       columnDefs: [{ orderable: false, targets: 4 }],
//       language: {
//         url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
//       },
//     });
//   } catch (error) {
//     console.log(error)
//     toastMessage('Error').showToast();
//   }
// };

const getAllIncidencesPending = async () => {
  let content = ``;
  try {
  
    
    const user = parserJWT();
    const response = await axiosClient.get(`/incidences/pending/${user.id}`);
    const tableBody = $('#incidencesBody');
    let content = '';

    
    tableBody.html('');
    const {rows} = await incidencesDB.allDocs({include_docs:true});
for (const [i, incidence] of response?.incidences.entries()) {
  const incidenceDate = new Date(incidence.incidenceDate);
  const day = String(incidenceDate.getDate()).padStart(2,'0');
  const month = String(incidenceDate.getMonth()+1).padStart(2,'0');
  const year = String(incidenceDate.getFullYear());

  content += `
  <tr>
      <td scope="row">${i + 1}</td>
      <td>${incidence.person.name} ${incidence.person.surname} ${incidence.person.lastname ?? ''}</td>
      <td>${incidence.user.area.name }</td>
      <td>${day}/${month}/${year}</td>
      <td>
        ${
          rows.find(row=>row.doc.id == incidence.id)
          ?
          `
          <button type='button' class='btn btn-outline-primary btn-sm' disabled>Acept</button>
          <button type='button' class='btn btn-outline-danger btn-sm' disabled>Reject</button>
          ` : 
          `
          <button type='button' class='btn btn-outline-primary btn-sm' onclick="aceptIncidence(${incidence.id})">Acept</button>
          <button type='button' class='btn btn-outline-danger btn-sm' onclick="rejectIncidence(${incidence.id})">Reject</button>
          `
        }
      </td>
  </tr>
  `;
}

  tableBody.html(content);
  new DataTable($('#incidencesTable'), {
    columnDefs: [{ orderable: false, targets: 4 }],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
    },
  });

  } catch (error) {
    console.log(error)
    toastMessage('Error').showToast();
  }
};