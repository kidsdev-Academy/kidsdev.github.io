/* js/interactive.js - Handles Challenge Logic */

const Interactive = {
    // --- PYTHON CHALLENGES (Simulation) ---
    checkPython: (code, keywords) => {
        // Simple check: Does the code contain the required keywords?
        const missing = keywords.filter(kw => !code.includes(kw));
        return missing.length === 0;
    },

    runPython: (id, keywords, successMsg) => {
        const code = document.getElementById('code-input').value;
        const output = document.getElementById('output-console');
        const solution = document.getElementById('solution-box');
        
        output.innerHTML = "<span class='text-yellow-400'>Running code...</span><br>";
        
        setTimeout(() => {
            if (Interactive.checkPython(code, keywords)) {
                output.innerHTML += `<span class='text-green-400'>${successMsg}</span><br>`;
                output.innerHTML += "<span class='text-blue-300'>Great job! The solution has been unlocked below. 👇</span>";
                solution.classList.remove('hidden');
                // Scroll to solution
                solution.scrollIntoView({ behavior: 'smooth' });
            } else {
                output.innerHTML += `<span class='text-red-400'>Error: Missing some key concepts. Did you use: ${keywords.join(', ')}?</span>`;
            }
        }, 800);
    },

    // --- CSS CHALLENGES (Live Preview) ---
    runCSS: (targetId, correctStyles) => {
        const code = document.getElementById('code-input').value;
        const previewStyle = document.getElementById('dynamic-style');
        const solution = document.getElementById('solution-box');
        const feedback = document.getElementById('css-feedback');

        // Inject CSS to see result
        previewStyle.innerHTML = code;

        // Basic Validation (Check if key properties exist)
        const missing = correctStyles.filter(style => !code.includes(style));
        
        if (missing.length === 0) {
            feedback.innerHTML = `<span class='text-green-600 font-bold'>✨ Perfect! It looks centered/styled correctly.</span>`;
            solution.classList.remove('hidden');
        } else {
            feedback.innerHTML = `<span class='text-red-500 font-bold'>Not quite. Try using: ${missing[0]}</span>`;
        }
    },

    // --- JS CHALLENGES (Execution) ---
    runJS: (testFunction) => {
        const code = document.getElementById('code-input').value;
        const feedback = document.getElementById('js-feedback');
        const solution = document.getElementById('solution-box');

        try {
            // Dangerous in production, but okay for client-side kid tutorials
            // We wrap user code in a safe way or just eval it for the test
            eval(code); 
            
            if (testFunction()) {
                feedback.innerHTML = "✅ <span class='text-green-600 font-bold'>Success! Logic verified.</span>";
                solution.classList.remove('hidden');
            } else {
                feedback.innerHTML = "❌ <span class='text-red-500 font-bold'>Code ran, but the result wasn't expected. Check your logic.</span>";
            }
        } catch (e) {
            feedback.innerHTML = `❌ <span class='text-red-500 font-bold'>Error: ${e.message}</span>`;
        }
    },

    // Reveal without trying
    giveUp: () => {
        document.getElementById('solution-box').classList.remove('hidden');
    }
};