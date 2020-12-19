let route = 'login'
let subjectsState = []

const renderEnrolment = (response, subjectsState) => {
     const subject = subjectsState.find(subject => subject._id === response.subject_id)
     const htmlObject = stringToHTML(`<li subject-id="${response._id}">${subject.desc} - ${response.user_id}</li>`)
    return htmlObject
}


//Converting string to Html object
const stringToHTML = (s) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(s, 'text/html')
  return doc.body.firstChild
}

//rendering each item from the array pulled from the db and adding an click event listener
const renderItem = (item) => {
 const htmlObject = stringToHTML(`<li subject-id="${item._id}">${item.desc}</li>`)

  //Code to run every time an subject is clicked 
  htmlObject.addEventListener('click', () => {
    const subjectsList = document.getElementById('subjects-list')
    const subjectsIdInput = document.getElementById('subjects-id')
    
    //Convert every subject from the subject liest to an array and do a foreach to remove the selected class from all of them.
    Array.from(subjectsList.children).forEach( subject  => subject.classList.remove('selected'))

    //Add the selected class to the HTML Object which has been clicked
    htmlObject.classList.add('selected')
    subjectsIdInput.value = item._id
  })
  return htmlObject
}


const initSubjAndEnrolLists = () => {
  //Fetching to the API to pull the subjects and rendering
  fetch('https://restful-api.alvarez-carlos.vercel.app/api/subjects')
   .then( subjectsResponse => subjectsResponse.json() )
   .then(subjectsResponse => {
     subjectsState = subjectsResponse
     const submit = document.getElementById('submit')
     const subjectsList = document.getElementById('subjects-list')
     const listItems = subjectsResponse.map(renderItem)
     //console.log(listItems)
     //Remove Loading text
     subjectsList.removeChild(subjectsList.firstElementChild)
     //Append subject to the subjectsList
     listItems.forEach( subject => subjectsList.appendChild(subject))
     
     submit.removeAttribute('disabled')

     //Fetching to the API to pull the Enrolments and rendering 
     fetch('https://restful-api.alvarez-carlos.vercel.app/api/enrolments')
      .then( enrolmentsResponse => enrolmentsResponse.json())
      .then( enrolmentsResponse => { 
	 //console.log(enrolmentsResponse )
         const enrolmentsList = document.getElementById('enrolments-list') 
	 const enrolmentsArray = enrolmentsResponse.map( enrolment => renderEnrolment(enrolment, subjectsResponse))
	 enrolmentsList.removeChild(enrolmentsList.firstElementChild)
	 enrolmentsArray.forEach( enrolment => enrolmentsList.appendChild(enrolment))
      })
   }) 
}



const initEnrolForm = () => {
  const enrolForm = document.getElementById('enrol-form')
  enrolForm.onsubmit = (e) => {
    e.preventDefault()
    
    //Let's disable the submit button while the enrolment is created.
    const submit = document.getElementById('submit')
    submit.setAttribute('disabled', true)

    //geting subject Id
    const subjectsId = document.getElementById('subjects-id')
    const subjectsIdValue = subjectsId.value
    
    //Verify if user actually selected any subject
    if(!subjectsIdValue){
      alert('You need to select a subject!')
      return
    }
    
    const enrolment = {
      subject_id: subjectsIdValue,
      user_id: 'userExample',
    }

    fetch('https://restful-api.alvarez-carlos.vercel.app/api/enrolments', {
      method: 'POST',
      headers:{
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrolment)
    })
    .then(response => response.json())
    .then(response => {
      const htmlObject = renderEnrolment(response, subjectsState) 
      const enrolmentsList = document.getElementById('enrolments-list')
      enrolmentsList.appendChild(htmlObject)
      submit.removeAttribute('disabled')
    })
  }
}


const renderSubjEnrolView = () => {
  const subjEnrolTemplate= document.getElementById('subjects-enrolments-view')
  document.getElementById('app').innerHTML = subjEnrolTemplate.innerHTML
  
 initEnrolForm()
 initSubjAndEnrolLists()
}

const renderLogin = () => {
  const loginTemplate = document.getElementById('login-template')
  document.getElementById('app').innerHTML = loginTemplate.innerHTML

  const loginForm =  document.getElementById('login-form')
  loginForm.onsubmit = (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    fetch('https://restful-api.alvarez-carlos.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
     .then( response => response.json())
    .then( response => {
      localStorage.setItem('token', response.token)
      route = 'enrolment'
      renderSubjEnrolView()
    })
  }
}

const renderApp = () => {
  const token = localStorage.getItem('token')
//  const token = true 
  if (token){
    return renderSubjEnrolView() 
  }
  renderLogin()
}

window.onload = () => {
  renderApp()
}
