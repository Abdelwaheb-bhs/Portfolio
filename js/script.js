const answers = {
    q1: 'b',
    q2: 'b',
    q3: 'b',
    q4: 'c',
    q5: 'a',
    q6: 'b',
    q7: 'b',
    q8: 'a',
    q9: 'b',
    q10: 'a'
};

const correctAnswersText = {
    q1: 'HyperText Markup Language',
    q2: '<a>',
    q3: 'Cascading Style Sheets',
    q4: 'color',
    q5: 'var nom;',
    q6: 'alert()',
    q7: '<h1>',
    q8: 'function maFonction()',
    q9: '<ul>',
    q10: '<link rel="stylesheet" href="style.css">'
};

function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkQuiz() {
    let score = 0;
    let answeredAll = true;

    for (let i = 1; i <= 10; i++) {
        const question = `q${i}`;
        const selected = document.querySelector(`input[name="${question}"]:checked`);
        
        if (!selected) {
            answeredAll = false;
        } else if (selected.value === answers[question]) {
            score++;
        }
    }

    if (!answeredAll) {
        alert('Veuillez répondre à toutes les questions avant de valider.');
        return;
    }

    const percentage = (score / 10) * 100;
    const resultDiv = document.getElementById('result');
    
    let correctAnswersList = '<h3>Réponses correctes :</h3><ul style="margin-top: 1rem;">';
    for (let i = 1; i <= 10; i++) {
        correctAnswersList += `<li style="margin: 0.5rem 0;">Question ${i}: ${correctAnswersText[`q${i}`]}</li>`;
    }
    correctAnswersList += '</ul>';

    resultDiv.innerHTML = `
        <h3>Résultat du Quiz</h3>
        <p style="font-size: 1.5rem; font-weight: bold; margin: 1rem 0;">
            Score : ${score}/10 (${percentage}%)
        </p>
        <p style="font-size: 1.1rem;">
            ${percentage >= 50 ? '🎉 Félicitations ! Vous avez réussi le quiz.' : '💪 Continuez vos efforts !'}
        </p>
        ${correctAnswersList}
    `;
    
    resultDiv.className = `result show ${percentage >= 50 ? 'pass' : 'fail'}`;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleContact(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    alert(`Merci ${name} ! Votre message a été envoyé avec succès.\n\nNous vous répondrons à l'adresse : ${email}`);
    document.getElementById('contactForm').reset();
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const themeToggle = document.querySelector('.theme-toggle');
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
}

window.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
});

function openCertificateModal(stageId, stageTitle, certificatePath) {
    const modal = document.getElementById('certificateModal');
    const title = document.getElementById('certificateTitle');
    const body = document.getElementById('certificateBody');

    title.textContent = stageTitle + ' - Attestation';
    
  
    if (certificatePath.endsWith('.pdf')) {
        body.innerHTML = `
            <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                <strong>Fichier:</strong> ${certificatePath}
            </p>
            <embed src="${certificatePath}" type="application/pdf" width="100%" height="600px" style="border-radius: 8px; border: 1px solid var(--border-color);">
        `;
    } else if (certificatePath.endsWith('.jpg') || certificatePath.endsWith('.png') || certificatePath.endsWith('.jpeg')) {
        body.innerHTML = `
            <img src="images/${certificatePath}" alt="${stageTitle} Certificate" class="certificate-image">
        `;
    } else {
        body.innerHTML = `
            <p style="color: var(--text-secondary); padding: 2rem; text-align: center;">
                <strong>Attestation disponible:</strong> ${stageTitle}<br><br>
                Fichier: ${certificatePath}<br><br>
                <em>Veuillez vous assurer que le fichier existe à ce chemin.</em>
            </p>
        `;
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    const modal = document.getElementById('certificateModal');
    if (event.target == modal) {
        closeCertificateModal();
    }
    const drawingModal = document.getElementById('drawingModal');
    if (event.target == drawingModal) {
        closeDrawingModal();
    }
}

function openDrawingModal(imageSrc, title) {
    const modal = document.getElementById('drawingModal');
    document.getElementById('drawingImage').src = imageSrc;
    document.getElementById('drawingTitle').textContent = title;
    modal.style.display = 'block';
}

function closeDrawingModal() {
    const modal = document.getElementById('drawingModal');
    modal.style.display = 'none';
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCertificateModal();
        closeDrawingModal();
    }
});
