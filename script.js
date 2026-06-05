// --- Dark/Light Mode Theme Toggle Logic ---
const themeToggle = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');
const body = document.body;

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeText.textContent = '☀️ Light Mode';
    } else {
        body.setAttribute('data-theme', 'light');
        themeText.textContent = '🌙 Dark Mode';
    }
});

// --- Dynamic Unit Input Toggle Module ---
const heightUnitSelect = document.getElementById('heightUnit');
const metricGroup = document.getElementById('metricHeightGroup');
const imperialGroup = document.getElementById('imperialHeightGroup');
const heightCmInput = document.getElementById('heightCm');
const heightFtInput = document.getElementById('heightFt');
const heightInInput = document.getElementById('heightIn');

// Initialize validation attributes correctly on load
heightCmInput.required = true;

heightUnitSelect.addEventListener('change', (e) => {
    if (e.target.value === 'cm') {
        metricGroup.classList.remove('hidden');
        imperialGroup.classList.add('hidden');
        heightCmInput.required = true;
        heightFtInput.required = false;
        heightInInput.required = false;
    } else {
        metricGroup.classList.add('hidden');
        imperialGroup.classList.remove('hidden');
        heightCmInput.required = false;
        heightFtInput.required = true;
        heightInInput.required = true;
    }
});

// --- Core Dynamic Meal Database ---
const mealDatabase = {
    maintain: [
        { name: "Breakfast (08:00 AM)", desc: "Oatmeal with whey protein, chia seeds, and fresh berries." },
        { name: "Lunch (01:00 PM)", desc: "Grilled chicken breast or tofu paired with brown rice and mixed green vegetables." },
        { name: "Evening Snack (05:00 PM)", desc: "Whole grain toast topped with mashed avocado and boiled eggs or paneer." },
        { name: "Dinner (08:30 PM)", desc: "Baked salmon or chickpea stir-fry with sweet potato sides." }
    ],
    lose: [
        { name: "Breakfast (08:00 AM)", desc: "Egg white omelet or scrambled tofu loaded with spinach, tomatoes, and mushrooms." },
        { name: "Lunch (01:00 PM)", desc: "Big green salad with lean turkey strips or grilled paneer tossed in light olive oil." },
        { name: "Evening Snack (05:00 PM)", desc: "Greek yogurt or dairy-free protein shake alongside a handful of almonds." },
        { name: "Dinner (08:30 PM)", desc: "Steamed white fish or lentil soup served alongside broccoli and cauliflower rice." }
    ],
    gain: [
        { name: "Breakfast (08:00 AM)", desc: "Smoothie made with whole milk/oat milk, peanut butter, oats, bananas, and protein powder." },
        { name: "Lunch (01:00 PM)", desc: "Lean beef strips or edamame tempeh paired generously with quinoa and avocado slices." },
        { name: "Evening Snack (05:00 PM)", desc: "Mixed nut varieties, cottage cheese, or an artisanal fruit and nut nutrition bar." },
        { name: "Dinner (08:30 PM)", desc: "Hearty chicken or bean burrito bowl layered with brown rice, black beans, and guacamole." }
    ]
};

// --- Calculation Engine & Form Processing ---
const form = document.getElementById('plannerForm');
const placeholder = document.getElementById('placeholder');
const resultsContent = document.getElementById('resultsContent');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Fetch Form Element values
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const unitSelection = heightUnitSelect.value;
    const goal = document.getElementById('goal').value;

    // Process Height across Metrics Units & Parameters
    let heightCm = 0;
    if (unitSelection === 'cm') {
        heightCm = parseFloat(heightCmInput.value);
    } else {
        const feet = parseFloat(heightFtInput.value || 0);
        const inches = parseFloat(heightInInput.value || 0);
        // Step conversion metric: (Feet * 12 + Inches) * 2.54 centimeters
        heightCm = ((feet * 12) + inches) * 2.54;
    }

    // Safety fallback metric check
    if (!heightCm || heightCm <= 0) return;

    // 1. Calculate Basal Metabolic Rate (BMR) via Miflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
    }

    // 2. Adjust for Baseline Physical Activity Multiplier (~1.4)
    let tdee = Math.round(bmr * 1.4);

    // 3. Calibrate Target Daily Calories based on Goal Selection
    let targetCalories;
    if (goal === 'lose') {
        targetCalories = tdee - 450; // Caloric Deficit
    } else if (goal === 'gain') {
        targetCalories = tdee + 400; // Caloric Surplus
    } else {
        targetCalories = tdee;       // Maintenance Target
    }

    // 4. Macro-distribution Strategy Calculation
    // Protein Strategy: ~2.2g per kg bodyweight
    let proteinGrams = Math.round(weight * 2.2);
    // Fats Strategy: ~25% allocation of total energy values (1g fat = 9 kcal)
    let fatGrams = Math.round((targetCalories * 0.25) / 9);
    // Carbs Strategy: Remainder calculated metrics (1g carb = 4 kcal)
    let proteinKcal = proteinGrams * 4;
    let fatKcal = fatGrams * 9;
    let carbGrams = Math.round((targetCalories - (proteinKcal + fatKcal)) / 4);

    // Fallback safety to ensure no negative numbers generated on edge parameters
    if (carbGrams < 0) carbGrams = 50; 

    // 5. Update DOM Values dynamically
    document.getElementById('calorieOutput').innerHTML = `${targetCalories} <span style="font-size: 1rem; font-weight:400; color:var(--text-muted);">kcal / day</span>`;
    document.getElementById('proteinOutput').textContent = `${proteinGrams}g`;
    document.getElementById('carbsOutput').textContent = `${carbGrams}g`;
    document.getElementById('fatsOutput').textContent = `${fatGrams}g`;

    // 6. Generate Structural Timeline Outputs
    const timeline = document.getElementById('mealTimeline');
    timeline.innerHTML = ''; // Clear prior results view
    
    const selectedMeals = mealDatabase[goal];
    selectedMeals.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.className = 'meal-card';
        mealElement.innerHTML = `
            <div class="meal-header">
                <span>${meal.name}</span>
            </div>
            <div class="meal-desc">${meal.desc}</div>
        `;
        timeline.appendChild(mealElement);
    });

    // Handle View State Shifts
    placeholder.classList.add('hidden');
    resultsContent.classList.remove('hidden');
    
    // Auto smooth scroll down to viewport section logic for smaller devices
    if (window.innerWidth <= 900) {
        document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
    }
});