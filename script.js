// Utilities
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  // Header: mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link (mobile)
    siteNav.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      }
    });
  }

  // Active link highlighting
  const navLinks = $$('.nav-link');
  const sections = $$('#home, #services, #legitimacy, #testimonials');
  
  // Function to set active link based on current page
  const setActiveByPage = () => {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    navLinks.forEach(link => link.classList.remove('active'));
    
    // For index.html with hash navigation (sections)
    if (sections.length > 0 && (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/'))) {
      const current = sections.findLast?.(sec => window.scrollY + 120 >= sec.offsetTop) || sections[0];
      if (current) {
        const found = $(`.nav-link[href="#${current.id}"]`);
        if (found) found.classList.add('active');
      }
      return;
    }
    
    // For other pages, match by filename
    if (currentPath.includes('services.html') || currentPath.endsWith('services.html')) {
      const found = $(`.nav-link[href*="services.html"]`);
      if (found) found.classList.add('active');
    } else if (currentPath.includes('about.html') || currentPath.endsWith('about.html')) {
      const found = $(`.nav-link[href*="about.html"]`);
      if (found) found.classList.add('active');
    } else if (currentPath.includes('contact.html') || currentPath.endsWith('contact.html')) {
      const found = $(`.nav-link[href*="contact.html"]`);
      if (found) found.classList.add('active');
    } else if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
      const found = $(`.nav-link[href="#home"], .nav-link[href="index.html"]`);
      if (found) found.classList.add('active');
    }
  };
  
  // Set active on page load
  setActiveByPage();
  
  // For index.html, update on scroll
  if (sections.length > 0) {
    window.addEventListener('scroll', setActiveByPage, { passive: true });
  }
  
  // Set active when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Reveal on scroll
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('reveal-visible'));
  }

  // Back to top button (supports both class and id selectors)
  const toTop = $('.to-top') || $('#back-to-top');
  const toggleToTop = () => {
    if (!toTop) return;
    const show = window.scrollY > 400;
    toTop.classList.toggle('visible', show);
  };
  if (toTop) {
    window.addEventListener('scroll', toggleToTop, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Footer year
  const yearSpan = $('#year');
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());

  // Contact form handling
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Fields
      const name = $('#name');
      const email = $('#email');
      const phone = $('#phone');
      const subject = $('#subject');
      const message = $('#message');
      const consent = $('#consent');
      const status = $('.form-status');
      const submitBtn = $('button[type="submit"]', form);

      // Reset errors
      $$('.error', form).forEach(el => (el.textContent = ''));

      // Validation
      let ok = true;
      const setErr = (id, msg) => { const el = $(`#err-${id}`); if (el) el.textContent = msg; ok = false; };

      if (!name.value.trim()) setErr('name', 'Please enter your full name.');
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) setErr('email', 'Enter a valid email address.');
      if (!subject.value.trim()) setErr('subject', 'Add a brief subject.');
      if (!message.value.trim()) setErr('message', 'Tell us a bit about your needs.');
      if (!consent.checked) setErr('consent', 'Please consent so we can contact you.');

      if (!ok) {
        if (status) {
          status.textContent = 'Please fix the highlighted fields.';
          status.style.color = 'var(--error)';
        }
        return;
      }

      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      if (status) {
        status.textContent = 'Sending your message...';
        status.style.color = 'var(--gold)';
      }

      try {
        // Submit to Formspree
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          if (status) {
            status.textContent = 'Thank you! Your message has been sent successfully.';
            status.style.color = 'var(--gold)';
          }
          form.reset();
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to send message');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        if (status) {
          status.textContent = 'Sorry, there was an error sending your message. Please try again or email us directly.';
          status.style.color = 'var(--error)';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        }
      }
    });
  }

  // Calendar Booking Feature
  const calendarBtn = $('#calendar-btn');
  const bookingModal = $('#booking-modal');
  const bookingClose = $('.booking-close');
  const calendarView = $('#calendar-view');
  const bookingFormView = $('#booking-form-view');
  const calendarGrid = $('#calendar-grid');
  const monthYear = $('#calendar-month-year');
  const prevMonthBtn = $('#prev-month');
  const nextMonthBtn = $('#next-month');
  const bookingForm = $('#booking-form');
  const selectedDateText = $('#selected-date-text');
  const bookingDateInput = $('#booking-date');
  const backToCalendarBtn = $('#back-to-calendar');
  const bookingStatus = $('#booking-status');

  let currentDate = new Date();
  let selectedDate = null;

  // Open modal
  if (bookingModal && calendarBtn) {
    calendarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      bookingModal.setAttribute('aria-hidden', 'false');
      bookingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      renderCalendar();

      // Close mobile menu if open
      const siteNav = document.getElementById('site-nav');
      const navToggle = document.querySelector('.nav-toggle');
      if (siteNav && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        if (navToggle) navToggle.setAttribute('aria-expanded', false);
      }
    });

    // Close modal
    bookingClose.addEventListener('click', closeModal);
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function closeModal() {
    if (!bookingModal) return;
    bookingModal.setAttribute('aria-hidden', 'true');
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset to calendar view
    if (calendarView) calendarView.style.display = 'block';
    if (bookingFormView) bookingFormView.style.display = 'none';
    selectedDate = null;
    if (bookingForm) bookingForm.reset();
  }

  function renderCalendar() {
    if (!calendarGrid || !monthYear) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    calendarGrid.innerHTML = '';
    
    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyCell);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('button');
      dayCell.className = 'calendar-day';
      dayCell.textContent = day;
      dayCell.type = 'button';
      
      const cellDate = new Date(year, month, day);
      const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (isPast) {
        dayCell.classList.add('past');
        dayCell.disabled = true;
      } else {
        dayCell.addEventListener('click', () => selectDate(cellDate));
      }
      
      calendarGrid.appendChild(dayCell);
    }
  }

  function selectDate(date) {
    selectedDate = date;
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (selectedDateText) selectedDateText.textContent = dateStr;
    if (bookingDateInput) bookingDateInput.value = date.toISOString().split('T')[0];
    
    if (calendarView) calendarView.style.display = 'none';
    if (bookingFormView) bookingFormView.style.display = 'block';
  }

  if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (backToCalendarBtn) {
    backToCalendarBtn.addEventListener('click', () => {
      if (calendarView) calendarView.style.display = 'block';
      if (bookingFormView) bookingFormView.style.display = 'none';
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = $('button[type="submit"]', bookingForm);
      if (submitBtn) submitBtn.disabled = true;
      
      if (bookingStatus) {
        bookingStatus.textContent = 'Sending booking request...';
        bookingStatus.style.color = 'var(--gold)';
      }

      try {
        const formData = new FormData(bookingForm);
        formData.append('_subject', 'New Appointment Booking Request');
        formData.append('_to', 'ndangiziomer100@gmail.com');
        
        const response = await fetch('https://formspree.io/f/mvgbpqdb', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          if (bookingStatus) {
            bookingStatus.textContent = 'Booking request sent successfully! We will contact you soon.';
            bookingStatus.style.color = 'var(--gold)';
          }
          bookingForm.reset();
          setTimeout(() => {
            closeModal();
          }, 2000);
        } else {
          throw new Error('Failed to send booking request');
        }
      } catch (error) {
        console.error('Booking submission error:', error);
        if (bookingStatus) {
          bookingStatus.textContent = 'Sorry, there was an error. Please try again or contact us directly.';
          bookingStatus.style.color = 'var(--error)';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});