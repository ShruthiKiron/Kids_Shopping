const form = document.getElementById('form')
const email = document.getElementById('email')
const password = document.getElementById('password')

form.addEventListener('submit', e => {
    e.preventDefault()
    if(!validateInputs()){
        form.submit()
    }
})

const setError = (element,message) => {
    const inputControl = element.parentElement
    const errorDisplay = inputControl.querySelector('.forValidation')
    errorDisplay.innerText = message
}

const validateInputs = () => {
        let lettersOnlyRegex = /^[A-Za-z\s]*$/
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let passwordUppercase = /^(?=.*?[A-Z])/;
        let passwordLower = /^(?=.*?[a-z])/;
        let passwordDigit = /^(?=.*?[0-9])/;
        let passwordSpecial = /^(?=.*?[#?!@$%^&*-])/;


        const emailValue = email.value.trim()
        const passwordValue = password.value.trim()

        const hasError = false

        if(emailValue === ''){
            setError(email,'Field is required')
            hasError = true
        }
        else if(!emailRegex.test(emailValue)){
            setError(email,'Invalid email address')
            hasError = true
        }
        else{
            setError(email,'')
        }
        if(passwordValue === ''){
            setError(password,'Field is required')
            hasError = true
        }
        else{
            setError(password,'')
        }

        if(hasError !== true)
        {
            return false
         }
         else{
            return true
         }
    
}
async function handleGoogleAuth(response){
    console.log("handleGoogleAuth response ",response);
      const url = '/auth/googlesignin'
      const method = "POST"
      const body = {
        googleResponse : response
      }
      const data = await fetchFunction(url,method,body);
      console.log("Data in google auth ",data);
      if(data.status === true){
        return location.assign('/home');
      }
    }

    async function fetchFunction(url, method,body) {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body : JSON.stringify(body)
        });
        const data = await response.json()
        return data;
    }