document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Curriculum Data Source ---
    const curriculumData = {
        "0": {
            title: "Digital Literacy & Productivity",
            age: "Ages 7+ & Adults",
            description: "The essential foundation for the digital world. Master the tools used in every modern office and school environment before diving into code.",
            image: "assets/illustrations/digital-literacy.svg",
            modules: [
                { title: "Computer Operations", desc: "OS basics, file management, typing proficiency, and shortcuts." },
                { title: "Microsoft Office Suite", desc: "Word formatting, Excel formulas/charts, PowerPoint design." },
                { title: "Internet Safety", desc: "Cybersecurity, safe browsing, email etiquette, and research skills." },
                { title: "Basic Design", desc: "Creating posters, logos, and social graphics using Canva." }
            ],
            projects: [
                "Professional Resume/CV",
                "Monthly Budget Spreadsheet",
                "School/Business Presentation Deck",
                "Personal Brand Kit (Logo & Banner)"
            ],
            skills: ["Digital Confidence", "Data Entry", "Visual Communication", "Research"]
        },
        "1": {
            title: "Digital Explorers",
            age: "Ages 7-10",
            description: "Igniting curiosity through play. We use visual blocks to teach the logic of coding without the frustration of syntax errors.",
            image: "assets/illustrations/scratch-coding.svg",
            modules: [
                { title: "Computational Thinking", desc: "Decomposition, Pattern Recognition, and Algorithms." },
                { title: "Scratch Programming", desc: "Sprites, Loops, Events, and Variables." },
                { title: "Game Mechanics", desc: "Collision detection, scoring, and level design." },
                { title: "Digital Storytelling", desc: "Animation, sound effects, and dialogue logic." }
            ],
            projects: [
                "Animated 'About Me' Story",
                "Interactive Maze Game",
                "Pong / Chase Game",
                "Virtual Pet Simulator"
            ],
            skills: ["Logical Sequencing", "Creativity", "Problem Solving", "Block Coding"]
        },
        "2": {
            title: "Junior Coders",
            age: "Ages 10-13",
            description: "Transitioning to text-based coding. Students learn the languages of the web to build their own custom websites from scratch.",
            image: "assets/illustrations/web-dev.svg",
            modules: [
                { title: "HTML5 Structure", desc: "Tags, elements, semantic structure, and DOM tree." },
                { title: "CSS3 Styling", desc: "Colors, fonts, box model, and layout techniques." },
                { title: "Responsive Design", desc: "Flexbox, Grid, and Media Queries for mobile layouts." },
                { title: "Intro to Python Logic", desc: "Basic syntax transition from blocks to text." }
            ],
            projects: [
                "Personal Portfolio Website",
                "Hero/Hobby Tribute Page",
                "Restaurant Menu Page",
                "Photo Gallery Grid"
            ],
            skills: ["Web Design", "Attention to Detail", "Syntax Precision", "Publishing"]
        },
        "3": {
            title: "Young Developers",
            age: "Ages 12-15",
            description: "Real software engineering begins here. Using Python to handle data, logic, and build complex desktop applications.",
            image: "assets/illustrations/python-coding.svg",
            modules: [
                { title: "Python Core", desc: "Variables, Data Types, Conditionals, and Loops." },
                { title: "Data Structures", desc: "Lists, Dictionaries, Tuples, and Sets." },
                { title: "Functions & Modules", desc: "Writing reusable code and importing libraries." },
                { title: "Game Dev (PyGame)", desc: "Graphics rendering, event loops, and object movement." }
            ],
            projects: [
                "Smart Calculator App",
                "Text-Based Adventure Game",
                "Currency Converter",
                "Automated Quiz Master"
            ],
            skills: ["Algorithmic Logic", "Data Handling", "Debugging", "App Architecture"]
        },
        "4": {
            title: "Future Engineers",
            age: "Ages 15+ & Adults",
            description: "Professional readiness. Advanced algorithms, AI integration, and full-stack deployment for serious developers.",
            image: "assets/illustrations/ai-coding.svg",
            modules: [
                { title: "JavaScript (ES6+)", desc: "DOM manipulation, events, and async programming." },
                { title: "React Framework", desc: "Components, state management, and props." },
                { title: "API Integration", desc: "Fetching data from external sources (Weather, Stocks, AI)." },
                { title: "AI Fundamentals", desc: "Using OpenAI/Gemini APIs and basic Machine Learning concepts." },
                { title: "Version Control", desc: "Git commands and GitHub collaboration." }
            ],
            projects: [
                "AI-Powered Chatbot",
                "Live Weather Dashboard",
                "Task Management SaaS",
                "Full-Stack Social Feed"
            ],
            skills: ["Full Stack Dev", "API Consumption", "Git Workflow", "AI Integration"]
        }
    };

    // --- 2. Parse URL Parameter ---
    const urlParams = new URLSearchParams(window.location.search);
    const levelId = urlParams.get('level');

    // --- 3. DOM Elements ---
    const titleEl = document.getElementById('level-title');
    const ageEl = document.getElementById('level-age');
    const descEl = document.getElementById('level-description');
    const imgEl = document.getElementById('level-image');
    const modulesContainer = document.getElementById('modules-container');
    const projectsList = document.getElementById('projects-list');
    const skillsContainer = document.getElementById('skills-container');

    // --- 4. Populate Content ---
    if (levelId && curriculumData[levelId]) {
        const data = curriculumData[levelId];

        // Header Info
        titleEl.textContent = data.title;
        ageEl.textContent = data.age;
        descEl.textContent = data.description;
        // Check if image exists before setting (simple fallback)
        imgEl.src = data.image;
        imgEl.onerror = function() { 
            // Fallback icon or hide if image is missing
            this.style.display = 'none'; 
        };

        // Modules Grid
        modulesContainer.innerHTML = ''; // Clear previous content
        data.modules.forEach((mod, index) => {
            const modCard = document.createElement('div');
            modCard.className = 'module-card';
            modCard.innerHTML = `
                <div style="font-weight:bold; color:#2563eb; margin-bottom:5px;">Module ${index + 1}</div>
                <h4 style="font-size:1.1rem; margin-bottom:10px; font-weight:700;">${mod.title}</h4>
                <p style="font-size:0.9rem; color:#64748b;">${mod.desc}</p>
            `;
            modulesContainer.appendChild(modCard);
        });

        // Projects List
        projectsList.innerHTML = '';
        data.projects.forEach(proj => {
            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            li.innerHTML = `<i class="fa-solid fa-check-circle" style="color:#22c55e; margin-right:10px;"></i> ${proj}`;
            projectsList.appendChild(li);
        });

        // Skills Tags
        skillsContainer.innerHTML = '';
        data.skills.forEach(skill => {
            const span = document.createElement('span');
            span.className = 'skill-tag'; // You can add CSS for .skill-tag in style.css
            // Inline styles for immediate effect
            span.style.cssText = "background:#eff6ff; color:#2563eb; padding:8px 16px; border-radius:50px; font-weight:600; font-size:0.9rem; display:inline-block; margin-right:10px; margin-bottom:10px; border:1px solid #dbeafe;";
            span.textContent = skill;
            skillsContainer.appendChild(span);
        });

    } else {
        // Fallback for invalid or missing level ID
        const container = document.querySelector('.container') || document.body;
        // Simple error message overlay
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = "text-align:center; padding:100px 20px;";
        errorMsg.innerHTML = `
            <h2>Level Not Found</h2>
            <p>Please return to the curriculum page to select a valid level.</p>
            <a href="curriculum.html" class="btn primary" style="margin-top:20px; display:inline-block; background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Go Back</a>
        `;
        // Replace hero content or append to body if structure is missing
        if(document.querySelector('section.hero')) {
             document.querySelector('section.hero').innerHTML = '';
             document.querySelector('section.hero').appendChild(errorMsg);
        } else {
             document.body.prepend(errorMsg);
        }
    }
});