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

// Initialize validation tracking attributes
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

// --- Core Dynamic Meal Database (Split into Veg & Non-Veg Engines) ---
const mealDatabase = {
    veg: {
        maintain: [
            { name: "Breakfast (08:00 AM)", desc: "Sprouted moong chat or rolled oats with soy milk, almonds, and flax seeds." },
            { name: "Lunch (01:00 PM)", desc: "Paneer bhurji (150g) paired with multi-grain rotis, dal tadka, and mixed salad." },
            { name: "Evening Snack (05:00 PM)", desc: "Roasted chickpeas (chana) or makhana with a green tea brew." },
            { name: "Dinner (08:30 PM)", desc: "Tofu stir-fry with broccoli, bell peppers, and a medium bowl of brown rice." }
        ],
        lose: [
            { name: "Breakfast (08:00 AM)", desc: "Besan cheela (chickpea flour pancake) loaded with finely chopped spinach and low-fat paneer." },
            { name: "Lunch (01:00 PM)", desc: "Soya chunks curry with cauliflower rice and a large cucumber-tomato salad bowl." },
            { name: "Evening Snack (05:00 PM)", desc: "Double-toned curd or Greek yogurt mixed with a dash of chia seeds." },
            { name: "Dinner (08:30 PM)", desc: "Clear lentil soup with steamed mushrooms, broccoli, and roasted asparagus." }
        ],
        gain: [
            { name: "Breakfast (08:00 AM)", desc: "High-calorie shake: Bananas, peanut butter, whole milk, oats, and ashwagandha powder." },
            { name: "Lunch (01:00 PM)", desc: "Thick paneer tikka masala served along with dal makhani, layered paratha, and curd." },
            { name: "Evening Snack (05:00 PM)", desc: "Handful of walnuts, cashews, raisins, and home-baked paneer cubes." },
            { name: "Dinner (08:30 PM)", desc: "Loaded soybean and vegetable biryani served with an almond-infused raita dip." }
        ]
    },
    nonveg: {
        maintain: [
            { name: "Breakfast (08:00 AM)", desc: "3 whole scrambled eggs on whole-wheat toast with avocado spread." },
            { name: "Lunch (01:00 PM)", desc: "Grilled chicken breast (200g) served with basmati rice and a side of steamed green beans." },
            { name: "Evening Snack (05:00 PM)", desc: "Boiled egg white salad with black pepper or clean whey protein isolates." },
            { name: "Dinner (08:30 PM)", desc: "Pan-seared Salmon or Rohu fish with sweet potato mash and a serving of sautéed zucchini." }
        ],
        lose: [
            { name: "Breakfast (08:00 AM)", desc: "Egg white omelet (4 whites) whisked with onions, green chilies, and spinach leaves." },
            { name: "Lunch (01:00 PM)", desc: "Shredded chicken breast salad tossed with olive oil, lemon zest, lettuce, and bell peppers." },
            { name: "Evening Snack (05:00 PM)", desc: "A bowl of clear chicken broth or tuna salad chunks mixed with celery." },
            { name: "Dinner (08:30 PM)", desc: "Grilled lean turkey or white fish fillet served with grilled asparagus and boiled broccoli." }
        ],
        gain: [
            { name: "Breakfast (08:00 AM)", desc: "3 egg omelet + 2 toasted slices with peanut butter and a tall glass of fresh orange juice." },
            { name: "Lunch (01:00 PM)", desc: "Mutton curry or chicken thigh layout served alongside ghee rice and a bowl of dal." },
            { name: "Evening Snack (05:00 PM)", desc: "Chicken breast sandwich with cheese slices or structural whey mass gainer smoothies." },
            { name: "Dinner (08:30 PM)", desc: "High-protein fish fillet or lean minced beef served with roasted potatoes and a side of pasta." }
        ]
    }
};

// --- Calculation Engine & Form Processing ---
const form = document.getElementById('plannerForm');
const placeholder = document.getElementById('placeholder');
const resultsContent = document.getElementById('resultsContent');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Fetch Input Parameters
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const diet = document.querySelector('input[name="diet"]:checked').value;
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const unitSelection = heightUnitSelect.value;
    const goal = document.getElementById('goal').value;

    // Process Height Unit Conversion Calculations
    let heightCm = 0;
    if (unitSelection === 'cm') {
        heightCm = parseFloat(heightCmInput.value);
    } else {
        const feet = parseFloat(heightFtInput.value || 0);
        const inches = parseFloat(heightInInput.value || 0);
        heightCm = ((feet * 12) + inches) * 2.54;
    }

    if (!heightCm || heightCm <= 0) return;

    // 1. Calculate Basal Metabolic Rate (BMR) via Mifflin-St Jeor Formula
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
        targetCalories = tdee - 450;
    } else if (goal === 'gain') {
        targetCalories = tdee + 400;
    } else {
        targetCalories = tdee;
    }

    // 4. Macro-distribution Strategy Calculation
    let proteinGrams, fatGrams, carbGrams;

    if (diet === 'veg') {
        // Vegetarian: High quality plant foods have slightly lower protein absorption rates.
        // Carbs are slightly higher due to the nature of vegetarian protein sources (lentils/beans).
        proteinGrams = Math.round(weight * 1.8); 
        fatGrams = Math.round((targetCalories * 0.25) / 9);
    } else {
        // Non-Vegetarian: Bioavailable direct protein source distribution strategy profiles.
        proteinGrams = Math.round(weight * 2.2); 
        fatGrams = Math.round((targetCalories * 0.23) / 9);
    }

    let proteinKcal = proteinGrams * 4;
    let fatKcal = fatGrams * 9;
    carbGrams = Math.round((targetCalories - (proteinKcal + fatKcal)) / 4);

    if (carbGrams < 0) carbGrams = 50; 

    // 5. Update DOM Values dynamically
    document.getElementById('calorieOutput').innerHTML = `${targetCalories} <span style="font-size: 1rem; font-weight:400; color:var(--text-muted);">kcal / day</span>`;
    document.getElementById('proteinOutput').textContent = `${proteinGrams}g`;
    document.getElementById('carbsOutput').textContent = `${carbGrams}g`;
    document.getElementById('fatsOutput').textContent = `${fatGrams}g`;

    // 6. Generate Structural Timeline Outputs based on Diet Type Engine
    const timeline = document.getElementById('mealTimeline');
    timeline.innerHTML = ''; 
    
    // Select specific timeline database section matching chosen filters
    const selectedMeals = mealDatabase[diet][goal];
    selectedMeals.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.className = 'meal-card';
        // Accent dynamically modified on diet choices
        if (diet === 'nonveg') {
            mealElement.style.borderLeftColor = '#ef4444';
        }
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
    
    if (window.innerWidth <= 900) {
        document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
    }
});
