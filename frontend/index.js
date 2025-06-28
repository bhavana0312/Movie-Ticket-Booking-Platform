 const form = document.querySelector('.login-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (res.ok) {
        const user = result.user;

        // ✅ Save full user object
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userCity", user.location || "Not Set");

        alert("Login successful!");

        // ✅ Redirect to homepage/login.html with email and name in URL
        const encodedEmail = encodeURIComponent(user.email);
        const encodedName = encodeURIComponent(user.name || "User");
        window.location.href = `login.html?email=${encodedEmail}&name=${encodedName}`;
      } else {
        alert(result.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong during login.');
    }
  });