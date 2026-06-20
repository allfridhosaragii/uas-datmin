// Elements
const stepNav = document.getElementById('step-nav');
const codeDisplay = document.getElementById('code-display');
const outputContent = document.getElementById('output-content');
const paneCode = document.getElementById('pane-code');
const paneOutput = document.getElementById('pane-output');
const mobileToggleBtn = document.getElementById('mobile-toggle-btn');

// State
let currentStepIdx = 0;
let mobileView = 'code'; // 'code' or 'output'

function init() {
    if (!notebookData || notebookData.length === 0) {
        stepNav.innerHTML = '<div class="nav-item"><span class="nav-item-title">No data found.</span></div>';
        return;
    }

    renderSidebar();
    
    // Set initial view for mobile
    if (window.innerWidth <= 1024) {
        paneCode.classList.add('active-mobile');
    }
    
    // Load first step
    selectStep(0);
    
    // Mobile toggle event
    if(mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', toggleMobileView);
    }
}

function renderSidebar() {
    stepNav.innerHTML = '';
    notebookData.forEach((step, idx) => {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.id = `nav-item-${idx}`;
        navItem.innerHTML = `
            <span class="nav-item-step">Step ${idx + 1}</span>
            <span class="nav-item-title">${step.title || 'Processing Step'}</span>
        `;
        
        navItem.addEventListener('click', () => selectStep(idx));
        stepNav.appendChild(navItem);
    });
}

function selectStep(idx) {
    if (idx < 0 || idx >= notebookData.length) return;
    
    // Update active class in sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-item-${idx}`).classList.add('active');
    
    currentStepIdx = idx;
    const step = notebookData[idx];

    // Inject Code with animation
    codeDisplay.parentElement.classList.remove('fade-in');
    void codeDisplay.parentElement.offsetWidth; // Trigger reflow
    codeDisplay.textContent = step.code || '# No code for this step';
    codeDisplay.parentElement.classList.add('fade-in');

    // Inject Output with animation
    outputContent.classList.remove('fade-in');
    void outputContent.offsetWidth; // Trigger reflow
    outputContent.innerHTML = '';
    
    if (step.outputs && step.outputs.length > 0) {
        step.outputs.forEach(out => {
            if (out.type === 'text') {
                const textDiv = document.createElement('div');
                textDiv.className = 'output-text';
                textDiv.textContent = out.content;
                outputContent.appendChild(textDiv);
            } else if (out.type === 'image') {
                const img = document.createElement('img');
                img.className = 'output-image';
                img.src = 'data:image/png;base64,' + out.content;
                outputContent.appendChild(img);
            } else if (out.type === 'html') {
                const htmlDiv = document.createElement('div');
                htmlDiv.className = 'output-html';
                htmlDiv.innerHTML = out.content;
                outputContent.appendChild(htmlDiv);
            }
        });
    } else {
        const noOut = document.createElement('div');
        noOut.className = 'output-empty';
        noOut.textContent = '> No output generated in this step.';
        outputContent.appendChild(noOut);
    }
    outputContent.classList.add('fade-in');
}

function toggleMobileView() {
    if (mobileView === 'code') {
        mobileView = 'output';
        paneCode.classList.remove('active-mobile');
        paneOutput.classList.add('active-mobile');
        mobileToggleBtn.innerHTML = '<i class="fas fa-code"></i> View Code';
    } else {
        mobileView = 'code';
        paneOutput.classList.remove('active-mobile');
        paneCode.classList.add('active-mobile');
        mobileToggleBtn.innerHTML = '<i class="fas fa-columns"></i> View Output';
    }
}

// Add keyboard navigation (up/down arrows)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        selectStep(Math.min(currentStepIdx + 1, notebookData.length - 1));
        document.getElementById(`nav-item-${currentStepIdx}`).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
        selectStep(Math.max(currentStepIdx - 1, 0));
        document.getElementById(`nav-item-${currentStepIdx}`).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

document.addEventListener('DOMContentLoaded', init);
