const form = document.getElementById('form')
const firstName = document.getElementById('firstName')
const lastName = document.getElementById('lastName')
const email = document.getElementById('email')
const password = document.getElementById('password')
const confirmPassword = document.getElementById('confirmPassword')

form.addEventListener('submit', e =>{
    e.preventDefault()
    //console.log("hey")
if(!validateInputs()){
    form.submit()

}
   
})
  

const setError = (element,message) => {
    const inputControl = element.parentElement
    const errorDisplay = inputControl.querySelector('.forValidation')
    errorDisplay.innerText = message
   
}



    const validateInputs = () =>{

        //console.log("helloooooooo")

        let lettersOnlyRegex = /^[A-Za-z\s]*$/
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let passwordUppercase = /^(?=.*?[A-Z])/;
        let passwordLower = /^(?=.*?[a-z])/;
        let passwordDigit = /^(?=.*?[0-9])/;
        let passwordSpecial = /^(?=.*?[#?!@$%^&*-])/;
      

    const firstNameValue = firstName.value.trim()
    const lastNameValue = lastName.value.trim()
    const emailValue = email.value.trim()
    const passwordValue = password.value.trim()
    const confirmPasswordValue = confirmPassword.value.trim()
    const hasError = false

    if(firstNameValue === ''){
        setError(firstName,'Field is required')
        hasError = true
    }
    else if(!lettersOnlyRegex.test(firstNameValue)){
        setError(firstName,'Invalid first name')
        hasError = true
    }
    else{
        setError(firstName,'')
    }
    if(lastNameValue === ''){
        setError(lastName,'Field is required')
        hasError = true
    }
    else if(!lettersOnlyRegex.test(lastNameValue)){
        setError(lastName,'Invalid last name')
        hasError = true
    }
    else{
        setError(lastName,'')
    }
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
    else if(passwordValue < 4){
        setError(password,'Password must be at least 4 character in length')
        hasError = true
    }
    else if(!passwordUppercase.test(passwordValue)){
        setError(password,'Password must contain minimum of one upper case letter [A-Z]')
        hasError = true
    }
    else if(!passwordLower.test(passwordValue)){
        setError(password,'Password must contain minimum of one lower case letter [a-z]')
        hasError = true
    }
    else if(!passwordSpecial.test(passwordValue)){
        setError(password,'Password must contain minimum of one special character')
        hasError = true
    }
    else if(!passwordDigit.test(passwordValue)){
        setError(password,'Password must contain minimum of one numeric value letter [0-9]')
        hasError = true
    }
    else{
        setError(password,'')
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
