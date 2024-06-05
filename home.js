document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector(".login-btn");
    const signupBtn = document.querySelector(".signup-btn");
    const logoutBtn = document.querySelector(".logout-btn");
    const loginModal = document.getElementById("login-modal");
    const signupModal = document.getElementById("signup-modal");

    // Kiểm tra trạng thái đăng nhập khi tải lại trang
    if (localStorage.getItem('authToken')) {
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        loginBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }

    // Show login modal
    loginBtn.onclick = () => {
        loginModal.style.display = "block";
    }

    // Show signup modal
    signupBtn.onclick = () => {
        signupModal.style.display = "block";
    }

    // Hide modals when clicking outside of them
    window.onclick = (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        } else if (event.target === signupModal) {
            signupModal.style.display = "none";
        }
    }

    // Handle login form submission
    document.getElementById("login-form").onsubmit = (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
            
        fetch(`https://backend-inventory-tracking-system.onrender.com/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            /* This block of code is handling the response after attempting to log in a user. Here's a breakdown of what it does: */
            if (data.token) {
                localStorage.setItem('authToken', data.token); // Save token
                alert("Logged in!");
                loginModal.style.display = "none";
                loginBtn.style.display = "none";
                signupBtn.style.display = "none";
                logoutBtn.style.display = "inline-block";
            } else {
                alert("Login failed!");
            }
        });
        
    }

    // Handle signup form submission
    document.getElementById("signup-form").onsubmit = (e) => {
        e.preventDefault();

        let add_signupBtn = document.getElementById("add-signup");

        add_signupBtn.onclick = (e) => {
            e.preventDefault();
            const name = document.getElementById("signup-name").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;
        
            console.log(name, email, password);
            
        
            fetch(`https://backend-inventory-tracking-system.onrender.com/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: name, email: email, password: password })
            })
            .then(response => {
                console.log(response);
                return response.json()
            }
            )
            .then(data => {
                console.log(name, email, password);
                console.log(data.name, data.email, data.password);
                console.log(data);
                alert("Signed up!");
                signupModal.style.display = "none";
            });
            }

        
    };
    

    // Handle logout
    logoutBtn.onclick = () => {
        localStorage.removeItem('authToken');
        alert("Logged out!");
        loginBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }

});
