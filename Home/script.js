
const tips = [
    "Always start speeches with a formal greeting.",
    "Use facts and statistics to support your arguments.",
    "Form alliances early during unmoderated caucus.",
    "Motion strategically to gain control of debate flow.",
    "Write resolutions with clear, actionable clauses.",
    "Master your country's foreign policy and stances.",
    "Stay in character — you're a delegate, not a student!",
  ];
  
  const tipsContainer = document.getElementById('greenTips');
  tips.forEach((tip, index) => {
    setTimeout(() => {
      const li = document.createElement('li');
      li.textContent = tip;
      tipsContainer.appendChild(li);
    }, index * 1000);
  });
  

  const canvas = document.getElementById('globeCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  let angle = 0;
  function drawGlobe() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const radius = 150;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#2980b9';
    ctx.fill();
    ctx.strokeStyle = '#1c5980';
    ctx.stroke();
  
    ctx.fillStyle = '#ecf0f1';
    const continentX = canvas.width / 2 + radius * 0.6 * Math.cos(angle);
    const continentY = canvas.height / 2 + radius * 0.3 * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(continentX, continentY, 30, 0, 2 * Math.PI);
    ctx.fill();
  
    angle += 0.01;
    requestAnimationFrame(drawGlobe);
  }
  
  drawGlobe();
  