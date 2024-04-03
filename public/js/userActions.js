

const alertBtn = document.querySelector('.alert-btn')


$(document).ready(function(){
    $(document).on('click','#resendButton',function(event){
        event.preventDefault()
        
        $.ajax({
            url: '/resend-otp',
            method: 'POST',
            success: function(response){
                if(response.success){
                    $('.modal-body').html(response.message);
                    alertBtn.click();
                    $('#resendButton').addClass('disabled').prop('disabled', true);
                    $(document).on('click',".doneBtn",function(){
                        location.reload()
                    })
                }
            },
            error: function(xhr, status, error){
                console.error(error);
            }
        });
    })
})
$(document).ready(function(){
    $(document).on('click','#forgotresendButton',function(event){
        event.preventDefault()
        
        $.ajax({
            url: '/forgot-resend-otp',
            method: 'POST',
            success: function(response){
                if(response.success){
                    $('.modal-body').html(response.message);
                    alertBtn.click();
                    $('#resendButton').addClass('disabled').prop('disabled', true);
                    $(document).on('click',".doneBtn",function(){
                        location.reload()
                    })
                }
            },
            error: function(xhr, status, error){
                console.error(error);
            }
        });
    })
})

$(document).ready(function() 
{
    const alertMsg = document.querySelector('.alert-msg')
    $(document).on('click' , '#signupOtpSubmitButton',function(){
        var value = $('#otpValue').val()
       
        
        if(!value){
           alertMsg.innerHTML = 'Enter OTP'
        }else{
        $.ajax({
            url:'/signup-otp',
            method:'POST',
            data:{value},
            success:function(response){
               if(response.success){
                 location.href = '/home'
               }else if(response.invalid){
                 alertMsg.innerHTML =response.message  
               }
            },error:function(error) {
               console.log(error)
            }
        })
    }
    })
})
