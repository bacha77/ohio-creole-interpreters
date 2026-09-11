document.addEventListener('DOMContentLoaded', () => {
    // Mobile Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade-in and slide-up elements
    document.querySelectorAll('.fade-in, .slide-up').forEach(element => {
        observer.observe(element);
    });

    // Form Submission Handling
    const bookingForm = document.getElementById('bookingForm');
    const successMessage = document.getElementById('successMessage');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            const formAction = bookingForm.getAttribute('action');
            
            // If the form ID hasn't been set yet, prevent submission and show success message (demo mode)
            if (formAction && formAction.includes('YOUR_FORM_ID_HERE')) {
                e.preventDefault(); 
                bookingForm.style.display = 'none';
                successMessage.classList.remove('hidden');
                successMessage.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! We have received your request (Demo Mode). Please connect Formspree for real emails.';
            }
            // Otherwise, let the form submit naturally to Formspree
        });
    }
});
