const form = document.getElementById('form')
const newPassword = document.getElementById('newPassword')
const confirmPassword = document.getElementById('confirmPassword')

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
        let passwordUppercase = /^(?=.*?[A-Z])/;
        let passwordLower = /^(?=.*?[a-z])/;
        let passwordDigit = /^(?=.*?[0-9])/;
        let passwordSpecial = /^(?=.*?[#?!@$%^&*-])/;

    const passwordValue = newPassword.value.trim()
    const confirmPasswordValue = confirmPassword.value.trim()
    const hasError = false

    if(passwordValue === ''){
        setError(newPassword,'Field is required')
        hasError = true
    }
    else if(passwordValue < 4){
        setError(newPassword,'Password must be at least 4 character in length')
        hasError = true
    }
    else if(!passwordUppercase.test(passwordValue)){
        setError(newPassword,'Password must contain minimum of one upper case letter [A-Z]')
        hasError = true
    }
    else if(!passwordLower.test(passwordValue)){
        setError(newPassword,'Password must contain minimum of one lower case letter [a-z]')
        hasError = true
    }
    else if(!passwordSpecial.test(passwordValue)){
        setError(newPassword,'Password must contain minimum of one special character')
        hasError = true
    }
    else if(!passwordDigit.test(passwordValue)){
        setError(newPassword,'Password must contain minimum of one numeric value letter [0-9]')
        hasError = true
    }
    else{
        setError(newPassword,'')
    }
    if(confirmPasswordValue === ''){
        setError(confirmPassword,'Field is required')
        hasError = true
    }
    else if(confirmPasswordValue !== passwordValue){
        setError(confirmPassword,'Password is not match')
        hasError = true
    }
    else{
        setError(confirmPassword,'')
    }


    if(hasError !== true)
    {
        return false
    }
    else{
        return true
    }
    



}