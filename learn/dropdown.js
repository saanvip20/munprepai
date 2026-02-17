document.addEventListener('DOMContentLoaded', function() {
    const userInfo = document.querySelector('.user-info');
    const dropdown = document.getElementById('dropdown');
    

    userInfo.addEventListener('click', function() {
      dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
    });

    document.addEventListener('click', function(event) {
      if (!userInfo.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
      }
    });
  });
  