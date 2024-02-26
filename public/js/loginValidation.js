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