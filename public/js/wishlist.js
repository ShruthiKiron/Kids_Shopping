document.addEventListener('DOMContentLoaded', function () {
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            const productId = 
            alert('clicked')
            // Fetch request
            fetch(`/add-wishlist?productId=${productId}`, {
                method: 'POST', 
            })
            .then(response => {
                if (response.ok) {
                    alert('Product added to wishlist!');
                } else {
                    alert('Failed to add product to wishlist. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add product to wishlist. Please try again.');
            });
        });
    });
});
