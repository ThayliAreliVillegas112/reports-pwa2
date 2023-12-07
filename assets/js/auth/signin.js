(() => {
  'use strict';
  const token = localStorage.getItem('token');
  if (token) {
    changeView(localStorage.getItem('activeRole'));
  }
})();

const form = document.getElementById('signinForm');
console.log(document.getElementById('yourUsername').value)
const submitSigninForm = async (event) => {
  event.stopPropagation();
  event.preventDefault();
  if (form.checkValidity()) {
    const username = document.getElementById('yourUsername').value;
    const password = document.getElementById('yourPassword').value;
    

    try {
      console.log(username,password)
      const response = await axiosClient.post(`/auth/signin`, {
        username,
        password
      });
      
      const payload = JSON.parse(atob(response.token.split('.')[1]));
      console.log(payload);
      if (response?.token) {
      fullname = `${payload.person.name} ${payload.person.surname}${
        payload.person.lastname ? ` ${payload.person.lastname}` : ''
      }`;
      localStorage.setItem('token', response.token);
      localStorage.setItem('activeRole', payload.roles[0].role);
      localStorage.setItem('fullname', fullname);
      localStorage.setItem('idUser', payload.id)
      localStorage.setItem('idPerson',payload.person.id)
      toastMessage(`Bienvenido ${username}`).showToast();
      changeView(payload.roles[0].role);
      }
    } catch (error) {
      //console.log(error.response);
      toastMessage('Credenciales incorrectas').showToast();
    }
  }
};

form.addEventListener('submit', submitSigninForm);
