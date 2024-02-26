

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
